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

// ─── MUNICIPAL OFFICIALS ──────────────────────────────────────────────────────

exports.getMunicipalOfficials = async () => {
  return await Connection(
    `SELECT * FROM municipal_officials ORDER BY type DESC, id ASC`
  );
};

const checkIfTypeExists = async (type, excludeId = null) => {
  let query = `SELECT id FROM municipal_officials WHERE type = ?`;
  const params = [type];
  if (excludeId) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }
  const rows = await Connection(query, params);
  return rows && rows.length > 0;
};

function duplicateError(message) {
  const err = new Error(message);
  err.code = 409;
  return err;
}

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
      const typeAlreadyExists = await checkIfTypeExists(type);
      if (typeAlreadyExists) {
        throw duplicateError(
          `A municipal official with type '${type}' already exists.`
        );
      }
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
    console.error("Error in addMunicipalOfficial service:", error);
    throw error;
  }
};

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
    const oldDataRows = await Connection(
      `SELECT name, position, type, image FROM municipal_officials WHERE id = ?`,
      [id]
    );
    const oldData = oldDataRows[0];

    if (!oldData) throw new Error("Municipal official not found for update.");

    if ((type === "top" || type === "mid") && oldData.type !== type) {
      const typeAlreadyExists = await checkIfTypeExists(type, id);
      if (typeAlreadyExists) {
        throw duplicateError(
          `A municipal official with type '${type}' already exists. Cannot change.`
        );
      }
    }

    const finalImage = image ?? oldData.image;

    const result = await Connection(
      `UPDATE municipal_officials SET name = ?, position = ?, type = ?, image = ? WHERE id = ?`,
      [name, position, type, finalImage, id]
    );

    if (image && oldData.image && oldData.image !== image) {
      const publicId = extractCloudinaryPublicId(oldData.image);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted Cloudinary image: ${publicId}`);
        } catch (err) {
          console.error("Failed to delete Cloudinary image:", err);
        }
      } else {
        const imagePath = path.join(__dirname, "../uploads", oldData.image);
        try {
          await fs.unlink(imagePath);
          console.log(`Deleted local image: ${imagePath}`);
        } catch (err) {
          console.error(`Failed to delete local image ${imagePath}:`, err);
        }
      }
    }

    if (result.affectedRows === 1 && user) {
      const changes = [];
      if (oldData.name !== name)
        changes.push(`name: '${oldData.name}' → '${name}'`);
      if (oldData.position !== position)
        changes.push(`position: '${oldData.position}' → '${position}'`);
      if (oldData.type !== type)
        changes.push(`type: '${oldData.type}' → '${type}'`);
      if (oldData.image !== finalImage)
        changes.push(`image: '${oldData.image}' → '${finalImage}'`);

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
    console.error("Error in updateMunicipalOfficial service:", error);
    throw error;
  }
};

exports.deleteMunicipalOfficial = async (id, user, ip) => {
  const officialRows = await Connection(
    `SELECT name, image FROM municipal_officials WHERE id = ?`,
    [id]
  );
  const official = officialRows[0];
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
      const publicId = extractCloudinaryPublicId(official.image);
      if (publicId) {
        try {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted Cloudinary image: ${publicId}`);
        } catch (err) {
          console.error("Failed to delete Cloudinary image:", err);
        }
      } else {
        const imagePath = path.join(__dirname, "../uploads", official.image);
        try {
          await fs.unlink(imagePath);
          console.log(`Deleted local image file: ${imagePath}`);
        } catch (err) {
          console.error(`Failed to delete local image file ${imagePath}:`, err);
        }
      }
    }
  }

  return result;
};

// ─── BARANGAY OFFICIALS ──────────────────────────────────────────────────────

exports.addBarangayOfficial = async (
  barangay_name,
  president_name,
  position,
  image,
  user,
  ip
) => {
  try {
    // Check if a barangay official already exists for this barangay and position
    const duplicateRows = await Connection(
      `SELECT id FROM barangay_officials WHERE barangay_name = ? AND position = ?`,
      [barangay_name, position]
    );
    if (duplicateRows.length > 0) {
      throw duplicateError(
        `A barangay official in ${barangay_name} already exists.`
      );
    }

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

exports.getBarangayOfficials = async () => {
  try {
    return await Connection(
      `SELECT * FROM barangay_officials ORDER BY barangay_name ASC`
    );
  } catch (error) {
    console.error("Error in getBarangayOfficials:", error);
    throw error;
  }
};

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
    const oldDataRows = await Connection(
      `SELECT barangay_name, president_name, position, image FROM barangay_officials WHERE id = ?`,
      [id]
    );
    const oldData = oldDataRows[0];

    if (!oldData) throw new Error("Barangay official not found for update.");

    const finalImage = image ?? oldData.image;

    const result = await Connection(
      `UPDATE barangay_officials SET barangay_name = ?, president_name = ?, position = ?, image = ? WHERE id = ?`,
      [barangay_name, president_name, position, finalImage, id]
    );

    if (image && oldData.image && image !== oldData.image) {
      const publicId = extractCloudinaryPublicId(oldData.image);
      if (publicId) {
        try {
          await safeCloudinaryDestroy(publicId);
        } catch (err) {
          console.error("Failed to delete Cloudinary image:", err);
        }
      } else {
        const imagePath = path.join(__dirname, "../uploads", oldData.image);
        try {
          await fs.unlink(imagePath);
          console.log(`Deleted local barangay image: ${imagePath}`);
        } catch (err) {
          console.error(
            `Failed to delete local barangay image ${imagePath}:`,
            err
          );
        }
      }
    }

    if (result.affectedRows === 1 && user) {
      const changes = [];
      if (oldData.barangay_name !== barangay_name)
        changes.push(
          `barangay_name: '${oldData.barangay_name}' → '${barangay_name}'`
        );
      if (oldData.president_name !== president_name)
        changes.push(
          `president_name: '${oldData.president_name}' → '${president_name}'`
        );
      if (oldData.position !== position)
        changes.push(
          `position: '${oldData.position || "none"}' → '${position || "none"}'`
        );
      if (oldData.image !== finalImage)
        changes.push(
          `image: '${oldData.image || "none"}' → '${finalImage || "none"}'`
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

exports.deleteBarangayOfficial = async (id, user, ip) => {
  try {
    const barangayRows = await Connection(
      `SELECT barangay_name, image FROM barangay_officials WHERE id = ?`,
      [id]
    );
    const barangay = barangayRows[0];
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
        const publicId = extractCloudinaryPublicId(barangay.image);
        if (publicId) {
          try {
            await safeCloudinaryDestroy(publicId);
          } catch (err) {
            console.error("Failed to delete Cloudinary image:", err);
          }
        } else {
          const imagePath = path.join(__dirname, "../uploads", barangay.image);
          try {
            await fs.unlink(imagePath);
            console.log(`Deleted local barangay image file: ${imagePath}`);
          } catch (err) {
            console.error(
              `Failed to delete local barangay image ${imagePath}:`,
              err
            );
          }
        }
      }
    }

    return result;
  } catch (error) {
    console.error("Error in deleteBarangayOfficial:", error);
    throw error;
  }
};
