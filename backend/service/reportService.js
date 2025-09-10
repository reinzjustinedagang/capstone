const Connection = require("../db/Connection");

exports.getBarangayDistribution = async () => {
  try {
    const sql = `
  SELECT 
    b.id,
    b.barangay_name AS barangay,
    CAST(SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.gender')) = 'Male' THEN 1 ELSE 0 END) AS UNSIGNED) AS male_count,
    CAST(SUM(CASE WHEN JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.gender')) = 'Female' THEN 1 ELSE 0 END) AS UNSIGNED) AS female_count
  FROM barangays b
  LEFT JOIN senior_citizens sc 
    ON sc.barangay_id = b.id 
   AND sc.deleted = 0 
   AND sc.registered = 1
  GROUP BY b.id, b.barangay_name
  ORDER BY b.barangay_name ASC
`;

    return await Connection(sql);
  } catch (err) {
    console.error("❌ Error fetching barangay distribution:", err);
    throw err;
  }
};

exports.getGenderDistribution = async () => {
  try {
    const sql = `
      SELECT 
        CAST(SUM(CASE 
          WHEN JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender')) = 'Male' THEN 1 
          ELSE 0 
        END) AS UNSIGNED) AS male_count,
        CAST(SUM(CASE 
          WHEN JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender')) = 'Female' THEN 1 
          ELSE 0 
        END) AS UNSIGNED) AS female_count,
        CAST(SUM(CASE 
          WHEN JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender')) IS NULL 
            OR JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender')) = '' 
            OR JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender')) NOT IN ('Male','Female')
          THEN 1 
          ELSE 0 
        END) AS UNSIGNED) AS unknown_count,
        COUNT(*) AS total_seniors
      FROM senior_citizens
      WHERE deleted = 0 AND registered = 1
    `;

    const result = await Connection(sql);
    return result[0]; // { male_count, female_count, unknown_count, total_seniors }
  } catch (err) {
    console.error("❌ Error fetching gender distribution:", err);
    throw err;
  }
};

exports.getAgeDistribution = async () => {
  try {
    const sql = `
  SELECT 
    CAST(SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) BETWEEN 60 AND 65 THEN 1 ELSE 0 END) AS UNSIGNED) AS "60_65",
    CAST(SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) BETWEEN 66 AND 70 THEN 1 ELSE 0 END) AS UNSIGNED) AS "66_70",
    CAST(SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) BETWEEN 71 AND 75 THEN 1 ELSE 0 END) AS UNSIGNED) AS "71_75",
    CAST(SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) BETWEEN 76 AND 80 THEN 1 ELSE 0 END) AS UNSIGNED) AS "76_80",
    CAST(SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) BETWEEN 81 AND 85 THEN 1 ELSE 0 END) AS UNSIGNED) AS "81_85",
    CAST(SUM(CASE WHEN CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) >= 86 THEN 1 ELSE 0 END) AS UNSIGNED) AS "86_plus"
  FROM senior_citizens
  WHERE deleted = 0 AND registered = 1
`;

    const result = await Connection(sql);
    return result[0];
  } catch (err) {
    console.error("❌ Error fetching age distribution:", err);
    throw err;
  }
};
