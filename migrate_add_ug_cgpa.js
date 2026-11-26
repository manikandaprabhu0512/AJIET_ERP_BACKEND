const pool = require('./src/config/db');

async function addUgCgpa() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM student_profiles LIKE 'ug_cgpa'"
    );

    if (columns.length === 0) {
      await connection.query(
        'ALTER TABLE student_profiles ADD COLUMN ug_cgpa DECIMAL(4,2) DEFAULT NULL'
      );
      console.log('✅ Added ug_cgpa column to student_profiles.');
    } else {
      console.log('ℹ️ ug_cgpa column already exists on student_profiles.');
    }
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

addUgCgpa();
