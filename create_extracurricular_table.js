const db = require('./src/config/db');

async function setupExtracurricular() {
  console.log('--- Setting up student_extracurricular_activities table ---');

  await db.query(`
    CREATE TABLE IF NOT EXISTS student_extracurricular_activities (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usn VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
      semester INT NOT NULL,
      category ENUM(
        'Publications',
        'Certifications',
        'Sports',
        'Culturals',
        'Workshop/Training',
        'Others'
      ) NOT NULL,
      other_category_title VARCHAR(150) DEFAULT NULL,
      title VARCHAR(255) NOT NULL,
      organizer VARCHAR(200) DEFAULT NULL,
      event_date DATE DEFAULT NULL,
      certificate_url LONGTEXT NOT NULL,
      status ENUM('Pending', 'Verified', 'Rejected') DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_sea_usn FOREIGN KEY (usn) REFERENCES student_profiles(usn) ON DELETE CASCADE,
      INDEX idx_sea_usn_sem (usn, semester)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  console.log('✅ student_extracurricular_activities table created successfully.');
  process.exit(0);
}

setupExtracurricular().catch((err) => {
  console.error('❌ Table creation failed:', err);
  process.exit(1);
});
