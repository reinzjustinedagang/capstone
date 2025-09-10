const express = require("express");
const router = express.Router();
const seniorCitizenService = require("../service/seniorCitizenService");

// GET: Senior citizen by ID
router.get("/get/:id", async (req, res) => {
  try {
    const citizen = await seniorCitizenService.getSeniorCitizenById(
      req.params.id
    );
    if (!citizen)
      return res.status(404).json({ message: "Senior citizen not found." });
    res.status(200).json(citizen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Unregistered citizens
router.get("/unregistered", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await seniorCitizenService.getUnregisteredCitizens({
      page,
      limit,
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST: Register (for seniors applying themselves, no session user required)
router.post("/register", async (req, res) => {
  const ip = req.userIp;
  try {
    const { firstName, lastName, middleName, suffix, form_data, barangay_id } =
      req.body;
    const dynamicData =
      typeof form_data === "string" ? JSON.parse(form_data) : form_data;

    const insertId = await seniorCitizenService.registerSeniorCitizen(
      {
        firstName,
        lastName,
        middleName,
        suffix,
        form_data: dynamicData,
        birthdate: dynamicData.birthdate,
        barangay_id,
      },
      ip
    );

    res.status(201).json({ message: "Senior citizen registered.", insertId });
  } catch (error) {
    res.status(error.code === 409 ? 409 : 500).json({ message: error.message });
  }
});

// POST: Create (admin creates with session)
router.post("/create", async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { firstName, lastName, middleName, suffix, form_data, barangay_id } =
      req.body;
    const dynamicData =
      typeof form_data === "string" ? JSON.parse(form_data) : form_data;

    const insertId = await seniorCitizenService.createSeniorCitizen(
      {
        firstName,
        lastName,
        middleName,
        suffix,
        form_data: dynamicData,
        birthdate: dynamicData.birthdate,
        barangay_id,
      },
      user,
      ip
    );

    res.status(201).json({ message: "Senior citizen created.", insertId });
  } catch (error) {
    res.status(error.code === 409 ? 409 : 500).json({ message: error.message });
  }
});

// PUT: Update
router.put("/update/:id", async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const { firstName, lastName, middleName, suffix, barangay_id, form_data } =
      req.body;
    const dynamicData =
      typeof form_data === "string" ? JSON.parse(form_data) : form_data;

    const success = await seniorCitizenService.updateSeniorCitizen(
      req.params.id,
      {
        firstName,
        lastName,
        middleName,
        suffix,
        barangay_id,
        form_data: dynamicData,
      },
      user,
      ip
    );

    if (!success)
      return res.status(404).json({ message: "Not found or not updated" });
    res.status(200).json({ message: "Senior citizen updated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH: Soft delete
router.patch("/soft-delete/:id", async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const success = await seniorCitizenService.softDeleteSeniorCitizen(
      req.params.id,
      user,
      ip
    );
    if (!success) return res.status(404).json({ message: "Not found" });
    res.status(200).json({ message: "Soft deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Soft-deleted
router.get("/deleted", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { items, total } =
      await seniorCitizenService.getDeletedSeniorCitizens(page, limit, offset);
    res
      .status(200)
      .json({ items, total, page, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH: Restore
router.patch("/restore/:id", async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const success = await seniorCitizenService.restoreSeniorCitizen(
      req.params.id,
      user,
      ip
    );
    if (!success) return res.status(404).json({ message: "Not restored" });
    res.status(200).json({ message: "Restored successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE: Permanent delete
router.delete("/permanent-delete/:id", async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;
  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const success = await seniorCitizenService.permanentlyDeleteSeniorCitizen(
      req.params.id,
      user,
      ip
    );
    if (!success)
      return res.status(404).json({ message: "Not permanently deleted" });
    res.status(200).json({ message: "Permanently deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Paginated citizens
router.get("/page", async (req, res) => {
  try {
    const result = await seniorCitizenService.getPaginatedFilteredCitizens(
      req.query
    );
    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET: Count unregistered
router.get("/register/all", async (req, res) => {
  try {
    const count = await seniorCitizenService.getRegisteredCount();
    res.json({ count });
  } catch {
    res.status(500).json({ message: "Failed to fetch count" });
  }
});

// GET: Count active
router.get("/count/all", async (req, res) => {
  try {
    const count = await seniorCitizenService.getCitizenCount();
    res.json({ count });
  } catch {
    res.status(500).json({ message: "Failed to fetch count" });
  }
});

// GET: SMS recipients
router.get("/sms-citizens", async (req, res) => {
  const { barangay, barangay_id, search } = req.query;
  try {
    const recipients = await seniorCitizenService.getSmsRecipients(
      barangay,
      barangay_id,
      search
    );
    res.status(200).json(recipients);
  } catch {
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
