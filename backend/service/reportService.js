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
        END) AS UNSIGNED) AS female_count
      FROM senior_citizens
      WHERE deleted = 0 AND registered = 1
    `;

    const result = await Connection(sql);
    return result[0]; // { male_count, female_count }
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

exports.getDeceasedReport = async (year) => {
  try {
    const sql = `
      SELECT 
        m.month_name AS month,
        COALESCE(d.count, 0) AS count
      FROM (
        SELECT 1 AS month_num, 'January' AS month_name UNION ALL
        SELECT 2, 'February' UNION ALL
        SELECT 3, 'March' UNION ALL
        SELECT 4, 'April' UNION ALL
        SELECT 5, 'May' UNION ALL
        SELECT 6, 'June' UNION ALL
        SELECT 7, 'July' UNION ALL
        SELECT 8, 'August' UNION ALL
        SELECT 9, 'September' UNION ALL
        SELECT 10, 'October' UNION ALL
        SELECT 11, 'November' UNION ALL
        SELECT 12, 'December'
      ) m
      LEFT JOIN (
        SELECT 
          MONTH(deceased_date) AS month_num,
          COUNT(*) AS count
        FROM senior_citizens
        WHERE deleted = 0
          AND registered = 1
          AND archived = 1
          AND archive_reason = 'Deceased'
          AND deceased_date IS NOT NULL
          AND YEAR(deceased_date) = ?
        GROUP BY MONTH(deceased_date)
      ) d ON m.month_num = d.month_num
      ORDER BY m.month_num;
    `;

    const result = await Connection(sql, [year]);
    return result.map((row) => ({
      month: row.month,
      count: row.count,
    }));
  } catch (err) {
    console.error("❌ Error fetching deceased report:", err);
    throw err;
  }
};

exports.getTransfereeReport = async (year) => {
  try {
    const results = await Connection(
      `
      SELECT 
        MONTH(transferee_date) AS month,
        JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender')) AS gender,
        COUNT(*) AS count
      FROM senior_citizens
      WHERE transferee_date IS NOT NULL
        AND YEAR(transferee_date) = ?
        AND deleted = 0
      GROUP BY MONTH(transferee_date), gender
      ORDER BY MONTH(transferee_date)
      `,
      [year]
    );

    // Format into { month, male, female }
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((m) => {
      const male =
        results.find((r) => r.month === m && r.gender === "Male")?.count || 0;
      const female =
        results.find((r) => r.month === m && r.gender === "Female")?.count || 0;

      return {
        month: new Date(0, m - 1).toLocaleString("en", { month: "short" }),
        male,
        female,
      };
    });
  } catch (error) {
    console.error("❌ Error in getTransfereeReport:", error);
    throw error;
  }
};
