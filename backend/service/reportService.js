const Connection = require("../db/Connection");

exports.getBarangayDistribution = async () => {
  try {
    const sql = `
      SELECT 
        b.id,
        b.barangay_name AS barangay,
        SUM(CASE WHEN sc.gender = 'Male' THEN 1 ELSE 0 END) AS male_count,
        SUM(CASE WHEN sc.gender = 'Female' THEN 1 ELSE 0 END) AS female_count
      FROM barangays b
      LEFT JOIN senior_citizens sc ON sc.barangay_id = b.id
      GROUP BY b.id, b.barangay_name
      ORDER BY b.barangay_name ASC
    `;

    return await Connection(sql);
  } catch (err) {
    console.error("Error fetching barangay distribution:", err);
    throw err;
  }
};
