const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");

exports.getAll = async () => {
  const query = `SELECT * FROM form_fields ORDER BY \`group\`, \`order\``;
  return await Connection(query);
};

exports.getOutside = async () => {
  const query = `SELECT * FROM form_fields WHERE show_outside = 1 ORDER BY \`group\`, \`order\``;
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
    show_outside = 0,
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
    INSERT INTO form_fields (field_name, label, type, options, required, \`group\`, \`order\`, show_outside)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const result = await Connection(query, [
    field_name,
    label,
    type,
    options,
    required,
    group,
    order,
    show_outside,
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
    show_outside = 0,
  } = data;
  const query = `
    UPDATE form_fields
    SET field_name = ?, label = ?, type = ?, options = ?, required = ?, \`group\` = ?, \`order\` = ?, show_outside = ?
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
    show_outside,
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

exports.getGroup = async () => {
  const query = `SELECT * FROM form_group ORDER BY group_label ASC`;
  return await Connection(query);
};

exports.createGroup = async (data, user, ip) => {
  const { group_key, group_label } = data;

  // 1. Check for duplicate field_name
  const existing = await Connection(
    `SELECT id FROM form_group WHERE group_key = ? OR group_label = ? LIMIT 1`,
    [group_key, group_label]
  );

  if (existing.length > 0) {
    throw new Error("A group with the same name or label already exists.");
  }

  // 2. Insert new field
  const query = `
    INSERT INTO form_group (group_key, group_label)
    VALUES (?, ?)
  `;
  const result = await Connection(query, [group_key, group_label]);

  // 3. Log audit
  await logAudit(
    user.id,
    user.email,
    user.role,
    "CREATE",
    `Added form group: '${group_label}'`,
    ip
  );

  return result;
};

exports.reorder = async (fields, user, ip) => {
  if (!Array.isArray(fields) || fields.length === 0) return;

  // Loop through each field and update its order
  for (const f of fields) {
    const query = `UPDATE form_fields SET \`order\` = ? WHERE id = ?`;
    await Connection(query, [parseInt(f.order), f.id]);
  }

  // Optional: Log audit
  await logAudit(
    user.id,
    user.email,
    user.role,
    "UPDATE",
    `Reordered ${fields.length} form fields`,
    ip
  );

  return true;
};

exports.deleteGroupWithFields = async (groupKey, user, ip) => {
  try {
    // First delete all fields that belong to this group
    await Connection(
      `DELETE f 
       FROM form_fields f
       JOIN form_group g ON f.\`group\` = g.group_key
       WHERE g.group_key = ?`,
      [groupKey]
    );

    // Then delete the group itself
    await Connection("DELETE FROM form_group WHERE group_key = ?", [groupKey]);

    if (user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "DELETE",
        `Deleted group '${groupKey}' and all its related fields`,
        ip
      );
    }

    return { message: "Group and all related fields deleted successfully!" };
  } catch (err) {
    console.error("❌ Error deleting group:", err.sqlMessage || err.message);
    throw err;
  }
};
