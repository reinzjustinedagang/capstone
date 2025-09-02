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
    // The duplicate check will now receive the correct `birthdate`.
    if (await isDuplicateSeniorCitizen(data)) {
      const msg = `A senior citizen named '${data.firstName} ${data.lastName}' with birthdate '${data.birthdate}' already exists.`;
      const err = new Error(msg);
      err.code = 409;
      throw err;
    }

    const insertData = {
      firstName: data.firstName,
      lastName: data.lastName,
      // ✅ FIX: These will now have values from the router.
      middleName: data.middleName || null,
      suffix: data.suffix || null,
      // ✅ FIX: Stringify the `form_data` object before inserting it into the database.
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
  let where = "WHERE deleted = 0 AND age >= 60"; // ✅ age comes from generated column

  if (search) {
    where += ` AND (
      firstName LIKE ? OR lastName LIKE ? OR middleName LIKE ? OR suffix LIKE ?
      OR JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.barangay')) LIKE ?
    )`;
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }

  if (barangay && barangay !== "All Barangays") {
    where += ` AND JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.barangay')) = ?`;
    params.push(barangay);
  }

  if (healthStatus && healthStatus !== "All Health Status") {
    where += ` AND JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.healthStatus')) = ?`;
    params.push(healthStatus);
  }

  if (gender && gender !== "All") {
    where += ` AND gender = ?`; // ✅ using generated column
    params.push(gender);
  }

  if (ageRange && ageRange !== "All") {
    const [min, maxRaw] = ageRange.split(" - ");
    const max = maxRaw.includes("+") ? 200 : parseInt(maxRaw);
    where += ` AND age BETWEEN ? AND ?`;
    params.push(parseInt(min), max);
  }

  const allowedSort = ["lastName", "firstName", "gender", "age", "created_at"];
  const orderBy = allowedSort.includes(sortBy) ? sortBy : "lastName";
  const order = sortOrder === "desc" ? "DESC" : "ASC";

  try {
    const totalResult = await Connection(
      `SELECT COUNT(*) AS total FROM senior_citizens ${where}`,
      params
    );
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / safeLimit);

    const data = await Connection(
      `SELECT id, firstName, middleName, lastName, suffix, 
              age, gender, form_data, created_at
       FROM senior_citizens
       ${where}
       ORDER BY ${orderBy} ${order}
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    return { citizens: data, total, totalPages };
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
      `SELECT COUNT(*) AS count FROM senior_citizens WHERE deleted = 0`
    );
    return result[0].count;
  } catch (error) {
    console.error("Error fetching citizen count:", error);
    throw new Error("Failed to fetch citizen count.");
  }
};

// Get SMS recipients with optional barangay filter
exports.getSmsRecipients = async (barangay = "") => {
  try {
    let sql = `
      SELECT 
        id,
        CONCAT_WS(' ', firstName, middleName, lastName, suffix) AS name,
        COALESCE(
          JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.mobileNumber')),
          JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.emergencyContactNumber'))
        ) AS contact,
        JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.barangay')) AS barangay
      FROM senior_citizens
      WHERE (JSON_EXTRACT(form_data, '$.mobileNumber') IS NOT NULL
          OR JSON_EXTRACT(form_data, '$.emergencyContactNumber') IS NOT NULL)
        AND deleted = 0
    `;

    const params = [];
    if (barangay) {
      sql += ` AND JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.barangay')) = ?`;
      params.push(barangay);
    }

    const result = await Connection(sql, params);
    return result;
  } catch (error) {
    console.error("Error fetching SMS recipients:", error);
    throw new Error("Internal server error");
  }
};
