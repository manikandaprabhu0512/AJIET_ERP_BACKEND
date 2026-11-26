const db = require('../config/db');

const ensureFacultyMessagesTable = async () => {
  await db.query(`
    CREATE TABLE IF NOT EXISTS faculty_messages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      faculty_id VARCHAR(50) NOT NULL,
      faculty_name VARCHAR(150) DEFAULT '',
      department VARCHAR(150) DEFAULT '',
      subject VARCHAR(200) DEFAULT '',
      body TEXT NOT NULL,
      recipient_usn VARCHAR(20) DEFAULT NULL,
      recipient_mode VARCHAR(20) NOT NULL DEFAULT 'all',
      is_read BOOLEAN DEFAULT FALSE,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_faculty_messages_faculty (faculty_id),
      INDEX idx_faculty_messages_recipient (recipient_usn),
      INDEX idx_faculty_messages_sent (sent_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
  await db.query(`
    CREATE TABLE IF NOT EXISTS faculty_message_reads (
      message_id INT NOT NULL,
      usn VARCHAR(20) NOT NULL,
      read_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (message_id, usn)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
};

// 1. Get Department Overview (Counts & Stats)
exports.getDepartmentOverview = async (req, res) => {
  try {
    const deptCode = (req.query.dept || 'EC').toUpperCase();

    // Faculty count
    const [facultyRows] = await db.query(
      'SELECT COUNT(*) as total_faculty FROM faculty WHERE dept_code = ?',
      [deptCode]
    );

    // Subject count
    const [subjectRows] = await db.query(
      'SELECT COUNT(*) as total_subjects FROM subjects WHERE dept_code = ?',
      [deptCode]
    );

    // Allocated count for current academic year
    const [allocRows] = await db.query(
      'SELECT COUNT(DISTINCT subject_code) as allocated_subjects FROM subject_allocations WHERE dept_code = ?',
      [deptCode]
    );

    res.json({
      deptCode,
      totalFaculty: facultyRows[0].total_faculty,
      totalSubjects: subjectRows[0].total_subjects,
      allocatedSubjects: allocRows[0].allocated_subjects
    });
  } catch (err) {
    console.error('Error fetching department overview:', err);
    res.status(500).json({ message: 'Failed to fetch department stats', error: err.message });
  }
};

// 2. Get Faculties for a Department
exports.getFaculties = async (req, res) => {
  try {
    const deptCode = (req.query.dept || 'EC').toUpperCase();
    const [rows] = await db.query(
      `SELECT faculty_id, name, dept_code, designation, email, is_hod, is_first_login
       FROM faculty
       WHERE dept_code = ?
       ORDER BY is_hod DESC, faculty_id ASC`,
      [deptCode]
    );
    res.json({ faculties: rows });
  } catch (err) {
    console.error('Error fetching faculties:', err);
    res.status(500).json({ message: 'Failed to fetch faculties', error: err.message });
  }
};

// 3. Get Subjects for a Department & Semester
exports.getSubjects = async (req, res) => {
  try {
    const deptCode = (req.query.dept || 'EC').toUpperCase();
    const semester = req.query.semester ? parseInt(req.query.semester, 10) : null;

    let query = 'SELECT * FROM subjects WHERE dept_code = ?';
    const params = [deptCode];

    if (semester) {
      query += ' AND semester = ?';
      params.push(semester);
    }

    query += ' ORDER BY semester ASC, subject_code ASC';

    const [rows] = await db.query(query, params);
    res.json({ subjects: rows });
  } catch (err) {
    console.error('Error fetching subjects:', err);
    res.status(500).json({ message: 'Failed to fetch subjects', error: err.message });
  }
};

// 4. Get Current Subject Allocations for Semester & Section
exports.getAllocations = async (req, res) => {
  try {
    const deptCode = (req.query.dept || 'EC').toUpperCase();
    const semester = parseInt(req.query.semester || '3', 10);
    const section = req.query.section || 'Section A';
    const academicYear = req.query.academicYear || '2026-27';

    const [rows] = await db.query(
      `SELECT s.id as subject_id, s.subject_code, s.subject_name, s.semester, s.credits, s.subject_type,
              sa.id as allocation_id, sa.section, sa.academic_year, sa.allocated_at,
              f.faculty_id, f.name as faculty_name, f.designation as faculty_designation
       FROM subjects s
       LEFT JOIN subject_allocations sa ON s.subject_code = sa.subject_code
            AND sa.semester = ? AND sa.section = ? AND sa.academic_year = ?
       LEFT JOIN faculty f ON sa.faculty_id = f.faculty_id
       WHERE s.dept_code = ? AND s.semester = ?
       ORDER BY s.subject_code ASC`,
      [semester, section, academicYear, deptCode, semester]
    );

    res.json({
      deptCode,
      semester,
      section,
      academicYear,
      allocations: rows
    });
  } catch (err) {
    console.error('Error fetching allocations:', err);
    res.status(500).json({ message: 'Failed to fetch allocations', error: err.message });
  }
};

// 5. Save / Upsert Subject Allocations (HOD mapping)
exports.saveAllocations = async (req, res) => {
  let connection;
  try {
    const dept = req.body.deptCode || req.body.dept_code || 'EC';
    const semester = req.body.semester;
    const section = req.body.section || 'Section A';
    const academicYear = req.body.academicYear || req.body.academic_year || '2026-27';
    const allocatedBy = req.body.allocatedBy || req.body.allocated_by || 'HOD_EC';
    const assignmentsList = req.body.assignments || req.body.allocations || [];

    if (!semester || !Array.isArray(assignmentsList)) {
      return res.status(400).json({ message: 'Semester and assignments array are required.' });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    for (const item of assignmentsList) {
      const subject_code = item.subject_code || item.subjectCode;
      const faculty_id = item.faculty_id || item.facultyId;

      if (!subject_code) continue;

      if (!faculty_id) {
        // If unassigned, delete any existing allocation
        await connection.query(
          `DELETE FROM subject_allocations
           WHERE dept_code = ? AND semester = ? AND section = ? AND subject_code = ? AND academic_year = ?`,
          [dept, semester, section, subject_code, academicYear]
        );
      } else {
        // Upsert allocation
        await connection.query(
          `INSERT INTO subject_allocations (dept_code, semester, section, subject_code, faculty_id, academic_year, allocated_by)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE
             faculty_id = VALUES(faculty_id),
             allocated_by = VALUES(allocated_by),
             allocated_at = CURRENT_TIMESTAMP`,
          [dept, semester, section, subject_code, faculty_id, academicYear, allocatedBy]
        );
      }
    }

    await connection.commit();
    res.json({ message: 'Subject allocations saved successfully.' });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error saving allocations:', err);
    res.status(500).json({ message: 'Failed to save subject allocations', error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

// 6. Get Curriculum Subjects Assigned to a Specific Faculty
exports.getFacultyAssignedSubjects = async (req, res) => {
  try {
    const facultyId = (req.query.faculty_id || req.params.faculty_id || '')
      .trim()
      .toUpperCase();

    if (!facultyId) {
      return res.status(400).json({ message: 'Faculty ID is required.' });
    }

    const [assignedRows] = await db.query(
      `SELECT csa.id AS allocation_id, cs.semester, csa.section,
              csa.academic_year, csa.allocated_at, csa.dept_code,
              cs.scheme_year, cs.subject_code, cs.subject_name,
              cs.credits, cs.subject_category, cs.teaching_hours,
              d.dept_name
       FROM curriculum_subject_allotments csa
       JOIN curriculum_subjects cs
         ON cs.id = csa.curriculum_subject_id
        AND cs.dept_code = csa.dept_code
       LEFT JOIN departments d ON d.dept_code = csa.dept_code
       WHERE UPPER(csa.faculty_id) = ?
       ORDER BY csa.academic_year DESC, cs.semester ASC,
                csa.section ASC, cs.subject_code ASC`,
      [facultyId]
    );

    res.json({
      assignedSubjects: assignedRows
    });
  } catch (err) {
    console.error('Error fetching faculty subjects:', err);
    res.status(500).json({ message: 'Failed to fetch assigned subjects', error: err.message });
  }
};

// 7. Fetch the enrolled students for one faculty subject allocation
exports.getFacultySubjectRoster = async (req, res) => {
  try {
    const facultyId = (req.query.faculty_id || '').trim().toUpperCase();
    const subjectCode = (req.query.subject_code || '').trim().toUpperCase();
    const semester = Number.parseInt(req.query.semester, 10);
    const section = (req.query.section || '').trim();
    const academicYear = (req.query.academic_year || '').trim();

    if (!facultyId || !subjectCode || !Number.isInteger(semester) || !section || !academicYear) {
      return res.status(400).json({
        message: 'Faculty, subject, semester, section, and academic year are required.'
      });
    }

    const [allocationRows] = await db.query(
      `SELECT csa.id
       FROM curriculum_subject_allotments csa
       JOIN curriculum_subjects cs
         ON cs.id = csa.curriculum_subject_id
        AND cs.dept_code = csa.dept_code
       WHERE UPPER(csa.faculty_id) = ? AND UPPER(cs.subject_code) = ?
         AND cs.semester = ? AND csa.section = ? AND csa.academic_year = ?
       LIMIT 1`,
      [facultyId, subjectCode, semester, section, academicYear]
    );
    if (allocationRows.length === 0) {
      return res.status(404).json({ message: 'This subject is not assigned to the faculty.' });
    }

    const [students] = await db.query(
      `SELECT DISTINCT UPPER(sp.usn) AS usn, sp.full_name AS student_name
       FROM student_course_enrollments sce
       JOIN student_profiles sp ON UPPER(sp.usn) = UPPER(sce.usn)
       WHERE UPPER(sce.subject_code) = ? AND sce.semester = ?
         AND sce.academic_year = ? AND sp.section = ?
       ORDER BY usn ASC`,
      [subjectCode, semester, academicYear, section]
    );

    res.json({
      facultyId,
      subjectCode,
      semester,
      section,
      academicYear,
      students: students.map((student) => ({
        studentId: student.usn,
        studentName: student.student_name
      }))
    });
  } catch (err) {
    console.error('Error fetching faculty subject roster:', err);
    res.status(500).json({
      message: 'Failed to fetch enrolled students for this subject.',
      error: err.message
    });
  }
};

// 7. Get Student Academic Grades & Attendance Ledger
exports.getStudentGrades = async (req, res) => {
  try {
    const usn = req.params.usn?.trim()?.toUpperCase();
    const semester = req.query.semester ? parseInt(req.query.semester, 10) : null;

    if (!usn) {
      return res.status(400).json({ message: 'USN is required.' });
    }

    // Get available semesters for this student
    const [semRows] = await db.query(
      'SELECT DISTINCT semester FROM student_academic_records WHERE UPPER(usn) = ? ORDER BY semester ASC',
      [usn]
    );

    const availableSemesters = semRows.map((r) => r.semester);

    // Query records
    let query = 'SELECT * FROM student_academic_records WHERE UPPER(usn) = ?';
    const params = [usn];

    if (semester) {
      query += ' AND semester = ?';
      params.push(semester);
    }

    query += ' ORDER BY semester ASC, subject_code ASC';

    const [rows] = await db.query(query, params);

    // Compute summary statistics if records exist
    let totalCredits = 0;
    let totalCreditPoints = 0;
    let attendanceSum = 0;

    rows.forEach((r) => {
      totalCredits += Number(r.credits) || 0;
      totalCreditPoints += Number(r.credit_point) || 0;
      attendanceSum += Number(r.final_attendance) || 0;
    });

    const sgpa = totalCredits > 0 ? (totalCreditPoints / totalCredits).toFixed(2) : '0.00';
    const avgAttendance = rows.length > 0 ? (attendanceSum / rows.length).toFixed(1) : '0.0';

    res.json({
      usn,
      availableSemesters,
      selectedSemester: semester || (availableSemesters.length > 0 ? availableSemesters[0] : null),
      records: rows,
      summary: {
        totalCredits,
        totalCreditPoints,
        sgpa: parseFloat(sgpa),
        avgAttendance: parseFloat(avgAttendance),
        totalSubjects: rows.length
      }
    });
  } catch (err) {
    console.error('Error fetching student academic records:', err);
    res.status(500).json({ message: 'Failed to fetch student grades', error: err.message });
  }
};

// 8. Get Extracurricular Activities for a student + eligible semester range (Option B)
exports.getStudentActivities = async (req, res) => {
  try {
    const usn = req.params.usn?.trim()?.toUpperCase();
    if (!usn) {
      return res.status(400).json({ message: 'USN is required.' });
    }

    // 1. Determine highest enrolled semester (Option B: max semester from enrollments or default to 1)
    const [[maxSemRow]] = await db.query(
      'SELECT COALESCE(MAX(semester), 1) AS maxSemester FROM student_course_enrollments WHERE UPPER(usn) = ?',
      [usn]
    );

    const maxSem = maxSemRow?.maxSemester || 1;
    // Eligible semesters from 1 to maxSem
    const eligibleSemesters = [];
    for (let s = 1; s <= maxSem; s++) {
      eligibleSemesters.push(s);
    }

    // 2. Fetch existing activities for this student
    const [activities] = await db.query(
      `SELECT id, usn, semester, category, other_category_title, title,
              organizer, event_date, certificate_url, created_at
       FROM student_extracurricular_activities
       WHERE UPPER(usn) = ?
       ORDER BY semester DESC, created_at DESC`,
      [usn]
    );

    res.json({
      usn,
      maxSemester: maxSem,
      eligibleSemesters,
      activities
    });
  } catch (err) {
    console.error('Error fetching extracurricular activities:', err);
    res.status(500).json({ message: 'Failed to fetch extracurricular activities', error: err.message });
  }
};

// 9. Upload / Add a new Extracurricular Activity
exports.addStudentActivity = async (req, res) => {
  try {
    const usn = req.params.usn?.trim()?.toUpperCase();
    const {
      semester,
      category,
      otherCategoryTitle,
      title,
      organizer,
      eventDate,
      certificateUrl
    } = req.body;

    if (!usn) {
      return res.status(400).json({ message: 'USN is required.' });
    }
    if (!semester || !category || !title || !certificateUrl) {
      return res.status(400).json({
        message: 'Semester, category, activity title, and certificate image are mandatory.'
      });
    }

    if (category === 'Others' && !otherCategoryTitle?.trim()) {
      return res.status(400).json({
        message: 'Please specify the custom category name for "Others".'
      });
    }

    // Verify semester is within eligible range (Option B)
    const [[maxSemRow]] = await db.query(
      'SELECT COALESCE(MAX(semester), 1) AS maxSemester FROM student_course_enrollments WHERE UPPER(usn) = ?',
      [usn]
    );
    const maxAllowed = maxSemRow?.maxSemester || 1;
    if (parseInt(semester, 10) > maxAllowed) {
      return res.status(400).json({
        message: `Invalid semester: You can only upload achievements up to your current enrolled semester (${maxAllowed}).`
      });
    }

    const [insertResult] = await db.query(`
      INSERT INTO student_extracurricular_activities (
        usn, semester, category, other_category_title,
        title, organizer, event_date, certificate_url
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      usn,
      parseInt(semester, 10),
      category,
      category === 'Others' ? otherCategoryTitle.trim() : null,
      title.trim(),
      organizer ? organizer.trim() : null,
      eventDate || null,
      certificateUrl
    ]);

    const [[newRecord]] = await db.query(
      `SELECT id, usn, semester, category, other_category_title, title,
              organizer, event_date, certificate_url, created_at
       FROM student_extracurricular_activities
       WHERE id = ?`,
      [insertResult.insertId]
    );

    res.status(201).json({
      message: 'Extracurricular achievement submitted successfully!',
      activity: newRecord
    });
  } catch (err) {
    console.error('Error adding extracurricular activity:', err);
    res.status(500).json({ message: 'Failed to record extracurricular activity', error: err.message });
  }
};

// 10. Faculty sends a message to all students or selected USNs
exports.sendFacultyMessage = async (req, res) => {
  let connection;
  try {
    await ensureFacultyMessagesTable();
    const facultyId = (req.body.facultyId || req.body.faculty_id || '').trim();
    const facultyName = (req.body.facultyName || req.body.faculty_name || '').trim();
    const department = (req.body.department || '').trim();
    const subject = (req.body.subject || '').trim();
    const body = (req.body.body || '').trim();
    const recipientMode = req.body.recipientMode === 'selected' ? 'selected' : 'all';
    const recipients = Array.isArray(req.body.recipients)
      ? [...new Set(req.body.recipients.map((usn) => String(usn).trim().toUpperCase()).filter(Boolean))]
      : [];

    if (!facultyId || !body) {
      return res.status(400).json({ message: 'Faculty ID and message body are required.' });
    }
    if (recipientMode === 'selected' && recipients.length === 0) {
      return res.status(400).json({ message: 'Select at least one student USN.' });
    }

    connection = await db.getConnection();
    await connection.beginTransaction();
    const insertedIds = [];

    if (recipientMode === 'all') {
      const [result] = await connection.query(
        `INSERT INTO faculty_messages
         (faculty_id, faculty_name, department, subject, body, recipient_usn, recipient_mode)
         VALUES (?, ?, ?, ?, ?, NULL, 'all')`,
        [facultyId, facultyName, department, subject, body]
      );
      insertedIds.push(result.insertId);
    } else {
      for (const usn of recipients) {
        const [result] = await connection.query(
          `INSERT INTO faculty_messages
           (faculty_id, faculty_name, department, subject, body, recipient_usn, recipient_mode)
           VALUES (?, ?, ?, ?, ?, ?, 'selected')`,
          [facultyId, facultyName, department, subject, body, usn]
        );
        insertedIds.push(result.insertId);
      }
    }

    await connection.commit();
    res.status(201).json({
      message: 'Message sent successfully.',
      recipientMode,
      recipients,
      messageIds: insertedIds
    });
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('Error sending faculty message:', err);
    res.status(500).json({ message: 'Failed to send faculty message.', error: err.message });
  } finally {
    if (connection) connection.release();
  }
};

// 11. Faculty sent-message history
exports.getFacultyMessages = async (req, res) => {
  try {
    await ensureFacultyMessagesTable();
    const facultyId = req.params.faculty_id?.trim();
    if (!facultyId) {
      return res.status(400).json({ message: 'Faculty ID is required.' });
    }

    const [rows] = await db.query(
      `SELECT id, faculty_id, faculty_name, department, subject, body,
              recipient_usn, recipient_mode, is_read, sent_at
       FROM faculty_messages
       WHERE faculty_id = ?
       ORDER BY sent_at DESC, id DESC
       LIMIT 100`,
      [facultyId]
    );

    const grouped = new Map();
    rows.forEach((row) => {
      const key =
        row.recipient_mode === 'all'
          ? `${row.sent_at}-${row.subject}-${row.body}`
          : `${row.sent_at}-${row.subject}-${row.body}-${row.recipient_mode}`;
      if (!grouped.has(key)) {
        grouped.set(key, {
          id: row.id,
          subject: row.subject,
          body: row.body,
          recipientMode: row.recipient_mode,
          recipients: [],
          sentAt: row.sent_at
        });
      }
      if (row.recipient_usn) {
        grouped.get(key).recipients.push(row.recipient_usn);
      }
    });

    res.json({ messages: [...grouped.values()] });
  } catch (err) {
    console.error('Error fetching faculty messages:', err);
    res.status(500).json({ message: 'Failed to fetch sent messages.', error: err.message });
  }
};

// 12. Student notification inbox
exports.getStudentMessages = async (req, res) => {
  try {
    await ensureFacultyMessagesTable();
    const usn = req.params.usn?.trim()?.toUpperCase();
    if (!usn) {
      return res.status(400).json({ message: 'USN is required.' });
    }

    const [rows] = await db.query(
      `SELECT fm.id, fm.faculty_id, fm.faculty_name, fm.department, fm.subject, fm.body,
              fm.recipient_usn, fm.recipient_mode, fm.sent_at,
              EXISTS (
                SELECT 1 FROM faculty_message_reads fmr
                WHERE fmr.message_id = fm.id AND fmr.usn = ?
              ) AS is_read
       FROM faculty_messages fm
       WHERE fm.recipient_mode = 'all'
          OR fm.recipient_usn = ?
       ORDER BY fm.sent_at DESC, fm.id DESC
       LIMIT 100`,
      [usn, usn]
    );
    res.json({ usn, messages: rows });
  } catch (err) {
    console.error('Error fetching student messages:', err);
    res.status(500).json({ message: 'Failed to fetch student notifications.', error: err.message });
  }
};

exports.markStudentMessageRead = async (req, res) => {
  try {
    await ensureFacultyMessagesTable();
    const usn = req.params.usn?.trim()?.toUpperCase();
    const messageId = parseInt(req.params.message_id, 10);
    if (!usn || !messageId) {
      return res.status(400).json({ message: 'USN and message ID are required.' });
    }

    const [eligible] = await db.query(
      `SELECT id FROM faculty_messages
       WHERE id = ? AND (recipient_mode = 'all' OR recipient_usn = ?)`,
      [messageId, usn]
    );
    if (eligible.length === 0) {
      return res.status(404).json({ message: 'Notification not found.' });
    }
    await db.query(
      `INSERT INTO faculty_message_reads (message_id, usn)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE read_at = CURRENT_TIMESTAMP`,
      [messageId, usn]
    );
    res.json({ message: 'Notification marked as read.' });
  } catch (err) {
    console.error('Error marking notification read:', err);
    res.status(500).json({ message: 'Failed to update notification.', error: err.message });
  }
};
