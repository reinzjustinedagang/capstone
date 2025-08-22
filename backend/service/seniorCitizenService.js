const Connection = require("../db/Connection");
const { logAudit } = require("./auditService");

// Fetch senior citizen by ID
exports.getSeniorCitizenById = async (id) => {
  try {
    const result = await Connection(
      `SELECT * FROM senior_citizens WHERE id = ?`,
      [id]
    );
    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error(`Error fetching senior citizen with ID ${id}:`, error);
    throw new Error(`Failed to retrieve senior citizen with ID ${id}.`);
  }
};

// Check for duplicate senior citizen
const isDuplicateSeniorCitizen = async ({ firstName, lastName, birthdate }) => {
  const result = await Connection(
    `SELECT id FROM senior_citizens WHERE firstName = ? AND lastName = ? AND birthdate = ?`,
    [firstName, lastName, birthdate]
  );
  return result.length > 0;
};

// Create a new senior citizen, with duplication check
exports.createSeniorCitizen = async (seniorCitizenData, user, ip) => {
  try {
    if (await isDuplicateSeniorCitizen(seniorCitizenData)) {
      const msg = `A senior citizen named '${seniorCitizenData.firstName} ${seniorCitizenData.lastName}' with birthdate '${seniorCitizenData.birthdate}' already exists.`;
      const err = new Error(msg);
      err.code = 409; // For express error handling
      throw err;
    }
    const query = `INSERT INTO senior_citizens SET ?`;
    const result = await Connection(query, seniorCitizenData);

    if (result.affectedRows === 1 && user) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "CREATE",
        `New Senior Citizen: '${seniorCitizenData.firstName} ${seniorCitizenData.lastName}'.`,
        ip
      );
    }
    return result.insertId;
  } catch (error) {
    if (error.code === 409) throw error; // Duplicate
    console.error("Error creating senior citizen:", error);
    throw new Error("Failed to create senior citizen.");
  }
};

// Update an existing senior citizen
exports.updateSeniorCitizen = async (id, updatedData, user, ip) => {
  try {
    const query = `UPDATE senior_citizens SET ? WHERE id = ?`;
    const result = await Connection(query, [updatedData, id]);

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

// Delete a senior citizen
exports.deleteSeniorCitizen = async (id, user, ip) => {
  try {
    const citizen = await Connection(
      `SELECT firstName, lastName FROM senior_citizens WHERE id = ?`,
      [id]
    );

    const query = `DELETE FROM senior_citizens WHERE id = ?`;
    const result = await Connection(query, [id]);

    if (result.affectedRows === 1 && user && citizen.length > 0) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "DELETE",
        `Senior Citizen Deleted: '${citizen[0].firstName} ${citizen[0].lastName}'.`,
        ip
      );
    }
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error deleting senior citizen with ID ${id}:`, error);
    throw new Error(`Failed to delete senior citizen with ID ${id}.`);
  }
};

// Paginated retrieval, age 60+
// seniorCitizenService.js

exports.getPaginatedFilteredCitizens = async (options) => {
  const {
    page = 1,
    limit = 10,
    search,
    barangay, // This will be 'All Barangays' initially
    gender,
    ageRange,
    healthStatus, // This will be 'All Health Status' initially
    sortBy,
    sortOrder,
  } = options;

  const safePage = Number.isInteger(page) && page > 0 ? page : 1;
  const safeLimit = Number.isInteger(limit) && limit > 0 ? limit : 10;
  const offset = (safePage - 1) * safeLimit;

  const params = [];
  let where =
    "WHERE deleted = 0 AND TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) >= 60";

  // Existing search filter
  if (search) {
    where += ` AND (
    firstName LIKE ? OR lastName LIKE ? OR middleName LIKE ? OR suffix LIKE ? OR barangay LIKE ?
  )`;
    const s = `%${search}%`;
    params.push(s, s, s, s, s);
  }

  // --- CRITICAL CHANGE HERE ---
  // Only add the barangay filter if it's not "All Barangays"
  if (barangay && barangay !== "All Barangays") {
    // <-- Changed from "All" to "All Barangays"
    where += ` AND barangay = ?`;
    params.push(barangay);
  } else {
    // If it's "All Barangays", remove it from the params array if it was pushed by mistake
    // (Though with the new check, it shouldn't be pushed in the first place)
  }

  // Only add the healthStatus filter if it's not "All Health Status"
  if (healthStatus && healthStatus !== "All Health Status") {
    // <-- Changed from "All" to "All Health Status"
    where += ` AND healthStatus = ?`;
    params.push(healthStatus);
  } else {
    // Same as above
  }
  // --- END CRITICAL CHANGE ---

  if (gender && gender !== "All") {
    where += ` AND gender = ?`;
    params.push(gender);
  }

  if (ageRange && ageRange !== "All") {
    const [min, maxRaw] = ageRange.split(" - ");
    const max = maxRaw.includes("+") ? 200 : parseInt(maxRaw);
    where += ` AND TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) BETWEEN ? AND ?`;
    params.push(parseInt(min), max);
  }

  const allowedSort = [
    "lastName",
    "firstName",
    "barangay",
    "gender",
    "birthdate",
  ];
  const orderBy = allowedSort.includes(sortBy) ? sortBy : "lastName";
  const order = sortOrder === "desc" ? "DESC" : "ASC";

  try {
    // Log the constructed query for total count (for verification)
    const totalQuery = `SELECT COUNT(*) AS total FROM senior_citizens ${where}`;

    const totalResult = await Connection(totalQuery, params);
    const total = totalResult[0].total;
    const totalPages = Math.ceil(total / safeLimit);

    // Get paginated data
    const data = await Connection(
      `SELECT id, firstName, middleName, lastName, suffix, birthdate,
               TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) AS age, healthStatus,
               gender, mobileNumber, houseNumberStreet, barangay, municipality, province, created_at
       FROM senior_citizens
       ${where}
       ORDER BY ${orderBy} ${order}
       LIMIT ? OFFSET ?`,
      [...params, safeLimit, offset]
    );

    return {
      citizens: data,
      total,
      totalPages,
    };
  } catch (error) {
    console.error("Error fetching paginated senior citizens:", error);
    throw new Error("Failed to fetch paginated senior citizens.");
  }
};

exports.getSmsRecipients = async (req, res) => {
  try {
    const result = await Connection(`
      SELECT 
        id,
        CONCAT_WS(' ', firstName, middleName, lastName, suffix) AS name,
        COALESCE(mobileNumber, emergencyContactNumber) AS contact,
        barangay
      FROM senior_citizens
      WHERE mobileNumber IS NOT NULL OR emergencyContactNumber IS NOT NULL
    `);
    res.json(result);
  } catch (error) {
    console.error("Error fetching SMS recipients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCitizenCount = async () => {
  const [result] = await Connection(
    "SELECT COUNT(*) AS count FROM senior_citizens"
  );
  return result.count;
};

// Soft delete a senior citizen (moves to recycle bin)
exports.softDeleteSeniorCitizen = async (id, user, ip) => {
  try {
    const citizen = await Connection(
      `SELECT firstName, lastName FROM senior_citizens WHERE id = ?`,
      [id]
    );

    if (citizen.length === 0) {
      console.warn(`No senior citizen found with ID ${id}`);
      return false;
    }

    const query = `
      UPDATE senior_citizens 
      SET deleted = 1, deleted_at = NOW() 
      WHERE id = ?
    `;
    const result = await Connection(query, [id]);

    if (result.affectedRows === 1 && user) {
      try {
        await logAudit(
          user.id,
          user.email,
          user.role,
          "DELETE",
          `Deleted senior citizen: '${citizen[0].firstName} ${citizen[0].lastName}'.`,
          ip
        );
      } catch (auditError) {
        console.error("Audit log failed:", auditError);
      }
    }

    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error soft deleting senior citizen with ID ${id}:`, error);
    throw new Error(`Failed to soft delete senior citizen with ID ${id}.`);
  }
};

