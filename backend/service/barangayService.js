const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");

// Get paginated barangays with optional search + sorting
exports.getPaginatedBarangays = async (
  page = 1,
  limit = 10,
  search = "",
  sortBy = "barangay_name",
  sortOrder = "ASC"
) => {
  const offset = (page - 1) * limit;
  const searchQuery = `%${search}%`;

  // ✅ allow only specific safe columns
  const allowedSortColumns = ["barangay_name", "controlNo", "created_at"];
  const safeSortBy = allowedSortColumns.includes(sortBy)
    ? sortBy
    : "barangay_name";
  const safeSortOrder = sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC";

  let data, countResult;

  if (search && search.trim() !== "") {
    data = await Connection(
      `SELECT * FROM barangays 
       WHERE barangay_name LIKE ? 
       ORDER BY ${safeSortBy} ${safeSortOrder} 
       LIMIT ? OFFSET ?`,
      [searchQuery, parseInt(limit), parseInt(offset)]
    );

    [countResult] = await Connection(
      "SELECT COUNT(*) AS total FROM barangays WHERE barangay_name LIKE ?",
      [searchQuery]
    );
  } else {
    data = await Connection(
      `SELECT * FROM barangays 
       ORDER BY ${safeSortBy} ${safeSortOrder} 
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

// Create a new barangay
exports.createBarangay = async (name, controlNo, user, ip) => {
  // Check for duplicate name
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
    [name.trim(), controlNo]
  );

  if (result.affectedRows === 1 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "CREATE",
      `Created barangay '${name}'.`,
      ip
    );
  }

  return result;
};

// Update a barangay
exports.updateBarangay = async (id, name, controlNo, user, ip) => {
  const existing = await Connection(
    "SELECT id FROM barangays WHERE barangay_name = ? AND controlNo = ? AND id != ?",
    [name.trim(), controlNo, id]
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
    [name, controlNo, id]
  );

  if (result.affectedRows === 1 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "UPDATE",
      `Updated barangay ${oldData.barangay_name} → ${name}.`,
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
