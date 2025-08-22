// routes/charts.js
const express = require("express");
const router = express.Router();
const reportService = require("../service/reportService");

// GET /api/charts/barangay
router.get("/barangay", async (req, res) => {
  try {
    const results = await reportService.getBarangayDistribution();
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch barangay distribution." });
  }
});

module.exports = router;
