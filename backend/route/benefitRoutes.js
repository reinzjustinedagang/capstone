const express = require("express");
const router = express.Router();
const benefitService = require("../service/benefitService");
const upload = require("../middleware/upload");
const cloudinary = require("../utils/cloudinary");
const { isAuthenticated } = require("../middleware/authMiddleware");

// GET benefit counts
router.get("/count/all", async (req, res) => {
  try {
    const count = await benefitService.getBenefitsCounts();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching benefit count:", error);
    res.status(500).json({ message: "Failed to fetch benefit count" });
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
router.get("/discount", async (req, res) => {
  try {
    const data = await benefitService.getDiscounts();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET
router.get("/financial-assistance", async (req, res) => {
  try {
    const data = await benefitService.getFinancial();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET
router.get("/medical-benefits", async (req, res) => {
  try {
    const data = await benefitService.getMedical();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET
router.get("/privilege-and-perks", async (req, res) => {
  try {
    const data = await benefitService.getPrivilege();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET
router.get("/republic-acts", async (req, res) => {
  try {
    const data = await benefitService.getRA();
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
  const { type, title, description, location, provider, enacted_date } =
    req.body;
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
      { type, title, description, location, provider, enacted_date, image_url },
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
    const { type, title, description, location, provider, enacted_date } =
      req.body;
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
          location,
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
