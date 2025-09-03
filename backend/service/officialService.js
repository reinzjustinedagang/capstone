const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");
const {
  duplicateError,
  checkIfTypeExists,
  extractCloudinaryPublicId,
  safeCloudinaryDestroy,
  deleteLocalImage,
} = require("../utils/serviceHelpers");

// ─── MUNICIPAL OFFICIALS ──────────────────────────────────────────────────────

exports.getMunicipalOfficials = async () => {
  return await Connection(
    `SELECT * FROM municipal_officials ORDER BY type DESC, id ASC`
  );
};

// ─── ADD ─────────────────────────────

exports.addMunicipalOfficial = async (
  name,
  position,
  type,
  image,
  user,
  ip
) => {
  try {
    if (type === "top" || type === "mid") {
      const exists = await checkIfTypeExists(
        Connection,
        "municipal_officials",
        type
      );
      if (exists)
        throw duplicateError(
          `A municipal official with type '${type}' already exists.`
        );
    }

    const result = await Connection(
      `INSERT INTO municipal_officials (name, position, type, image) VALUES (?, ?, ?, ?)`,
      [name, position, type, image]
    );

    if (result.affectedRows === 1 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "CREATE",
        `Added municipal official '${name}' as ${position} (${type})`,
        ip
      );
    }

    return result;
  } catch (error) {
    console.error("Error in addMunicipalOfficial:", error);
    throw error;
  }
};

// ─── UPDATE ─────────────────────────────

exports.updateMunicipalOfficial = async (
  id,
  name,
  position,
  type,
  image,
  user,
  ip
) => {
  try {
    const oldRows = await Connection(
      `SELECT name, position, type, image FROM municipal_officials WHERE id = ?`,
      [id]
    );
    const old = oldRows[0];
    if (!old) throw new Error("Municipal official not found for update.");

    if ((type === "top" || type === "mid") && old.type !== type) {
      const exists = await checkIfTypeExists(
        Connection,
        "municipal_officials",
        type,
        id
      );
      if (exists)
        throw duplicateError(
          `A municipal official with type '${type}' already exists.`
        );
    }

    const finalImage = image ?? old.image;

    const result = await Connection(
      `UPDATE municipal_officials SET name = ?, position = ?, type = ?, image = ? WHERE id = ?`,
      [name, position, type, finalImage, id]
    );

    // Delete old image if replaced
    if (image && old.image && old.image !== image) {
      if (old.image.includes("res.cloudinary.com")) {
        const publicId = extractCloudinaryPublicId(old.image);
        await safeCloudinaryDestroy(publicId);
      } else {
        await deleteLocalImage(old.image);
      }
    }

    // Log audit
    if (result.affectedRows === 1 && user) {
      const changes = [];
      if (old.name !== name) changes.push(`name: '${old.name}' → '${name}'`);
      if (old.position !== position)
        changes.push(`position: '${old.position}' → '${position}'`);
      if (old.type !== type) changes.push(`type: '${old.type}' → '${type}'`);
      if (old.image !== finalImage)
        changes.push(`image: '${old.image}' → '${finalImage}'`);

      if (changes.length > 0) {
        await logAudit(
          user.id,
          user.email,
          user.role,
          "UPDATE",
          `Updated municipal official ${name} (ID: ${id}): ${changes.join(
            ", "
          )}`,
          ip
        );
      }
    }

    return result;
  } catch (error) {
    console.error("Error in updateMunicipalOfficial:", error);
    throw error;
  }
};

// ─── DELETE ─────────────────────────────

exports.deleteMunicipalOfficial = async (id, user, ip) => {
  const rows = await Connection(
    `SELECT name, image FROM municipal_officials WHERE id = ?`,
    [id]
  );
  const official = rows[0];
  if (!official) throw new Error("Municipal official not found for deletion.");

  const result = await Connection(
    `DELETE FROM municipal_officials WHERE id = ?`,
    [id]
  );

  if (result.affectedRows === 1 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "DELETE",
      `Deleted municipal official '${official.name}'`,
      ip
    );

    if (official.image) {
      if (official.image.includes("res.cloudinary.com")) {
        const publicId = extractCloudinaryPublicId(official.image);
        await safeCloudinaryDestroy(publicId);
      } else {
        await deleteLocalImage(official.image);
      }
    }
  }

  return result;
};

