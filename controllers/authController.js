const { auth } = require('../config/firebase');
const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config();

const shopifyAdminAPI = `https://${process.env.SHOPIFY_API_KEY}:${process.env.SHOPIFY_PASSWORD}@${process.env.SHOPIFY_STORE_NAME}.myshopify.com/admin/api/2024-01/customers.json`;

// Send OTP
exports.sendOTP = async (req, res) => {
  const { phoneNumber } = req.body;

  try {
    const verificationId = await auth.createUserWithPhoneNumber(phoneNumber, {
      session: true,
    });
    res.json({ verificationId });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Verify OTP and register/login
exports.verifyOTP = async (req, res) => {
  const { verificationId, otpCode, userInfo } = req.body;

  try {
    const verifiedUser = await auth.verifyPhoneNumber(verificationId, otpCode);

    // Save user to Shopify
    const shopifyResponse = await axios.post(shopifyAdminAPI, {
      customer: {
        first_name: userInfo.firstName,
        last_name: userInfo.lastName,
        email: userInfo.email,
        phone: verifiedUser.phoneNumber,
        verified_email: true,
        addresses: [userInfo.address],
      },
    });

    res.json({ message: 'User successfully registered/login', shopifyData: shopifyResponse.data });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
    