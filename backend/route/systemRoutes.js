const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const cloudinary = require("../utils/cloudinary");
const systemService = require("../service/systemService");
const { isAuthenticated } = require("../middleware/authMiddleware");

// GET system settings
router.get("/", async (req, res) => {
  try {
    const settings = await systemService.getSystemSettings();
    if (!settings) {
      return res.status(404).json({ message: "System settings not found" });
    }
    res.json(settings);
  } catch (err) {
    console.error("Error fetching system settings:", err);
    res.status(500).json({ message: "Failed to fetch system settings" });
  }
});

// POST (insert/update) system settings
router.post("/", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    const {
      systemName,
      municipality,
      existingSeal,
      mission,
      vision,
      preamble,
    } = req.body;
    let sealPath = existingSeal || null;
    const ip = req.userIp;
    const user = req.session.user;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "system/" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      sealPath = result.secure_url;
    }

    if (req.file && existingSeal?.includes("res.cloudinary.com")) {
      const publicId = existingSeal.split("/").pop().split(".")[0]; // crude but works
      await cloudinary.uploader.destroy(`system/${publicId}`);
    }

    const result = await systemService.updateSystemSettings(
      systemName,
      municipality,
      sealPath,
      mission,
      vision,
      preamble,
      user,
      ip
    );

    res.status(200).json({
      message:
        result.actionType === "INSERT"
          ? "System settings created successfully."
          : "System settings updated successfully.",
      changes: result.changes,
    });
  } catch (err) {
    console.error("Error saving system settings:", err);
    res.status(500).json({ message: "Failed to save system settings" });
  }
});

module.exports = router;
