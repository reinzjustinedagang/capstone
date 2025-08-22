const cloudinary = require("./cloudinary");

/**
 * Uploads a file buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer (from multer memoryStorage)
 * @param {string} folder - Cloudinary folder (e.g. 'user_profiles')
 * @returns {Promise<string>} - Uploaded image URL
 */
const uploadToCloudinary = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
};

module.exports = uploadToCloudinary;
