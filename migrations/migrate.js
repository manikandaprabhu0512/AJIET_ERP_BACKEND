const fs = require('fs');
const path = require('path');
const pool = require('../src/config/db');

async function migrate() {
  let connection;
  try {
    const sqlPath = path.join(__dirname, '..', 'src', 'models', 'schema.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Remove comments
    const cleanSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    // Split SQL statements by semicolon
    const rawStatements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    console.log(`🔄 Found ${rawStatements.length} statements to execute...`);
    connection = await pool.getConnection();

    for (const stmt of rawStatements) {
      console.log('Executing:', stmt.substring(0, 40).replace(/\n/g, ' ') + '...');
      await connection.query(stmt);
    }

    const [tables] = await connection.query('SHOW TABLES');
    console.log('✅ Tables in database:');
    console.table(tables);

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

migrate();
