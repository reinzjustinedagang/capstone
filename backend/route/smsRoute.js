const express = require("express");
const smsService = require("../service/smsService");

const router = express.Router();

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

module.exports = router;
