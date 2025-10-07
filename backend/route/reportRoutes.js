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

// GET /api/charts/non-socpen?year=2025
router.get("/non-socpen", async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  try {
    const data = await reportService.getNonSocPenReport(year);
    res.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch Non-SocPen reports:", err);
    res.status(500).json({ message: "Failed to fetch Non-SocPen reports." });
  }
});

// GET /api/charts/pdl?year=2025
router.get("/pdl", async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  try {
    const data = await reportService.getPDLReport(year);
    res.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch PDL reports:", err);
    res.status(500).json({ message: "Failed to fetch PDL reports." });
  }
});

// GET /api/charts/new?year=2025
router.get("/new", async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  try {
    const data = await reportService.getNewSeniorReport(year);
    res.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch new reports:", err);
    res.status(500).json({ message: "Failed to fetch new reports." });
  }
});

// GET /api/charts/booklet?year=2025
router.get("/booklet", async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  try {
    const data = await reportService.getBookletReport(year);
    res.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch booklet reports:", err);
    res.status(500).json({ message: "Failed to fetch booklet reports." });
  }
});

// GET /api/charts/booklet?year=2025
router.get("/utp", async (req, res) => {
  const year = req.query.year || new Date().getFullYear();
  try {
    const data = await reportService.getUTPReport(year);
    res.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch utp reports:", err);
    res.status(500).json({ message: "Failed to fetch utp reports." });
  }
});

// GET /api/charts/pensioner
router.get("/pensioner", async (req, res) => {
  try {
    const data = await reportService.getPensionerReport();
    res.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch pensioner reports:", err);
    res.status(500).json({ message: "Failed to fetch pensioner reports." });
    res.json({
      DSWDSOCPEN: 0,
      GSIS: 0,
      SSS: 0,
      PVAO: 0,
      AFPSLAI: 0,
      OTHERS: 0,
    });
  }
});

// GET /api/charts/remarks
router.get("/remarks", async (req, res) => {
  try {
    const data = await reportService.getRemarksReport();
    res.json(data);
  } catch (err) {
    console.error("❌ Failed to fetch remarks reports:", err);
    res.status(500).json({
      message: "Failed to fetch remarks reports.",
      data: {},
    });
  }
});

// routes/chartRoutes.js
router.get("/citizens/print", async (req, res) => {
  try {
    const {
      search,
      barangay,
      gender,
      ageRange,
      healthStatus,
      sortBy,
      sortOrder,
    } = req.query;

    const citizens = await reportService.getFilteredCitizensForPrint({
      search,
      barangay,
      gender,
      ageRange,
      healthStatus,
      sortBy,
      sortOrder,
    });

    res.json({ citizens });
  } catch (err) {
    console.error("Error fetching citizens for print:", err);
    res.status(500).json({ error: "Failed to fetch citizens for print." });
  }
});

module.exports = router;
