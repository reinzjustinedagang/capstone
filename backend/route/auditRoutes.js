const express = require("express");
const router = express.Router();
const auditService = require("../service/auditService");

// router.get("/getAll", async (req, res) => {
//   try {
//     const results = await auditService.getLogAudit();
//     res.status(200).json({ logs: results }); // Make sure it's named "logs"
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// });

router.get("/getAll", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const results = await auditService.getPaginatedAuditLogs(page, limit);

    res.status(200).json(results);
  } catch (error) {
    console.error("Error in /audit-logs/getAll:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/login-trails/:id → Get login trails for specific user
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const trails = await auditService.getLoginTrailsByUserId(id);

    if (!trails || trails.length === 0) {
      return res
        .status(404)
        .json({ message: "No login trails found for this user." });
    }

    res.status(200).json(trails);
  } catch (err) {
    console.error("Error in GET /:id:", err);
    res.status(500).json({ error: "Failed to fetch login trails." });
  }
});

module.exports = router;
