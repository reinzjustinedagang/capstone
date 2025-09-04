const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");

// Fetch by ID
exports.getSeniorCitizenById = async (id) => {
  try {
    const result = await Connection(
      `SELECT id, firstName, middleName, lastName, suffix, form_data,
              age, gender, created_at, updated_at, deleted, deleted_at
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

// Check duplicate (firstName, lastName, birthdate inside JSON)
const isDuplicateSeniorCitizen = async ({ firstName, lastName, birthdate }) => {
  const result = await Connection(
    `SELECT id 
     FROM senior_citizens 
     WHERE firstName = ? 
       AND lastName = ? 
       AND JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.birthdate')) = ?
       AND deleted = 0`,
    [firstName, lastName, birthdate]
  );
  return result.length > 0;
};

// Create
// In your senior citizen service file

exports.createSeniorCitizen = async (data, user, ip) => {
  try {
    // Check for duplicates
    if (await isDuplicateSeniorCitizen(data)) {
      const msg = `A senior citizen named '${data.firstName} ${data.lastName}' with birthdate '${data.birthdate}' already exists.`;
      const err = new Error(msg);
      err.code = 409;
      throw err;
    }

    const insertData = {
      firstName: data.firstName,
      lastName: data.lastName,
      middleName: data.middleName || null,
      suffix: data.suffix || null,
      barangay_id: data.barangay_id || null, // save the ID
      form_data: JSON.stringify(data.form_data || {}),
    };

    const result = await Connection(
      `INSERT INTO senior_citizens SET ?`,
      insertData
    );

    if (result.affectedRows === 1 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "CREATE",
        `New Senior Citizen: '${data.firstName} ${data.lastName}'.`,
        ip
      );
    }

    return result.insertId;
  } catch (error) {
    if (error.code === 409) throw error;
    console.error("Error creating senior citizen:", error);
    throw new Error("Failed to create senior citizen.");
  }
};

// Update
exports.updateSeniorCitizen = async (id, updatedData, user, ip) => {
  try {
    const updateData = {
      firstName: updatedData.firstName,
      lastName: updatedData.lastName,
      form_data: JSON.stringify(updatedData.form_data || {}),
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
  let where = "WHERE sc.deleted = 0 AND sc.age >= 60"; // Only active seniors

  // Search by name or barangay
  if (search) {
    where += ` AND (
      sc.firstName LIKE ? OR sc.lastName LIKE ? OR sc.middleName LIKE ? OR sc.suffix LIKE ?
      OR b.barangay_name LIKE ?
    )`;
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }

  // Barangay filter
  if (barangay && barangay !== "All Barangays") {
    where += ` AND b.barangay_name = ?`;
    params.push(barangay);
  }

  // Health status filter
  if (healthStatus && healthStatus !== "All Health Status") {
    where += ` AND JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.healthStatus')) = ?`;
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
    const result = await Connection(
      `UPDATE senior_citizens 
       SET deleted = 1, deleted_at = NOW() 
       WHERE id = ? AND deleted = 0`,
      [id]
    );

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
    console.error(`Error soft deleting senior citizen with ID ${id}:`, error);
    throw new Error("Failed to soft delete senior citizen.");
  }
};

// Get all soft-deleted citizens
exports.getDeletedSeniorCitizens = async () => {
  try {
    return await Connection(
      `SELECT id, firstName, middleName, lastName, suffix, age, gender, form_data, deleted_at
       FROM senior_citizens
       WHERE deleted = 1
       ORDER BY deleted_at DESC`
    );
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
    const result = await Connection(
      `DELETE FROM senior_citizens WHERE id = ?`,
      [id]
    );

    if (result.affectedRows > 0 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "PERMANENT_DELETE",
        `Permanently deleted Senior Citizen ID: ${id}`,
        ip
      );
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

// Count active citizens
exports.getCitizenCount = async () => {
  try {
    const result = await Connection(
      `SELECT COUNT(*) AS count 
       FROM senior_citizens 
       WHERE deleted = 0 AND age >= 60`
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
        sc.barangay_id
      FROM senior_citizens sc
      WHERE (JSON_EXTRACT(sc.form_data, '$.mobileNumber') IS NOT NULL
          OR JSON_EXTRACT(sc.form_data, '$.emergencyContactNumber') IS NOT NULL)
        AND sc.deleted = 0
    `;

    const params = [];

    // Filter by barangay_id
    if (barangay_id && barangay_id.trim() !== "") {
      sql += ` AND sc.barangay_id = ?`;
      params.push(barangay_id);
    }
    // Filter by barangay name
    else if (barangay && barangay.trim() !== "") {
      sql += ` AND JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.barangay')) = ?`;
      params.push(barangay);
    }

    // Search by name or contact
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
