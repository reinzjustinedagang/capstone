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

exports.getGenderDistribution = async () => {
  try {
    const sql = `
      SELECT 
        SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender')) = 'Male' THEN 1 ELSE 0 END) AS male_count,
        SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender')) = 'Female' THEN 1 ELSE 0 END) AS female_count,
        SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender')) IS NULL 
                  OR JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender')) = '' 
                 THEN 1 ELSE 0 END) AS unknown_count
      FROM senior_citizens
      WHERE deleted = 0
    `;

    const result = await Connection(sql);
    return result[0]; // { male_count, female_count, unknown_count }
  } catch (err) {
    console.error("❌ Error fetching gender distribution:", err);
    throw err;
  }
};

// Age distribution (ranges) - pulling from form_data JSON
exports.getAgeDistribution = async () => {
  try {
    const sql = `
      SELECT 
        SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) BETWEEN 60 AND 65 THEN 1 ELSE 0 END) AS "60_65",
        SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) BETWEEN 66 AND 70 THEN 1 ELSE 0 END) AS "66_70",
        SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) BETWEEN 71 AND 75 THEN 1 ELSE 0 END) AS "71_75",
        SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) BETWEEN 76 AND 80 THEN 1 ELSE 0 END) AS "76_80",
        SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) BETWEEN 81 AND 85 THEN 1 ELSE 0 END) AS "81_85",
        SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) >= 86 THEN 1 ELSE 0 END) AS "86_plus"
      FROM senior_citizens
      WHERE deleted = 0
    `;

    const result = await Connection(sql);
    return result[0];
  } catch (err) {
    console.error("❌ Error fetching age distribution:", err);
    throw err;
  }
};
