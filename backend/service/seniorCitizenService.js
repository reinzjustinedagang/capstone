const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");
const cloudinary = require("../utils/cloudinary");

// Generate unique 6-digit ID per barangay
const generateUniqueBarangayIdNumber = async (barangayControl) => {
  let idNumber;
  let isDuplicate = true;
  let attempts = 0;

  while (isDuplicate && attempts < 50) {
    const randomPart = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    idNumber = `${barangayControl}${randomPart}`;

    isDuplicate = await isDuplicateIdNumber(idNumber);
    attempts++;
  }

  if (isDuplicate) {
    throw new Error(
      "Failed to generate a unique ID number after multiple attempts."
    );
  }

  return idNumber;
};

// Check duplicate idNumber
const isDuplicateIdNumber = async (idNumber, excludeId = null) => {
  let sql = `
    SELECT id FROM senior_citizens
    WHERE JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.idNumber')) = ?
      AND deleted = 0
  `;
  const params = [idNumber];

  if (excludeId) {
    sql += " AND id != ?";
    params.push(excludeId);
  }

  const result = await Connection(sql, params);
  return result.length > 0;
};

// ✅ Get all senior citizens with birthdays today or tomorrow
exports.getBirthdayCelebrants = async () => {
  try {
    const result = await Connection(`
      SELECT 
        id, firstName, middleName, lastName, suffix, form_data, barangay_id
      FROM senior_citizens
      WHERE deleted = 0 
        AND registered = 1 
        AND archived = 0
        AND JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.birthdate')) IS NOT NULL
        AND JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.birthdate')) != ''
        AND (
          DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.birthdate')), '%m-%d') = DATE_FORMAT(CURDATE(), '%m-%d')
          OR DATE_FORMAT(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.birthdate')), '%m-%d') = DATE_FORMAT(DATE_ADD(CURDATE(), INTERVAL 1 DAY), '%m-%d')
        )
    `);

    // Fetch barangays once
    const barangays = await Connection(
      "SELECT id, barangay_name FROM barangays"
    );
    const barangayMap = barangays.reduce((acc, b) => {
      acc[b.id] = b.barangay_name;
      return acc;
    }, {});

    // Helper to compute age
    const calculateAge = (birthdate) => {
      const today = new Date();
      const bDate = new Date(birthdate);
      let age = today.getFullYear() - bDate.getFullYear();
      const m = today.getMonth() - bDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) {
        age--;
      }
      return age;
    };

    // Map results
    const celebrants = result.map((citizen) => {
      const formData =
        typeof citizen.form_data === "string"
          ? JSON.parse(citizen.form_data || "{}")
          : citizen.form_data || {};

      const birthdate = formData.birthdate || null;
      const contact =
        formData.mobileNumber ||
        formData.contactNumber ||
        formData.emergencyContactNumber ||
        "";
      const barangayName = barangayMap[citizen.barangay_id] || "";

      return {
        id: citizen.id,
        name: `${citizen.lastName}, ${citizen.firstName}${
          citizen.middleName ? ` ${citizen.middleName}` : ""
        }${citizen.suffix ? ` ${citizen.suffix}` : ""}`.trim(),
        birthdate,
        age: birthdate ? calculateAge(birthdate) : null,
        barangay: barangayName,
        contact, // ✅ added contact number
      };
    });

    return celebrants;
  } catch (error) {
    console.error("Error fetching birthday celebrants:", error);
    throw new Error("Failed to fetch birthday celebrants.");
  }
};

