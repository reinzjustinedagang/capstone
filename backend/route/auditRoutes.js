const express = require("express");
const router = express.Router();
const auditService = require("../service/auditService");

// routes/auditRoutes.js
router.get("/getAll", async (req, res) => {
  try {
    const options = {
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10,
      search: req.query.search || "",
      user: req.query.user || "All",
      userRole: req.query.userRole || "All",
      action: req.query.action || "All",
      sortBy: req.query.sortBy || "timestamp",
      sortOrder: req.query.sortOrder || "desc",
    };

    const results = await auditService.getPaginatedAuditLogs(options);
    res.status(200).json(results);
  } catch (error) {
    console.error("Error in /audit-logs/getAll:", error);
    res.status(500).json({ message: error.message });
  }
});

// GET /api/audit-logs/filters → Get all users and action types
router.get("/filters", async (req, res) => {
  try {
    const filters = await auditService.getAuditFilters();
    res.status(200).json(filters);
  } catch (err) {
    console.error("Error in /audit-logs/filters:", err);
    res.status(500).json({ message: "Failed to fetch filter options." });
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

// DELETE /api/audit-logs/truncate → Clear all audit logs
router.delete("/truncate", async (req, res) => {
  try {
    const result = await auditService.truncateAuditLogs();
    res.status(200).json(result);
  } catch (err) {
    console.error("Error in DELETE /audit-logs/truncate:", err);
    res.status(500).json({ message: "Failed to clear audit logs." });
  }
});

module.exports = router;
