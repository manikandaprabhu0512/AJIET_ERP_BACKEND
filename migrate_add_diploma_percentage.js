const pool = require('./src/config/db');

async function addDiplomaPercentage() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM student_profiles LIKE 'diploma_percentage'"
    );

    if (columns.length === 0) {
      await connection.query(
        'ALTER TABLE student_profiles ADD COLUMN diploma_percentage DECIMAL(5,2) DEFAULT NULL'
      );
      console.log('✅ Added diploma_percentage column to student_profiles.');
    } else {
      console.log('ℹ️ diploma_percentage column already exists on student_profiles.');
    }
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

addDiplomaPercentage();
