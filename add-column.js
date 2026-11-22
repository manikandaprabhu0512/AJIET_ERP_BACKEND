const pool = require('./src/config/db');

async function updateSchema() {
  try {
    const [cols] = await pool.query("SHOW COLUMNS FROM users LIKE 'is_first_login'");
    if (cols.length === 0) {
      await pool.query('ALTER TABLE users ADD COLUMN is_first_login BOOLEAN DEFAULT TRUE');
      console.log('✅ Added column is_first_login to users table.');
    } else {
      console.log('ℹ️ Column is_first_login already present.');
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err.message);
    process.exit(1);
  }
}

updateSchema();
