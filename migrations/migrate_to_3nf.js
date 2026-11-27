const db = require('../src/config/db');

async function migrateTo3NF() {
  console.log('=== Step 1: Upsert Subjects into subjects Master Table ===');
  
  const subjectsData = [
    // Semester 2
    ['EC201', 'Network Analysis', 'EC', 2, 4, 'Theory'],
    ['EC202', 'Analog Electronics', 'EC', 2, 4, 'Theory'],
    ['EC203', 'Signals and Systems', 'EC', 2, 3, 'Theory'],
    ['EC204', 'Digital Logic Design', 'EC', 2, 3, 'Theory'],
    ['EC205', 'Engineering Mathematics II', 'EC', 2, 3, 'Theory'],
    // Semester 3
    ['EC301', 'Electromagnetic Theory', 'EC', 3, 4, 'Theory'],
    ['EC302', 'Analog Circuits', 'EC', 3, 4, 'Theory'],
    ['EC303', 'Linear Integrated Circuits', 'EC', 3, 3, 'Theory'],
    ['EC304', 'Microprocessors and Microcontrollers', 'EC', 3, 3, 'Theory'],
    ['EC305', 'Analog Communication Systems', 'EC', 3, 3, 'Theory'],
    // Semester 4
    ['EC401', 'Digital Signal Processing', 'EC', 4, 4, 'Theory'],
    ['EC402', 'Digital Communication', 'EC', 4, 4, 'Theory'],
    ['EC403', 'Control Systems', 'EC', 4, 3, 'Theory'],
    ['EC404', 'VLSI Design', 'EC', 4, 3, 'Theory'],
    ['EC405', 'Transmission Lines and Antennas', 'EC', 4, 3, 'Theory']
  ];

  for (const [code, name, dept, sem, cred, type] of subjectsData) {
    await db.query(`
      INSERT INTO subjects (subject_code, subject_name, dept_code, semester, credits, subject_type)
      VALUES (?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        subject_name = VALUES(subject_name),
        dept_code = VALUES(dept_code),
        semester = VALUES(semester),
        credits = VALUES(credits),
        subject_type = VALUES(subject_type)
    `, [code, name, dept, sem, cred, type]);
  }
  console.log('✅ 15 Subjects upserted into subjects master table.');

  console.log('=== Step 2: Create 3NF Normalized Tables ===');
  
  // Table 1: student_course_enrollments
  await db.query(`
    CREATE TABLE IF NOT EXISTS student_course_enrollments (
      id INT AUTO_INCREMENT PRIMARY KEY,
      usn VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
      subject_code VARCHAR(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
      semester INT NOT NULL,
      academic_year VARCHAR(20) DEFAULT '2026-27',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE KEY uq_student_course_sem (usn, subject_code, semester),
      INDEX idx_usn_sem (usn, semester),
      CONSTRAINT fk_sce_usn FOREIGN KEY (usn) REFERENCES student_profiles(usn) ON DELETE CASCADE,
      CONSTRAINT fk_sce_sub FOREIGN KEY (subject_code) REFERENCES subjects(subject_code) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✅ student_course_enrollments table created.');

  // Table 2: student_evaluations
  await db.query(`
    CREATE TABLE IF NOT EXISTS student_evaluations (
      id INT AUTO_INCREMENT PRIMARY KEY,
      enrollment_id INT NOT NULL UNIQUE,
      internal_marks_1 DECIMAL(4,1),
      internal_marks_2 DECIMAL(4,1),
      attendance_1 DECIMAL(5,2),
      attendance_2 DECIMAL(5,2),
      final_attendance DECIMAL(5,2),
      cie_marks DECIMAL(4,1),
      external_marks DECIMAL(4,1),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT fk_se_enrollment FOREIGN KEY (enrollment_id) REFERENCES student_course_enrollments(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
  console.log('✅ student_evaluations table created.');

  console.log('=== Step 3: Populate 3NF Tables from Existing Records ===');
  const [existingRecords] = await db.query('SELECT * FROM student_academic_records');
  console.log(`Processing ${existingRecords.length} records...`);

  for (const r of existingRecords) {
    // 1. Insert into student_course_enrollments
    await db.query(`
      INSERT INTO student_course_enrollments (usn, subject_code, semester, academic_year)
      VALUES (?, ?, ?, '2026-27')
      ON DUPLICATE KEY UPDATE academic_year = VALUES(academic_year)
    `, [r.usn, r.subject_code, r.semester]);

    // 2. Fetch the enrollment id
    const [[enrollment]] = await db.query(
      'SELECT id FROM student_course_enrollments WHERE usn = ? AND subject_code = ? AND semester = ?',
      [r.usn, r.subject_code, r.semester]
    );

    // 3. Insert into student_evaluations
    await db.query(`
      INSERT INTO student_evaluations (
        enrollment_id, internal_marks_1, internal_marks_2,
        attendance_1, attendance_2, final_attendance,
        cie_marks, external_marks
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        internal_marks_1 = VALUES(internal_marks_1),
        internal_marks_2 = VALUES(internal_marks_2),
        attendance_1 = VALUES(attendance_1),
        attendance_2 = VALUES(attendance_2),
        final_attendance = VALUES(final_attendance),
        cie_marks = VALUES(cie_marks),
        external_marks = VALUES(external_marks)
    `, [
      enrollment.id, r.internal_marks_1, r.internal_marks_2,
      r.attendance_1, r.attendance_2, r.final_attendance,
      r.cie_marks, r.external_marks
    ]);
  }

  const [[{ count: enrollCount }]] = await db.query('SELECT COUNT(*) AS count FROM student_course_enrollments');
  const [[{ count: evalCount }]] = await db.query('SELECT COUNT(*) AS count FROM student_evaluations');
  console.log(`✅ Verified: ${enrollCount} enrollments, ${evalCount} evaluations in normalized tables.`);

  console.log('=== Step 4: Drop legacy flat table and recreate as pure 3NF View ===');
  await db.query('DROP TABLE IF EXISTS student_academic_records');

  await db.query(`
    CREATE OR REPLACE VIEW student_academic_records AS
    SELECT 
      e.id AS id,
      e.usn,
      sp.full_name AS student_name,
      e.semester,
      sub.dept_code,
      sub.subject_code,
      sub.subject_name,
      sub.credits,
      ev.internal_marks_1,
      ev.internal_marks_2,
      ev.attendance_1,
      ev.attendance_2,
      ev.final_attendance,
      ev.cie_marks,
      ev.external_marks,
      -- Derived total marks
      ROUND(COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0), 1) AS total_marks,
      -- Derived grade point
      CASE 
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 90 THEN 10
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 80 THEN 9
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 70 THEN 8
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 60 THEN 7
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 50 THEN 6
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 45 THEN 5
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 40 THEN 4
        ELSE 0
      END AS grade_point,
      -- Derived credit point
      (CASE 
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 90 THEN 10
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 80 THEN 9
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 70 THEN 8
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 60 THEN 7
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 50 THEN 6
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 45 THEN 5
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 40 THEN 4
        ELSE 0
      END) * sub.credits AS credit_point,
      -- Derived grade letter
      CASE 
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 90 THEN 'O'
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 80 THEN 'A+'
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 70 THEN 'A'
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 60 THEN 'B+'
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 50 THEN 'B'
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 45 THEN 'C'
        WHEN (COALESCE(ev.cie_marks, 0) + COALESCE(ev.external_marks, 0)) >= 40 THEN 'P'
        ELSE 'F'
      END AS grade_letter
    FROM student_course_enrollments e
    JOIN subjects sub ON e.subject_code = sub.subject_code
    LEFT JOIN student_profiles sp ON e.usn = sp.usn
    LEFT JOIN student_evaluations ev ON e.id = ev.enrollment_id;
  `);

  console.log('✅ Created 3NF View: student_academic_records.');

  console.log('=== Step 5: Test View with sample query ===');
  const [testRows] = await db.query(
    'SELECT usn, student_name, semester, subject_code, subject_name, credits, cie_marks, external_marks, total_marks, grade_point, credit_point, grade_letter FROM student_academic_records WHERE usn = "4JK25EC002" AND semester = 2 LIMIT 2'
  );
  console.log('Sample output from 3NF View:', testRows);

  console.log('\n🎉 Successfully migrated academic database to pure 3NF architecture!');
  process.exit(0);
}

migrateTo3NF().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
