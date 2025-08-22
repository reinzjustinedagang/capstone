const axios = require("axios");
const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");

exports.sendSMS = async (message, recipients) => {
  try {
    const [credentials] = await Connection(
      "SELECT * FROM sms_credentials LIMIT 1"
    );

    if (!credentials) {
      throw new Error("SMS credentials not found in database.");
    }

    const authHeader =
      "Basic " +
      Buffer.from(`${credentials.email}:${credentials.password}`).toString(
        "base64"
      );

    const payload = {
      ApiCode: credentials.api_code,
      Recipients: recipients,
      Message: message,
    };

    const response = await axios.post(
      "https://api.itexmo.com/api/broadcast",
      payload,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
      }
    );

    const data = response.data;

    await Connection(
      `INSERT INTO sms_logs (recipients, message, status, reference_id, credit_used)
       VALUES (?, ?, ?, ?, ?)`,
      [
        JSON.stringify(recipients),
        message,
        data.Error === false ? "Success" : "Failed",
        data.ReferenceId || null,
        data.TotalCreditUsed || 0,
      ]
    );

    return data.Error === false && data.Accepted > 0
      ? { success: true, response: data }
      : { success: false, response: `iTexMo error: ${JSON.stringify(data)}` };
  } catch (error) {
    console.error("Error sending SMS:", error);

    await Connection(
      `INSERT INTO sms_logs (recipients, message, status, reference_id, credit_used)
       VALUES (?, ?, ?, ?, ?)`,
      [JSON.stringify(recipients), message, "Request Failed", null, 0]
    );

    return {
      success: false,
      response:
        error.response?.status === 400
          ? "❌ Failed to send broadcast: Insufficient credits or bad request."
          : `Request failed: ${error.message}`,
    };
  }
};

exports.deleteSms = async (id) => {
  try {
    const query = `DELETE FROM sms_logs WHERE id = ?`;
    const result = await Connection(query, [id]);

    if (result.affectedRows > 0) {
      return true;
    } else {
      console.warn("No Message found with ID:", id);
      return false;
    }
  } catch (err) {
    console.error("Error deleting Message:", err);
    return false;
  }
};

// In your smsService.js

exports.getSmsCredentials = async () => {
  const result = await Connection(
    "SELECT email, password, api_code FROM sms_credentials WHERE id = 1"
  );
  return result.length > 0 ? result[0] : null;
};

exports.updateSmsCredentials = async (email, password, api_code, user, ip) => {
  const existing = await Connection(
    `SELECT * FROM sms_credentials WHERE id = 1`
  );

  let actionType = "UPDATE";
  const oldData = existing[0];

  if (!oldData) {
    // Insert new credentials
    await Connection(
      `INSERT INTO sms_credentials (id, email, password, api_code) VALUES (1, ?, ?, ?)`,
      [email, password, api_code]
    );
    actionType = "INSERT";

    if (user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        actionType,
        `Created initial SMS credentials: email='${email}'`,
        ip
      );
    }
  } else {
    // Update existing credentials
    await Connection(
      `UPDATE sms_credentials SET email = ?, password = ?, api_code = ? WHERE id = 1`,
      [email, password, api_code]
    );

    if (user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "UPDATE",
        `Updated SMS credentials (ID: 1)`,
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
