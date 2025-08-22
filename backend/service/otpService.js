const Connection = require("../db/Connection");
const smsService = require("./smsService");

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // 6-digit code
}

exports.sendOTP = async (mobileNumber, purpose = "account_verification") => {
  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes from now

    await Connection(
      `INSERT INTO otp_codes (mobile, otp, expires_at, purpose) VALUES (?, ?, ?, ?)`,
      [mobileNumber, otp.toString(), expiresAt, purpose]
    );

    const message = `Your OTP code is ${otp}. It will expire in 5 minutes.`;

    return await smsService.sendSMS(message, [mobileNumber]);
  } catch (error) {
    console.error("Error in sendOTP:", error);
    return { success: false, message: "Failed to send OTP." }; // ✅ return useful response
  }
};

exports.verifyOTP = async (mobile, otp, purpose = "account_verification") => {
  try {
    const rows = await Connection(
      `SELECT * FROM otp_codes WHERE mobile = ? AND otp = ? AND purpose = ? AND used = 0 AND expires_at > NOW() ORDER BY id DESC LIMIT 1`,
      [mobile, otp.toString(), purpose]
    );

    if (rows.length === 0) {
      return { valid: false, message: "Invalid or expired OTP." };
    }

    await Connection(`UPDATE otp_codes SET used = 1 WHERE id = ?`, [
      rows[0].id,
    ]);

    return { valid: true };
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    return {
      valid: false,
      message: "OTP verification failed due to server error.",
    }; // ✅ return useful response
  }
};
