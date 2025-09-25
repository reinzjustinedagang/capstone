const mysql = require("mysql2/promise");
require("dotenv").config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Wrapper so services can still use:  await Connection(sql, params);
async function Connection(sql, params = []) {
  const [rows] = await pool.query(sql, params);
  return rows;
}

// Export both
module.exports = Connection;
module.exports.pool = pool;

// ------------------------------------------------------------------
// Auto-create tables at startup
// ------------------------------------------------------------------

async function initTables() {
  try {
    // Users
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        cp_number VARCHAR(15) UNIQUE NOT NULL,
        role VARCHAR(50) NOT NULL,
        status ENUM('active', 'inactive') DEFAULT 'inactive',
        image TEXT DEFAULT NULL,
        blocked INT DEFAULT 0,
        registered INT DEFAULT 0,
        last_login TIMESTAMP NULL DEFAULT NULL,
        last_seen TIMESTAMP NULL,
        last_logout TIMESTAMP NULL DEFAULT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ users table ready.");

    // Barangays
    await pool.query(`
      CREATE TABLE IF NOT EXISTS barangays (
        id INT AUTO_INCREMENT PRIMARY KEY,
        barangay_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ barangays table ready.");

    // Positions
    await pool.query(`
      CREATE TABLE IF NOT EXISTS positions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        type ENUM('orgchart', 'federation') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ positions table ready.");

    // Municipal officials
    await pool.query(`
      CREATE TABLE IF NOT EXISTS municipal_officials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        type ENUM('top', 'mid', 'bottom') NOT NULL,
        image VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ municipal_officials table ready.");

    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS orgChart (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        position VARCHAR(255) NOT NULL,
        type ENUM('top', 'mid', 'bottom') NOT NULL,
        image VARCHAR(255), -- stores file name or URL
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `
    );
    console.log("✅ barangay table ready.");

    await pool.query(
      `
  CREATE TABLE IF NOT EXISTS barangay_officials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barangay_name VARCHAR(255) NOT NULL,
    president_name VARCHAR(255) NOT NULL,
    position VARCHAR(100) DEFAULT 'President',
    image VARCHAR(255), -- stores file name or URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  `
    );
    console.log("✅ barangay table ready.");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS sms_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,                   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When the template was added
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`
    );
    console.log("✅ barangay table ready.");

    await pool.query(
      `
  CREATE TABLE IF NOT EXISTS sms_credentials (
  id INT PRIMARY KEY,
  api_key VARCHAR(255),
  sender_id VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`
    );
    console.log("✅ barangay table ready.");

    await pool.query(
      `
  CREATE TABLE IF NOT EXISTS otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    cp_number VARCHAR(15) NOT NULL,        
    otp VARCHAR(6) NOT NULL,            
    purpose VARCHAR(50),                
    expires_at DATETIME,                
    used BOOLEAN DEFAULT 0,            
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
  )
`
    );
    console.log("✅ barangay table ready.");

    await pool.query(
      `CREATE TABLE IF NOT EXISTS sms_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,    
    recipients TEXT NOT NULL,             
    message TEXT NOT NULL,                
    status VARCHAR(20) NOT NULL,          
    reference_id VARCHAR(100),            
    credit_used DECIMAL(10,2) DEFAULT 0,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
  )`
    );
    console.log("✅ barangay table ready.");

    await pool.query(
      `
  CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    userId INT NOT NULL,
    user VARCHAR(255) NOT NULL,
    userRole VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL,
    details TEXT,
    ipAddress VARCHAR(45) 
  )
  `
    );
    console.log("✅ barangay table ready.");

    await pool.query(
      `
  CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    type ENUM('event', 'slideshow'),
    description TEXT,
    date DATE,
    image_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL
  )
  `
    );
    console.log("✅ barangay table ready.");

    await pool.query(
      `
  CREATE TABLE IF NOT EXISTS benefits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    description TEXT,
    provider VARCHAR(255),
    type VARCHAR(255),
    enacted_date DATE NULL,
    image_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL
  )
  `
    );
    console.log("✅ barangay table ready.");

    await pool.query(
      `
  CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    year INT NOT NULL,
    month INT NOT NULL,
    socpen INT DEFAULT 0,
    nonsocpen INT DEFAULT 0,
    deceased INT DEFAULT 0,
    transferee INT DEFAULT 0,
    pdl_male INT DEFAULT 0,
    pdl_female INT DEFAULT 0,
    new_male INT DEFAULT 0,
    new_female INT DEFAULT 0,
    utp_male INT DEFAULT 0,
    utp_female INT DEFAULT 0,
    booklet_male INT DEFAULT 0,
    booklet_female INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
  `
    );
    console.log("✅ barangay table ready.");

    await pool.query(
      `
    CREATE TABLE IF NOT EXISTS senior_citizens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      
      -- Core structured fields
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      middleName VARCHAR(255),
      suffix VARCHAR(50),
      birthdate DATE NULL, 
      -- Dynamic form fields stored here
      form_data JSON NOT NULL,
      
      -- Optional: quick access columns (can be included in JSON too)
      age INT GENERATED ALWAYS AS (CAST(JSON_EXTRACT(form_data, '$.age') AS UNSIGNED)) VIRTUAL,
      gender VARCHAR(10) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender'))) VIRTUAL,

      -- Image
      document_image VARCHAR(500),
      document_type VARCHAR(255),
      photo VARCHAR(500),
      document_public_id VARCHAR(500),
      photo_public_id VARCHAR(500),
      
      -- Metadata
      barangay_id  INT NULL,
      socpen_date DATE NULL,
      nonsocpen_date DATE NULL,
      deceased_date DATE NULL,
      transferee_date DATE NULL,
      pdl_date DATE NULL,
      utp_date DATE NULL,
      booklet_date DATE NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      registered TINYINT(1) DEFAULT 1,
      deleted TINYINT(1) DEFAULT 0,
      deleted_at TIMESTAMP NULL
  )
