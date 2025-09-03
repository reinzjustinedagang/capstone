const express = require("express");
const router = express.Router();
const positionService = require("../service/positionService");

// GET all positions
router.get("/", async (req, res) => {
  try {
    const positions = await positionService.getAll();
    res.status(200).json(positions);
  } catch (err) {
    console.error("Error fetching positions:", err);
    res.status(500).json({ message: "Failed to fetch positions" });
  }
});

// GET orgchart positions
router.get("/orgchart", async (req, res) => {
  try {
    const positions = await positionService.getOrgChart();
    res.status(200).json(positions);
  } catch (err) {
    console.error("Error fetching orgchart positions:", err);
    res.status(500).json({ message: "Failed to fetch orgchart positions" });
  }
});

// GET municipal positions
router.get("/federation", async (req, res) => {
  try {
    const positions = await positionService.getFederation();
    res.status(200).json(positions);
  } catch (err) {
    console.error("Error fetching municipal federation positions:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch municipal federation positions" });
  }
});

// GET single position by ID
router.get("/:id", async (req, res) => {
  try {
    const position = await positionService.getById(req.params.id);
    if (!position || position.length === 0) {
      return res.status(404).json({ message: "Position not found" });
    }
    res.status(200).json(position[0]);
  } catch (err) {
    console.error("Error fetching position:", err);
    res.status(500).json({ message: err.message });
  }
});

// POST create position
router.post("/", async (req, res) => {
  const { name, type } = req.body;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const inserted = await positionService.create({ name, type }, user, ip);
    res
      .status(201)
      .json({ message: "Position created", id: inserted.insertId });
  } catch (err) {
    if (err.message.includes("already exists")) {
      return res.status(409).json({ message: err.message });
    }
    console.error("Error creating position:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT update position
router.put("/:id", async (req, res) => {
  const { name, type } = req.body;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const updated = await positionService.update(
      req.params.id,
      { name, type },
      user,
      ip
    );
    if (!updated)
      return res.status(404).json({ message: "Position not found" });
    res.status(200).json({ message: "Position updated" });
  } catch (err) {
    if (err.message.includes("already exists")) {
      return res.status(409).json({ message: err.message });
    }
    console.error("Error updating position:", err);
    res.status(500).json({ message: err.message });
  }
});

// DELETE position
router.delete("/:id", async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const deleted = await positionService.remove(req.params.id, user, ip);
    if (!deleted)
      return res.status(404).json({ message: "Position not found" });
    res.status(200).json({ message: "Position deleted" });
  } catch (err) {
    console.error("Error deleting position:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
