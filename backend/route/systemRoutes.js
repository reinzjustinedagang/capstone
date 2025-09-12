const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const cloudinary = require("../utils/cloudinary");
const systemService = require("../service/systemService");
import { logAudit } from "../service/auditService";
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
  extractCloudinaryPublicId,
  safeCloudinaryDestroy,
} = require("../utils/serviceHelpers");

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

// POST update About OSCA
router.post("/about", isAuthenticated, async (req, res) => {
  try {
    const { mission, vision, preamble } = req.body;
    const user = req.session.user;
    const ip = req.userIp;

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Update system settings via service
    const result = await systemService.updateAbout(
      mission,
      vision,
      preamble,
      user,
      ip
    );

    res.status(200).json({
      message:
        result.actionType === "INSERT"
          ? "About OSCA created successfully."
          : "About OSCA updated successfully.",
      changes: result.changes,
    });
  } catch (err) {
    console.error("Error updating About OSCA:", err);
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

const teamUpload = upload.array("teamImages");

router.post("/about-us", isAuthenticated, (req, res, next) => {
  // Multer middleware needs special handling for indexes
  teamUpload(req, res, async (err) => {
    if (err) {
      console.error("Multer error:", err);
      return res.status(500).json({ message: "File upload failed." });
    }

    try {
      const user = req.session.user;
      const ip = req.userIp;

      const { introduction, objective } = req.body;
      let { team, teamIndexes } = req.body;

      // 1. Basic Validation
      if (!introduction || !objective || !team) {
        return res.status(400).json({ message: "Missing required fields." });
      }

      // 2. Parse the team JSON string from FormData
      let teamData;
      try {
        teamData = JSON.parse(team);
      } catch (parseError) {
        return res.status(400).json({ message: "Invalid team data format." });
      }

      // 3. VERY IMPORTANT: Attach the original index to each file object
      // This allows the service to know which team member the file belongs to.
      // The frontend sends `teamIndexes` for this purpose.
      if (req.files && teamIndexes) {
        // Ensure teamIndexes is an array
        const indexes = Array.isArray(teamIndexes)
          ? teamIndexes
          : [teamIndexes];
        req.files.forEach((file, i) => {
          // We attach the index to the file's `originalname` field to pass it to the service.
          // This is a simple way to pass metadata along with the file buffer.
          file.originalname = indexes[i];
        });
      }

      // 4. Call the service to handle all logic
      const updatedSettings = await systemService.updateAboutUs(
        { introduction, objective, team: teamData },
        req.files, // Pass the processed files
        user,
        ip
      );

      // 5. Send success response
      res.status(200).json(updatedSettings);
    } catch (error) {
      console.error("Error saving About Us:", error);
      res.status(500).json({ message: "Failed to save About Us settings." });
    }
  });
});

module.exports = router;
