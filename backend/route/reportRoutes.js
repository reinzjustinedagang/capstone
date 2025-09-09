// routes/charts.js
const express = require("express");
const router = express.Router();
const reportService = require("../service/reportService");

// Barangay distribution (with optional gender filter)
router.get("/barangay", async (req, res) => {
  try {
    const { gender } = req.query; // "Male", "Female", or undefined
    const result = await chartService.getBarangayDistribution(gender);
    res.json(result);
  } catch (err) {
    console.error("Failed to fetch barangay distribution:", err);
    res.status(500).json({ error: "Failed to fetch barangay distribution" });
  }
});

module.exports = router;
