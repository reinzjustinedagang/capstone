const express = require("express");
const router = express.Router();
const benefitService = require("../service/benefitService");
const upload = require("../middleware/upload");
const cloudinary = require("../utils/cloudinary");
const { isAuthenticated } = require("../middleware/authMiddleware");

// GET benefit counts
router.get("/count/all", async (req, res) => {
  const user = req.session.user;
  try {
    const count = await benefitService.getBenefitsCounts(user);
    res.json({ count });
  } catch (error) {
    console.error("Error fetching benefit count:", error);
    res.status(500).json({ message: "Failed to fetch benefit count" });
  }
});

// GET all ra (limit 3)
router.get("/front-ra", async (req, res) => {
  try {
    const data = await benefitService.getThreeRa();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all benefits (limit 5)
router.get("/", async (req, res) => {
  try {
    const data = await benefitService.getAll();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET discounts
router.get("/national", async (req, res) => {
  const user = req.session.user;
  try {
    const data = await benefitService.getNational(user);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET
router.get("/local", async (req, res) => {
  const user = req.session.user;
  try {
    const data = await benefitService.getLocal(user);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/ra", async (req, res) => {
  const user = req.session.user;
  try {
    const data = await benefitService.getRa(user);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/allra", async (req, res) => {
  try {
    const data = await benefitService.getPublicRa();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/allbenefits", async (req, res) => {
  try {
    const data = await benefitService.getPublicBenefits();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// eventRoute.js
router.get("/public-benefits/:id", async (req, res) => {
  try {
    const data = await benefitService.getPublicById(req.params.id);
    if (!data) return res.status(404).json({ message: "Benefits not found" });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET benefit by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const benefit = await benefitService.getBenefitsById(id);
    if (!benefit || benefit.length === 0)
      return res.status(404).json({ message: "Benefit not found" });

    res.status(200).json(benefit[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST create benefit
router.post("/", isAuthenticated, upload.single("image"), async (req, res) => {
  const { type, title, description, provider, enacted_date } = req.body;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    let image_url = null;
    if (req.file) {
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "benefits" },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(req.file.buffer);
      });
      image_url = result.secure_url;
    }

    const inserted = await benefitService.create(
      { type, title, description, provider, enacted_date, image_url },
      user,
      ip
    );

    res.status(201).json({ message: "Benefit created", id: inserted.insertId });
  } catch (err) {
    console.error("Failed to create benefit:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT update benefit
router.put(
  "/:id",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    const { id } = req.params;
    const { type, title, description, provider, enacted_date } = req.body;
    const user = req.session.user;
    const ip = req.userIp;

    if (!user) return res.status(401).json({ message: "Unauthorized" });

    try {
      let image_url = req.body.image_url || null;

      if (req.file) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "benefits" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
        image_url = result.secure_url;
      }

      const updated = await benefitService.update(
        id,
        {
          type,
          title,
          description,
          provider,
          enacted_date,
          image_url,
        },
        user,
        ip
      );

      if (!updated)
        return res.status(404).json({ message: "Benefit not found" });

      res.status(200).json({ message: "Benefit updated" });
    } catch (err) {
      console.error("Failed to update benefit:", err);
      res.status(500).json({ message: err.message });
    }
  }
);

// APPROVE benefit (Admin only)
router.put("/:id/approve", isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;

  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  try {
    const approved = await benefitService.approve(req.params.id, user, ip);

    if (!approved) {
      return res.status(404).json({ message: "Benefit not found" });
    }

    res.status(200).json({ message: "Benefit approved" });
  } catch (err) {
    console.error("Failed to approve benefit:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE benefit
router.delete("/:id", isAuthenticated, async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const deleted = await benefitService.remove(id, user, ip);
    if (!deleted) return res.status(404).json({ message: "Benefit not found" });

    res.status(200).json({ message: "Benefit deleted" });
  } catch (err) {
    console.error("Failed to delete benefit:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
