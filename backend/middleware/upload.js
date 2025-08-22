const multer = require("multer");

// Use memory storage
const storage = multer.memoryStorage();

// Allowed mime types array for stricter checking
const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];

const fileFilter = (req, file, cb) => {
  const isMimeAllowed = allowedMimeTypes.includes(file.mimetype.toLowerCase());
  const ext = file.originalname.toLowerCase().split(".").pop();
  const allowedExtensions = ["jpeg", "jpg", "png"];
  const isExtAllowed = allowedExtensions.includes(ext);

  if (isMimeAllowed && isExtAllowed) {
    cb(null, true);
  } else {
    cb(new Error("Only JPEG, JPG, and PNG files are allowed"));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter,
});

module.exports = upload;
