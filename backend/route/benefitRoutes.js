const express = require("express");
const router = express.Router();
const benefitService = require("../service/benefitService");

// GET benefit count
router.get("/count/all", async (req, res) => {
  try {
    const count = await benefitService.getBenefitsCounts();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching benefit count:", error);
    res.status(500).json({ message: "Failed to fetch benefit count" });
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
  const user = req.session.user;

  try {
    const benefit = await benefitService.getBenefitsById(id);
    if (!benefit || benefit.length === 0) {
      return res.status(404).json({ message: "Benefit not found" });
    }

    res.status(200).json(benefit[0]); // return the first match
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// POST create discount
router.post("/", async (req, res) => {
  const { type, title, description, location, provider, enacted_date } =
    req.body;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const inserted = await benefitService.create(
      { type, title, description, location, provider, enacted_date },
      user,
      ip
    );
    res
      .status(201)
      .json({ message: "Benefits created", id: inserted.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT update discount
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { type, title, description, location, provider, enacted_date } =
    req.body;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const updated = await benefitService.update(
      id,
      { type, title, description, location, provider, enacted_date },
      user,
      ip
    );
    if (!updated)
      return res.status(404).json({ message: "Discount not found" });
    res.status(200).json({ message: "Discount updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE discount
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const deleted = await benefitService.remove(id, user, ip);
    if (!deleted)
      return res.status(404).json({ message: "Discount not found" });
    res.status(200).json({ message: "Discount deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
