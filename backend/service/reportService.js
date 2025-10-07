const Connection = require("../db/Connection");

// 📊 Barangay Distribution
exports.getBarangayDistribution = async () => {
  try {
    const sql = `
      SELECT 
        b.id,
        b.barangay_name AS barangay,
        CAST(SUM(CASE 
          WHEN LOWER(TRIM(sc.gender)) = 'male' THEN 1 
          ELSE 0 
        END) AS UNSIGNED) AS male_count,
        CAST(SUM(CASE 
          WHEN LOWER(TRIM(sc.gender)) = 'female' THEN 1 
          ELSE 0 
        END) AS UNSIGNED) AS female_count
      FROM barangays b
      LEFT JOIN senior_citizens sc 
        ON sc.barangay_id = b.id 
       AND sc.deleted = 0 
       AND sc.registered = 1 
       AND sc.archived = 0
       AND CAST(JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.age')) AS UNSIGNED) >= 60
      GROUP BY b.id, b.barangay_name
      ORDER BY b.barangay_name ASC
    `;
    return await Connection(sql);
  } catch (err) {
    console.error("❌ Error fetching barangay distribution:", err);
    throw err;
  }
};

// 📊 Gender Distribution
exports.getGenderDistribution = async () => {
  try {
    const sql = `
      SELECT 
        CAST(SUM(CASE 
          WHEN LOWER(TRIM(gender)) = 'male' THEN 1 
          ELSE 0 
        END) AS UNSIGNED) AS male_count,
        CAST(SUM(CASE 
          WHEN LOWER(TRIM(gender)) = 'female' THEN 1 
          ELSE 0 
        END) AS UNSIGNED) AS female_count
      FROM senior_citizens
      WHERE deleted = 0 
        AND registered = 1 
        AND archived = 0
        AND CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) >= 60
    `;
    const result = await Connection(sql);
    return result[0];
  } catch (err) {
    console.error("❌ Error fetching gender distribution:", err);
    throw err;
  }
};

exports.getAgeDistribution = async () => {
  try {
    const sql = `
      SELECT 
        CAST(SUM(CASE WHEN age BETWEEN 60 AND 65 THEN 1 ELSE 0 END) AS UNSIGNED) AS "60_65",
        CAST(SUM(CASE WHEN age BETWEEN 66 AND 70 THEN 1 ELSE 0 END) AS UNSIGNED) AS "66_70",
        CAST(SUM(CASE WHEN age BETWEEN 71 AND 75 THEN 1 ELSE 0 END) AS UNSIGNED) AS "71_75",
        CAST(SUM(CASE WHEN age BETWEEN 76 AND 80 THEN 1 ELSE 0 END) AS UNSIGNED) AS "76_80",
        CAST(SUM(CASE WHEN age BETWEEN 81 AND 85 THEN 1 ELSE 0 END) AS UNSIGNED) AS "81_85",
        CAST(SUM(CASE WHEN age BETWEEN 86 AND 90 THEN 1 ELSE 0 END) AS UNSIGNED) AS "86_90",
        CAST(SUM(CASE WHEN age BETWEEN 91 AND 95 THEN 1 ELSE 0 END) AS UNSIGNED) AS "91_95",
        CAST(SUM(CASE WHEN age BETWEEN 96 AND 100 THEN 1 ELSE 0 END) AS UNSIGNED) AS "96_100",
        CAST(SUM(CASE WHEN age > 100 THEN 1 ELSE 0 END) AS UNSIGNED) AS "100_plus"
      FROM (
        SELECT CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) AS age
        FROM senior_citizens
        WHERE deleted = 0 AND registered = 1 AND archived = 0
      ) AS ages;
    `;

    const result = await Connection(sql);
    return result[0];
  } catch (err) {
    console.error("❌ Error fetching age distribution:", err);
    throw err;
  }
};

