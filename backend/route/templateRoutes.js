const express = require("express");
const router = express.Router();
const templateService = require("../service/templateService");

// GET all templates
router.get("/", async (req, res) => {
  try {
    const templates = await templateService.getAllTemplates();
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ message: "Failed to fetch SMS templates" });
  }
});

// GET one template by ID
router.get("/:id", async (req, res) => {
  try {
    const template = await templateService.getTemplateById(req.params.id);
    if (!template)
      return res.status(404).json({ message: "Template not found" });
    res.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: "Failed to fetch template" });
  }
});

// POST create a new template
router.post("/", async (req, res) => {
  const { name, category, message } = req.body;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Not logged in" });
  }

  try {
    await templateService.createTemplate(name, category, message, user, ip);
    res.status(201).json({ message: "Template created successfully" });
  } catch (error) {
    console.error("Error creating template:", error);
    res.status(500).json({ message: "Failed to create template" });
  }
});

// PUT update a template
router.put("/:id", async (req, res) => {
  const { name, category, message } = req.body;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Not logged in" });
  }

  try {
    await templateService.updateTemplate(
      req.params.id,
      name,
      category,
      message,
      user,
      ip
    );
    res.json({ message: "Template updated successfully" });
  } catch (error) {
    console.error("Error updating template:", error);
    res.status(500).json({ message: "Failed to update template" });
  }
});

// DELETE a template
router.delete("/:id", async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Not logged in" });
  }

  try {
    await templateService.deleteTemplate(req.params.id, user, ip);
    res.json({ message: "Template deleted successfully" });
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ message: "Failed to delete template" });
  }
});

module.exports = router;
