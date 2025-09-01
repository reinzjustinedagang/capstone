const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");
const fs = require("fs/promises");
const path = require("path");
const cloudinary = require("../utils/cloudinary");

const extractCloudinaryPublicId = (url) => {
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
  const result = await Connection(`SELECT * FROM system WHERE id = 1`);
  return result.length > 0 ? result[0] : null;
};

// Update or insert system settings
exports.updateSystemSettings = async (
  systemName,
  municipality,
  province,
  sealPath,
  mission,
  vision,
  preamble,
  user,
  ip
) => {
  const existingRows = await Connection(`SELECT * FROM system WHERE id = 1`);
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
      `INSERT INTO system (id, system_name, municipality, province, seal, mission, vision, preamble) VALUES (1, ?, ?, ?, ?, ?, ?, ?)`,
      [
        systemName,
        municipality,
        province,
        sealPath,
        mission,
        vision,
        preamble || null,
      ]
    );
    changes.push("Initial system settings created.");
  } else {
    await Connection(
      `UPDATE system SET system_name = ?, municipality = ?, province = ?, seal = ?, mission = ?, vision = ?, preamble = ? WHERE id = 1`,
      [
        systemName,
        municipality,
        province,
        sealPath,
        mission,
        vision,
        preamble || old.seal,
      ]
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
  if (old.mission !== mission)
    changes.push(`Mission: '${old.mission}' → '${mission}'`);
  if (old.vision !== vision)
    changes.push(`Vision: '${old.vision}' → '${vision}'`);
  if (old.preamble !== preamble)
    changes.push(`Preamble: '${old.preamble}' → '${preamble}'`);

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