// 📊 Deceased
exports.getDeceasedReport = async (year) => {
  try {
    const results = await Connection(
      `
      SELECT 
        MONTH(deceased_date) AS month,
        ANY_VALUE(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender'))) AS gender,
        COUNT(*) AS count
      FROM senior_citizens
      WHERE deleted = 0
        AND registered = 1
        AND archived = 1
        AND archive_reason = 'Deceased'
        AND deceased_date IS NOT NULL
        AND YEAR(deceased_date) = ?
        AND CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) >= 60
      GROUP BY MONTH(deceased_date), gender
      ORDER BY MONTH(deceased_date)
      `,
      [year]
    );
    // format results
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((m) => ({
      month: new Date(0, m - 1).toLocaleString("en", { month: "short" }),
      male:
        results.find((r) => r.month === m && r.gender === "Male")?.count || 0,
      female:
        results.find((r) => r.month === m && r.gender === "Female")?.count || 0,
    }));
  } catch (err) {
    console.error("❌ Error fetching deceased report:", err);
    throw err;
  }
};

// 📊 Transferee
exports.getTransfereeReport = async (year) => {
  try {
    const results = await Connection(
      `
      SELECT 
        MONTH(transferee_date) AS month,
        ANY_VALUE(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender'))) AS gender,
        COUNT(*) AS count
      FROM senior_citizens
      WHERE transferee_date IS NOT NULL
        AND YEAR(transferee_date) = ?
        AND registered = 1
        AND deleted = 0
        AND archived = 0
        AND CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) >= 60
      GROUP BY MONTH(transferee_date), gender
      ORDER BY MONTH(transferee_date)
      `,
      [year]
    );
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((m) => ({
      month: new Date(0, m - 1).toLocaleString("en", { month: "short" }),
      male:
        results.find((r) => r.month === m && r.gender === "Male")?.count || 0,
      female:
        results.find((r) => r.month === m && r.gender === "Female")?.count || 0,
    }));
  } catch (err) {
    console.error("❌ Error in getTransfereeReport:", err);
    throw err;
  }
};

// 📊 SocPen
exports.getSocPenReport = async (year) => {
  try {
    const results = await Connection(
      `
      SELECT 
        MONTH(socpen_date) AS month,
        ANY_VALUE(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender'))) AS gender,
        COUNT(*) AS count
      FROM senior_citizens
      WHERE socpen_date IS NOT NULL
        AND YEAR(socpen_date) = ?
        AND registered = 1
        AND deleted = 0
        AND archived = 0
        AND CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) >= 60
      GROUP BY MONTH(socpen_date), gender
      ORDER BY MONTH(socpen_date)
      `,
      [year]
    );
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((m) => ({
      month: new Date(0, m - 1).toLocaleString("en", { month: "short" }),
      male:
        results.find((r) => r.month === m && r.gender === "Male")?.count || 0,
      female:
        results.find((r) => r.month === m && r.gender === "Female")?.count || 0,
    }));
  } catch (err) {
    console.error("❌ Error fetching SocPen report:", err);
    throw err;
  }
};

// 📊 Non-SocPen
exports.getNonSocPenReport = async (year) => {
  try {
    const results = await Connection(
      `
      SELECT 
        MONTH(nonsocpen_date) AS month,
        ANY_VALUE(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender'))) AS gender,
        COUNT(*) AS count
      FROM senior_citizens
      WHERE socpen_date IS NULL
        AND YEAR(nonsocpen_date) = ?
        AND registered = 1
        AND deleted = 0
        AND archived = 0
        AND CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) >= 60
      GROUP BY MONTH(nonsocpen_date), gender
      ORDER BY MONTH(nonsocpen_date)
      `,
      [year]
    );
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((m) => ({
      month: new Date(0, m - 1).toLocaleString("en", { month: "short" }),
      male:
        results.find((r) => r.month === m && r.gender === "Male")?.count || 0,
      female:
        results.find((r) => r.month === m && r.gender === "Female")?.count || 0,
    }));
  } catch (err) {
    console.error("❌ Error fetching Non-SocPen report:", err);
    throw err;
  }
};

