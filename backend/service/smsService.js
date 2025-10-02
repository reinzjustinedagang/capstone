const axios = require("axios");
const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");
const bcrypt = require("bcrypt");

exports.sendSMS = async (message, recipients, user, options = {}) => {
  // If user looks like options (has skipLogging), swap
  if (user && user.skipLogging) {
    options = user;
    user = null;
  }

  let validRecipients = [];
  try {
    const [credentials] = await Connection(
      "SELECT * FROM sms_credentials LIMIT 1"
    );
    if (!credentials) throw new Error("SMS credentials not found.");

    validRecipients = (recipients || []).filter(
      (num) => num && num.toString().trim() !== ""
    );

    if (validRecipients.length === 0) {
      throw new Error("No valid recipients to send SMS.");
    }

    // Convert to comma-separated string
    const numbersStr = validRecipients.join(",");

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
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    const data = response.data;
    const logs = Array.isArray(data) ? data : [data];

    // ✅ Only log if NOT OTP (skipLogging flag is false)
    // ✅ Only log if NOT OTP (skipLogging flag is false)
    if (!options.skipLogging) {
      const firstLog = Array.isArray(logs) ? logs[0] : logs;

      await Connection(
        `INSERT INTO sms_logs (recipients, message, status, reference_id, sent_by, sent_role, sent_email)
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          JSON.stringify(validRecipients), // full recipients list
          message,
          firstLog.status === "Pending" ? "Success" : firstLog.status, // use first status
          firstLog.message_id || null, // use first ref
          user ? user.id : null,
          user ? user.role : null,
          user ? user.email : null,
        ]
      );
    }

    return { success: true, response: logs };
  } catch (error) {
    console.error("Error sending SMS:", error?.response?.data || error.message);

    if (!options.skipLogging) {
      await Connection(
        `INSERT INTO sms_logs (recipients, message, status, reference_id, sent_by, sent_role, sent_email)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          JSON.stringify(validRecipients), // clean recipients
          message,
          "Failed",
          null,
          user ? user.id : null,
          user ? user.role : null,
          user ? user.email : null,
        ]
      );
    }

    return {
      success: false,
      response: error?.response?.data || { message: error.message },
    };
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
        `SMS credentials added: API Key ending in ${api_key.slice(
          -4
        )}, Sender ID: ${sender_id}`,
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

exports.getRecentSMSHistory = async () => {
  try {
    const recentHistory = await Connection(`
      SELECT * 
      FROM sms_logs 
      WHERE status = 'Success'
      ORDER BY created_at DESC 
      LIMIT 5
    `);
    return recentHistory;
  } catch (error) {
    console.error("Error fetching recent SMS history:", error);
    throw new Error("Failed to retrieve recent SMS history.");
  }
};

exports.getPaginatedSMSHistory = async (limit, offset, user, filters = {}) => {
  const { role = "All", email = "All", status = "All" } = filters;

  let baseQuery = `
    SELECT id, recipients, message, status, reference_id, created_at, sent_by, sent_role, sent_email
    FROM sms_logs
  `;
  let whereClauses = [];
  let params = [];

  // Role filtering
  if (role !== "All") {
    whereClauses.push("sent_role = ?");
    params.push(role.toLowerCase());
  }

  // Email filtering
  if (email !== "All") {
    whereClauses.push("sent_email = ?");
    params.push(email);
  }

  // Status filtering
  if (status !== "All") {
    if (status === "Failed") {
      // cover both "Failed" and descriptive failures like "Failed: Invalid Number"
      whereClauses.push("status LIKE 'Failed%'");
    } else {
      whereClauses.push("status = ?");
      params.push(status);
    }
  }

  // Access control
  if (user && user.role?.toLowerCase() !== "admin") {
    whereClauses.push("sent_by = ?");
    params.push(user.id);
  }

  // Build WHERE clause
  const whereSQL = whereClauses.length
    ? "WHERE " + whereClauses.join(" AND ")
    : "";

  // Paginated logs
  const logs = await Connection(
    `
      ${baseQuery}
      ${whereSQL}
      ORDER BY created_at DESC
      LIMIT ? OFFSET ?
    `,
    [...params, limit, offset]
  );

  // Total count for pagination
  const totalResult = await Connection(
    `
      SELECT COUNT(*) AS total
      FROM sms_logs
      ${whereSQL}
    `,
    params
  );

  const total = totalResult[0]?.total || 0;
  return { logs, total };
};

exports.getSmsCounts = async (user) => {
  try {
    let query;
    let params = [];

    if (user && user.role?.toLowerCase() === "admin") {
      query = `
        SELECT 
          SUM(CASE WHEN status = 'Success' THEN JSON_LENGTH(recipients) ELSE 0 END) AS success_count,
          SUM(CASE WHEN status = 'Failed' THEN JSON_LENGTH(recipients) ELSE 0 END) AS failed_count,
          SUM(CASE WHEN status = 'Pending' THEN JSON_LENGTH(recipients) ELSE 0 END) AS pending_count,
          SUM(JSON_LENGTH(recipients)) AS total
        FROM sms_logs
        WHERE MONTH(created_at) = MONTH(CURRENT_DATE())
          AND YEAR(created_at) = YEAR(CURRENT_DATE())
      `;
    } else if (user && user.id) {
      query = `
        SELECT 
          SUM(CASE WHEN status = 'Success' THEN JSON_LENGTH(recipients) ELSE 0 END) AS success_count,
          SUM(CASE WHEN status = 'Failed' THEN JSON_LENGTH(recipients) ELSE 0 END) AS failed_count,
          SUM(CASE WHEN status = 'Pending' THEN JSON_LENGTH(recipients) ELSE 0 END) AS pending_count,
          SUM(JSON_LENGTH(recipients)) AS total
        FROM sms_logs
        WHERE MONTH(created_at) = MONTH(CURRENT_DATE())
          AND YEAR(created_at) = YEAR(CURRENT_DATE())
          AND sent_by = ?
      `;
      params.push(user.id);
    } else {
      return { success_count: 0, failed_count: 0, pending_count: 0, total: 0 };
    }

    const [result] = await Connection(query, params);
    return (
      result || {
        success_count: 0,
        failed_count: 0,
        pending_count: 0,
        total: 0,
      }
    );
  } catch (err) {
    console.error("Error fetching SMS counts:", err);
    throw err;
  }
};

/**
 * Generate and send OTP only if user exists
 */
exports.requestOtp = async (cpNumber) => {
  if (!cpNumber) throw new Error("Mobile number required");

  // ✅ Check if number exists in users table
  const [user] = await Connection(
    "SELECT id FROM users WHERE cp_number = ? LIMIT 1",
    [cpNumber]
  );
  if (!user) {
    throw new Error("This number is not registered");
  }

  // ✅ Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // ✅ Insert/update OTP
  await Connection(
    `INSERT INTO otp_codes (mobile, otp, expires_at) 
     VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 5 MINUTE))
     ON DUPLICATE KEY UPDATE otp = VALUES(otp), expires_at = VALUES(expires_at)`,
    [cpNumber, otp]
  );

  // ✅ Send SMS without logging OTP in sms_logs
  const smsResult = await exports.sendSMS(
    `Your OTP code is ${otp}`,
    [cpNumber],
    null,
    { skipLogging: true }
  );

  if (!smsResult.success) throw new Error("Failed to send OTP");
  return true;
};

/**
 * Verify OTP
 */
exports.verifyOtp = async (cpNumber, otp) => {
  const [record] = await Connection(
    `SELECT * FROM otp_codes WHERE mobile = ? AND expires_at > NOW()`,
    [cpNumber]
  );

  if (!record || record.otp !== otp) {
    throw new Error("Invalid or expired OTP");
  }

  // Optional: delete OTP after successful verification
  await Connection(`DELETE FROM otp_codes WHERE mobile = ?`, [cpNumber]);

  return true;
};

/**
 * Reset password by cpNumber
 */
exports.resetPassword = async (cpNumber, newPassword) => {
  const hashed = await bcrypt.hash(newPassword, 10);

  const result = await Connection(
    `UPDATE users SET password = ? WHERE cp_number = ?`,
    [hashed, cpNumber]
  );

  if (result.affectedRows === 0) {
    throw new Error("User not found");
  }

  return true;
};

// smsService.js
exports.getSmsFilters = async (user) => {
  try {
    if (user.role === "admin") {
      // Admins see all distinct sent_email values
      const usersResult = await Connection(
        `SELECT DISTINCT sent_email 
         FROM sms_logs 
         WHERE sent_email IS NOT NULL 
         ORDER BY sent_email ASC`
      );

      const users = usersResult.map((row) => row.sent_email);
      return { users };
    } else {
      // Non-admins only see their own email
      return { users: [user.email] };
    }
  } catch (err) {
    console.error("❌ Failed to fetch SMS filter options:", err);
    throw err;
  }
};
