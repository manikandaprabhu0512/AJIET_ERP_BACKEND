const pool = require('../src/config/db');

async function createCurriculumCatalog() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS curriculum_schemes (
        dept_code VARCHAR(10) NOT NULL,
        scheme_year CHAR(2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (dept_code, scheme_year),
        FOREIGN KEY (dept_code) REFERENCES departments(dept_code) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS curriculum_subjects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dept_code VARCHAR(10) NOT NULL,
        scheme_year CHAR(2) NOT NULL,
        semester TINYINT UNSIGNED NOT NULL,
        subject_number TINYINT UNSIGNED NOT NULL,
        subject_code VARCHAR(20) NOT NULL,
        subject_name VARCHAR(200) NOT NULL,
        subject_category VARCHAR(40) NOT NULL,
        teaching_hours SMALLINT UNSIGNED NOT NULL,
        credits SMALLINT UNSIGNED NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_curriculum_subject_sequence (dept_code, scheme_year, semester, subject_number),
        UNIQUE KEY unique_curriculum_subject_code (subject_code),
        FOREIGN KEY (dept_code, scheme_year)
          REFERENCES curriculum_schemes(dept_code, scheme_year) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    await connection.query(`
      CREATE TABLE IF NOT EXISTS curriculum_subject_allotments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dept_code VARCHAR(10) NOT NULL,
        curriculum_subject_id INT NOT NULL,
        faculty_id VARCHAR(20) NOT NULL,
        academic_year VARCHAR(20) NOT NULL,
        section VARCHAR(20) NOT NULL DEFAULT 'Section A',
        allocated_by VARCHAR(20) DEFAULT 'HOD_EC',
        allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY unique_curriculum_allotment (dept_code, curriculum_subject_id, faculty_id, academic_year, section),
        FOREIGN KEY (dept_code) REFERENCES departments(dept_code) ON DELETE CASCADE,
        FOREIGN KEY (curriculum_subject_id) REFERENCES curriculum_subjects(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ Curriculum schemes, subjects, and allotments are ready.');
  } catch (err) {
    console.error('❌ Curriculum catalog migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

createCurriculumCatalog();
