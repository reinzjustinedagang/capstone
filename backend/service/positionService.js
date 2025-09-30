const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");

exports.getAll = async () => {
  const query = `SELECT * FROM positions ORDER BY created_at DESC`;
  return await Connection(query);
};

exports.getOrgChart = async () => {
  const query = `SELECT * FROM positions WHERE type = 'orgchart'`;
  return await Connection(query);
};

exports.getFederation = async () => {
  const query = `SELECT * FROM positions WHERE type = 'federation'`;
  return await Connection(query);
};

exports.getById = async (id) => {
  const query = `SELECT * FROM positions WHERE id = ? LIMIT 1`;
  return await Connection(query, [id]);
};

exports.create = async (data, user, ip) => {
  const { name, type } = data;

  // Check for duplicates
  const existing = await Connection(
    `SELECT id FROM positions WHERE name = ? AND type = ? LIMIT 1`,
    [name, type]
  );
  if (existing.length > 0) {
    throw new Error(`Position '${name}' already exists in '${type}'`);
  }

  const query = `INSERT INTO positions (name, type) VALUES (?, ?)`;
  const result = await Connection(query, [name, type]);

  await logAudit(
    user.id,
    user.email,
    user.role,
    "CREATE",
    `Added position: '${name}'`,
    ip
  );

  return result;
};

exports.update = async (id, data, user, ip) => {
  const { name, type } = data;

  // Check for duplicates (exclude current record)
  const existing = await Connection(
    `SELECT id FROM positions WHERE name = ? AND type = ? AND id != ? LIMIT 1`,
    [name, type, id]
  );
  if (existing.length > 0) {
    throw new Error(`Position '${name}' already exists in '${type}'`);
  }

  const query = `UPDATE positions SET name = ?, type = ? WHERE id = ?`;
  const result = await Connection(query, [name, type, id]);

  if (result.affectedRows > 0) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "UPDATE",
      `Updated position: '${name}'`,
      ip
    );
  }

  return result.affectedRows > 0;
};

exports.remove = async (id, user, ip) => {
  const rows = await Connection(`SELECT name FROM positions WHERE id = ?`, [
    id,
  ]);
  if (rows.length === 0) return false;

  const query = `DELETE FROM positions WHERE id = ?`;
  const result = await Connection(query, [id]);

  if (result.affectedRows > 0) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "DELETE",
      `Deleted position: '${rows[0].name}'`,
      ip
    );
  }

  return result.affectedRows > 0;
};
