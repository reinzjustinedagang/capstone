const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");
const {
  extractCloudinaryPublicId,
  safeCloudinaryDestroy,
  deleteLocalImage,
} = require("../utils/serviceHelpers");

exports.getBenefitsCounts = async (user) => {
  if (user && user.role === "admin") {
    const [result] = await Connection(
      "SELECT COUNT(*) AS count FROM benefits WHERE type != 'republic-acts' AND approved = 1"
    );
    return result.count;
  } else if (user) {
    const [result] = await Connection(
      "SELECT COUNT(*) AS count FROM benefits WHERE type != 'republic-acts' AND approved = 1 AND created_by = ?",
      [user.id]
    );
    return result.count;
  } else {
    // no session user
    return 0;
  }
};

exports.getThreeRa = async () => {
  return await Connection(
    `SELECT * FROM benefits WHERE type = 'republic-acts' AND approved = 1 ORDER BY created_at DESC LIMIT 3`
  );
};

// Get all benefits (limit 5)
exports.getAll = async () => {
  const query = `
    SELECT id, type, description, provider, image_url
    FROM benefits
    WHERE type != 'republic-acts' AND approved = 1
    ORDER BY created_at ASC
    LIMIT 5
  `;
  return await Connection(query);
};

// Get benefits by type
exports.getNational = async (user) => {
  if (user && user.role === "admin") {
    return await Connection(
      `SELECT * FROM benefits WHERE type = 'national' ORDER BY created_at DESC`
    );
  } else {
    return await Connection(
      `SELECT * FROM benefits WHERE type = 'national' AND created_by = ? ORDER BY created_at DESC`,
      [user.id]
    );
  }
};

exports.getLocal = async (user) => {
  if (user && user.role === "admin") {
    return await Connection(
      `SELECT * FROM benefits WHERE type = 'local' ORDER BY created_at DESC`
    );
  } else {
    return await Connection(
      `SELECT * FROM benefits WHERE type = 'local' AND created_by = ? ORDER BY created_at DESC`,
      [user.id]
    );
  }
};

exports.getRa = async (user) => {
  if (user && user.role === "admin") {
    return await Connection(
      `SELECT * FROM benefits WHERE type = 'republic-acts' ORDER BY created_at DESC`
    );
  } else {
    return await Connection(
      `SELECT * FROM benefits WHERE type = 'republic-acts' AND created_by = ? ORDER BY created_at DESC`,
      [user.id]
    );
  }
};

exports.getPublicRa = async () => {
  return await Connection(`
    SELECT *
    FROM benefits
    WHERE type = 'republic-acts' AND approved = 1
    ORDER BY created_at ASC
  `);
};

exports.getPublicBenefits = async () => {
  return await Connection(`
    SELECT *
    FROM benefits
    WHERE approved = 1
    ORDER BY created_at ASC
  `);
};

// benefitsService.js
exports.getPublicById = async (id) => {
  const query = `
    SELECT * 
    FROM benefits 
    WHERE id = ? AND approved = 1
  `;
  const rows = await Connection(query, [id]);
  return rows[0] || null;
};

exports.getBenefitsById = async (id) => {
  return await Connection(`SELECT * FROM benefits WHERE id = ? LIMIT 1`, [id]);
};

// CREATE benefit
exports.create = async (data, user, ip) => {
  const { type, title, description, provider, enacted_date, image_url } = data;

  if (!type || !description)
    throw new Error("Type and description are required");

  const enacted_date_safe =
    enacted_date && enacted_date !== "" ? enacted_date : null;

  const approved = user.role === "admin" ? 1 : 0;

  const query = `
    INSERT INTO benefits (type, title, description, provider, enacted_date, image_url, created_by, approved)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const result = await Connection(query, [
    type,
    title,
    description,
    provider,
    enacted_date_safe,
    image_url,
    user.id,
    approved,
  ]);

  await logAudit(
    user.id,
    user.email,
    user.role,
    "CREATE",
    `Added new ${type} benefit: '${title}' (Approved: ${
      approved === 1 ? "true" : "false"
    })`,
    ip
  );

  return result;
};

// UPDATE benefit
exports.update = async (id, data, user, ip) => {
  const { type, title, description, provider, enacted_date, image_url } = data;

  const enacted_date_safe =
    enacted_date && enacted_date !== "" ? enacted_date : null;

  const approved = user.role === "admin" ? 1 : 0;

  const query = `
    UPDATE benefits
    SET type = ?, title = ?, description = ?, provider = ?, enacted_date = ?, image_url = ?, approved = ?
    WHERE id = ?
  `;

  const result = await Connection(query, [
    type,
    title,
    description,
    provider,
    enacted_date_safe,
    image_url,
    approved,
    id,
  ]);

  if (result.affectedRows > 0) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "UPDATE",
      `Update ${type} benefit: '${title}' (Approved: ${
        approved === 1 ? "true" : "false"
      })`,
      ip
    );
  }

  return result.affectedRows > 0;
};

// Approve benefit (Admin only)
exports.approve = async (id, user, ip) => {
  const result = await Connection(
    `UPDATE benefits 
     SET approved = 1, approved_by = ?, approved_at = NOW() 
     WHERE id = ?`,
    [user.id, id]
  );

  const [benefit] = await Connection(
    `SELECT title, type FROM benefits WHERE id = ?`,
    [id]
  );

  if (result.affectedRows > 0 && benefit) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "APPROVE",
      `Approved ${benefit.type} benefit: '${benefit.title}'`,
      ip
    );
  }

  return result.affectedRows > 0;
};

// DELETE benefit
exports.remove = async (id, user, ip) => {
  const benefits = await Connection(
    `SELECT type, title, image_url FROM benefits WHERE id = ?`,
    [id]
  );
  const benefit = benefits[0];
  if (!benefit) return false;

  const result = await Connection(`DELETE FROM benefits WHERE id = ?`, [id]);

  if (result.affectedRows > 0) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "DELETE",
      `Deleted ${benefit.type} benefit: '${benefit.title}'`,
      ip
    );
  }

  if (benefit.image_url) {
    const publicId = extractCloudinaryPublicId(benefit.image_url);
    if (publicId) await safeCloudinaryDestroy(publicId);
    else await deleteLocalImage(benefit.image_url);
  }

  return result.affectedRows > 0;
};
