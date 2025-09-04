const express = require("express");
const router = express.Router();
const seniorCitizenService = require("../service/seniorCitizenService");

// GET: Senior citizen by ID
router.get("/get/:id", async (req, res) => {
  try {
    const citizen = await seniorCitizenService.getSeniorCitizenById(
      req.params.id
    );
    if (!citizen) {
      return res.status(404).json({ message: "Senior citizen not found." });
    }
    // ✅ age comes from MySQL computed column, no need to recalc
    res.status(200).json(citizen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST: Create new senior citizen (with duplicate check)
// In your senior citizen routes file

router.post("/create", async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No user session found." });
  }

  try {
    // Destructure all fields including barangay_id from frontend
    const { firstName, lastName, middleName, suffix, form_data, barangay_id } =
      req.body;

    // Parse the dynamic form_data object
    const dynamicData = JSON.parse(form_data);

    // Include barangay_id in dynamicData
    dynamicData.barangay_id = barangay_id;

    const insertId = await seniorCitizenService.createSeniorCitizen(
      {
        firstName,
        lastName,
        middleName,
        suffix,
        form_data: dynamicData,
        birthdate: dynamicData.birthdate,
        barangay_id, // pass separately if needed
      },
      user,
      ip
    );

    res.status(201).json({ message: "Senior citizen created.", insertId });
  } catch (error) {
    if (error.code === 409) {
      return res.status(409).json({ message: error.message });
    }
    res.status(500).json({ message: error.message });
  }
});

// PUT: Update senior citizen
router.put("/update/:id", async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No user session found." });
  }

  try {
    // ✅ Only allow updating firstName, lastName, and form_data
    const { firstName, lastName, form_data } = req.body;

    const success = await seniorCitizenService.updateSeniorCitizen(
      req.params.id,
      { firstName, lastName, form_data },
      user,
      ip
    );

    if (!success) {
      return res
        .status(404)
        .json({ message: "Senior citizen not found or not updated." });
    }
    res.status(200).json({ message: "Senior citizen updated." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE: Remove senior citizen
router.delete("/delete/:id", async (req, res) => {
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No user session found." });
  }
  try {
    const success = await seniorCitizenService.deleteSeniorCitizen(
      req.params.id,
      user,
      ip
    );
    if (!success) {
      return res
        .status(404)
        .json({ message: "Senior citizen not found or not deleted." });
    }
    res.status(200).json({ message: "Senior citizen deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Paginated list
router.get("/page", async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    barangay = "All",
    gender = "All",
    ageRange = "All",
    healthStatus = "All",
    sortBy = "lastName",
    sortOrder = "asc",
  } = req.query;

  try {
    const result = await seniorCitizenService.getPaginatedFilteredCitizens({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      barangay,
      gender,
      ageRange,
      healthStatus,
      sortBy,
      sortOrder,
    });

    // ✅ Return exactly what the frontend expects
    res.status(200).json({
      citizens: result.citizens,
      total: result.total,
      totalPages: result.totalPages,
    });
  } catch (err) {
    console.error("Error getting filtered citizens:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// GET: Count all
router.get("/count/all", async (req, res) => {
  try {
    const count = await seniorCitizenService.getCitizenCount();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching senior citizen count:", error);
    res.status(500).json({ message: "Failed to fetch senior citizen count" });
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
  } catch (error) {
    console.error("Error fetching SMS recipients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PATCH: Soft delete
router.patch("/soft-delete/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  try {
    const success = await seniorCitizenService.softDeleteSeniorCitizen(
      id,
      user,
      ip
    );
    if (success) {
      return res
        .status(200)
        .json({ message: "Senior citizen soft deleted successfully" });
    } else {
      return res.status(404).json({ message: "Senior citizen not found" });
    }
  } catch (error) {
    console.error("Error in soft delete route:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET: List soft-deleted
router.get("/deleted", async (req, res) => {
  try {
    const deletedCitizens =
      await seniorCitizenService.getDeletedSeniorCitizens();
    res.status(200).json(deletedCitizens);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PATCH: Restore from recycle bin
router.patch("/restore/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) return res.status(401).json({ message: "Unauthorized" });

  try {
    const success = await seniorCitizenService.restoreSeniorCitizen(
      id,
      user,
      ip
    );
    if (!success) {
      return res
        .status(404)
        .json({ message: "Senior citizen not found or not restored." });
    }
    res.status(200).json({ message: "Senior citizen restored." });
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
    if (!success) {
      return res.status(404).json({
        message: "Senior citizen not found or not permanently deleted.",
      });
    }
    res.status(200).json({ message: "Senior citizen permanently deleted." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
