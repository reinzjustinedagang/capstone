const express = require("express");
const router = express.Router();
const barangayService = require("../service/barangayService");

// GET paginated barangays
router.get("/", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const { data, total } = await barangayService.getPaginatedBarangays(
      page,
      limit
    );
    res.json({ barangays: data, total });
  } catch (error) {
    console.error("Error fetching barangays:", error);
    res.status(500).json({ message: "Failed to fetch barangays" });
  }
});

// GET barangay
router.get("/all", async (req, res) => {
  try {
    const barangays = await barangayService.getAllBarangay();
    if (!barangays || barangays.length === 0) {
      return res.status(404).json({ message: "No barangays found" });
    }
    res.json(barangays); // ✅ returns array of barangay names
  } catch (error) {
    console.error("Error fetching barangays:", error);
    res.status(500).json({ message: "Failed to fetch barangays" });
  }
});

// GET barangay count
router.get("/count/all", async (req, res) => {
  try {
    const count = await barangayService.getBarangayCount();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching barangay count:", error);
    res.status(500).json({ message: "Failed to fetch barangay count" });
  }
});

// POST create a new barangay
router.post("/", async (req, res) => {
  const { name } = req.body;
  const user = req.session.user;
  const ip = req.userIp;

  console.log("Client IP:", req.userIp);

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Not logged in" });
  }

  try {
    await barangayService.createBarangay(name, user, ip);
    res.status(201).json({ message: "Barangay created successfully" });
  } catch (error) {
    console.error("Error creating barangay:", error);
    res
      .status(500)
      .json({ message: error.message || "Failed to create barangay" });
  }
});

// PUT update a barangay
router.put("/:id", async (req, res) => {
  const { name } = req.body;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Not logged in" });
  }

  try {
    await barangayService.updateBarangay(req.params.id, name, user, ip);
    res.json({ message: "Barangay updated successfully" });
  } catch (error) {
    console.error("Error updating barangay:", error);
    res.status(500).json({ message: "Failed to update barangay" });
  }
});

// DELETE a barangay
router.delete("/:id", async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res.status(401).json({ message: "Unauthorized: Not logged in" });
  }

  try {
    await barangayService.deleteBarangay(req.params.id, user, ip);
    res.json({ message: "Barangay deleted successfully" });
  } catch (error) {
    console.error("Error deleting barangay:", error);
    res.status(500).json({ message: "Failed to delete barangay" });
  }
});

module.exports = router;
