const Connection = require("../db/Connection");

exports.getBarangayDistribution = async (gender = null) => {
  try {
    let sql = `
      SELECT 
        b.id,
        b.barangay_name AS barangay,
        COUNT(sc.id) AS total
      FROM barangays b
      LEFT JOIN senior_citizens sc ON sc.barangay_id = b.id
    `;

    const params = [];

    if (gender) {
      sql += ` AND sc.gender = ? `;
      params.push(gender);
    }

    sql += `
      GROUP BY b.id, b.barangay_name
      ORDER BY b.barangay_name ASC
    `;

    return await Connection(sql, params);
  } catch (err) {
    console.error("Error fetching barangay distribution:", err);
    throw err;
  }
};
