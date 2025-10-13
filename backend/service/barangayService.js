const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");

exports.getPaginatedBarangays = async (
  page = 1,
  limit = 10,
  search = "",
  sortOrder = "ASC"
) => {
  const offset = (page - 1) * limit;
  const searchQuery = `%${search}%`;

  // Ensure sort order is valid
  const safeSortOrder = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

  const orderClause = `CAST(controlNo AS UNSIGNED) ${safeSortOrder}`;

  let data, countResult;

  if (search && search.trim() !== "") {
    data = await Connection(
      `SELECT * FROM barangays 
       WHERE barangay_name LIKE ? OR controlNo LIKE ?
       ORDER BY ${orderClause} 
       LIMIT ? OFFSET ?`,
      [searchQuery, searchQuery, parseInt(limit), parseInt(offset)]
    );

    [countResult] = await Connection(
      `SELECT COUNT(*) AS total 
       FROM barangays 
       WHERE barangay_name LIKE ? OR controlNo LIKE ?`,
      [searchQuery, searchQuery]
    );
  } else {
    data = await Connection(
      `SELECT * FROM barangays 
       ORDER BY ${orderClause} 
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    [countResult] = await Connection("SELECT COUNT(*) AS total FROM barangays");
  }

  return {
    data,
    total: countResult.total,
  };
};

// Get all barangay
exports.getAllBarangay = async () => {
  const result = await Connection("SELECT * FROM barangays");
  return result;
};

// Helper function
function formatControlNo(no) {
  return String(no).padStart(3, "0");
}

// Create a new barangay
exports.createBarangay = async (name, controlNo, user, ip) => {
  const formattedControlNo = formatControlNo(controlNo);

  const existing = await Connection(
    "SELECT * FROM barangays WHERE barangay_name = ?",
    [name.trim()]
  );
  if (existing.length > 0) {
    const error = new Error("Barangay already exists.");
    error.status = 409;
    throw error;
  }

  const result = await Connection(
    "INSERT INTO barangays (barangay_name, controlNo) VALUES (?, ?)",
    [name.trim(), formattedControlNo]
  );

  if (result.affectedRows === 1 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "CREATE",
      `Created barangay '${name}' with Control No. ${formattedControlNo}.`,
      ip
    );
  }

  return result;
};

// Update barangay
exports.updateBarangay = async (id, name, controlNo, user, ip) => {
  const formattedControlNo = formatControlNo(controlNo);

  const existing = await Connection(
    "SELECT id FROM barangays WHERE barangay_name = ? AND controlNo = ? AND id != ?",
    [name.trim(), formattedControlNo, id]
  );
  if (existing.length > 0) {
    const error = new Error("Another barangay with this name already exists.");
    error.status = 409;
    throw error;
  }

  const [oldData] = await Connection("SELECT * FROM barangays WHERE id = ?", [
    id,
  ]);

  const result = await Connection(
    "UPDATE barangays SET barangay_name = ?, controlNo = ? WHERE id = ?",
    [name, formattedControlNo, id]
  );

  if (result.affectedRows === 1 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "UPDATE",
      `Updated barangay ${oldData.barangay_name} → ${name} (Control No: ${formattedControlNo}).`,
      ip
    );
  }

  return result;
};

// Delete a barangay
exports.deleteBarangay = async (id, user, ip) => {
  const [barangay] = await Connection(
    "SELECT barangay_name FROM barangays WHERE id = ?",
    [id]
  );

  const result = await Connection("DELETE FROM barangays WHERE id = ?", [id]);

  if (result.affectedRows === 1 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "DELETE",
      `Deleted barangay '${barangay?.barangay_name}'`,
      ip
    );
  }

  return result;
};

// Get total number of barangays
exports.getBarangayCount = async () => {
  const [result] = await Connection("SELECT COUNT(*) AS count FROM barangays");
  return result.count;
};
