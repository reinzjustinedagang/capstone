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

// services/auditService.js
exports.getPaginatedAuditLogs = async ({
  page = 1,
  limit = 10,
  search = "",
  user = "All",
  userRole = "All",
  action = "All",
  sortBy = "timestamp",
  sortOrder = "desc",
}) => {
  const offset = (page - 1) * limit;

  let where = "WHERE 1=1";
  const params = [];

  if (search) {
    where += ` AND (user LIKE ? OR action LIKE ? OR details LIKE ?)`;
    const s = `%${search}%`;
    params.push(s, s, s);
  }

  if (user && user !== "All") {
    where += " AND user = ?";
    params.push(user);
  }

  if (action && action !== "All") {
    where += " AND action = ?";
    params.push(action);
  }

  if (userRole && userRole !== "All") {
    where += " AND userRole = ?";
    params.push(userRole);
  }

  const allowedSort = ["timestamp", "user", "action", "userRole"];
  const orderBy = allowedSort.includes(sortBy) ? sortBy : "timestamp";
  const order = sortOrder === "asc" ? "ASC" : "DESC";

  try {
    const totalQuery = `SELECT COUNT(*) AS total FROM audit_logs ${where}`;
    const totalResult = await Connection(totalQuery, params);
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    const data = await Connection(
      `SELECT * FROM audit_logs
       ${where}
       ORDER BY ${orderBy} ${order}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    return { logs: data, total, totalPages, page };
  } catch (err) {
    console.error("❌ Failed to retrieve audit log data:", err);
    throw err;
  }
};

// Get all unique users and action types for filters
exports.getAuditFilters = async () => {
  try {
    const usersResult = await Connection(
      `SELECT DISTINCT user FROM audit_logs ORDER BY user ASC`
    );

    const actionsResult = await Connection(
      `SELECT DISTINCT action FROM audit_logs ORDER BY action ASC`
    );

    const users = usersResult.map((row) => row.user);
    const actions = actionsResult.map((row) => row.action);

    return { users, actions };
  } catch (err) {
    console.error("❌ Failed to fetch audit filter options:", err);
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

// Truncate all audit logs
exports.truncateAuditLogs = async () => {
  try {
    await Connection(`TRUNCATE TABLE audit_logs`);
    return { message: "All audit logs have been cleared successfully." };
  } catch (err) {
    console.error("❌ Failed to truncate audit logs:", err);
    throw err;
  }
};
