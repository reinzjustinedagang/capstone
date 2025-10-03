const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const officialService = require("../service/officialService");
const { isAuthenticated } = require("../middleware/authMiddleware");
const {
  uploadToCloudinary,
  deleteCloudinaryImage,
} = require("../utils/cloudinaryHelpers");

// ----------------- OFFICIALS COUNT ROUTE -----------------
router.get("/count", async (req, res) => {
  try {
    const counts = await officialService.getOfficialsCount();
    res.json(counts);
  } catch (error) {
    console.error("Failed to fetch officials count:", error);
    res.status(500).json({ message: "Failed to fetch officials count" });
  }
});

router.get("/head", async (req, res) => {
  try {
    const head = await officialService.getHead();
    res.json(head);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch head" });
  }
});

router.get("/mayor", async (req, res) => {
  try {
    const mayor = await officialService.getMayor();
    res.json(mayor);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch mayor" });
  }
});

router.get("/municipal-public", async (req, res) => {
  try {
    const officials = await officialService.getMunicipalPublic();
    res.json(officials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch municipal officials" });
  }
});

router.get("/barangay-public", async (req, res) => {
  try {
    const officials = await officialService.getBarangayPublic();
    res.json(officials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch barangay officials" });
  }
});

router.get("/orgchart-public", async (req, res) => {
  try {
    const officials = await officialService.getOrgPublic();
    res.json(officials);
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Failed to fetch organizational chart officials" });
  }
});

// APPROVE municipal (Admin only)
router.put("/:id/approve-municipal", isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;

  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  try {
    const approved = await officialService.approveMunicipal(
      req.params.id,
      user,
      ip
    );

    if (!approved) {
      return res.status(404).json({ message: "official not found" });
    }

    res.status(200).json({ message: "official approved" });
  } catch (err) {
    console.error("Failed to approve official:", err);
    res.status(500).json({ message: err.message });
  }
});

// APPROVE barangay (Admin only)
router.put("/:id/approve-barangay", isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;

  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  try {
    const approved = await officialService.approveBarangay(
      req.params.id,
      user,
      ip
    );

    if (!approved) {
      return res.status(404).json({ message: "official not found" });
    }

    res.status(200).json({ message: "official approved" });
  } catch (err) {
    console.error("Failed to approve official:", err);
    res.status(500).json({ message: err.message });
  }
});

// APPROVE orgchart (Admin only)
router.put("/:id/approve-orgchart", isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;

  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins only" });
  }

  try {
    const approved = await officialService.approveOrgChart(
      req.params.id,
      user,
      ip
    );

    if (!approved) {
      return res.status(404).json({ message: "official not found" });
    }

    res.status(200).json({ message: "official approved" });
  } catch (err) {
    console.error("Failed to approve official:", err);
    res.status(500).json({ message: err.message });
  }
});

// ----------------- MUNICIPAL ROUTES -----------------

router.get("/municipal", async (req, res) => {
  try {
    const officials = await officialService.getMunicipalOfficials();
    res.json(officials);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch municipal officials" });
  }
});

router.post(
  "/municipal",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    const { name, position, type } = req.body;
    const user = req.session.user;
    const ip = req.userIp;

    try {
      const imageUrl = req.file
        ? await uploadToCloudinary(req.file.buffer, "municipal_officials")
        : null;

      const result = await officialService.addMunicipalOfficial(
        name,
        position,
        type,
        imageUrl,
        user,
        ip
      );

      res.status(201).json({
        message: "Municipal official added",
        id: result.insertId,
        image: imageUrl,
      });
    } catch (error) {
      console.error(error);
      if (error.message?.includes("already exists"))
        return res.status(409).json({ message: error.message });
      res.status(500).json({ message: "Failed to add municipal official" });
    }
  }
);

router.put(
  "/municipal/:id",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    const { name, position, type, existing_image } = req.body;
    const user = req.session.user;
    const ip = req.userIp;

    try {
      let imageUrl = existing_image;
      if (req.file) {
        imageUrl = await uploadToCloudinary(
          req.file.buffer,
          "municipal_officials"
        );
      }

      await officialService.updateMunicipalOfficial(
        req.params.id,
        name,
        position,
        type,
        imageUrl,
        user,
        ip
      );
      res.json({ message: "Municipal official updated successfully" });
    } catch (error) {
      console.error(error);
      if (error.message?.includes("already exists"))
        return res.status(409).json({ message: error.message });
      res.status(500).json({ message: "Failed to update municipal official" });
    }
  }
);

