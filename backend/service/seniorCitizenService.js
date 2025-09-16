const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");
const cloudinary = require("../utils/cloudinary");

// Fetch by ID
exports.getSeniorCitizenById = async (id) => {
  try {
    const result = await Connection(
      `SELECT id, firstName, middleName, lastName, suffix, form_data,
              age, gender, created_at, updated_at, deleted, deleted_at, document_image, document_type, photo
       FROM senior_citizens
       WHERE id = ?`,
      [id]
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(`Error fetching senior citizen with ID ${id}:`, error);
    throw new Error(`Failed to retrieve senior citizen with ID ${id}.`);
  }
};

// service/seniorCitizenService.js
exports.getUnregisteredCitizens = async ({ page = 1, limit = 10 } = {}) => {
  try {
    const offset = (page - 1) * limit;

    const result = await Connection(
      `SELECT sc.id, sc.firstName, sc.middleName, sc.lastName, sc.suffix,
              sc.age, sc.gender, sc.form_data, sc.created_at,
              sc.barangay_id, b.barangay_name
       FROM senior_citizens sc
       LEFT JOIN barangays b ON sc.barangay_id = b.id
       WHERE sc.deleted = 0 AND sc.age >= 60 AND sc.registered = 0
       ORDER BY sc.lastName ASC, sc.firstName ASC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    const totalResult = await Connection(
      `SELECT COUNT(*) AS total 
       FROM senior_citizens 
       WHERE deleted = 0 AND age >= 60 AND registered = 0`
    );
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / limit);

    return {
      citizens: result.map((citizen) => ({
        ...citizen,
        form_data:
          typeof citizen.form_data === "string"
            ? JSON.parse(citizen.form_data || "{}")
            : citizen.form_data || {},
      })),
      total,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching unregistered citizens:", error);
    throw new Error("Failed to fetch unregistered citizens.");
  }
};

const normalize = (val) => {
  if (val === undefined || val === null) return null;
  if (typeof val === "string" && val.trim() === "") return null;
  return val;
};

// check duplicate by firstName + lastName + birthdate (null-safe)
const isDuplicateSeniorCitizen = async ({ firstName, lastName, birthdate }) => {
  let sql, params;

  if (!birthdate) {
    sql = `SELECT id FROM senior_citizens
           WHERE firstName = ? AND lastName = ? 
             AND birthdate IS NULL AND deleted = 0`;
    params = [firstName, lastName];
  } else {
    sql = `SELECT id FROM senior_citizens
           WHERE firstName = ? AND lastName = ? 
             AND birthdate = ? AND deleted = 0`;
    params = [firstName, lastName, birthdate];
  }

  const result = await Connection(sql, params);
  return result.length > 0;
};

//apply senior
exports.applySeniorCitizen = async (data, ip) => {
  try {
    // 🔎 Duplicate check
    if (await isDuplicateSeniorCitizen(data)) {
      const msg = `A senior citizen named '${data.firstName} ${data.lastName}' with birthdate '${data.birthdate}' already exists.`;
      const err = new Error(msg);
      err.code = 409;
      throw err;
    }

    // 📝 Prepare insert
    const insertData = {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName || null,
      suffix: data.suffix || null,
      barangay_id: data.barangay_id || null,
      form_data: JSON.stringify(data.form_data || {}),
      document_image: data.document_image || null,
      document_type: data.documentType || null, // ✅ fixed
      photo: data.photo || null,
      registered: 0,
    };

    // 💾 Save to DB
    const result = await Connection(
      `INSERT INTO senior_citizens SET ?`,
      insertData
    );

    // 🗒️ Audit log
    if (result.affectedRows === 1) {
      await logAudit(
        0,
        "N/A",
        "User",
        "REGISTER",
        `Registered new senior citizen: '${data.firstName} ${data.lastName}'.`,
        ip
      );
    }

    return result.insertId;
  } catch (error) {
    if (error.code === 409) throw error;
    console.error("❌ Error creating senior citizen:", error);
    throw new Error("Failed to register senior citizen.");
  }
};

// Mark senior citizen as registered
exports.registerSeniorCitizen = async (id, user, ip) => {
  try {
    // Check if the senior exists
    const [senior] = await Connection(
      `SELECT id, registered FROM senior_citizens WHERE id = ?`,
      [id]
    );

    if (!senior) {
      return false; // not found
    }

    // If already registered, just return true (idempotent)
    if (senior.registered === 1) {
      return true;
    }

    // Mark as registered
    const result = await Connection(
      `UPDATE senior_citizens 
       SET registered = 1,
           updated_at = NOW(),
           created_at = NOW()
       WHERE id = ?`,
      [id]
    );

    // Audit log only if successful
    if (result.affectedRows > 0 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "Register",
        `Registered Senior Citizen ID: ${id}`,
        ip
      );
    }

    return result.affectedRows > 0;
  } catch (error) {
    console.error(`❌ Error registering senior citizen ID ${id}:`, error);
    throw new Error("Failed to register senior citizen.");
  }
};

// CREATE
exports.createSeniorCitizen = async (data, user, ip) => {
  try {
    let documentUrl = null;
    let photoUrl = null;

    // Upload document if provided
    if (data.documentFile) {
      const file = data.documentFile;
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

    // Upload photo if provided
    if (data.photoFile) {
      const file = data.photoFile;
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

    // Insert into DB
    const insertData = {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: normalize(data.middleName),
      suffix: normalize(data.suffix),
      barangay_id: normalize(data.barangay_id),
      form_data: JSON.stringify(data.form_data || {}),
      document_image: documentUrl,
      document_type: data.documentType || null,
      photo: photoUrl,
    };

    const result = await Connection(`INSERT INTO senior_citizens SET ?`, [
      insertData,
    ]);

    if (result.affectedRows > 0 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "CREATE",
        `Created Senior Citizen: '${data.firstName} ${data.lastName}'.`,
        ip
      );
    }

    return result.insertId;
  } catch (error) {
    console.error("Error creating senior citizen:", error);
    throw new Error("Failed to create senior citizen.");
  }
};

//update
exports.updateSeniorCitizen = async (id, updatedData, user, ip) => {
  try {
    // Fetch current record (to clean up old images)
    const [existing] = await Connection(
      `SELECT document_image, document_public_id, photo, photo_public_id
       FROM senior_citizens
       WHERE id = ? AND deleted = 0`,
      [id]
    );

    if (!existing) return false;

    let documentUrl = existing.document_image;
    let documentPublicId = existing.document_public_id;
    let photoUrl = existing.photo;
    let photoPublicId = existing.photo_public_id;

    // ✅ Helper for Cloudinary upload (using buffer)
    const uploadToCloudinary = (file, folder) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        );
        stream.end(file.buffer);
      });

    // 🔹 Upload new document if provided
    if (updatedData.documentFile) {
      // Delete old document if exists
      if (documentPublicId) {
        await cloudinary.uploader.destroy(documentPublicId);
      }

      // Upload new
      const result = await uploadToCloudinary(
        updatedData.documentFile,
        "seniors/documents"
      );
      documentUrl = result.secure_url;
      documentPublicId = result.public_id;
    }

    // 🔹 Upload new photo if provided
    if (updatedData.photoFile) {
      // Delete old photo if exists
      if (photoPublicId) {
        await cloudinary.uploader.destroy(photoPublicId);
      }

      // Upload new
      const result = await uploadToCloudinary(
        updatedData.photoFile,
        "seniors/photos"
      );
      photoUrl = result.secure_url;
      photoPublicId = result.public_id;
    }

    // ✅ Update record
    const updateData = {
      firstName: updatedData.firstName,
      lastName: updatedData.lastName,
      middleName: normalize(updatedData.middleName),
      suffix: normalize(updatedData.suffix),
      barangay_id: normalize(updatedData.barangay_id),
      form_data: JSON.stringify(updatedData.form_data || {}),
      document_image: documentUrl,
      document_public_id: documentPublicId, // new field
      document_type: updatedData.documentType || null,
      photo: photoUrl,
      photo_public_id: photoPublicId, // new field
    };

    const result = await Connection(
      `UPDATE senior_citizens SET ? WHERE id = ? AND deleted = 0`,
      [updateData, id]
    );

    if (result.affectedRows > 0 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "UPDATE",
        `Updated Senior Citizen: '${updatedData.firstName} ${updatedData.lastName}'.`,
        ip
      );
    }

    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error updating senior citizen with ID ${id}:`, error);
    throw new Error(`Failed to update senior citizen with ID ${id}.`);
  }
};

// ✅ Pagination & filtering (using JSON_EXTRACT)
exports.getPaginatedFilteredCitizens = async (options) => {
  const {
    page = 1,
    limit = 10,
    search,
    barangay,
    gender,
    ageRange,
    healthStatus,
    sortBy,
    sortOrder,
  } = options;

  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
  const offset = (safePage - 1) * safeLimit;

  const params = [];
  let where =
    "WHERE sc.deleted = 0 AND sc.age >= 60 AND registered = 1 AND archived = 0"; // Only active seniors

  // Search by name or barangay
  if (search) {
    where += ` AND (
    sc.firstName LIKE ? OR sc.lastName LIKE ? OR sc.middleName LIKE ? OR sc.suffix LIKE ?
    OR b.barangay_name LIKE ?
    OR JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.idNumber')) LIKE ?
  )`;
    const s = `%${search}%`;
    params.push(s, s, s, s, s, s);
  }

  // Barangay filter
  if (barangay && barangay !== "All Barangays") {
    where += ` AND b.barangay_name = ?`;
    params.push(barangay);
  }

  // Health status filter
  if (healthStatus && healthStatus !== "All Remarks") {
    where += ` AND JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.remarks')) = ?`;
    params.push(healthStatus);
  }

  // Gender filter
  if (gender && gender !== "All") {
    where += ` AND sc.gender = ?`;
    params.push(gender);
  }

  // Age range filter
  if (ageRange && ageRange !== "All") {
    const [min, maxRaw] = ageRange.split(" - ");
    const max = maxRaw.includes("+") ? 200 : parseInt(maxRaw);
    where += ` AND sc.age BETWEEN ? AND ?`;
    params.push(parseInt(min), max);
  }

  // Sorting
  const allowedSort = [
    "lastName",
    "firstName",
    "gender",
    "age",
    "created_at",
    "barangay_name",
  ];
  const orderBy = allowedSort.includes(sortBy) ? sortBy : "lastName";
  const order = sortOrder === "desc" ? "DESC" : "ASC";

  try {
    // Get total count
    const totalResult = await Connection(
      `SELECT COUNT(*) AS total
       FROM senior_citizens sc
       LEFT JOIN barangays b ON sc.barangay_id = b.id
       ${where}`,
      params
    );
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / safeLimit);

    // Get paginated data
    const data = await Connection(
      `SELECT sc.id, sc.firstName, sc.middleName, sc.lastName, sc.suffix,
              sc.age, sc.gender, sc.form_data, sc.created_at,
              sc.barangay_id, b.barangay_name
       FROM senior_citizens sc
       LEFT JOIN barangays b ON sc.barangay_id = b.id
       ${where}
       ORDER BY ${orderBy} ${order}
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    // Ensure form_data is always an object
    const citizens = data.map((citizen) => ({
      ...citizen,
      form_data:
        typeof citizen.form_data === "string"
          ? JSON.parse(citizen.form_data || "{}")
          : citizen.form_data || {},
    }));

    return { citizens, total, totalPages };
  } catch (error) {
    console.error("Error fetching paginated senior citizens:", error);
    throw new Error("Failed to fetch paginated senior citizens.");
  }
};

// Soft delete (mark as deleted, set deleted_at)
exports.softDeleteSeniorCitizen = async (id, user, ip) => {
  try {
    // First check if the senior exists
    const [senior] = await Connection(
      `SELECT id, deleted FROM senior_citizens WHERE id = ?`,
      [id]
    );

    if (!senior) {
      return false; // not found
    }

    // If already deleted, just return true (idempotent)
    if (senior.deleted === 1) {
      return true;
    }

    // Perform soft delete
    const result = await Connection(
      `UPDATE senior_citizens 
       SET deleted = 1, deleted_at = NOW() 
       WHERE id = ?`,
      [id]
    );

    // Audit log only if successful
    if (result.affectedRows > 0 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "SOFT_DELETE",
        `Soft deleted Senior Citizen ID: ${id}`,
        ip
      );
    }

    return result.affectedRows > 0;
  } catch (error) {
    console.error(`❌ Error soft deleting senior citizen ID ${id}:`, error);
    throw new Error("Failed to soft delete senior citizen.");
  }
};

// Get all soft-deleted citizens
exports.getDeletedSeniorCitizens = async (page, limit, offset) => {
  try {
    // Get paginated records
    const items = await Connection(
      `SELECT id, firstName, middleName, lastName, suffix, age, gender, form_data, deleted_at
       FROM senior_citizens
       WHERE deleted = 1
       ORDER BY deleted_at DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );

    // Get total count
    const totalResult = await Connection(
      `SELECT COUNT(*) AS count FROM senior_citizens WHERE deleted = 1`
    );
    const total = totalResult[0].count;

    return { items, total };
  } catch (error) {
    console.error("Error fetching deleted senior citizens:", error);
    throw new Error("Failed to fetch deleted senior citizens.");
  }
};

