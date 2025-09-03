const cloudinary = require("./cloudinary");
const fs = require("fs/promises");
const path = require("path");

function duplicateError(message) {
  const err = new Error(message);
  err.code = 409;
  return err;
}

// Check if a type exists in a table (for top/mid uniqueness)
const checkIfTypeExists = async (Connection, table, type, excludeId = null) => {
  let query = `SELECT id FROM ${table} WHERE type = ?`;
  const params = [type];
  if (excludeId) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }
  const rows = await Connection(query, params);
  return rows && rows.length > 0;
};

// Extract Cloudinary public ID from URL
const extractCloudinaryPublicId = (url) => {
  if (!url.includes("res.cloudinary.com")) return null;
  const parts = url.split("/");
  const filename = parts.pop().split(".")[0];
  const folder = parts.pop();
  return `${folder}/${filename}`;
};

// Safe Cloudinary destroy with retries
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

// Delete local image safely
const deleteLocalImage = async (imageName) => {
  const imagePath = path.join(__dirname, "../uploads", imageName);
  try {
    await fs.unlink(imagePath);
    console.log(`Deleted local image: ${imagePath}`);
  } catch (err) {
    console.error(`Failed to delete local image ${imagePath}:`, err);
  }
};

module.exports = {
  duplicateError,
  checkIfTypeExists,
  extractCloudinaryPublicId,
  safeCloudinaryDestroy,
  deleteLocalImage,
};
