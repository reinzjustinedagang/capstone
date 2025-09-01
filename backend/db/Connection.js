const mysql = require("mysql2");
require("dotenv").config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || "",
  port: process.env.DB_PORT,
  database: process.env.DB_DATABASE,
});

db.connect((err) => {
  if (err) {
    console.error("❌ MySQL connection error:", err.message);
    return;
  }
  console.log("✅ Connected to MySQL database.");
});

// Create the 'user' table if it does not already exist.
db.query(
  `
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    cp_number VARCHAR(15) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'inactive',
    image TEXT DEFAULT NULL,
    last_login TIMESTAMP NULL DEFAULT NULL,
    last_logout TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  `,
  (err) => {
    if (err) {
      console.error("❌ Failed to create users table:", err);
    } else {
      console.log("✅ users table ready.");

      // 🔹 Check if table has records
      db.query("SELECT COUNT(*) AS count FROM users", (err, results) => {
        if (err) {
          console.error("❌ Failed to check users count:", err);
          return;
        }

        if (results[0].count === 0) {
          // hash your password before saving
          const bcrypt = require("bcryptjs");
          const hashedPassword = bcrypt.hashSync("Iamreinz2004", 10);

          db.query(
            `INSERT INTO users (username, email, password, cp_number, role, status) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
              "Administrator",
              "reinzjustinedagang@gmail.com",
              hashedPassword,
              "09123456789",
              "admin",
              "active",
            ],
            (err) => {
              if (err) {
                console.error("❌ Failed to insert default admin:", err);
              } else {
                console.log(
                  "✅ Default admin account created (email: admin@example.com / password: admin123)"
                );
              }
            }
          );
        }
      });
    }
  }
);

// Barangay Table
db.query(
  `
  CREATE TABLE IF NOT EXISTS barangays (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barangay_name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  `,
  (err) => {
    if (err) {
      console.error("❌ Failed to create barangay table:", err);
    } else {
      console.log("✅ barangay table ready.");
    }
  }
);

// Municipal Officials Table
db.query(
  `
  CREATE TABLE IF NOT EXISTS municipal_officials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    type ENUM('head', 'vice', 'officer') NOT NULL,
    image VARCHAR(255), -- stores file name or URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  `,
  (err) => {
    if (err) {
      console.error("❌ Failed to create municipal_officials table:", err);
    } else {
      console.log("✅ municipal_officials table ready.");
    }
  }
);

// Barangay Officials Table
db.query(
  `
  CREATE TABLE IF NOT EXISTS barangay_officials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    barangay_name VARCHAR(255) NOT NULL,
    president_name VARCHAR(255) NOT NULL,
    position VARCHAR(100) DEFAULT 'President',
    image VARCHAR(255), -- stores file name or URL
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )
  `,
  (err) => {
    if (err) {
      console.error("❌ Failed to create barangay_officials table:", err);
    } else {
      console.log("✅ barangay_officials table ready.");
    }
  }
);

db.query(
  `CREATE TABLE IF NOT EXISTS sms_templates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,                   
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,  -- When the template was added
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )`,
  (err) => {
    if (err) {
      console.error("❌ Failed to create sms_templates table:", err);
    } else {
      console.log("✅ sms_templates table ready.");
    }
  }
);

// Create the sms credentials table if it does not already exist.
db.query(
  `
  CREATE TABLE IF NOT EXISTS sms_credentials (
  id INT PRIMARY KEY,
  api_key VARCHAR(255),
  sender_id VARCHAR(50),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)`,
  (err) => {
    if (err) {
      console.error("❌ Failed to create sms credentials table:", err);
    } else {
      console.log("✅ sms credentials table ready.");
    }
  }
);

// Create the 'otp_codes' table if it does not already exist.
db.query(
  `
  CREATE TABLE IF NOT EXISTS otp_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,  
    mobile VARCHAR(15) NOT NULL,        
    otp VARCHAR(6) NOT NULL,            
    purpose VARCHAR(50),                
    expires_at DATETIME,                
    used BOOLEAN DEFAULT 0,            
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
  )
`,
  (err) => {
    if (err) {
      console.error("❌ Failed to create otp_codes table:", err);
    } else {
      console.log("✅ otp_codes table ready.");
    }
  }
);

// Create the 'sms_logs' table if it does not already exist.
db.query(
  `CREATE TABLE IF NOT EXISTS sms_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,    
    recipients TEXT NOT NULL,             
    message TEXT NOT NULL,                
    status VARCHAR(20) NOT NULL,          
    reference_id VARCHAR(100),            
    credit_used DECIMAL(10,2) DEFAULT 0,  
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP 
  )`,
  (err) => {
    if (err) {
      console.error("❌ Failed to create sms_logs table:", err);
    } else {
      console.log("✅ sms_logs table ready.");
    }
  }
);

// Create the 'audit_logs' table if it does not already exist.
db.query(
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
  `,
  (err) => {
    if (err) {
      console.error("❌ Failed to create audit_logs table:", err);
    } else {
      console.log("✅ audit_logs table ready.");
    }
  }
);

// Create the 'events' table if it does not already exist.
db.query(
  `
  CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) DEFAULT 'event',
    description TEXT NOT NULL,
    date DATE NOT NULL,
    image_url VARCHAR(500),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL
  )
  `,
  (err) => {
    if (err) {
      console.error("❌ Failed to create events table:", err);
    } else {
      console.log("✅ events table ready.");
    }
  }
);

// Create the 'benefits' table if it does not already exist.
db.query(
  `
  CREATE TABLE IF NOT EXISTS benefits (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    location VARCHAR(255),
    provider VARCHAR(255),
    type VARCHAR(255),
    enacted_date DATE NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted TINYINT(1) DEFAULT 0,
    deleted_at TIMESTAMP NULL
  )
  `,
  (err) => {
    if (err) {
      console.error("❌ Failed to create benefits table:", err);
    } else {
      console.log("✅ benefits table ready.");
    }
  }
);

// Create the 'reports' table if it does not already exist.
db.query(
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
  `,
  (err) => {
    if (err) {
      console.error("❌ Failed to create reports table:", err);
    } else {
      console.log("✅ reports table ready.");
    }
  }
);

// Create the 'senior_citizens' table if it does not already exist.
db.query(
  `
    CREATE TABLE IF NOT EXISTS senior_citizens (
      id INT AUTO_INCREMENT PRIMARY KEY,
      
      -- Core structured fields
      firstName VARCHAR(255) NOT NULL,
      lastName VARCHAR(255) NOT NULL,
      middleName VARCHAR(255),
      suffix VARCHAR(50),
      
      -- Dynamic form fields stored here
      form_data JSON NOT NULL,
      
      -- Optional: quick access columns (can be included in JSON too)
      age INT GENERATED ALWAYS AS (CAST(JSON_EXTRACT(form_data, '$.age') AS UNSIGNED)) VIRTUAL,
      gender VARCHAR(10) GENERATED ALWAYS AS (JSON_UNQUOTE(JSON_EXTRACT(form_data, '$.gender'))) VIRTUAL,
      
      -- Metadata
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      deleted TINYINT(1) DEFAULT 0,
      deleted_at TIMESTAMP NULL
  )
`,
  (err) => {
    if (err) {
      console.error("❌ Failed to create senior_citizens table:", err);
    } else {
      console.log("✅ senior_citizens table ready.");
    }
  }
);

db.query(
  `
  CREATE TABLE IF NOT EXISTS system (
    id INT PRIMARY KEY AUTO_INCREMENT,
    system_name VARCHAR(255) NOT NULL,
    municipality VARCHAR(255) NOT NULL,
    province VARCHAR(255) NOT NULL,
    seal VARCHAR(500), -- path or URL of uploaded seal image,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    mission TEXT NULL,
    vision TEXT NULL,
    preamble TEXT NULL
  )
  `,
  (err) => {
    if (err) {
      console.error("❌ Failed to create system table:", err);
    } else {
      console.log("✅ system table ready.");
    }
  }
);

// Create the 'senior citizen form' table if it does not already exist.
db.query(
  `
  CREATE TABLE IF NOT EXISTS form_fields (
    id INT PRIMARY KEY AUTO_INCREMENT,
    field_name VARCHAR(255) NOT NULL,       
    label VARCHAR(255) NOT NULL,           
    type VARCHAR(50) NOT NULL,              
    options TEXT,                          
    required BOOLEAN DEFAULT FALSE,        
    \`group\` VARCHAR(50),                    
    \`order\` INT DEFAULT 0                   
  )
  `,
  (err) => {
    if (err) {
      console.error("❌ Failed to create form_fields table:", err);
    } else {
      console.log("✅ form_fields table ready.");
    }
  }
);

module.exports = (query, params = []) => {
  return new Promise((resolve, reject) => {
    db.query(query, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};
