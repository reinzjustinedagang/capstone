const Connection = require("../db/Connection");
const cloudinary = require("../utils/cloudinary");
const { logAudit } = require("./auditService");
const {
  safeCloudinaryDestroy,
  uploadToCloudinary,
} = require("../utils/serviceHelpers");

/**
 * Upload buffer to Cloudinary (returns result)
 */
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const passthrough = new stream.PassThrough();
    passthrough.end(buffer);

    cloudinary.uploader
      .upload_stream({ folder }, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      })
      .end(buffer);
  });
};

// Get system settings (all fields)
exports.getSystemSettings = async () => {
  const result = await Connection(`SELECT * FROM system_setting WHERE id = 1`);
  if (result.length === 0) return null;

  const settings = result[0];
  return {
    ...settings,
    introduction: settings.introduction ? settings.introduction.toString() : "",
    objective: settings.objective ? settings.objective.toString() : "",
    mission: settings.mission ? settings.mission.toString() : "",
    vision: settings.vision ? settings.vision.toString() : "",
    preamble: settings.preamble ? settings.preamble.toString() : "",
    team:
      typeof settings.team === "string"
        ? JSON.parse(settings.team)
        : settings.team || [],
  };
};
// Update or insert system settings
exports.updateSystemSettings = async (
  systemName,
  municipality,
  province,
  sealPath,
  user,
  ip
) => {
  const existingRows = await Connection(
    `SELECT * FROM system_setting WHERE id = 1`
  );
  const old = existingRows[0] || {};
  let actionType = existingRows.length === 0 ? "INSERT" : "UPDATE";
  const changes = [];

  // If new seal uploaded and old seal exists, delete old one
  if (sealPath && old.seal && old.seal !== sealPath) {
    const publicId = extractCloudinaryPublicId(old.seal);
    if (publicId) {
      await safeCloudinaryDestroy(publicId);
    }
  }

  if (existingRows.length === 0) {
    await Connection(
      `INSERT INTO system_setting (id, system_name, municipality, province, seal) VALUES (1, ?, ?, ?, ?)`,
      [systemName, municipality, province, sealPath]
    );
    changes.push("Initial system settings created.");
  } else {
    await Connection(
      `UPDATE system_setting SET system_name = ?, municipality = ?, province = ?, seal = ? WHERE id = 1`,
      [systemName, municipality, province, sealPath || old.seal]
    );
  }

  // Track changes
  if (old.system_name !== systemName)
    changes.push(`System name: '${old.system_name}' → '${systemName}'`);
  if (old.municipality !== municipality)
    changes.push(`Municipality: '${old.municipality}' → '${municipality}'`);
  if (old.province !== province)
    changes.push(`Province: '${old.province}' → '${province}'`);
  if (sealPath && old.seal !== sealPath) changes.push(`Seal updated`);

  // Log audit
  if (changes.length > 0 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      actionType,
      changes.join("; "),
      ip
    );
  }

  return { actionType, changes };
};

// Update About OSCA
exports.updateAboutOSCA = async (mission, vision, preamble, user, ip) => {
  const existing = await Connection(
    `SELECT * FROM system_setting WHERE id = 1`
  );
  const old = existing[0] || {};
  const actionType = existing.length === 0 ? "INSERT" : "UPDATE";
  const changes = [];

  if (existing.length === 0) {
    await Connection(
      `INSERT INTO system_setting (id, mission, vision, preamble) VALUES (1, ?, ?, ?)`,
      [mission, vision, preamble]
    );
    changes.push("Initial About OSCA created");
  } else {
    await Connection(
      `UPDATE system_setting SET mission = ?, vision = ?, preamble = ? WHERE id = 1`,
      [mission, vision, preamble]
    );
    if (old.mission !== mission) changes.push("Mission updated");
    if (old.vision !== vision) changes.push("Vision updated");
    if (old.preamble !== preamble) changes.push("Preamble updated");
  }

  if (changes.length > 0 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      actionType,
      changes.join("; "),
      ip
    );
  }

  return { actionType, changes };
};

exports.saveKey = async (key) => {
  if (!key) throw { status: 400, message: "Key is required" };

  // 1. Clean up expired unused keys (older than 5 minutes)
  await Connection(
    `DELETE FROM dev_keys 
     WHERE used = 0 
     AND created_at < NOW() - INTERVAL 5 MINUTE`
  );

  // 2. Check if an unused key exists that is still valid
  const existing = await Connection(
    `SELECT * FROM dev_keys 
     WHERE used = 0 
     AND created_at >= NOW() - INTERVAL 5 MINUTE 
     LIMIT 1`
  );

  if (existing.length > 0) {
    return {
      message: "An unused developer key already exists and is still valid",
      skipped: true,
      expiresAt: new Date(
        new Date(existing[0].created_at).getTime() + 5 * 60000
      ), // Optional: expiry info
    };
  }

  // 3. Insert new key with created_at timestamp
  await Connection(
    "INSERT INTO dev_keys (`key`, used, created_at) VALUES (?, 0, NOW())",
    [key]
  );

  return { message: "Developer key created successfully", skipped: false };
};

// Update About Us
exports.updateAboutUs = async (req) => {
  const { introduction, objective, team } = req.body;
  if (!team) throw { status: 400, message: "Team data is required" };

  let parsedTeam;
  try {
    parsedTeam = JSON.parse(team);
  } catch (err) {
    throw { status: 400, message: "Invalid team JSON" };
  }

  // Handle uploaded team images
  if (req.files && req.files.teamImages) {
    const files = Array.isArray(req.files.teamImages)
      ? req.files.teamImages
      : [req.files.teamImages];

    let indexes = Array.isArray(req.body.teamIndexes)
      ? req.body.teamIndexes
      : [req.body.teamIndexes];

    indexes = indexes.map((i) => parseInt(i));

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const index = indexes[i];
      if (!parsedTeam[index]) continue;

      // Delete old image if exists
      if (parsedTeam[index].public_id) {
        await safeCloudinaryDestroy(parsedTeam[index].public_id);
      }

      const result = await uploadToCloudinary(file.buffer, "team");
      parsedTeam[index].image = result.secure_url;
      parsedTeam[index].public_id = result.public_id;
    }
  }

  // Update DB
  await Connection(
    `UPDATE system_setting SET introduction = ?, objective = ?, team = ? WHERE id = 1`,
    [introduction, objective, JSON.stringify(parsedTeam)]
  );

  return { introduction, objective, team: parsedTeam };
};
