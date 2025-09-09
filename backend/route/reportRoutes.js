// routes/charts.js
const express = require("express");
const router = express.Router();
const reportService = require("../service/reportService");

// Barangay distribution (with optional gender filter)
router.get("/barangay", async (req, res) => {
  try {
    const result = await reportService.getBarangayDistribution();
    res.json(result);
  } catch (err) {
    console.error("Failed to fetch barangay distribution:", err);
    res.status(500).json({ error: "Failed to fetch barangay distribution" });
  }
});

// GET /api/charts/gender → Gender distribution
router.get("/gender", async (req, res) => {
  try {
    const result = await reportService.getGenderDistribution();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch gender distribution." });
  }
});

router.get("/age", async (req, res) => {
  try {
    const result = await chartService.getAgeDistribution();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch age distribution." });
  }
});

module.exports = router;