// 📊 PDL
exports.getPDLReport = async (year) => {
  try {
    const results = await Connection(
      `
      SELECT 
        MONTH(pdl_date) AS month,
        ANY_VALUE(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender'))) AS gender,
        COUNT(*) AS count
      FROM senior_citizens
      WHERE pdl_date IS NOT NULL
        AND YEAR(pdl_date) = ?
        AND registered = 1
        AND deleted = 0
        AND archived = 0
        AND CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) >= 60
      GROUP BY MONTH(pdl_date), gender
      ORDER BY MONTH(pdl_date)
      `,
      [year]
    );
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((m) => ({
      month: new Date(0, m - 1).toLocaleString("en", { month: "short" }),
      male:
        results.find((r) => r.month === m && r.gender === "Male")?.count || 0,
      female:
        results.find((r) => r.month === m && r.gender === "Female")?.count || 0,
    }));
  } catch (err) {
    console.error("❌ Error fetching pdl report:", err);
    throw err;
  }
};

// 📊 New Seniors
exports.getNewSeniorReport = async (year) => {
  try {
    const results = await Connection(
      `
      SELECT 
        MONTH(created_at) AS month,
        ANY_VALUE(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender'))) AS gender,
        COUNT(*) AS count
      FROM senior_citizens
      WHERE registered = 1
        AND YEAR(created_at) = ?
        AND deleted = 0
        AND archived = 0
        AND CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) >= 60
      GROUP BY MONTH(created_at), gender
      ORDER BY MONTH(created_at)
      `,
      [year]
    );
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((m) => ({
      month: new Date(0, m - 1).toLocaleString("en", { month: "short" }),
      male:
        results.find((r) => r.month === m && r.gender === "Male")?.count || 0,
      female:
        results.find((r) => r.month === m && r.gender === "Female")?.count || 0,
    }));
  } catch (err) {
    console.error("❌ Error fetching new senior report:", err);
    throw err;
  }
};

// 📊 Booklet
exports.getBookletReport = async (year) => {
  try {
    const results = await Connection(
      `
      SELECT 
        MONTH(booklet_date) AS month,
        ANY_VALUE(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender'))) AS gender,
        COUNT(*) AS count
      FROM senior_citizens
      WHERE registered = 1
        AND YEAR(booklet_date) = ?
        AND deleted = 0
        AND archived = 0
        AND CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) >= 60
      GROUP BY MONTH(booklet_date), gender
      ORDER BY MONTH(booklet_date)
      `,
      [year]
    );
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((m) => ({
      month: new Date(0, m - 1).toLocaleString("en", { month: "short" }),
      male:
        results.find((r) => r.month === m && r.gender === "Male")?.count || 0,
      female:
        results.find((r) => r.month === m && r.gender === "Female")?.count || 0,
    }));
  } catch (err) {
    console.error("❌ Error fetching booklet report:", err);
    throw err;
  }
};

// 📊 Booklet
exports.getUTPReport = async (year) => {
  try {
    const results = await Connection(
      `
      SELECT 
        MONTH(utp_date) AS month,
        ANY_VALUE(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender'))) AS gender,
        COUNT(*) AS count
      FROM senior_citizens
      WHERE registered = 1
        AND YEAR(utp_date) = ?
        AND deleted = 0
        AND archived = 0
        AND CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) >= 60
      GROUP BY MONTH(utp_date), gender
      ORDER BY MONTH(utp_date)
      `,
      [year]
    );
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return months.map((m) => ({
      month: new Date(0, m - 1).toLocaleString("en", { month: "short" }),
      male:
        results.find((r) => r.month === m && r.gender === "Male")?.count || 0,
      female:
        results.find((r) => r.month === m && r.gender === "Female")?.count || 0,
    }));
  } catch (err) {
    console.error("❌ Error fetching utp report:", err);
    throw err;
  }
};