exports.getBirthdaysByMonth = async (month) => {
  try {
    const result = await Connection(
      `
      SELECT id, firstName, middleName, lastName, suffix, form_data, barangay_id
      FROM senior_citizens
      WHERE deleted = 0
        AND registered = 1
        AND archived = 0
        AND JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.birthdate')) IS NOT NULL
        AND MONTH(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.birthdate'))) = ?
      `,
      [month]
    );

    const barangays = await Connection(
      "SELECT id, barangay_name FROM barangays"
    );
    const barangayMap = barangays.reduce((acc, b) => {
      acc[b.id] = b.barangay_name;
      return acc;
    }, {});

    const calculateAge = (birthdate) => {
      const today = new Date();
      const bDate = new Date(birthdate);
      let age = today.getFullYear() - bDate.getFullYear();
      const m = today.getMonth() - bDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < bDate.getDate())) age--;
      return age;
    };

    return result.map((citizen) => {
      const formData =
        typeof citizen.form_data === "string"
          ? JSON.parse(citizen.form_data || "{}")
          : citizen.form_data || {};

      const birthdate = formData.birthdate || null;
      const barangayName = barangayMap[citizen.barangay_id] || "";
      const contact =
        formData.mobileNumber ||
        formData.contactNumber ||
        formData.emergencyContactNumber ||
        "";

      return {
        id: citizen.id,
        name: `${citizen.lastName}, ${citizen.firstName}${
          citizen.middleName ? ` ${citizen.middleName}` : ""
        }${citizen.suffix ? ` ${citizen.suffix}` : ""}`.trim(),
        birthdate,
        age: birthdate ? calculateAge(birthdate) : null,
        barangay: barangayName,
        contact,
      };
    });
  } catch (error) {
    console.error("Error fetching birthdays by month:", error);
    throw new Error("Failed to fetch monthly birthdays.");
  }
};

// Fetch recent senior citizens
exports.getRecentSeniorCitizens = async () => {
  try {
    const citizens = await Connection(`
      SELECT * 
      FROM senior_citizens 
      WHERE deleted = 0 
        AND age >= 60 
        AND registered = 1 
        AND archived = 0
      ORDER BY created_at DESC
      LIMIT 5
    `);

    // Fetch all barangays once
    const barangays = await Connection("SELECT * FROM barangays");
    const barangayMap = barangays.reduce((acc, b) => {
      acc[b.id] = b.barangay_name;
      return acc;
    }, {});

    // Map citizens to frontend-friendly format
    return citizens.map((citizen) => {
      const formData =
        typeof citizen.form_data === "string"
          ? JSON.parse(citizen.form_data || "{}")
          : citizen.form_data || {};

      const barangayName = barangayMap[formData.barangay_id] || "";

      return {
        id: citizen.id,
        name: `${citizen.lastName}, ${citizen.firstName}${
          citizen.middleName ? ` ${citizen.middleName}` : ""
        }`.trim(),
        age: formData.age || citizen.age,
        address: `${barangayName ? `${barangayName}` : ""}`.trim(),
        dateRegistered: citizen.created_at,
      };
    });
  } catch (error) {
    console.error("Error fetching recent senior citizens:", error);
    throw new Error("Failed to retrieve recent senior citizens.");
  }
};

exports.getAllSeniorCitizens = async () => {
  try {
    const result = await Connection(`SELECT * FROM senior_citizens`);
    return result;
  } catch (error) {
    console.error("Error fetching all senior citizens:", error);
    throw new Error("Failed to retrieve senior citizens.");
  }
};

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