// Get all soft deleted senior citizens
exports.getDeletedSeniorCitizens = async () => {
  try {
    const result = await Connection(`
      SELECT id, firstName, middleName, lastName, suffix, birthdate,
             TIMESTAMPDIFF(YEAR, birthdate, CURDATE()) AS age,
             barangay,deleted_at, created_at
      FROM senior_citizens
      WHERE deleted = 1
      ORDER BY created_at DESC
    `);
    return result;
  } catch (error) {
    console.error("Error fetching deleted senior citizens:", error);
    throw new Error("Failed to retrieve deleted senior citizens.");
  }
};

// Restore a soft-deleted senior citizen
exports.restoreSeniorCitizen = async (id, user, ip) => {
  console.log(id);
  try {
    const citizen = await Connection(
      `SELECT firstName, lastName FROM senior_citizens WHERE id = ?`,
      [id]
    );

    const query = `UPDATE senior_citizens SET deleted = 0, deleted_at = NULL WHERE id = ?`;
    const result = await Connection(query, [id]);

    if (result.affectedRows === 1 && user && citizen.length > 0) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "RESTORE",
        `Restored senior citizen: '${citizen[0].firstName} ${citizen[0].lastName}'.`,
        ip
      );
    }
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error restoring senior citizen with ID ${id}:`, error);
    throw new Error(`Failed to restore senior citizen with ID ${id}.`);
  }
};

// Permanently delete a senior citizen
exports.permanentlyDeleteSeniorCitizen = async (id, user, ip) => {
  try {
    const citizen = await Connection(
      `SELECT firstName, lastName FROM senior_citizens WHERE id = ?`,
      [id]
    );

    const query = `DELETE FROM senior_citizens WHERE id = ? AND deleted = 1`;
    const result = await Connection(query, [id]);

    if (result.affectedRows === 1 && user && citizen.length > 0) {
      await logAudit(
        user.id,
        user.email,
        user.role,
        "PERMANENT_DELETE",
        `Permanently deleted senior citizen: '${citizen[0].firstName} ${citizen[0].lastName}'.`,
        ip
      );
    }
    return result.affectedRows > 0;
  } catch (error) {
    console.error(
      `Error permanently deleting senior citizen with ID ${id}:`,
      error
    );
    throw new Error(
      `Failed to permanently delete senior citizen with ID ${id}.`
    );
  }
};

// Permanently delete records soft-deleted more than 30 days ago
exports.cleanupOldSoftDeletedCitizens = async () => {
  try {
    const result = await Connection(`
      DELETE FROM senior_citizens
      WHERE deleted = 1 AND deleted_at IS NOT NULL AND deleted_at < NOW() - INTERVAL 30 DAY
    `);

    console.log(
      `Cleanup complete. ${result.affectedRows} soft-deleted senior citizen(s) permanently removed.`
    );
    return result.affectedRows;
  } catch (error) {
    console.error("Error during cleanup of old soft-deleted records:", error);
    throw new Error("Cleanup failed.");
  }
};
