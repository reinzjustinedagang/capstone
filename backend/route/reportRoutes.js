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
    const result = await reportService.getAgeDistribution();
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch age distribution." });
  }
});

router.get("/summary", async (req, res) => {
  try {
    const [gender, barangay, age] = await Promise.all([
      reportService.getGenderDistribution(),
      reportService.getBarangayDistribution(),
      reportService.getAgeDistribution(),
    ]);

    res.status(200).json({
      gender,
      barangay,
      age,
    });
  } catch (err) {
    console.error("❌ Failed to fetch statistical summary:", err);
    res.status(500).json({ message: "Failed to fetch statistical summary." });
  }
});

// GET /api/charts/deceased?year=2025
router.get("/deceased", async (req, res) => {
  try {
    const year = req.query.year || new Date().getFullYear();
    const result = await reportService.getDeceasedReport(year);
    res.json(result);
  } catch (err) {
    console.error("❌ Failed to fetch deceased reports:", err);
    res.status(500).json({ error: "Failed to fetch deceased reports" });
  }
});

// GET /api/charts/transferees?year=2025
router.get("/transferees", async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  try {
    const data = await reportService.getTransfereeReport(year);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch transferee reports." });
  }
});

// GET /api/charts/socpen?year=2025
router.get("/socpen", async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  try {
    const data = await reportService.getSocPenReport(year);
    res.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch SocPen reports:", err);
    res.status(500).json({ message: "Failed to fetch SocPen reports." });
  }
});

module.exports = router;
