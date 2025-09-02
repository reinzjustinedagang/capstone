const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");

// Get all barangays
// Get paginated barangays
exports.getPaginatedBarangays = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;

  const data = await Connection(
    "SELECT id, barangay_name, created_at FROM barangays ORDER BY id DESC LIMIT ? OFFSET ?",
    [parseInt(limit), parseInt(offset)]
  );

  const [countResult] = await Connection(
    "SELECT COUNT(*) AS total FROM barangays"
  );

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
exports.createBarangay = async (name, user) => {
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
    "INSERT INTO barangays (barangay_name) VALUES (?)",
    [name.trim()]
  );

  if (result.affectedRows === 1 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "CREATE",
      `Created barangay '${name}'.`
    );
  }

  return result;
};

// Update a barangay
exports.updateBarangay = async (id, name, user) => {
  const existing = await Connection(
    "SELECT id FROM barangays WHERE barangay_name = ? AND id != ?",
    [name.trim(), id]
  );
  if (existing.length > 0) {
    const error = new Error("Another barangay with this name already exists.");
    error.status = 409;
    throw error;
  }

  const [oldData] = await Connection(
    "SELECT barangay_name FROM barangays WHERE id = ?",
    [id]
  );

  const result = await Connection(
    "UPDATE barangays SET barangay_name = ? WHERE id = ?",
    [name, id]
  );

  if (result.affectedRows === 1 && user) {
    const changes =
      oldData.barangay_name !== name
        ? `barangay_name: '${oldData.barangay_name}' → '${name}'`
        : "No changes.";

    await logAudit(
      user.id,
      user.email,
      user.role,
      "UPDATE",
      `Updated barangay ${name}: ${changes}`
    );
  }

  return result;
};

// Delete a barangay
exports.deleteBarangay = async (id, user) => {
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
      `Deleted barangay '${barangay?.barangay_name}'`
    );
  }

  return result;
};

// Get total number of barangays
exports.getBarangayCount = async () => {
  const [result] = await Connection("SELECT COUNT(*) AS count FROM barangays");
  return result.count;
};
