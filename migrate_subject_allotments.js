const pool = require('./src/config/db');

async function updateSubjectAllotments() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [tables] = await connection.query(
      `SELECT TABLE_NAME
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subject_allocations'`
    );

    if (tables.length === 0) {
      throw new Error('subject_allocations table does not exist. Run seed_academic.js first.');
    }

    const [columns] = await connection.query(
      `SELECT COLUMN_NAME
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subject_allocations'`
    );
    if (!columns.some((column) => column.COLUMN_NAME === 'teaching_hours')) {
      await connection.query(
        'ALTER TABLE subject_allocations ADD COLUMN teaching_hours INT NOT NULL DEFAULT 0'
      );
      console.log('✅ Added teaching_hours to subject_allocations.');
    }

    const [indexes] = await connection.query(
      `SELECT DISTINCT INDEX_NAME
       FROM information_schema.STATISTICS
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subject_allocations'`
    );
    const indexNames = new Set(indexes.map((index) => index.INDEX_NAME));

    if (!indexNames.has('unique_subject_faculty_year')) {
      await connection.query(
        `ALTER TABLE subject_allocations
         ADD UNIQUE KEY unique_subject_faculty_year
         (dept_code, semester, section, subject_code, faculty_id, academic_year)`
      );
      console.log('✅ Enabled multiple faculty allotments per subject.');
    }
    if (indexNames.has('unique_allocation')) {
      await connection.query(
        'ALTER TABLE subject_allocations DROP INDEX unique_allocation'
      );
      console.log('✅ Removed the one-faculty-per-subject constraint.');
    }
  } catch (err) {
    console.error('❌ Subject allotment migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

updateSubjectAllotments();