// ─── BARANGAY OFFICIALS ──────────────────────────────────────────────────────

exports.getBarangayOfficials = async () => {
  return await Connection(
    `SELECT * FROM barangay_officials ORDER BY barangay_name ASC`
  );
};

// ─── ADD ─────────────────────────────

exports.addBarangayOfficial = async (
  barangay_name,
  president_name,
  position,
  image,
  user,
  ip
) => {
  try {
    const duplicateRows = await Connection(
      `SELECT id FROM barangay_officials WHERE barangay_name = ? AND position = ?`,
      [barangay_name, position]
    );
    if (duplicateRows.length > 0)
      throw duplicateError(
        `A barangay official in ${barangay_name} already exists.`
      );

    const result = await Connection(
      `INSERT INTO barangay_officials (barangay_name, president_name, position, image) VALUES (?, ?, ?, ?)`,
      [barangay_name, president_name, position, image]
    );

    if (result.affectedRows === 1 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "CREATE",
        `Added barangay official '${barangay_name}'`,
        ip
      );
    }

    return result;
  } catch (error) {
    console.error("Error in addBarangayOfficial:", error);
    throw error;
  }
};

// ─── UPDATE ─────────────────────────────

exports.updateBarangayOfficial = async (
  id,
  barangay_name,
  president_name,
  position,
  image,
  user,
  ip
) => {
  try {
    const oldRows = await Connection(
      `SELECT barangay_name, president_name, position, image FROM barangay_officials WHERE id = ?`,
      [id]
    );
    const old = oldRows[0];
    if (!old) throw new Error("Barangay official not found for update.");

    const finalImage = image ?? old.image;

    const result = await Connection(
      `UPDATE barangay_officials SET barangay_name = ?, president_name = ?, position = ?, image = ? WHERE id = ?`,
      [barangay_name, president_name, position, finalImage, id]
    );

    if (image && old.image && image !== old.image) {
      if (old.image.includes("res.cloudinary.com")) {
        const publicId = extractCloudinaryPublicId(old.image);
        await safeCloudinaryDestroy(publicId);
      } else {
        await deleteLocalImage(old.image);
      }
    }

    if (result.affectedRows === 1 && user) {
      const changes = [];
      if (old.barangay_name !== barangay_name)
        changes.push(
          `barangay_name: '${old.barangay_name}' → '${barangay_name}'`
        );
      if (old.president_name !== president_name)
        changes.push(
          `president_name: '${old.president_name}' → '${president_name}'`
        );
      if (old.position !== position)
        changes.push(
          `position: '${old.position || "none"}' → '${position || "none"}'`
        );
      if (old.image !== finalImage)
        changes.push(
          `image: '${old.image || "none"}' → '${finalImage || "none"}'`
        );

      await logAudit(
        user.id,
        user.email,
        user.role,
        "UPDATE",
        `Updated barangay official ${president_name}: ${changes.join(", ")}`,
        ip
      );
    }

    return result;
  } catch (error) {
    console.error("Error in updateBarangayOfficial:", error);
    throw error;
  }
};

// ─── DELETE ─────────────────────────────

exports.deleteBarangayOfficial = async (id, user, ip) => {
  const rows = await Connection(
    `SELECT barangay_name, image FROM barangay_officials WHERE id = ?`,
    [id]
  );
  const barangay = rows[0];
  if (!barangay) throw new Error("Barangay official not found for deletion.");

  const result = await Connection(
    `DELETE FROM barangay_officials WHERE id = ?`,
    [id]
  );

  if (result.affectedRows === 1 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "DELETE",
      `Deleted barangay official '${barangay.barangay_name}'`,
      ip
    );

    if (barangay.image) {
      if (barangay.image.includes("res.cloudinary.com")) {
        const publicId = extractCloudinaryPublicId(barangay.image);
        await safeCloudinaryDestroy(publicId);
      } else {
        await deleteLocalImage(barangay.image);
      }
    }
  }

  return result;
};

