const pool = require('./src/config/db');

async function removeMediumOfInstruction() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [columns] = await connection.query(
      "SHOW COLUMNS FROM student_profiles LIKE 'medium_of_instruction'"
    );

    if (columns.length === 0) {
      console.log('ℹ️ medium_of_instruction is already absent from student_profiles.');
      return;
    }

    await connection.query(
      'ALTER TABLE student_profiles DROP COLUMN medium_of_instruction'
    );
    console.log('✅ Removed medium_of_instruction from student_profiles.');
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

removeMediumOfInstruction();
