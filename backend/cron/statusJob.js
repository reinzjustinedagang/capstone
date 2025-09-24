const Connection = require("../db/Connection");
const smsService = require("../service/smsService");

// ----------------------
// 1. Mark users inactive
// ----------------------
const markInactive = async () => {
  try {
    const result = await Connection(
      "UPDATE users SET status = 'inactive' WHERE last_seen < NOW() - INTERVAL 5 MINUTE"
    );
    if (result.affectedRows > 0) {
      console.log(`🔄 Marked ${result.affectedRows} users inactive`);
    }
  } catch (err) {
    console.error("Error marking inactive:", err);
  }
};

// run every 1 minute
setInterval(markInactive, 60 * 1000);

// -----------------------------
// 2. Update Pending SMS Status
// -----------------------------
const updatePendingSMS = async () => {
  try {
    const pendingMessages = await Connection(
      "SELECT id, reference_id FROM sms_logs WHERE status = 'Pending'"
    );

    if (pendingMessages.length === 0) {
      return; // nothing to do
    }

    for (const msg of pendingMessages) {
      if (!msg.reference_id) continue; // skip invalid rows

      try {
        const statusData = await smsService.checkMessageStatus(
          msg.reference_id
        );

        if (statusData && statusData.status) {
          await Connection("UPDATE sms_logs SET status = ? WHERE id = ?", [
            statusData.status,
            msg.id,
          ]);
          console.log(
            `📩 Updated SMS ${msg.reference_id}: ${statusData.status}`
          );
        }
      } catch (err) {
        console.error(
          `❌ Failed to check SMS ${msg.reference_id}:`,
          err.message
        );
      }
    }
  } catch (err) {
    console.error("Error updating pending SMS:", err);
  }
};

setInterval(updatePendingSMS, 30 * 1000); // 30,000ms = 30 seconds

// no need to export anything
