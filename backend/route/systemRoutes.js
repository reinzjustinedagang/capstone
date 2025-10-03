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
    const { systemName, municipality, province, zipCode, existingSeal } =
      req.body;
    const ip = req.userIp;
    const user = req.session.user;

    // Validate required fields
    if (!systemName || !municipality || !province || !zipCode) {
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
      zipCode,
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
    const { mission, vision, preamble, introduction, objective } = req.body;
    const user = req.session.user;
    const ip = req.userIp;

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Update system settings via service
    const result = await systemService.updateAbout(
      mission,
      vision,
      preamble,
      introduction,
      objective,
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

// --- GET team members ---
// GET team
router.get("/team", async (req, res) => {
  try {
    const team = await systemService.getTeam();
    res.status(200).json(team);
  } catch (err) {
    console.error("Error fetching team:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch team", error: err.message });
  }
});

// --- POST update/add team members ---
// systemRoutes.js
router.post("/team", isAuthenticated, upload.any(), async (req, res) => {
  try {
    const user = req.session.user;
    const ip = req.userIp;

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // --- Safely parse team from formData ---
    let parsedTeam = [];
    if (req.body.team) {
      if (typeof req.body.team === "string") {
        parsedTeam = JSON.parse(req.body.team);
      } else if (Array.isArray(req.body.team)) {
        parsedTeam = req.body.team;
      } else {
        parsedTeam = [];
      }
    }

    // --- Attach uploaded images to corresponding team members ---
    if (req.files && req.files.length) {
      const teamIndexes = Array.isArray(req.body.teamIndexes)
        ? req.body.teamIndexes
        : [req.body.teamIndexes];

      for (let i = 0; i < req.files.length; i++) {
        const file = req.files[i];
        const index = parseInt(teamIndexes[i], 10);
        if (!parsedTeam[index]) continue;

        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "team/" },
            (error, result) => (error ? reject(error) : resolve(result))
          );
          stream.end(file.buffer);
        });

        parsedTeam[index].image = result.secure_url;
        parsedTeam[index].public_id = result.public_id;
      }
    }

    const result = await systemService.updateTeam(parsedTeam, user, ip);

    res.status(200).json({
      message: "Team updated successfully",
      changes: result.changes,
      team: result.team,
    });
  } catch (err) {
    console.error("Error updating team:", err);
    res
      .status(500)
      .json({ message: "Failed to update team", error: err.message });
  }
});

module.exports = router;
