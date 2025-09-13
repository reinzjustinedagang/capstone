const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");
const cloudinary = require("../utils/cloudinary");

const extractCloudinaryPublicId = (url) => {
  if (!url || typeof url !== "string") return null; // <-- safeguard
  if (!url.includes("res.cloudinary.com")) return null;

  const parts = url.split("/");
  const filename = parts.pop().split(".")[0];
  const folder = parts.pop();
  return `${folder}/${filename}`;
};

const safeCloudinaryDestroy = async (publicId, retries = 3, delayMs = 1000) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      await cloudinary.uploader.destroy(publicId);
      console.log(`Deleted Cloudinary image: ${publicId}`);
      return;
    } catch (error) {
      console.error(
        `Attempt ${attempt} to delete Cloudinary image failed:`,
        error
      );
      if (attempt === retries) throw error;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
};

// Fetch system settings (only 1 record)
exports.getSystemSettings = async () => {
  const result = await Connection(`SELECT * FROM system_setting WHERE id = 1`);
  return result.length > 0 ? result[0] : null;
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

exports.updateAbout = async (
  mission,
  vision,
  preamble,
  introduction,
  objective,
  user,
  ip
) => {
  const existing = await Connection(
    `SELECT mission, vision, preamble, introduction, objective FROM system_setting WHERE id = 1`
  );
  const old = existing[0] || {};
  const actionType = existing.length === 0 ? "INSERT" : "UPDATE";
  const changes = [];

  if (existing.length === 0) {
    await Connection(
      `INSERT INTO system_setting (id, mission, vision, preamble, introduction, objective) VALUES (1, ?, ?, ?, ?, ?)`,
      [mission, vision, preamble, introduction, objective]
    );
    changes.push("Created initial About OSCA settings.");
  } else {
    await Connection(
      `UPDATE system_setting SET mission = ?, vision = ?, preamble = ?, introduction = ?, objective = ? WHERE id = 1`,
      [mission, vision, preamble, introduction, objective]
    );
  }

  // Track changes
  if (old.mission !== mission) changes.push(`Mission updated`);
  if (old.vision !== vision) changes.push(`Vision updated`);
  if (old.preamble !== preamble) changes.push(`Preamble updated`);
  if (old.introduction !== introduction) changes.push(`Introduction updated`);
  if (old.objective !== objective) changes.push(`Objective updated`);

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

// --- Update or insert team members ---
exports.updateTeam = async (team = [], user, ip) => {
  const existingRows = await Connection(
    `SELECT team FROM system_setting WHERE id = 1`
  );
  const oldTeam = existingRows[0]?.team ? JSON.parse(existingRows[0].team) : [];
  const actionType = existingRows.length === 0 ? "INSERT" : "UPDATE";
  const changes = [];

  // --- Delete removed Cloudinary images ---
  const oldTeamMap = oldTeam.reduce((acc, member) => {
    if (member.public_id) acc[member.public_id] = true;
    return acc;
  }, {});
  const newTeamPublicIds = team
    .filter((m) => m.public_id)
    .map((m) => m.public_id);
  const removedPublicIds = Object.keys(oldTeamMap).filter(
    (pid) => !newTeamPublicIds.includes(pid)
  );

  for (const pid of removedPublicIds) {
    await safeCloudinaryDestroy(pid);
    changes.push(`Deleted old team image: ${pid}`);
  }

  // --- Save team JSON ---
  const teamJSON = JSON.stringify(team);
  if (existingRows.length === 0) {
    await Connection(`INSERT INTO system_setting (id, team) VALUES (1, ?)`, [
      teamJSON,
    ]);
    changes.push("Created initial team data.");
  } else {
    await Connection(`UPDATE system_setting SET team = ? WHERE id = 1`, [
      teamJSON,
    ]);
    changes.push("Team data updated.");
  }

  // --- Log audit ---
  if (user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      actionType,
      changes.join("; "),
      ip
    );
  }

  return { actionType, changes, team };
};

// --- Fetch team members ---
exports.getTeam = async () => {
  const result = await Connection(
    `SELECT team FROM system_setting WHERE id = 1`
  );
  if (!result.length) return [];
  return result[0].team ? JSON.parse(result[0].team) : [];
};
