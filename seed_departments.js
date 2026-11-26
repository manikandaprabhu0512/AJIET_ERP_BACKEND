const pool = require('./src/config/db');

const departments = [
  { code: 'CE', name: 'Civil Engineering' },
  { code: 'CSE', name: 'Computer Science & Engineering' },
  {
    code: 'CSEAIML',
    name: 'Computer Science & Engineering (Artificial Intelligence & Machine Learning)',
  },
  {
    code: 'CSEIOT',
    name: 'Computer Science & Engineering (IoT & Cyber Security including Blockchain Technology)',
  },
  { code: 'AIDS', name: 'Artificial Intelligence & Data Science' },
  {
    code: 'EVLSI',
    name: 'Electronics Engineering (VLSI Design and Technology)',
  },
  { code: 'ISE', name: 'Information Science & Engineering' },
  { code: 'ME', name: 'Mechanical Engineering' },
  { code: 'BSH', name: 'Basic Science and Humanity' },
  { code: 'MBA', name: 'Master of Business Administration (MBA) - PG' },
  { code: 'MCA', name: 'Master of Computer Applications (MCA) - PG' },
];

async function seedDepartments() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let inserted = 0;
    for (const department of departments) {
      const [[existing]] = await connection.query(
        'SELECT dept_name FROM departments WHERE dept_code = ?',
        [department.code]
      );

      if (existing) {
        if (existing.dept_name !== department.name) {
          throw new Error(
            `Department code ${department.code} already belongs to "${existing.dept_name}".`
          );
        }
        continue;
      }

      await connection.query(
        'INSERT INTO departments (dept_code, dept_name) VALUES (?, ?)',
        [department.code, department.name]
      );
      inserted += 1;
    }

    await connection.commit();
    console.log(
      `✅ Department records ready: inserted ${inserted}; EC was left unchanged.`
    );
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('❌ Department seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

seedDepartments();