// Restore soft-deleted citizen
exports.restoreSeniorCitizen = async (id, user, ip) => {
  try {
    const result = await Connection(
      `UPDATE senior_citizens 
       SET deleted = 0, deleted_at = NULL 
       WHERE id = ? AND deleted = 1`,
      [id]
    );

    if (result.affectedRows > 0 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "RESTORE",
        `Restored Senior Citizen ID: ${id}`,
        ip
      );
    }
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error restoring senior citizen with ID ${id}:`, error);
    throw new Error("Failed to restore senior citizen.");
  }
};

// Permanent delete (hard remove from DB)
exports.permanentlyDeleteSeniorCitizen = async (id, user, ip) => {
  try {
    // Get existing images
    const [existing] = await Connection(
      `SELECT document_image, photo FROM senior_citizens WHERE id = ?`,
      [id]
    );

    if (!existing) return false;

    // Delete from DB
    const result = await Connection(
      `DELETE FROM senior_citizens WHERE id = ?`,
      [id]
    );

    if (result.affectedRows > 0) {
      // Cleanup Cloudinary
      if (existing.document_image) {
        const publicId = existing.document_image.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`seniors/documents/${publicId}`);
      }
      if (existing.photo) {
        const publicId = existing.photo.split("/").pop().split(".")[0];
        await cloudinary.uploader.destroy(`seniors/photos/${publicId}`);
      }

      if (user) {
        await logAudit(
          user.id,
          user.email,
          user.role,
          "PERMANENT_DELETE",
          `Permanently deleted Senior Citizen ID: ${id}`,
          ip
        );
      }
    }

    return result.affectedRows > 0;
  } catch (error) {
    console.error(
      `Error permanently deleting senior citizen with ID ${id}:`,
      error
    );
    throw new Error("Failed to permanently delete senior citizen.");
  }
};

// Count not registered citizens
exports.getRegisteredCount = async () => {
  try {
    const result = await Connection(
      `SELECT COUNT(*) AS count 
       FROM senior_citizens 
       WHERE deleted = 0 AND age >= 60 AND registered = 0`
    );
    return result[0].count;
  } catch (error) {
    console.error("Error fetching citizen count:", error);
    throw new Error("Failed to fetch citizen count.");
  }
};

// Count active citizens
exports.getCitizenCount = async () => {
  try {
    const result = await Connection(
      `SELECT COUNT(*) AS count 
       FROM senior_citizens 
       WHERE deleted = 0 AND age >= 60 AND registered = 1 AND archived = 0`
    );
    return result[0].count;
  } catch (error) {
    console.error("Error fetching citizen count:", error);
    throw new Error("Failed to fetch citizen count.");
  }
};

// Get SMS recipients with optional barangay filter
exports.getSmsRecipients = async (
  barangay = "",
  barangay_id = "",
  search = ""
) => {
  try {
    let sql = `
      SELECT 
        sc.id,
        CONCAT_WS(' ', sc.firstName, sc.middleName, sc.lastName, sc.suffix) AS name,
        COALESCE(
          JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.mobileNumber')),
          JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.emergencyContactNumber'))
        ) AS contact,
        JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.barangay')) AS barangay,
        sc.barangay_id,
        TIMESTAMPDIFF(
          YEAR,
          STR_TO_DATE(JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.birthdate')), '%Y-%m-%d'),
          CURDATE()
        ) AS age
      FROM senior_citizens sc
      WHERE (JSON_EXTRACT(sc.form_data, '$.mobileNumber') IS NOT NULL
          OR JSON_EXTRACT(sc.form_data, '$.emergencyContactNumber') IS NOT NULL)
        AND sc.deleted = 0 
        AND registered = 1
        AND archived = 0
        AND TIMESTAMPDIFF(
              YEAR,
              STR_TO_DATE(JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.birthdate')), '%Y-%m-%d'),
              CURDATE()
            ) >= 60
    `;

    const params = [];

    if (barangay_id && barangay_id.trim() !== "") {
      sql += ` AND sc.barangay_id = ?`;
      params.push(barangay_id);
    } else if (barangay && barangay.trim() !== "") {
      sql += ` AND JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.barangay')) = ?`;
      params.push(barangay);
    }

    if (search && search.trim() !== "") {
      sql += ` AND (
        CONCAT_WS(' ', sc.firstName, sc.middleName, sc.lastName, sc.suffix) LIKE ? 
        OR COALESCE(
          JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.mobileNumber')),
          JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.emergencyContactNumber'))
        ) LIKE ?
      )`;
      params.push(`%${search}%`, `%${search}%`);
    }

    const result = await Connection(sql, params);
    return result;
  } catch (error) {
    console.error("Error fetching SMS recipients:", error);
    throw new Error("Internal server error");
  }
};