`
    );
    console.log("✅ barangay table ready.");

    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS dev_keys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      \`key\` VARCHAR(50) NOT NULL UNIQUE,
      used INT(1) DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
      `
    );
    console.log("✅ barangay table ready.");

    await pool.query(
      `
      CREATE TABLE IF NOT EXISTS system_setting (
        id INT PRIMARY KEY AUTO_INCREMENT,
        system_name VARCHAR(255) NOT NULL,
        municipality VARCHAR(255) NOT NULL,
        province VARCHAR(255) NOT NULL,
        seal VARCHAR(500), -- path or URL of uploaded seal image,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        mission TEXT NULL,
        vision TEXT NULL,
        preamble TEXT NULL,
        introduction TEXT NULL,
        objective TEXT NULL,
        team JSON NULL
      )
      `
    );
    console.log("✅ barangay table ready.");

    // Ensure form_group table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS form_group (
        id INT PRIMARY KEY AUTO_INCREMENT,
        group_key VARCHAR(255) NOT NULL,
        group_label VARCHAR(255) NOT NULL
      )
    `);
    console.log("✅ form_group table ready.");

    const [fgRows] = await pool.query(
      `SELECT COUNT(*) AS count FROM form_group`
    );
    if (fgRows[0].count === 0) {
      const defaultGroups = [
        ["i_personal_information", "I. Personal Information"],
        ["ii_contact", "II. Contact"],
        ["iii_address", "III. Address"],
      ];
      await pool.query(
        `INSERT INTO form_group (group_key, group_label) VALUES ?`,
        [defaultGroups]
      );
      console.log("✅ Default form groups inserted.");
    }

    // Ensure form_fields table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS form_fields (
        id INT AUTO_INCREMENT PRIMARY KEY,
        field_name VARCHAR(100) NOT NULL,
        label VARCHAR(100) NOT NULL,
        type VARCHAR(50) NOT NULL,
        options TEXT,
        required BOOLEAN DEFAULT false,
        \`group\` VARCHAR(100) NOT NULL,
        \`order\` INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ form_fields table ready.");

    const [ffRows] = await pool.query(
      `SELECT COUNT(*) AS count FROM form_fields`
    );
    if (ffRows[0].count === 0) {
      const defaultFields = [
        [
          "firstName",
          "First Name",
          "text",
          null,
          true,
          "i_personal_information",
          1,
        ],
        [
          "middleName",
          "Middle Name",
          "text",
          null,
          false,
          "i_personal_information",
          2,
        ],
        [
          "lastName",
          "Last Name",
          "text",
          null,
          true,
          "i_personal_information",
          3,
        ],
        // ... add the rest of your default fields ...
      ];
      await pool.query(
        `INSERT INTO form_fields (field_name, label, type, options, required, \`group\`, \`order\`) VALUES ?`,
        [defaultFields]
      );
      console.log("✅ Default form fields inserted.");
    }

    console.log("🎉 All tables initialized.");
  } catch (err) {
    console.error("❌ Error initializing tables:", err);
  }
}

// Initialize at startup
initTables();
