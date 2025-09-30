const express = require("express");
const router = express.Router();
const eventService = require("../service/eventService");
const upload = require("../middleware/upload");
const cloudinary = require("../utils/cloudinary");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.get("/count/all", async (req, res) => {
  const user = req.session.user;
  try {
    const count = await eventService.getEventCount(user);
    res.json({ count });
  } catch (error) {
    console.error("Error fetching event count:", error);
    res.status(500).json({ message: "Failed to fetch event count" });
  }
});

// GET all events
router.get("/public-events", async (req, res) => {
  try {
    const data = await eventService.getPublicEvents();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all events
router.get("/event", async (req, res) => {
  try {
    const user = req.session.user;
    const data = await eventService.getEvent(user);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/slideshow", async (req, res) => {
  try {
    const data = await eventService.getSlideshow();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all events
router.get("/", async (req, res) => {
  try {
    const data = await eventService.getFive();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// eventRoute.js
router.get("/public-events/:id", async (req, res) => {
  try {
    const data = await eventService.getPublicById(req.params.id);
    if (!data) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const user = req.session.user;
    const data = await eventService.getById(req.params.id, user);
    if (!data) return res.status(404).json({ message: "Event not found" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create event
router.post("/", isAuthenticated, upload.single("image"), async (req, res) => {
  const { title, type, description, date } = req.body; // Remove image_url destructure
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    let image_url = null;

    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "events" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      image_url = result.secure_url;
    }

    const inserted = await eventService.create(
      { title, type, description, date, image_url },
      user,
      ip
    );

    res.status(201).json({ message: "Event created", id: inserted.insertId });
  } catch (err) {
    console.error("Failed to create event:", err); // Add console log
    res.status(500).json({ message: err.message });
  }
});

// PUT update event
router.put(
  "/:id",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;
    const {
      title,
      type,
      description,
      date,
      image_url: bodyImageUrl,
    } = req.body;
    const user = req.session.user;
    const ip = req.userIp;

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    try {
      let image_url = bodyImageUrl || null;

      // If a new image file is uploaded → upload to Cloudinary
      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "events" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        image_url = result.secure_url;
      }

      // If no new file and no body image_url, fallback to current DB image
      if (!req.file && !bodyImageUrl) {
        const current = await eventService.getById(id);
        if (current && current.image_url) {
          image_url = current.image_url;
        }
      }

      const updated = await eventService.update(
        id,
        { title, type, description, date, image_url },
        user,
        ip
      );

      if (!updated) return res.status(404).json({ message: "Event not found" });

      res.status(200).json({ message: "Event updated" });
    } catch (err) {
      console.error("Failed to update event:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// PUT approve event
router.put("/:id/approve", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const approved = await eventService.approve(id, user, ip);
    if (!approved) return res.status(404).json({ message: "Event not found" });

    res.status(200).json({ message: "Event approved" });
  } catch (err) {
    console.error("Failed to approve event:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE event
router.delete("/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const deleted = await eventService.remove(id, user, ip);
    if (!deleted) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event deleted" });
  } catch (err) {
    console.error("Delete event error:", err);

    if (err.message.startsWith("Permission denied")) {
      return res.status(403).json({ message: err.message });
    }

    res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE /api/form-fields/group/:groupKey
router.delete("/group/:groupKey", async (req, res) => {
  const { groupKey } = req.params;
  try {
    await Connection("DELETE FROM form_fields WHERE `group` = ?", [groupKey]);
    await Connection("DELETE FROM field_groups WHERE group_key = ?", [
      groupKey,
    ]);
    res.json({ message: "Group and all related fields deleted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete group." });
  }
});

module.exports = router;
