const pool = require('../src/config/db');

async function addAbcId() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM student_profiles LIKE 'abc_id'"
    );

    if (columns.length === 0) {
      await connection.query(
        'ALTER TABLE student_profiles ADD COLUMN abc_id VARCHAR(12) DEFAULT NULL'
      );
      console.log('✅ Added abc_id column to student_profiles.');
    } else {
      console.log('ℹ️ abc_id column already exists on student_profiles.');
    }

    const [indexes] = await connection.query(
      "SHOW INDEX FROM student_profiles WHERE Key_name = 'unique_student_abc_id'"
    );
    if (indexes.length === 0) {
      await connection.query(
        'ALTER TABLE student_profiles ADD UNIQUE KEY unique_student_abc_id (abc_id)'
      );
      console.log('✅ Added unique index for student ABC IDs.');
    } else {
      console.log('ℹ️ Unique index for student ABC IDs already exists.');
    }
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

addAbcId();
