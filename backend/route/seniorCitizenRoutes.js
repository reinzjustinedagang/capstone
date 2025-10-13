const express = require("express");
const router = express.Router();
const seniorCitizenService = require("../service/seniorCitizenService");
const upload = require("../middleware/upload");
const cloudinary = require("../utils/cloudinary");

router.get("/birthdays", async (req, res) => {
  try {
    const celebrants = await seniorCitizenService.getBirthdayCelebrants();
    res.json(celebrants);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get("/birthdays/month/:month", async (req, res) => {
  try {
    const month = parseInt(req.params.month); // 1-12
    const celebrants = await seniorCitizenService.getBirthdaysByMonth(month);
    res.json(celebrants);
  } catch (error) {
    console.error("Error fetching monthly birthdays:", error);
    res.status(500).json({ message: error.message });
  }
});

router.get("/all", async (req, res) => {
  try {
    const citizens = await seniorCitizenService.getAllSeniorCitizens();
    res.status(200).json(citizens);
  } catch (error) {
    console.error("Error fetching all senior citizens:", error);
    res.status(500).json({ message: "Failed to fetch senior citizens." });
  }
});

router.get("/new", async (req, res) => {
  try {
    const citizens = await seniorCitizenService.getRecentSeniorCitizens();
    res.status(200).json(citizens);
  } catch (error) {
    console.error("Error fetching all senior citizens:", error);
    res.status(500).json({ message: "Failed to fetch senior citizens." });
  }
});

// GET: Senior citizen by ID
router.get("/get/:id", async (req, res) => {
  try {
    const citizen = await seniorCitizenService.getSeniorCitizenById(
      req.params.id
    );
    if (!citizen) {
      return res.status(404).json({ message: "Senior citizen not found." });
    }
    res.status(200).json(citizen);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET: Unregistered citizens (list)
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
    console.error("Error fetching unregistered citizens:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// POST: Apply senior citizen with image/document upload
router.post(
  "/apply",
  upload.fields([
    { name: "documentFile", maxCount: 1 },
    { name: "photoFile", maxCount: 1 },
  ]),
  async (req, res) => {
    const ip = req.userIp;

    try {
      const {
        firstName,
        lastName,
        middleName,
        suffix,
        form_data,
        documentType,
        barangay_id,
      } = req.body;

      const dynamicData = JSON.parse(form_data);
      dynamicData.barangay_id = barangay_id;

      let documentUrl = null;
      let photoUrl = null;

      // Handle document upload
      if (req.files?.documentFile) {
        const file = req.files.documentFile[0];
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "seniors/documents" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        documentUrl = result.secure_url;
      }

      // Handle photo upload
      if (req.files?.photoFile) {
        const file = req.files.photoFile[0];
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "seniors/photos" },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          stream.end(file.buffer);
        });
        photoUrl = result.secure_url;
      }

      const insertId = await seniorCitizenService.applySeniorCitizen(
        {
          firstName,
          lastName,
          middleName,
          suffix,
          form_data: dynamicData,
          birthdate: dynamicData.birthdate,
          barangay_id,
          document_image: documentUrl,
          documentType,
          photo: photoUrl,
        },
        ip
      );

      res.status(201).json({ message: "Senior citizen registered.", insertId });
    } catch (error) {
      if (error.code === 409) {
        return res.status(409).json({ message: error.message });
      }
      console.error("❌ Error applying senior citizen:", error);
      res.status(500).json({ message: error.message });
    }
  }
);

// Register senior citizen (set registered = 1)
router.put("/register/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  try {
    const success = await seniorCitizenService.registerSeniorCitizen(
      id,
      user,
      ip
    );

    if (success) {
      return res
        .status(200)
        .json({ message: "Senior citizen registered successfully" });
    } else {
      return res.status(404).json({ message: "Senior citizen not found" });
    }
  } catch (error) {
    console.error("❌ Error in register route:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// seniorCitizenRoutes.js
router.post(
  "/create",
  upload.fields([
    { name: "documentFile", maxCount: 1 },
    { name: "photoFile", maxCount: 1 },
  ]),
  async (req, res) => {
    const user = req.session.user;
    const ip = req.userIp;

    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user session found." });
    }

    try {
      const {
        firstName,
        lastName,
        middleName,
        suffix,
        form_data,
        documentType,
        barangay_id,
      } = req.body;
      const dynamicData = JSON.parse(form_data);
      dynamicData.barangay_id = barangay_id;

      const insertId = await seniorCitizenService.createSeniorCitizen(
        {
          firstName,
          lastName,
          middleName,
          suffix,
          form_data: dynamicData,
          birthdate: dynamicData.birthdate,
          barangay_id,
          documentType,
          documentFile: req.files?.documentFile
            ? req.files.documentFile[0]
            : null,
          photoFile: req.files?.photoFile ? req.files.photoFile[0] : null,
        },
        user,
        ip
      );

      res.status(201).json({ message: "Senior citizen created.", insertId });
    } catch (error) {
      res
        .status(error.code === 409 ? 409 : 500)
        .json({ message: error.message });
    }
  }
);

// PUT: Update senior citizen
router.put(
  "/update/:id",
  upload.fields([
    { name: "documentFile", maxCount: 1 },
    { name: "photoFile", maxCount: 1 },
  ]),
  async (req, res) => {
    const user = req.session.user;
    const ip = req.userIp;

    if (!user) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No user session found." });
    }

    try {
      const {
        firstName,
        lastName,
        middleName,
        suffix,
        barangay_id,
        form_data,
        documentType,
      } = req.body;
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
          documentType,
          documentFile: req.files?.documentFile
            ? req.files.documentFile[0]
            : null,
          photoFile: req.files?.photoFile ? req.files.photoFile[0] : null,
        },
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
  }
);

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
    pensioner = "All",
    reports = "All",
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
      pensioner,
      reports,
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

// GET: Count not registered
router.get("/register/all", async (req, res) => {
  try {
    const count = await seniorCitizenService.getRegisteredCount();
    res.json({ count });
  } catch (error) {
    console.error("Error fetching senior citizen count:", error);
    res.status(500).json({ message: "Failed to fetch senior citizen count" });
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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { items, total } =
      await seniorCitizenService.getDeletedSeniorCitizens(page, limit, offset);

    res.status(200).json({
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
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

// Archive a senior citizen
router.put("/archive/:id", async (req, res) => {
  const { id } = req.params;
  const { reason, deceasedDate } = req.body;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No user session found." });
  }

  try {
    const success = await seniorCitizenService.archiveSeniorCitizen(
      id,
      reason,
      deceasedDate,
      user,
      ip
    );

    if (success) {
      return res
        .status(200)
        .json({ message: "Senior citizen archived successfully." });
    } else {
      return res
        .status(404)
        .json({ message: "Senior citizen not found or already archived." });
    }
  } catch (error) {
    console.error("❌ Error archiving senior citizen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Restore an archived senior citizen
router.put("/archive/restore/:id", async (req, res) => {
  const { id } = req.params;
  const user = req.session.user;
  const ip = req.userIp;

  if (!user) {
    return res
      .status(401)
      .json({ message: "Unauthorized: No user session found." });
  }

  try {
    const success = await seniorCitizenService.restoreArchivedSeniorCitizen(
      id,
      user,
      ip
    );

    if (success) {
      return res
        .status(200)
        .json({ message: "Archived senior citizen restored successfully." });
    } else {
      return res
        .status(404)
        .json({ message: "Senior citizen not found or not archived." });
    }
  } catch (error) {
    console.error("❌ Error restoring archived senior citizen:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get archived senior citizens (with pagination)
router.get("/archived", async (req, res) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    barangay = "All Barangays",
    gender = "All",
    reason = "All",
    sortBy = "archive_date",
    sortOrder = "desc",
  } = req.query;

  try {
    const result = await seniorCitizenService.getArchivedSeniorCitizens({
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      search,
      barangay,
      gender,
      reason,
      sortBy,
      sortOrder,
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Error fetching archived citizens:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/filters/remarks", async (req, res) => {
  try {
    const filters = await seniorCitizenService.getRemarksFilters();
    res.json(filters);
  } catch (err) {
    console.error("❌ Error in /filters/remarks route:", err);
    res
      .status(500)
      .json({ message: "Failed to fetch remarks and pensioner options" });
  }
});

module.exports = router;
