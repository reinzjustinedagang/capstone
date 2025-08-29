const axios = require("axios");
const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");

exports.sendSMS = async (message, recipients) => {
  try {
    const [credentials] = await Connection(
      "SELECT * FROM sms_credentials LIMIT 1"
    );

    if (!credentials) throw new Error("SMS credentials not found.");

    // Convert recipients array to comma-separated string
    const numbersStr = recipients.join(",");

    // Prepare payload as URL-encoded form data
    const params = new URLSearchParams();
    params.append("apikey", credentials.api_key);
    params.append("number", numbersStr);
    params.append("message", message);
    if (credentials.sender_id)
      params.append("sendername", credentials.sender_id);

    // Send SMS via Semaphore
    const response = await axios.post(
      "https://api.semaphore.co/api/v4/messages",
      params.toString(),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );

    const data = response.data;

    // Save each message individually in SMS logs
    const logs = Array.isArray(data) ? data : [data];
    for (const log of logs) {
      await Connection(
        `INSERT INTO sms_logs (recipients, message, status, reference_id, credit_used)
         VALUES (?, ?, ?, ?, ?)`,
        [
          log.recipient,
          log.message,
          log.status || "Pending",
          log.message_id || null,
          1, // Assume 1 credit per message
        ]
      );
    }

    return { success: true, response: data };
  } catch (error) {
    console.error("Error sending SMS:", error);

    // Log failure for all recipients
    await Connection(
      `INSERT INTO sms_logs (recipients, message, status, reference_id, credit_used)
       VALUES (?, ?, ?, ?, ?)`,
      [JSON.stringify(recipients), message, "Failed", null, 0]
    );

    return { success: false, response: error.message };
  }
};

exports.deleteSms = async (id) => {
  try {
    const query = `DELETE FROM sms_logs WHERE id = ?`;
    const result = await Connection(query, [id]);
    return result.affectedRows > 0;
  } catch (err) {
    console.error("Error deleting SMS:", err);
    return false;
  }
};

exports.getSmsCredentials = async () => {
  const result = await Connection(
    "SELECT api_key, sender_id FROM sms_credentials WHERE id = 1"
  );
  return result.length > 0 ? result[0] : null;
};

exports.updateSmsCredentials = async (api_key, sender_id, user, ip) => {
  const existing = await Connection(
    `SELECT * FROM sms_credentials WHERE id = 1`
  );

  let actionType = "UPDATE";

  if (!existing[0]) {
    await Connection(
      `INSERT INTO sms_credentials (id, api_key, sender_id) VALUES (1, ?, ?)`,
      [api_key, sender_id]
    );
    actionType = "INSERT";

    if (user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        actionType,
        `SMS credentials added: API Key: ${api_key}, Sender ID: ${sender_id}`,
        ip
      );
    }
  } else {
    await Connection(
      `UPDATE sms_credentials SET api_key = ?, sender_id = ? WHERE id = 1`,
      [api_key, sender_id]
    );

    if (user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "UPDATE",
        `SMS credentials updated (ID: 1)`,
        ip
      );
    }
  }

  return { actionType };
};

exports.getPaginatedSMSHistory = async (limit, offset) => {
  const logs = await Connection(
    `
    SELECT id, recipients, message, status, reference_id, credit_used, created_at
    FROM sms_logs
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `,
    [limit, offset]
  );

  const totalResult = await Connection(
    `SELECT COUNT(*) AS total FROM sms_logs`
  );
  const total = totalResult[0]?.total || 0;

  return { logs, total };
};
