const express = require("express");
const smsService = require("../service/smsService");
const router = express.Router();

// ✅ Get SMS counts (success, failed, pending, total)
router.get("/count", async (req, res) => {
  try {
    const counts = await smsService.getSmsCounts();
    res.json(counts);
  } catch (error) {
    console.error("Error fetching SMS counts:", error);
    res.status(500).json({ message: "Failed to fetch SMS counts" });
  }
});

// ✅ Send SMS to one or multiple numbers
router.post("/send-sms", async (req, res) => {
  const { number, numbers, message } = req.body;

  const recipients = numbers || (number ? [number] : null);

  if (
    !recipients ||
    !Array.isArray(recipients) ||
    recipients.length === 0 ||
    !message
  ) {
    return res
      .status(400)
      .json({ error: "Array of numbers and a message are required." });
  }

  try {
    const result = await smsService.sendSMS(message, recipients);

    if (result.success) {
      res.json({
        message: "✅ Broadcast sent successfully",
        data: result.response,
      });
    } else {
      res.status(500).json({
        message: "❌ Failed to send broadcast",
        error: result.response,
      });
    }
  } catch (err) {
    console.error("Error sending SMS:", err);
    res.status(500).json({ message: "❌ Server error while sending SMS" });
  }
});

// ✅ Delete SMS log by ID
router.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const success = await smsService.deleteSms(id);

    if (success) {
      res.status(200).json({ message: "✅ Message deleted successfully." });
    } else {
      res
        .status(404)
        .json({ message: "❌ Message not found or deletion failed." });
    }
  } catch (err) {
    console.error("Error deleting SMS:", err);
    res.status(500).json({ message: "❌ Server error while deleting SMS" });
  }
});

// GET paginated SMS history
router.get("/history", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { logs, total } = await smsService.getPaginatedSMSHistory(
      limit,
      offset
    );
    res.json({ logs, total });
  } catch (error) {
    console.error("Error fetching SMS history:", error);
    res.status(500).json({ message: "Failed to fetch SMS history" });
  }
});

// GET Semaphore credentials
router.get("/sms-credentials", async (req, res) => {
  try {
    const credentials = await smsService.getSmsCredentials();
    if (!credentials) {
      return res.status(404).json({ message: "Credentials not found" });
    }
    res.json(credentials);
  } catch (error) {
    console.error("Error fetching SMS credentials:", error);
    res.status(500).json({ message: "Failed to fetch SMS credentials" });
  }
});

// PUT Semaphore credentials
router.put("/sms-credentials", async (req, res) => {
  try {
    const { api_key, sender_id } = req.body; // updated fields
    const ip = req.userIp;
    const user = req.session.user;

    const result = await smsService.updateSmsCredentials(
      api_key,
      sender_id,
      user,
      ip
    );
    res.status(200).json({
      message:
        result.actionType === "INSERT"
          ? "✅ SMS credentials added successfully."
          : "✅ SMS credentials updated successfully.",
    });
  } catch (error) {
    console.error("Error updating SMS credentials:", error);
    res.status(500).json({ message: "Failed to update SMS credentials" });
  }
});

router.post("/request-otp", async (req, res) => {
  try {
    const { cpNumber } = req.body;
    if (!cpNumber)
      return res
        .status(400)
        .json({ success: false, message: "Mobile number required" });

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Save OTP in DB with expiration (5 mins)
    await Connection(
      `INSERT INTO otp_codes (cp_number, otp, expires_at) VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))
       ON DUPLICATE KEY UPDATE otp = VALUES(otp), expires_at = VALUES(expires_at)`,
      [cpNumber, otp]
    );

    // Send SMS via Semaphore
    const smsResult = await smsService.sendSMS(`Your OTP code is ${otp}`, [
      cpNumber,
    ]);
    if (!smsResult.success) {
      return res
        .status(500)
        .json({ success: false, message: "Failed to send OTP" });
    }

    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error in request-otp:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { cpNumber, otp } = req.body;

    const [record] = await Connection(
      `SELECT * FROM otp_codes WHERE cp_number = ? AND expires_at > NOW()`,
      [cpNumber]
    );

    if (!record || record.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // Optional: delete OTP after successful verification
    await Connection(`DELETE FROM otp_codes WHERE cp_number = ?`, [cpNumber]);

    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("Error in verify-otp:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { cpNumber, newPassword } = req.body;

    // Hash password (bcrypt recommended)
    const bcrypt = require("bcryptjs");
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update user password by cpNumber
    const result = await Connection(
      `UPDATE users SET password = ? WHERE cp_number = ?`,
      [hashed, cpNumber]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Error in reset-password:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
