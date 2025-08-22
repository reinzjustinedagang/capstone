const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");

exports.getDiscounts = async () => {
  const query = `
    SELECT *
    FROM benefits
    WHERE type = 'discount'
    ORDER BY created_at DESC
  `;
  return await Connection(query);
};

exports.getFinancial = async () => {
  const query = `
    SELECT *
    FROM benefits
    WHERE type = 'financial assistance'
    ORDER BY created_at DESC
  `;
  return await Connection(query);
};

exports.getMedical = async () => {
  const query = `
    SELECT *
    FROM benefits
    WHERE type = 'medical benefits'
    ORDER BY created_at DESC
  `;
  return await Connection(query);
};

exports.getPrivilege = async () => {
  const query = `
    SELECT *
    FROM benefits
    WHERE type = 'privileges and perks'
    ORDER BY created_at DESC
  `;
  return await Connection(query);
};

exports.getRA = async () => {
  const query = `
    SELECT *
    FROM benefits
    WHERE type = 'republic acts'
    ORDER BY created_at DESC
  `;
  return await Connection(query);
};

exports.getBenefitsById = async (id) => {
  const query = `
    SELECT *
    FROM benefits
    WHERE id = ?
    LIMIT 1
  `;
  return await Connection(query, [id]);
};

exports.create = async (data, user, ip) => {
  const { type, title, description, location, provider, enacted_date } = data;

  const query = `
    INSERT INTO benefits (type, title, description, location , provider, enacted_date)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const result = await Connection(query, [
    type,
    title,
    description,
    location,
    provider,
    enacted_date,
  ]);

  await logAudit(
    user.id,
    user.email,
    user.role,
    "CREATE",
    `Added ${type}: '${title}'`,
    ip
  );

  return result;
};

exports.update = async (id, data, user, ip) => {
  const { type, title, description, location, provider, enacted_date } = data;

  const query = `
    UPDATE benefits
    SET type = ?, title = ?, description = ?, location = ?, provider = ?, enacted_date = ?
    WHERE id = ?
  `;
  const result = await Connection(query, [
    type,
    title,
    description,
    location,
    provider,
    enacted_date,
    id,
  ]);

  if (result.affectedRows > 0) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "UPDATE",
      `Updated benefit ID ${id}: '${title}'`,
      ip
    );
  }

  return result.affectedRows > 0;
};

exports.remove = async (id, user, ip) => {
  const discount = await Connection(`SELECT title FROM benefits WHERE id = ?`, [
    id,
  ]);
  if (discount.length === 0) return false;

  const query = `DELETE FROM benefits WHERE id = ?`;
  const result = await Connection(query, [id]);

  if (result.affectedRows > 0) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "DELETE",
      `Deleted benefit: '${discount[0].title}'`,
      ip
    );
  }

  return result.affectedRows > 0;
};