// ✅ IMPROVED: Check duplicates using firstName + lastName + birthdate from form_data
const isDuplicateSeniorCitizen = async (
  { firstName, lastName, birthdate },
  excludeId = null
) => {
  let sql, params;

  if (!birthdate) {
    sql = `SELECT id FROM senior_citizens
           WHERE LOWER(TRIM(firstName)) = LOWER(TRIM(?)) 
             AND LOWER(TRIM(lastName)) = LOWER(TRIM(?))
             AND (
               JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.birthdate')) IS NULL
               OR JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.birthdate')) = ''
             )
             AND deleted = 0`;
    params = [firstName, lastName];
  } else {
    sql = `SELECT id FROM senior_citizens
           WHERE LOWER(TRIM(firstName)) = LOWER(TRIM(?)) 
             AND LOWER(TRIM(lastName)) = LOWER(TRIM(?))
             AND JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.birthdate')) = ?
             AND deleted = 0`;
    params = [firstName, lastName, birthdate];
  }

  // Exclude current record when updating
  if (excludeId) {
    sql += " AND id != ?";
    params.push(excludeId);
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
// ✅ FIXED: Add duplicate check to createSeniorCitizen
exports.createSeniorCitizen = async (data, user, ip) => {
  try {
    let documentUrl = null;
    let photoUrl = null;

    const formData = data.form_data || {};

    // ✅ Extract birthdate from form_data if available
    const birthdate = formData.birthdate || data.birthdate || null;

    // ✅ CHECK FOR DUPLICATES BEFORE PROCEEDING
    if (
      await isDuplicateSeniorCitizen({
        firstName: data.firstName,
        lastName: data.lastName,
        birthdate,
      })
    ) {
      const msg = `A senior citizen named '${data.firstName} ${data.lastName}'${
        birthdate ? ` with birthdate '${birthdate}'` : ""
      } already exists.`;
      const err = new Error(msg);
      err.code = 409;
      throw err;
    }

    // Upload document
    if (data.documentFile) {
      const file = data.documentFile;
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "seniors/documents" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
      });
      documentUrl = result.secure_url;
    }

    // Upload photo
    if (data.photoFile) {
      const file = data.photoFile;
      const result = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "seniors/photos" },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
      });
      photoUrl = result.secure_url;
    }

    // ✅ Get barangay control number for ID prefix
    const [barangay] = await Connection(
      "SELECT controlNo FROM barangays WHERE id = ?",
      [data.barangay_id]
    );

    if (!barangay) {
      const err = new Error("Invalid barangay ID.");
      err.code = 400;
      throw err;
    }

    const barangayControl = String(barangay.controlNo).padStart(3, "0");

    // ✅ Generate or validate ID number
    if (!formData.idNumber || formData.idNumber.trim() === "") {
      formData.idNumber = await generateUniqueBarangayIdNumber(barangayControl);
    } else {
      formData.idNumber = formData.idNumber.replace(/\D/g, "").padStart(6, "0");

      if (await isDuplicateIdNumber(formData.idNumber)) {
        const err = new Error(
          `ID Number '${formData.idNumber}' already exists.`
        );
        err.code = 409;
        throw err;
      }
    }

    // ✅ Auto-force pensioner to "none" if SOCIAL PENSION
    if (formData.remarks === "SOCIAL PENSION") {
      formData.pensioner = "";
    }

    const now = new Date();

    const insertData = {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: normalize(data.middleName),
      suffix: normalize(data.suffix),
      barangay_id: normalize(data.barangay_id),
      form_data: JSON.stringify(formData || {}),
      document_image: documentUrl,
      document_type: data.documentType || null,
      photo: photoUrl,
      pdl_date: formData.pdl === "Yes" ? now : null,
      socpen_date: formData.remarks === "SOCIAL PENSION" ? now : null,
      nonsocpen_date: formData.remarks === "NON-SOCIAL PENSION" ? now : null,
      transferee_date: formData.transfer === "Yes" ? now : null,
      booklet_date: formData.booklet === "Yes" ? now : null,
      utp_date: formData.utp === "Yes" ? now : null,
    };

    // Insert into DB
    const result = await Connection(`INSERT INTO senior_citizens SET ?`, [
      insertData,
    ]);

    if (result.affectedRows > 0 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "CREATE",
        `Created New Senior Citizen: '${data.lastName}, ${data.firstName} ${data.middleName}'.`,
        ip
      );
    }

    return result.insertId;
  } catch (error) {
    console.error("Error creating senior citizen:", error);
    if (error.code === 400 || error.code === 409) throw error;
    throw new Error("Failed to create senior citizen.");
  }
};