router.delete("/municipal/:id", isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;

  try {
    await officialService.deleteMunicipalOfficial(req.params.id, user, ip);
    res.json({ message: "Municipal official deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete municipal official" });
  }
});

// ----------------- BARANGAY ROUTES -----------------

router.get("/barangay", async (req, res) => {
  try {
    const results = await officialService.getBarangayOfficials();
    res.json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch barangay officials" });
  }
});

router.post(
  "/barangay",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    const { barangay_name, president_name, position } = req.body;
    const user = req.session.user;
    const ip = req.userIp;

    try {
      const imageUrl = req.file
        ? await uploadToCloudinary(req.file.buffer, "barangay_officials")
        : null;

      const result = await officialService.addBarangayOfficial(
        barangay_name,
        president_name,
        position,
        imageUrl,
        user,
        ip
      );

      res.status(201).json({
        message: "Barangay official added",
        id: result.insertId,
        image: imageUrl,
      });
    } catch (error) {
      console.error(error);
      if (error.message?.includes("already exists"))
        return res.status(409).json({ message: error.message });
      res.status(500).json({ message: "Failed to add barangay official" });
    }
  }
);

router.put(
  "/barangay/:id",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    const { barangay_name, president_name, position, existing_image } =
      req.body;
    const user = req.session.user;
    const ip = req.userIp;

    try {
      let imageUrl = existing_image;
      if (req.file) {
        imageUrl = await uploadToCloudinary(
          req.file.buffer,
          "barangay_officials"
        );
        if (existing_image?.includes("res.cloudinary.com"))
          await deleteCloudinaryImage(existing_image);
      }

      await officialService.updateBarangayOfficial(
        req.params.id,
        barangay_name,
        president_name,
        position,
        imageUrl,
        user,
        ip
      );
      res.json({ message: "Barangay official updated successfully" });
    } catch (error) {
      console.error(error);
      if (error.message?.includes("already exists"))
        return res.status(409).json({ message: error.message });
      res.status(500).json({ message: "Failed to update barangay official" });
    }
  }
);

router.delete("/barangay/:id", isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;

  try {
    await officialService.deleteBarangayOfficial(req.params.id, user, ip);
    res.json({ message: "Barangay official deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete barangay official" });
  }
});

// ----------------- ORGCHART ROUTES -----------------

router.get("/orgchart", async (req, res) => {
  try {
    const data = await officialService.getOrgChart();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch org chart" });
  }
});

router.post(
  "/orgchart",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    const { name, position, type } = req.body;
    const user = req.session.user;
    const ip = req.userIp;

    try {
      const imageUrl = req.file
        ? await uploadToCloudinary(req.file.buffer, "orgChart")
        : "";

      const added = await officialService.addOrgChart(
        name,
        position,
        type,
        imageUrl,
        user,
        ip
      );
      res.status(201).json({
        message: "Org chart entry added",
        id: added.insertId,
        image: imageUrl,
      });
    } catch (error) {
      console.error(error);
      if (error.message?.includes("already exists"))
        return res.status(409).json({ message: error.message });
      res.status(500).json({ message: "Failed to add org chart entry" });
    }
  }
);

router.put(
  "/orgchart/:id",
  isAuthenticated,
  upload.single("image"),
  async (req, res) => {
    const { name, position, type, existing_image } = req.body;
    const user = req.session.user;
    const ip = req.userIp;

    try {
      let imageUrl = existing_image;
      if (req.file) {
        imageUrl = await uploadToCloudinary(req.file.buffer, "orgChart");
        if (existing_image?.includes("res.cloudinary.com"))
          await deleteCloudinaryImage(existing_image);
      }

      await officialService.updateOrgChart(
        req.params.id,
        name,
        position,
        type,
        imageUrl,
        user,
        ip
      );
      res.json({ message: "Org chart updated successfully" });
    } catch (error) {
      console.error(error);
      if (error.message?.includes("already exists"))
        return res.status(409).json({ message: error.message });
      res.status(500).json({ message: "Failed to update org chart entry" });
    }
  }
);

router.delete("/orgchart/:id", isAuthenticated, async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;

  try {
    await officialService.deleteOrgChart(req.params.id, user, ip);
    res.json({ message: "Org chart entry deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to delete org chart entry" });
  }
});

module.exports = router;
