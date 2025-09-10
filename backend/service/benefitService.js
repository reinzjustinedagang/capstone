const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");
const {
  extractCloudinaryPublicId,
  safeCloudinaryDestroy,
  deleteLocalImage,
} = require("../utils/serviceHelpers");

// Get total number of benefits grouped by type
exports.getBenefitsCounts = async () => {
  const query = `
    SELECT COUNT(*) AS total
    FROM benefits
    WHERE type != 'republic-acts'
  `;
  const [rows] = await Connection(query);

  return rows[0]?.total || 0;
};

// Get all benefits (limit 5)
exports.getAll = async () => {
  const query = `
    SELECT type, description, provider, image_url
    FROM benefits
    WHERE type != 'republic-acts'
    ORDER BY created_at ASC
    LIMIT 5
  `;
  return await Connection(query);
};

// Get benefits by type
exports.getNational = async () => {
  return await Connection(
    `SELECT * FROM benefits WHERE type = 'national' ORDER BY created_at DESC`
  );
};

exports.getLocal = async () => {
  return await Connection(
    `SELECT * FROM benefits WHERE type = 'local' ORDER BY created_at DESC`
  );
};

exports.getRa = async () => {
  return await Connection(
    `SELECT * FROM benefits WHERE type = 'republic-acts' ORDER BY created_at DESC`
  );
};

exports.getBenefitsById = async (id) => {
  return await Connection(`SELECT * FROM benefits WHERE id = ? LIMIT 1`, [id]);
};

// CREATE benefit
exports.create = async (data, user, ip) => {
  const { type, title, description, provider, enacted_date, image_url } = data;

  if (!type || !description) {
    throw new Error("Type and description are required");
  }

  if (type === "republic acts" && !title) {
    throw new Error("Title is required for Republic Acts");
  }

  if (type === "republic acts" && !enacted_date) {
    throw new Error("Enacted date is required for Republic Acts");
  }

  // if (type !== "republic acts" && !image_url) {
  //   throw new Error("Image is required for non-Republic Acts");
  // }

  const query = `
    INSERT INTO benefits (type, title, description, provider, enacted_date, image_url)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  const enacted_date_safe =
    enacted_date && enacted_date !== "" ? enacted_date : null;

  const result = await Connection(query, [
    type,
    title,
    description,
    provider,
    enacted_date_safe,
    image_url,
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

// UPDATE benefit
exports.update = async (id, data, user, ip) => {
  const { type, title, description, provider, enacted_date, image_url } = data;

  if (!type || !description) {
    throw new Error("Type and description are required");
  }

  if (type === "republic acts" && !title) {
    throw new Error("Title is required for Republic Acts");
  }

  if (type === "republic acts" && !enacted_date) {
    throw new Error("Enacted date is required for Republic Acts");
  }

  // if (type !== "republic acts" && !image_url) {
  //   throw new Error("Image is required for non-Republic Acts");
  // }

  // Fetch current benefit
  const benefits = await Connection(
    `SELECT image_url FROM benefits WHERE id = ?`,
    [id]
  );
  const current = benefits[0];
  if (!current) throw new Error("Benefit not found");

  // Delete old image if new one is provided
  if (image_url && current.image_url && current.image_url !== image_url) {
    const publicId = extractCloudinaryPublicId(current.image_url);
    if (publicId) await safeCloudinaryDestroy(publicId);
    else await deleteLocalImage(current.image_url);
  }

  const enacted_date_safe =
    enacted_date && enacted_date !== "" ? enacted_date : null;

  const query = `
    UPDATE benefits
    SET type = ?, title = ?, description = ?, provider = ?, enacted_date = ?, image_url = ?
    WHERE id = ?
  `;
  const result = await Connection(query, [
    type,
    title,
    description,
    provider,
    enacted_date_safe,
    image_url,
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

// DELETE benefit
exports.remove = async (id, user, ip) => {
  const benefits = await Connection(
    `SELECT title, image_url FROM benefits WHERE id = ?`,
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
      `Deleted benefit: '${benefit.title}'`,
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