//UPDATE
exports.updateSeniorCitizen = async (id, updatedData, user, ip) => {
  try {
    // Fetch existing record
    const [existing] = await Connection(
      `SELECT document_image, document_public_id, photo, photo_public_id, form_data, barangay_id
       FROM senior_citizens
       WHERE id = ? AND deleted = 0`,
      [id]
    );

    if (!existing) return false;

    let documentUrl = existing.document_image;
    let documentPublicId = existing.document_public_id;
    let photoUrl = existing.photo;
    let photoPublicId = existing.photo_public_id;

    // Helper for Cloudinary uploads
    const uploadToCloudinary = (file, folder) =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder },
          (error, result) => (error ? reject(error) : resolve(result))
        );
        stream.end(file.buffer);
      });

    // Upload document if updated
    if (updatedData.documentFile) {
      if (documentPublicId) await cloudinary.uploader.destroy(documentPublicId);
      const result = await uploadToCloudinary(
        updatedData.documentFile,
        "seniors/documents"
      );
      documentUrl = result.secure_url;
      documentPublicId = result.public_id;
    }

    // Upload photo if updated
    if (updatedData.photoFile) {
      if (photoPublicId) await cloudinary.uploader.destroy(photoPublicId);
      const result = await uploadToCloudinary(
        updatedData.photoFile,
        "seniors/photos"
      );
      photoUrl = result.secure_url;
      photoPublicId = result.public_id;
    }

    // Extract form_data
    const formData = updatedData.form_data || {};
    const oldFormData =
      typeof existing.form_data === "string"
        ? JSON.parse(existing.form_data)
        : existing.form_data || {};

    // ✅ Check if barangay changed
    const barangayChanged = updatedData.barangay_id !== existing.barangay_id;

    // ✅ Handle barangay-based ID logic
    let newIdNumber = formData.idNumber
      ? formData.idNumber.replace(/\D/g, "").padStart(6, "0")
      : null;

    if (barangayChanged) {
      // Barangay changed → generate new barangay-based ID
      const [barangay] = await Connection(
        "SELECT controlNo FROM barangays WHERE id = ?",
        [updatedData.barangay_id]
      );

      if (!barangay) {
        const err = new Error("Invalid barangay ID.");
        err.code = 400;
        throw err;
      }

      const barangayControl = String(barangay.controlNo).padStart(3, "0");
      newIdNumber = await generateUniqueBarangayIdNumber(barangayControl);
      formData.idNumber = newIdNumber;
    } else if (newIdNumber && newIdNumber !== oldFormData.idNumber) {
      // Same barangay, manually changed ID → validate duplicate
      if (await isDuplicateIdNumber(newIdNumber, id)) {
        const err = new Error(`ID Number '${newIdNumber}' already exists.`);
        err.code = 409;
        throw err;
      }
      formData.idNumber = newIdNumber;
    } else {
      // Keep old ID
      formData.idNumber = oldFormData.idNumber;
    }

    // ✅ Auto-force pensioner to "none" if SOCIAL PENSION
    if (formData.remarks === "SOCIAL PENSION") {
      formData.pensioner = "";
    }

    // Prepare update data
    const updateData = {
      firstName: updatedData.firstName,
      lastName: updatedData.lastName,
      middleName: normalize(updatedData.middleName),
      suffix: normalize(updatedData.suffix),
      barangay_id: normalize(updatedData.barangay_id),
      form_data: JSON.stringify(formData),
      document_image: documentUrl,
      document_public_id: documentPublicId,
      document_type: updatedData.documentType || null,
      photo: photoUrl,
      photo_public_id: photoPublicId,
      // Conditional date fields
      pdl_date: formData.pdl === "Yes" ? new Date() : null,
      socpen_date: formData.remarks === "SOCIAL PENSION" ? new Date() : null,
      nonsocpen_date:
        formData.remarks === "NON-SOCIAL PENSION" ? new Date() : null,
      transferee_date: formData.transfer === "Yes" ? new Date() : null,
      booklet_date: formData.booklet === "Yes" ? new Date() : null,
      utp_date: formData.utp === "Yes" ? new Date() : null,
    };

    // Update DB
    const result = await Connection(
      `UPDATE senior_citizens SET ? WHERE id = ? AND deleted = 0`,
      [updateData, id]
    );

    // Audit log
    if (result.affectedRows > 0 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "UPDATE",
        `Updated Senior Citizen: '${updatedData.lastName}, ${updatedData.firstName} ${updatedData.middleName}'.`,
        ip
      );
    }

    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error updating senior citizen with ID ${id}:`, error);
    if (error.code === 400 || error.code === 409) throw error;
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
    pensioner,
    reports,
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

  if (pensioner && pensioner !== "All Pensions") {
    if (pensioner === "Others") {
      where += `
      AND (
        JSON_EXTRACT(sc.form_data, '$.pensioner') IS NULL
        OR TRIM(JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.pensioner'))) = ''
        OR (
          LOWER(JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.pensioner'))) NOT LIKE '%sss%'
          AND LOWER(JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.pensioner'))) NOT LIKE '%gsis%'
          AND LOWER(JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.pensioner'))) NOT LIKE '%pvao%'
            AND LOWER(JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.pensioner'))) NOT LIKE '%afpslai%'
          AND LOWER(JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.pensioner'))) NOT LIKE '%dswd socpen%'
        )
      )
    `;
    } else {
      where += `
      AND (
        LOWER(JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.pensioner'))) LIKE ?
        OR JSON_CONTAINS(
          JSON_EXTRACT(sc.form_data, '$.pensioner'),
          JSON_QUOTE(?)
        )
      )
    `;
      const pensionLike = `%${pensioner.toLowerCase()}%`;
      params.push(pensionLike, pensioner);
    }
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

  // Report filter
  if (reports === "Booklet") {
    where += ` AND JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.booklet')) = 'Yes'`;
  }

  if (reports === "UTP") {
    where += ` AND JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.utp')) = 'Yes'`;
  }

  if (reports === "Transferee") {
    where += ` AND JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.transfer')) = 'Yes'`;
  }

  if (reports === "PDL") {
    where += ` AND JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.pdl')) = 'Yes'`;
  }

  if (reports === "PWD") {
    where += ` AND JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.isPwd')) = 'Yes'`;
  }

  if (reports === "IP's") {
    where += ` 
    AND (
      JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.ipMembership')) IS NOT NULL
      AND JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.ipMembership')) != ''
      AND JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.ipMembership')) != 'None'
    )
  `;
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

    const [citizen] = await Connection(
      `SELECT * 
       FROM senior_citizens 
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows > 0 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "RESTORE",
        `Restored Senior Citizen: '${citizen.lastName}, ${citizen.firstName} ${citizen.middleName}'`,
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
      `SELECT firstName, lastName, middleName, document_image, photo FROM senior_citizens WHERE id = ?`,
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
          `Permanently deleted Senior Citizen: '${existing.lastName}, ${existing.firstName} ${existing.middleName}'`,
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
       WHERE deleted = 0 AND age >= 60 AND registered = 0 AND archived = 0`
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
    CONCAT_WS(' ', CONCAT(sc.lastName, ','), sc.firstName, sc.middleName, sc.suffix) AS name,
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
exports.archiveSeniorCitizen = async (id, reason, deceasedDate, user, ip) => {
  try {
    const result = await Connection(
      `UPDATE senior_citizens 
       SET archived = 1, 
           archive_reason = ?, 
           deceased_date = ?, 
           archive_date = NOW(), 
           updated_at = NOW() 
       WHERE id = ?`,
      [reason, deceasedDate || null, id]
    );

    const [citizen] = await Connection(
      `SELECT * 
       FROM senior_citizens 
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows > 0) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "ARCHIVE",
        `Archived senior citizen: '${citizen.firstName}, ${citizen.firstName} ${
          citizen.middleName
        }'. Reason: ${reason}${
          deceasedDate ? `, Date of Death: ${deceasedDate}` : ""
        }`,
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
       SET archived = 0, deceased_date = NULL, updated_at = NOW() 
       WHERE id = ? AND deleted = 0`,
      [id]
    );

    const [citizen] = await Connection(
      `SELECT * 
       FROM senior_citizens 
       WHERE id = ?`,
      [id]
    );

    if (result.affectedRows > 0) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "RESTORE",
        `Restored Archived Senior Citizen: '${citizen.lastName}, ${citizen.firstName} ${citizen.middleName}'`,
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
exports.getArchivedSeniorCitizens = async (options) => {
  const {
    page = 1,
    limit = 10,
    search,
    barangay,
    gender,
    reason,
    sortBy,
    sortOrder,
  } = options;

  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
  const offset = (safePage - 1) * safeLimit;

  const params = [];
  let where = "WHERE sc.archived = 1 AND sc.deleted = 0";

  // 🔍 Search
  if (search) {
    where += ` AND (
      sc.firstName LIKE ? OR sc.lastName LIKE ? OR sc.middleName LIKE ? OR sc.suffix LIKE ?
      OR b.barangay_name LIKE ?
      OR JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.idNumber')) LIKE ?
    )`;
    const s = `%${search}%`;
    params.push(s, s, s, s, s, s);
  }

  // 🏘 Barangay filter
  if (barangay && barangay !== "All Barangays") {
    where += ` AND b.barangay_name = ?`;
    params.push(barangay);
  }

  // 🚻 Gender filter
  if (gender && gender !== "All") {
    where += ` AND sc.gender = ?`;
    params.push(gender);
  }

  // 🗂 Archive Reason filter
  if (reason && reason !== "All") {
    if (reason === "Other") {
      // Anything not in the predefined categories
      where += ` AND sc.archive_reason NOT IN ('Deceased', 'Transferred', 'Delete')`;
    } else {
      where += ` AND sc.archive_reason = ?`;
      params.push(reason);
    }
  }

  const allowedSort = ["lastName", "archive_date", "deceased_date"]; // add whatever columns you allow sorting on

  // 🔽 Sorting
  // 🔽 Sorting
  let orderByClause = "";
  if (sortBy && allowedSort.includes(sortBy)) {
    const order = sortOrder === "asc" ? "ASC" : "DESC";
    orderByClause = `ORDER BY ${sortBy} ${order}`;
  } else {
    // Default fallback
    orderByClause = "ORDER BY sc.archive_date DESC";
  }

  try {
    const totalResult = await Connection(
      `SELECT COUNT(*) AS total
       FROM senior_citizens sc
       LEFT JOIN barangays b ON sc.barangay_id = b.id
       ${where}`,
      params
    );
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / safeLimit);

    const rows = await Connection(
      `SELECT sc.id, sc.firstName, sc.lastName, sc.middleName, sc.suffix, sc.gender,
          sc.form_data,
          sc.barangay_id, b.barangay_name,
          sc.deceased_date, sc.archive_date, sc.archive_reason
   FROM senior_citizens sc
   LEFT JOIN barangays b ON sc.barangay_id = b.id
   ${where}
   ${orderByClause}
   LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    const citizens = rows.map((citizen) => ({
      ...citizen,
      form_data:
        typeof citizen.form_data === "string"
          ? JSON.parse(citizen.form_data || "{}")
          : citizen.form_data || {},
    }));

    return { citizens, total, totalPages };
  } catch (error) {
    console.error("❌ Error fetching archived senior citizens:", error);
    throw new Error("Failed to fetch archived senior citizens.");
  }
};

// services/seniorCitizenService.js
exports.getRemarksFilters = async () => {
  try {
    const [field] = await Connection(
      `SELECT options 
       FROM form_fields 
       WHERE field_name = 'remarks' 
       LIMIT 1`
    );

    const [pension] = await Connection(
      `SELECT options 
       FROM form_fields 
       WHERE field_name = 'pensioner' 
       LIMIT 1`
    );

    if (!field && !pension) return {};

    const remarksOptions = field?.options
      ? field.options
          .toString()
          .split(",")
          .map((opt) => opt.trim())
          .filter(Boolean)
      : [];

    const pensionOptions = pension?.options
      ? pension.options
          .toString()
          .split(",")
          .map((opt) => opt.trim())
          .filter(Boolean)
      : [];

    return {
      remarks: remarksOptions,
      pensioner: pensionOptions,
    };
  } catch (err) {
    console.error("❌ Failed to fetch remarks or pensioner options:", err);
    throw err;
  }
};