exports.getPensionerReport = async () => {
  try {
    const rows = await Connection(`
      SELECT
        sc.id,
        JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.pensioner')) AS pensioner
      FROM senior_citizens sc
      WHERE sc.registered = 1
        AND sc.deleted = 0
        AND sc.archived = 0
        AND CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) >= 60
    `);

    // Initialize counters
    const report = {
      DSWDSOCPEN: 0,
      GSIS: 0,
      SSS: 0,
      PVAO: 0,
      AFPSLAI: 0,
      OTHERS: 0,
    };

    rows.forEach((row) => {
      if (!row.pensioner) return;

      let pensions = [];

      try {
        // Case 1: pensioner stored as JSON array, e.g. ["SSS","GSIS"]
        if (row.pensioner.trim().startsWith("[")) {
          pensions = JSON.parse(row.pensioner);
        }
        // Case 2: pensioner stored as comma-separated string, e.g. "SSS,PVAO"
        else {
          pensions = row.pensioner.split(",").map((p) => p.trim());
        }
      } catch {
        pensions = [row.pensioner.trim()];
      }

      // Count each pension type
      pensions.forEach((p) => {
        const normalized = p.replace(/\s+/g, "").toUpperCase(); // e.g. "DSWD SOCPEN" -> "DSWDSOCPEN"
        if (report.hasOwnProperty(normalized)) {
          report[normalized]++;
        } else {
          report.OTHERS++;
        }
      });
    });

    return report;
  } catch (err) {
    console.error("❌ Error fetching pensioner report:", err);
    throw err;
  }
};

exports.getRemarksReport = async () => {
  try {
    // 1. Fetch valid options from your form_fields definition
    const [field] = await Connection(`
      SELECT options 
      FROM form_fields 
      WHERE field_name = 'remarks'
      LIMIT 1
    `);

    if (!field) throw new Error("Remarks field not found in form_fields");

    // Split and normalize options into a list of valid values
    const validOptions = field.options
      .split(",")
      .map((opt) => opt.trim().toUpperCase());

    // 2. Fetch senior citizen remarks
    const rows = await Connection(`
      SELECT 
        JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.remarks')) AS remarks
      FROM senior_citizens
      WHERE registered = 1
        AND deleted = 0
        AND archived = 0
        AND CAST(JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.age')) AS UNSIGNED) >= 60
    `);

    // 3. Initialize report with all valid options set to 0
    const report = {};
    validOptions.forEach((opt) => (report[opt] = 0));

    // 4. Count only valid remarks
    rows.forEach(({ remarks }) => {
      if (!remarks) return;

      let key = remarks.trim().toUpperCase();
      key = key.replace(/[\[\]"]/g, ""); // cleanup ["X"]

      if (validOptions.includes(key)) {
        report[key] += 1;
      }
    });

    return report;
  } catch (err) {
    console.error("❌ Error fetching remarks report:", err);
    throw err;
  }
};

// service
exports.getFilteredCitizensForPrint = async (options) => {
  const {
    search,
    barangay,
    gender,
    ageRange,
    healthStatus,
    sortBy,
    sortOrder,
  } = options;

  const params = [];
  let where =
    "WHERE sc.deleted = 0 AND sc.age >= 60 AND registered = 1 AND archived = 0";

  // Search
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
  if (barangay && barangay !== "" && barangay !== "All Barangays") {
    where += ` AND b.barangay_name = ?`;
    params.push(barangay);
  }

  // Gender filter
  if (gender && gender !== "" && gender !== "All") {
    where += ` AND sc.gender = ?`;
    params.push(gender);
  }

  // Health status filter
  if (healthStatus && healthStatus !== "" && healthStatus !== "All Remarks") {
    where += ` AND JSON_UNQUOTE(JSON_EXTRACT(sc.form_data, '$.remarks')) = ?`;
    params.push(healthStatus);
  }

  // Age range filter
  if (ageRange && ageRange !== "" && ageRange !== "All") {
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

  const data = await Connection(
    `SELECT sc.id, sc.firstName, sc.middleName, sc.lastName, sc.suffix,
            sc.age, sc.gender, sc.form_data, sc.created_at,
            sc.barangay_id, b.barangay_name
     FROM senior_citizens sc
     LEFT JOIN barangays b ON sc.barangay_id = b.id
     ${where}
     ORDER BY ${orderBy} ${order}`,
    params
  );

  return data.map((c) => ({
    ...c,
    form_data:
      typeof c.form_data === "string"
        ? JSON.parse(c.form_data || "{}")
        : c.form_data || {},
  }));
};
