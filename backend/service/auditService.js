const Connection = require("../db/Connection");

exports.logAudit = async (
  userId,
  user,
  userRole,
  action,
  details,
  ipAddress
) => {
  const safeIp = ipAddress || "UNKNOWN";
  try {
    await Connection(
      `
      INSERT INTO audit_logs (userId, user, userRole, action, details, ipAddress)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [userId, user, userRole, action, details, safeIp]
    );
  } catch (err) {
    console.error("❌ Failed to log audit entry:", err);
    throw err;
  }
};

exports.getLogAudit = async () => {
  try {
    const rows = await Connection(`SELECT * FROM audit_logs`);
    return rows;
  } catch (err) {
    console.error("❌ Failed to retrieve log audit data:", err);
  }
};

exports.getPaginatedAuditLogs = async (page, limit) => {
  const offset = (page - 1) * limit;

  try {
    const logs = await Connection(
      `SELECT * FROM audit_logs ORDER BY timestamp DESC LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalRows = await Connection(
      `SELECT COUNT(*) AS total FROM audit_logs`
    );
    const total = totalRows[0].total;

    return {
      logs,
      total,
      totalPages: Math.ceil(total / limit),
      page,
    };
  } catch (err) {
    console.error("❌ Failed to retrieve log audit data:", err);
    throw err;
  }
};

// Get all login records for a specific user
exports.getLoginTrailsByUserId = async (userId) => {
  try {
    const results = await Connection(
      `
      SELECT id,timestamp, userId, user, userRole, action, ipAddress
      FROM audit_logs
      WHERE userId = ? AND action = 'LOGIN'
      ORDER BY timestamp DESC
      `,
      [userId]
    );

    return results;
  } catch (err) {
    console.error("❌ Error fetching login trails:", err);
    throw err;
  }
};
