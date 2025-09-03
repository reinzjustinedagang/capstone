const cloudinary = require("./cloudinary");

// Upload image buffer to Cloudinary
async function uploadToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) reject(err);
        else resolve(result.secure_url);
      }
    );
    stream.end(buffer);
  });
}

// Delete image from Cloudinary given its URL
async function deleteCloudinaryImage(url) {
  const publicId = url.split("/").pop().split(".")[0]; // crude fallback
  await cloudinary.uploader.destroy(publicId);
}

module.exports = { uploadToCloudinary, deleteCloudinaryImage };
