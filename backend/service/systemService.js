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

exports.updateAbout = async (mission, vision, preamble, user, ip) => {
  const existing = await Connection(
    `SELECT mission, vision, preamble FROM system_setting WHERE id = 1`
  );
  const old = existing[0] || {};
  const actionType = existing.length === 0 ? "INSERT" : "UPDATE";
  const changes = [];

  if (existing.length === 0) {
    await Connection(
      `INSERT INTO system_setting (id, mission, vision, preamble) VALUES (1, ?, ?, ?)`,
      [mission, vision, preamble]
    );
    changes.push("Created initial About OSCA settings.");
  } else {
    await Connection(
      `UPDATE system_setting SET mission = ?, vision = ?, preamble = ? WHERE id = 1`,
      [mission, vision, preamble]
    );
  }

  // Track changes
  if (old.mission !== mission) changes.push(`Mission updated`);
  if (old.vision !== vision) changes.push(`Vision updated`);
  if (old.preamble !== preamble) changes.push(`Preamble updated`);

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

exports.updateAboutUs = async (
  { introduction, objective, team }, // New data from the request
  files, // Array of uploaded files (from multer)
  user,
  ip
) => {
  // 1. Fetch the current settings to compare team members
  const existingRows = await Connection(
    `SELECT introduction, objective, team FROM system_setting WHERE id = 1`
  );
  const oldSettings = existingRows[0] || { team: "[]" };
  const oldTeam = oldSettings.team ? JSON.parse(oldSettings.team) : [];

  const finalTeam = [...team]; // Create a mutable copy of the new team data

  // 2. Upload new images to Cloudinary and update the team array
  if (files && files.length > 0) {
    const uploadPromises = files.map((file) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "team/" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        stream.end(file.buffer);
      });
    });

    const uploadResults = await Promise.all(uploadPromises);

    // The frontend sends files and their original indexes separately.
    // We match them up to update the correct team member.
    // NOTE: This assumes `req.body.teamIndexes` is available where this service is called.
    // We will handle this in the route.
    files.forEach((file, i) => {
      const memberIndex = parseInt(file.originalname, 10);
      if (!isNaN(memberIndex) && finalTeam[memberIndex]) {
        finalTeam[memberIndex].image = uploadResults[i].secure_url;
        finalTeam[memberIndex].public_id = uploadResults[i].public_id;
      }
    });
  }

  // 3. Identify and delete any images for team members that were removed or replaced
  const oldPublicIds = oldTeam.map((m) => m.public_id).filter(Boolean); // Get all old public_ids
  const newPublicIds = finalTeam.map((m) => m.public_id).filter(Boolean); // Get all public_ids from the final team

  const idsToDelete = oldPublicIds.filter((id) => !newPublicIds.includes(id));

  if (idsToDelete.length > 0) {
    const deletionPromises = idsToDelete.map((id) => safeCloudinaryDestroy(id));
    await Promise.all(deletionPromises);
    console.log(`Deleted ${idsToDelete.length} obsolete Cloudinary images.`);
  }

  // 4. Update the database with the new information
  const teamJson = JSON.stringify(finalTeam);
  await Connection(
    `UPDATE system_setting SET introduction = ?, objective = ?, team = ? WHERE id = 1`,
    [introduction, objective, teamJson]
  );

  // 5. Log the audit trail
  const changes = [];
  if (oldSettings.introduction !== introduction)
    changes.push("Introduction updated.");
  if (oldSettings.objective !== objective) changes.push("Objective updated.");
  // A simple check is enough, as deep comparison is complex
  if (JSON.stringify(oldTeam) !== teamJson)
    changes.push("Team members updated.");

  if (changes.length > 0 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "UPDATE",
      `About Us section: ${changes.join(" ")}`,
      ip
    );
  }

  // 6. Return the updated data to be sent as a response
  return {
    introduction,
    objective,
    team: finalTeam,
  };
};
