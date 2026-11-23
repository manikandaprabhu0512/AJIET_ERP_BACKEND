const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const pool = require('./src/config/db');

async function seedAcademic() {
  let connection;
  try {
    connection = await pool.getConnection();
    console.log('🔄 Executing academic schema creation...');

    const sqlPath = path.join(__dirname, 'src', 'models', 'schema_academic.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    const cleanSql = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n');

    const statements = cleanSql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.toLowerCase().startsWith('use '));

    for (const stmt of statements) {
      await connection.query(stmt);
    }
    console.log('✅ Academic tables created/verified.');

    // 1. Seed Department: EC
    await connection.query(
      `INSERT INTO departments (dept_code, dept_name)
       VALUES ('EC', 'Electronics & Communication Engineering')
       ON DUPLICATE KEY UPDATE dept_name = VALUES(dept_name)`
    );
    console.log('✅ Department EC seeded.');

    // 2. Prepare HOD & Faculty records
    const faculties = [
      {
        id: 'HOD_EC',
        name: 'Dr. Ravindra K',
        dept: 'EC',
        designation: 'Professor & Head of Department',
        email: 'hod.ec@ajiet.ac.in',
        is_hod: true
      },
      {
        id: 'EC001',
        name: 'Dr. Prasanna Kumar',
        dept: 'EC',
        designation: 'Professor',
        email: 'prasanna.ec@ajiet.ac.in',
        is_hod: false
      },
      {
        id: 'EC002',
        name: 'Prof. Rajesh Shetty',
        dept: 'EC',
        designation: 'Associate Professor',
        email: 'rajesh.ec@ajiet.ac.in',
        is_hod: false
      },
      {
        id: 'EC003',
        name: 'Prof. Anusha Rao',
        dept: 'EC',
        designation: 'Assistant Professor',
        email: 'anusha.ec@ajiet.ac.in',
        is_hod: false
      },
      {
        id: 'EC004',
        name: 'Prof. Sandeep Bhat',
        dept: 'EC',
        designation: 'Assistant Professor',
        email: 'sandeep.ec@ajiet.ac.in',
        is_hod: false
      },
      {
        id: 'EC005',
        name: 'Prof. Divya Nayak',
        dept: 'EC',
        designation: 'Assistant Professor',
        email: 'divya.ec@ajiet.ac.in',
        is_hod: false
      }
    ];

    for (const f of faculties) {
      const passwordHash = await bcrypt.hash(f.id, 10); // default password is their ID
      await connection.query(
        `INSERT INTO faculty (faculty_id, name, dept_code, designation, email, password_hash, is_hod, is_first_login)
         VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)
         ON DUPLICATE KEY UPDATE
           name = VALUES(name),
           designation = VALUES(designation),
           email = VALUES(email),
           is_hod = VALUES(is_hod)`,
        [f.id, f.name, f.dept, f.designation, f.email, passwordHash, f.is_hod]
      );
    }
    console.log('✅ HOD and 5 Faculties seeded.');

    // 3. Seed Subjects: Sem 3 & Sem 4
    const subjects = [
      // Semester 3
      { code: '21EC31', name: 'Transform Calculus, Fourier Series & Numerical Tech', sem: 3, credits: 3, type: 'Theory' },
      { code: '21EC32', name: 'Digital System Design using Verilog', sem: 3, credits: 4, type: 'Theory + Lab' },
      { code: '21EC33', name: 'Analog Electronic Circuits', sem: 3, credits: 4, type: 'Theory + Lab' },
      { code: '21EC34', name: 'Network Analysis', sem: 3, credits: 3, type: 'Theory' },
      { code: '21EC35', name: 'Constitution of India & Professional Ethics', sem: 3, credits: 1, type: 'Mandatory' },

      // Semester 4
      { code: '21EC41', name: 'Complex Analysis, Probability & Statistical Methods', sem: 4, credits: 3, type: 'Theory' },
      { code: '21EC42', name: 'Microcontroller & Embedded Systems', sem: 4, credits: 4, type: 'Theory + Lab' },
      { code: '21EC43', name: 'Signals & Systems', sem: 4, credits: 3, type: 'Theory' },
      { code: '21EC44', name: 'Principles of Communication Systems', sem: 4, credits: 3, type: 'Theory' },
      { code: '21EC45', name: 'Biology for Engineers', sem: 4, credits: 2, type: 'Theory' }
    ];

    for (const sub of subjects) {
      await connection.query(
        `INSERT INTO subjects (subject_code, subject_name, dept_code, semester, credits, subject_type)
         VALUES (?, ?, 'EC', ?, ?, ?)
         ON DUPLICATE KEY UPDATE
           subject_name = VALUES(subject_name),
           semester = VALUES(semester),
           credits = VALUES(credits),
           subject_type = VALUES(subject_type)`,
        [sub.code, sub.name, sub.sem, sub.credits, sub.type]
      );
    }
    console.log('✅ 10 Subjects seeded across Semesters 3 & 4.');

    const [facultyList] = await connection.query("SELECT faculty_id, name, designation, is_hod FROM faculty WHERE dept_code = 'EC'");
    console.log('\n📋 Seeded Faculty:');
    console.table(facultyList);

    const [subList] = await connection.query("SELECT semester, subject_code, subject_name, credits, subject_type FROM subjects WHERE dept_code = 'EC' ORDER BY semester, subject_code");
    console.log('\n📚 Seeded Subjects:');
    console.table(subList);

    console.log('\n🎉 ACADEMIC SEED COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  } finally {
    if (connection) connection.release();
  }
}

seedAcademic();
