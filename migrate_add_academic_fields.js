const pool = require('./src/config/db');

async function updateSchema() {
  let connection;
  try {
    connection = await pool.getConnection();

    const [semesterColumns] = await connection.query(
      "SHOW COLUMNS FROM student_profiles LIKE 'current_semester'",
    );
    if (semesterColumns.length === 0) {
      await connection.query(
        "ALTER TABLE student_profiles ADD COLUMN current_semester VARCHAR(20) DEFAULT 'Semester 1'",
      );
    }

    const [yearColumns] = await connection.query(
      "SHOW COLUMNS FROM student_profiles LIKE 'academic_year'",
    );
    if (yearColumns.length === 0) {
      await connection.query(
        "ALTER TABLE student_profiles ADD COLUMN academic_year VARCHAR(20) DEFAULT '2026-27'",
      );
    }

    await connection.query(
      `UPDATE student_profiles
       SET academic_year = CONCAT(LEFT(academic_year, 4), '-', RIGHT(academic_year, 2))
       WHERE academic_year REGEXP '^[0-9]{4}-[0-9]{4}$'`,
    );
    await connection.query(
      "ALTER TABLE student_profiles MODIFY COLUMN academic_year VARCHAR(20) DEFAULT '2026-27'",
    );

    console.log('Student academic semester and year fields are ready.');
  } catch (error) {
    console.error('Migration failed:', error.message);
    process.exitCode = 1;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

updateSchema();