// Archive a senior citizen
exports.archiveSeniorCitizen = async (id, reason, user, ip) => {
  try {
    const result = await Connection(
      `UPDATE senior_citizens 
       SET archived = 1, archive_reason = ?, archive_date = NOW(), updated_at = NOW() 
       WHERE id = ?`,
      [reason, id]
    );

    if (result.affectedRows > 0) {
      await logAudit(
        user,
        "Archive",
        "Senior Citizen",
        id,
        `Archived senior citizen with ID: ${id}`,
        ip
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error archiving senior citizen:", error);
    throw error;
  }
};

// Restore archived senior citizen
exports.restoreArchivedSeniorCitizen = async (id, user, ip) => {
  try {
    const result = await Connection(
      `UPDATE senior_citizens 
       SET archived = 0, updated_at = NOW() 
       WHERE id = ? AND deleted = 0`,
      [id]
    );

    if (result.affectedRows > 0) {
      await logAudit(
        user,
        "Restore",
        "Senior Citizen",
        id,
        `Restored archived senior citizen with ID: ${id}`,
        ip
      );
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error restoring archived senior citizen:", error);
    throw error;
  }
};

// Get archived senior citizens with pagination
exports.getArchivedSeniorCitizens = async (page = 1, limit = 10) => {
  try {
    const offset = (page - 1) * limit;

    const [rows] = await Connection(
      `SELECT SQL_CALC_FOUND_ROWS 
          id, firstName, lastName, middleName, suffix, gender,
          barangay_name, deleted_at, archived_at
       FROM senior_citizens
       WHERE archived = 1 AND deleted = 0
       ORDER BY archived_at DESC
       LIMIT ? OFFSET ?`,
      [parseInt(limit), parseInt(offset)]
    );

    const [countRows] = await Connection(`SELECT FOUND_ROWS() as total`);
    const total = countRows.total || 0;
    const totalPages = Math.ceil(total / limit);

    return {
      citizens: rows,
      total,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching archived senior citizens:", error);
    throw error;
  }
};
