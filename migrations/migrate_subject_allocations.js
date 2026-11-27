const pool = require('../src/config/db');

async function ensureSubjectAllocationsTable() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.query(`
      CREATE TABLE IF NOT EXISTS subject_allocations (
        id INT AUTO_INCREMENT PRIMARY KEY,
        dept_code VARCHAR(10) NOT NULL,
        semester INT NOT NULL,
        section VARCHAR(20) NOT NULL DEFAULT 'Section A',
        subject_code VARCHAR(20) NOT NULL,
        faculty_id VARCHAR(20) NOT NULL,
        academic_year VARCHAR(20) NOT NULL DEFAULT '2026-27',
        allocated_by VARCHAR(20) DEFAULT 'HOD_EC',
        teaching_hours INT NOT NULL DEFAULT 0,
        allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (dept_code) REFERENCES departments(dept_code) ON DELETE CASCADE,
        FOREIGN KEY (subject_code) REFERENCES subjects(subject_code) ON DELETE CASCADE,
        UNIQUE KEY unique_subject_faculty_year
          (dept_code, semester, section, subject_code, faculty_id, academic_year)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);

    console.log('✅ subject_allocations table is ready.');
  } catch (err) {
    console.error('❌ subject_allocations migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

ensureSubjectAllocationsTable();
