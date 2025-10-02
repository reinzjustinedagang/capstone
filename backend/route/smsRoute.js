const express = require("express");
const smsService = require("../service/smsService");
const router = express.Router();
const { isAuthenticated } = require("../middleware/authMiddleware");

// ✅ Get SMS counts (success, failed, pending, total)
router.get("/count", isAuthenticated, async (req, res) => {
  const user = req.session.user;
  try {
    const counts = await smsService.getSmsCounts(user);
    res.json(counts);
  } catch (error) {
    console.error("Error fetching SMS counts:", error);
    res.status(500).json({ message: "Failed to fetch SMS counts" });
  }
});

// ✅ Send SMS to one or multiple numbers
router.post("/send-sms", isAuthenticated, async (req, res) => {
  const { number, numbers, message } = req.body;
  const user = req.session.user;
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
    const result = await smsService.sendSMS(message, recipients, user);
    console.log(user);
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

router.get("/recent", async (req, res) => {
  try {
    const result = await smsService.getRecentSMSHistory();
    res.status(200).json({ logs: result }); // ✅ wrap in { logs: ... } for consistency
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch recent sms history." });
  }
});

// GET paginated SMS history
router.get("/history", isAuthenticated, async (req, res) => {
  try {
    const user = req.session.user;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const filters = {
      role: req.query.role || "All",
      email: req.query.email || "All",
      status: req.query.status || "All",
    };

    const { logs, total } = await smsService.getPaginatedSMSHistory(
      limit,
      offset,
      user,
      filters
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

// ✅ Request OTP
router.post("/request-otp", async (req, res) => {
  try {
    console.log("Incoming OTP request body:", req.body); // ✅ Debug log
    const { cpNumber } = req.body;
    await smsService.requestOtp(cpNumber);
    res.json({ success: true, message: "OTP sent successfully" });
  } catch (err) {
    console.error("Error in request-otp:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// ✅ Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { cpNumber, otp } = req.body;
    await smsService.verifyOtp(cpNumber, otp);
    res.json({ success: true, message: "OTP verified" });
  } catch (err) {
    console.error("Error in verify-otp:", err);
    res.status(400).json({ success: false, message: err.message });
  }
});

// ✅ Reset password
router.post("/reset-password", async (req, res) => {
  try {
    const { cpNumber, newPassword } = req.body;
    await smsService.resetPassword(cpNumber, newPassword);
    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Error in reset-password:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// routes/sms.js
router.get("/filters", isAuthenticated, async (req, res) => {
  const user = req.session.user;
  try {
    const filters = await smsService.getSmsFilters(user);
    res.status(200).json(filters);
  } catch (err) {
    console.error("Error in /sms/filters:", err);
    res.status(500).json({ message: "Failed to fetch SMS filter options." });
  }
});

module.exports = router;
