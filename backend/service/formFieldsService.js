const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");

exports.getAll = async () => {
  const query = `SELECT * FROM form_fields ORDER BY \`group\`, \`order\``;
  return await Connection(query);
};

exports.getById = async (id) => {
  const query = `SELECT * FROM form_fields WHERE id = ? LIMIT 1`;
  const result = await Connection(query, [id]);
  return result[0] || null;
};

exports.create = async (data, user, ip) => {
  const {
    field_name,
    label,
    type,
    options = null,
    required = 0,
    group = "",
    order = 0,
  } = data;

  // 1. Check for duplicate field_name
  const existing = await Connection(
    `SELECT id FROM form_fields WHERE field_name = ? OR label = ? LIMIT 1`,
    [field_name, label]
  );

  if (existing.length > 0) {
    throw new Error("A field with the same name or label already exists.");
  }

  // 2. Insert new field
  const query = `
    INSERT INTO form_fields (field_name, label, type, options, required, \`group\`, \`order\`)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await Connection(query, [
    field_name,
    label,
    type,
    options,
    required,
    group,
    order,
  ]);

  // 3. Log audit
  await logAudit(
    user.id,
    user.email,
    user.role,
    "CREATE",
    `Added field: '${label}'`,
    ip
  );

  return result;
};

exports.update = async (id, data, user, ip) => {
  const {
    field_name,
    label,
    type,
    options = null,
    required = 0,
    group = "",
    order = 0,
  } = data;
  const query = `
    UPDATE form_fields
    SET field_name = ?, label = ?, type = ?, options = ?, required = ?, \`group\` = ?, \`order\` = ?
    WHERE id = ?
  `;
  const result = await Connection(query, [
    field_name,
    label,
    type,
    options,
    required,
    group,
    order,
    id,
  ]);

  if (result.affectedRows > 0) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "UPDATE",
      `Updated field ID ${id}: '${label}'`,
      ip
    );
  }
  return result.affectedRows > 0;
};

exports.remove = async (id, user, ip) => {
  const field = await Connection(`SELECT label FROM form_fields WHERE id = ?`, [
    id,
  ]);
  if (!field.length) return false;

  const query = `DELETE FROM form_fields WHERE id = ?`;
  const result = await Connection(query, [id]);

  if (result.affectedRows > 0) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "DELETE",
      `Deleted field: '${field[0].label}'`,
      ip
    );
  }
  return result.affectedRows > 0;
};
