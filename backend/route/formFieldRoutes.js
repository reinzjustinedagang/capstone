const express = require("express");
const router = express.Router();
const formFieldsService = require("../service/formFieldsService");

// GET all form fields
router.get("/", async (req, res) => {
  try {
    const fields = await formFieldsService.getAll();
    res.status(200).json(fields);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all form fields for register
router.get("/register-field", async (req, res) => {
  try {
    const fields = await formFieldsService.getOutside();
    res.status(200).json(fields);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET all form fields
router.get("/group", async (req, res) => {
  try {
    const fields = await formFieldsService.getGroup();
    res.status(200).json(fields);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new group
router.post("/group", async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const inserted = await formFieldsService.createGroup(req.body, user, ip);
    res.status(201).json({ message: "group created", id: inserted.insertId });
  } catch (err) {
    console.error("Error creating group field:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT reorder fields
router.put("/reorder", async (req, res) => {
  // Accept the array directly from req.body instead of destructuring from fields
  const fields = req.body; // Now expects array directly: [{ id, order }, ...]

  const user = req.session.user;
  const ip = req.userIp;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  // Add validation to ensure we have an array
  if (!Array.isArray(fields) || fields.length === 0) {
    return res.status(400).json({ message: "Invalid fields data" });
  }

  try {
    await formFieldsService.reorder(fields, user, ip);
    res.json({ message: "Fields reordered successfully." });
  } catch (err) {
    console.error("Error reordering fields:", err);
    res.status(500).json({ message: err.message });
  }
});

// GET a single field by ID
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const field = await formFieldsService.getById(id);
    if (!field) return res.status(404).json({ message: "Field not found" });
    res.status(200).json(field);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create a new field
router.post("/", async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const inserted = await formFieldsService.create(req.body, user, ip);
    res.status(201).json({ message: "Field created", id: inserted.insertId });
  } catch (err) {
    console.error("Error creating form field:", err);
    res.status(500).json({ message: err.message });
  }
});

// PUT update field
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const updated = await formFieldsService.update(id, req.body, user, ip);
    if (!updated) return res.status(404).json({ message: "Field not found" });
    res.status(200).json({ message: "Field updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE field
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const deleted = await formFieldsService.remove(id, user, ip);
    if (!deleted) return res.status(404).json({ message: "Field not found" });
    res.status(200).json({ message: "Field deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/group/:groupKey", async (req, res) => {
  const { groupKey } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!groupKey) {
    return res.status(400).json({ message: "Group key is required." });
  }

  try {
    const result = await formFieldsService.deleteGroupWithFields(
      groupKey,
      user,
      ip
    );
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to delete group." });
  }
});

module.exports = router;