// ─── Organizational Chart ─────────────────────────────

exports.getOrgChart = async () => {
  return await Connection(`SELECT * FROM orgChart ORDER BY type DESC, id ASC`);
};

exports.addOrgChart = async (name, position, type, image, user, ip) => {
  try {
    if (type === "top" || type === "mid") {
      const exists = await checkIfTypeExists(Connection, "orgChart", type);
      if (exists) throw duplicateError(`A ${type} position already exists.`);
    }

    const result = await Connection(
      `INSERT INTO orgChart (name, position, type, image) VALUES (?, ?, ?, ?)`,
      [name, position, type, image]
    );

    if (result.affectedRows === 1 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "CREATE",
        `Added orgChart '${name}' as ${position} (${type})`,
        ip
      );
    }
    return result;
  } catch (error) {
    console.error("Error in addOrgChart service:", error);
    throw error;
  }
};

exports.updateOrgChart = async (id, name, position, type, image, user, ip) => {
  try {
    const oldRows = await Connection(`SELECT * FROM orgChart WHERE id = ?`, [
      id,
    ]);
    const old = oldRows[0];
    if (!old) throw new Error("Org chart entry not found.");

    if ((type === "top" || type === "mid") && old.type !== type) {
      const exists = await checkIfTypeExists(Connection, "orgChart", type, id);
      if (exists) throw duplicateError(`A ${type} position already exists.`);
    }

    const finalImage = image ?? old.image;

    const result = await Connection(
      `UPDATE orgChart SET name = ?, position = ?, type = ?, image = ? WHERE id = ?`,
      [name, position, type, finalImage, id]
    );

    // Delete old image if replaced
    if (image && old.image && old.image !== image) {
      if (old.image.includes("res.cloudinary.com")) {
        const publicId = extractCloudinaryPublicId(old.image);
        await safeCloudinaryDestroy(publicId);
      } else {
        await deleteLocalImage(old.image);
      }
    }

    if (result.affectedRows === 1 && user) {
      const changes = [];
      if (old.name !== name) changes.push(`name: '${old.name}' → '${name}'`);
      if (old.position !== position)
        changes.push(`position: '${old.position}' → '${position}'`);
      if (old.type !== type) changes.push(`type: '${old.type}' → '${type}'`);
      if (old.image !== finalImage)
        changes.push(`image: '${old.image}' → '${finalImage}'`);

      if (changes.length > 0) {
        await logAudit(
          user.id,
          user.email,
          user.role,
          "UPDATE",
          `Updated orgChart ID ${id}: ${changes.join(", ")}`,
          ip
        );
      }
    }

    return result;
  } catch (error) {
    console.error("Error in updateOrgChart service:", error);
    throw error;
  }
};

exports.deleteOrgChart = async (id, user, ip) => {
  const rows = await Connection(`SELECT * FROM orgChart WHERE id = ?`, [id]);
  const entry = rows[0];
  if (!entry) throw new Error("Org chart entry not found.");

  const result = await Connection(`DELETE FROM orgChart WHERE id = ?`, [id]);

  if (result.affectedRows === 1 && user) {
    await logAudit(
      user.id,
      user.email,
      user.role,
      "DELETE",
      `Deleted orgChart '${entry.name}'`,
      ip
    );

    if (entry.image) {
      if (entry.image.includes("res.cloudinary.com")) {
        const publicId = extractCloudinaryPublicId(entry.image);
        await safeCloudinaryDestroy(publicId);
      } else {
        await deleteLocalImage(entry.image);
      }
    }
  }

  return result;
};
