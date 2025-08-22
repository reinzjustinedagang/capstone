const express = require("express");
const router = express.Router();
const { sendOTP, verifyOTP } = require("../services/otpService");

// Send OTP (e.g., during registration or password reset)
router.post("/send-otp", async (req, res) => {
  const { mobile, purpose } = req.body;

  try {
    const result = await sendOTP(mobile, purpose);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to send OTP." });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  const { mobile, otp, purpose } = req.body;

  try {
    const result = await verifyOTP(mobile, otp, purpose);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ valid: false, message: "OTP verification failed." });
  }
});

module.exports = router;
