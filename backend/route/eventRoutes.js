const express = require("express");
const router = express.Router();
const eventService = require("../service/eventService");
const upload = require("../middleware/upload");
const cloudinary = require("../utils/cloudinary");
const { isAuthenticated } = require("../middleware/authMiddleware");

router.get("/count/all", async (req, res) => {
  try {
    const count = await eventService.getEventCount();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching user count:", error);
    res.status(500).json({ message: "Failed to fetch user count" });
  }
});

// GET all events
router.get("/event", async (req, res) => {
  try {
    const data = await eventService.getEvent();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all events
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
// PUT update event
router.put(
  "/:id",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;
    const { title, type, description, date } = req.body;
    const user = req.session.user;
    const ip = req.userIp;

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    try {
      let image_url = req.body.image_url || null;

      // Handle new image upload
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

// DELETE event
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const deleted = await eventService.remove(id, user, ip);
    if (!deleted) return res.status(404).json({ message: "Event not found" });
    res.status(200).json({ message: "Event deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
