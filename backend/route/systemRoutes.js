const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const cloudinary = require("../utils/cloudinary");
const systemService = require("../service/systemService");
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
  extractCloudinaryPublicId,
  safeCloudinaryDestroy,
} = require("../utils/serviceHelpers");

// GET system settings
// GET all system settings (About OSCA + About Us)
router.get("/", async (req, res) => {
  try {
    const settings = await systemService.getSystemSettings();
    if (!settings)
      return res.status(404).json({ message: "Settings not found" });
    res.json(settings);
  } catch (err) {
    console.error("Error fetching system settings:", err);
    res.status(500).json({ message: "Failed to fetch settings" });
  }
});

// POST (insert/update) system settings
router.post("/", isAuthenticated, upload.single("image"), async (req, res) => {
  try {
    const { systemName, municipality, province, existingSeal } = req.body;
    const ip = req.userIp;
    const user = req.session.user;

    // Validate required fields
    if (!systemName || !municipality || !province) {
      return res.status(400).json({
        message: "systemName, municipality, and province are required",
      });
    }

    let sealPath = existingSeal || null;

    // Handle new seal upload
    if (req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "system/" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(req.file.buffer);
        });
        sealPath = result.secure_url;

        // Delete old seal if exists
        if (existingSeal?.includes("res.cloudinary.com")) {
          const publicId = extractCloudinaryPublicId(existingSeal);
          if (publicId) await safeCloudinaryDestroy(publicId);
        }
      } catch (err) {
        console.error("Cloudinary error:", err);
        return res.status(500).json({ message: "Failed to upload seal image" });
      }
    }

    const result = await systemService.updateSystemSettings(
      systemName,
      municipality,
      province,
      sealPath,
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
    res
      .status(500)
      .json({ message: "Failed to save system settings", error: err.message });
  }
});

// POST About OSCA
router.post("/about-osca", isAuthenticated, async (req, res) => {
  try {
    const { mission, vision, preamble } = req.body;
    const user = req.session.user;
    const ip = req.userIp;

    const result = await systemService.updateAboutOSCA(
      mission,
      vision,
      preamble,
      user,
      ip
    );
    res.status(200).json({
      message: "About OSCA updated successfully",
      changes: result.changes,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update About OSCA" });
  }
});

// POST save a new key
router.post("/save-key", async (req, res) => {
  try {
    const { key } = req.body;
    console.log("Request body:", req.body);

    const result = await systemService.saveKey(key);
    res.status(200).json(result);
  } catch (err) {
    console.error("Error saving key:", err);
    res
      .status(err.status || 500)
      .json({ message: err.message || "Failed to save key" });
  }
});

// POST update About Us
// POST About Us
router.post(
  "/about-us",
  isAuthenticated,
  upload.fields([{ name: "teamImages" }]),
  async (req, res) => {
    try {
      const updated = await systemService.updateAboutUs(req);
      res
        .status(200)
        .json({ message: "About Us updated successfully", data: updated });
    } catch (err) {
      console.error(err);
      res
        .status(err.status || 500)
        .json({ message: err.message || "Failed to update About Us" });
    }
  }
);
module.exports = router;
