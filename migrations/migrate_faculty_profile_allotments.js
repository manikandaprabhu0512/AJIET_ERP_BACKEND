const pool = require('../src/config/db');

const allotmentTables = new Set([
  'curriculum_subject_allotments',
  'subject_allocations'
]);

async function migrateFacultyProfileAllotments() {
  let connection;
  try {
    connection = await pool.getConnection();
    const [constraints] = await connection.query(
      `SELECT TABLE_NAME, CONSTRAINT_NAME
       FROM information_schema.KEY_COLUMN_USAGE
       WHERE TABLE_SCHEMA = DATABASE()
         AND TABLE_NAME IN (?, ?)
         AND COLUMN_NAME = 'faculty_id'
         AND REFERENCED_TABLE_NAME = 'faculty'`,
      [...allotmentTables]
    );

    for (const { TABLE_NAME: tableName, CONSTRAINT_NAME: constraintName } of constraints) {
      if (!allotmentTables.has(tableName)) continue;
      const quotedTable = `\`${tableName.replace(/`/g, '``')}\``;
      const quotedConstraint = `\`${constraintName.replace(/`/g, '``')}\``;
      await connection.query(
        `ALTER TABLE ${quotedTable} DROP FOREIGN KEY ${quotedConstraint}`
      );
    }

    console.log(
      `✅ Faculty profile allotment migration complete; removed ${constraints.length} legacy faculty foreign key(s).`
    );
  } catch (err) {
    console.error('❌ Faculty profile allotment migration failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

migrateFacultyProfileAllotments();
