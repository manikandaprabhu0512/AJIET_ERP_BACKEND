const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, username: user.username, role: user.role, email: user.email },
    process.env.JWT_SECRET || 'ajiet_super_secret_jwt_key_2026_secure',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// 1. Register a new student
exports.registerStudent = async (req, res) => {
  let connection;
  try {
    const data = req.body;
    const usn = data.usn?.trim()?.toUpperCase();
    const email = data.email?.trim()?.toLowerCase();
    const abcId = typeof data.abcId === 'string' ? data.abcId.trim() : '';
    const rawPassword = data.password || usn; // Defaults to USN as initial password

    if (!usn || !email || !data.fullName) {
      return res.status(400).json({ message: 'USN, Email, and Student Name are required.' });
    }
    if (abcId && !/^\d{12}$/.test(abcId)) {
      return res.status(400).json({ message: 'ABC ID must be exactly 12 digits when provided.' });
    }

    // Check if USN or Email already registered
    const [existingUsers] = await db.query(
      'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
      [usn, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ message: 'A student with this USN or Email is already registered.' });
    }

    if (abcId) {
      const [existingAbcId] = await db.query(
        'SELECT user_id FROM student_profiles WHERE abc_id = ? LIMIT 1',
        [abcId]
      );
      if (existingAbcId.length > 0) {
        return res.status(409).json({ message: 'This ABC ID is already registered.' });
      }
    }

    connection = await db.getConnection();
    await connection.beginTransaction();

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(rawPassword, salt);

    // Insert into users table
    const [userResult] = await connection.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES (?, ?, ?, 'student')`,
      [usn, email, passwordHash]
    );

    const newUserId = userResult.insertId;

    // Insert into student_profiles table
    await connection.query(
      `INSERT INTO student_profiles (
        user_id, usn, full_name, email, mobile_country_code, mobile, branch, section,
        current_semester, academic_year,
        enrolled_year, program_type, admission_quota, dob, gender, blood_group, religion,
        caste, category, aadhaar_number, place_of_stay, student_ssid,
        sslc_percentage, studied_kannada_in_sslc, puc_pcm_percentage, diploma_percentage, ug_cgpa, puc_total_percentage, abc_id,
        address_line1, city, district, state, pincode, pg_owner_name, pg_contact_country_code,
        pg_contact_number, pg_address, father_name, father_occupation, father_mobile_country_code,
        father_mobile, mother_name, mother_occupation, mother_mobile_country_code, mother_mobile,
        declaration_accepted
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
        ?,
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      )`,
      [
        newUserId,
        usn,
        data.fullName,
        email,
        data.mobileCountryCode || '+91',
        data.mobile || '',
        data.branch || '',
        data.section || 'Section A',
        data.currentSemester || 'Semester 1',
        data.academicYear || '2026-27',
        data.enrolledYear || '2026',
        data.programType || 'UG',
        data.admissionQuota || 'CET',
        data.dob || null,
        data.gender || '',
        data.bloodGroup || '',
        data.religion || '',
        data.caste || '',
        data.category || '',
        data.aadhaarNumber || '',
        data.placeOfStay || '',
        data.studentSsid || '',
        parseFloat(data.sslcPercentage) || null,
        data.studiedKannadaInSSLC || 'Yes',
        parseFloat(data.pucPcmPercentage) || null,
        parseFloat(data.diplomaPercentage) || null,
        data.ugCgpa ? Number(data.ugCgpa) : null,
        parseFloat(data.pucTotalPercentage) || null,
        abcId || null,
        data.addressLine1 || '',
        data.city || '',
        data.district || '',
        data.state || 'Karnataka',
        data.pincode || '',
        data.pgOwnerName || '',
        data.pgContactCountryCode || '+91',
        data.pgContactNumber || '',
        data.pgAddress || '',
        data.fatherName || '',
        data.fatherOccupation || '',
        data.fatherMobileCountryCode || '+91',
        data.fatherMobile || '',
        data.motherName || '',
        data.motherOccupation || '',
        data.motherMobileCountryCode || '+91',
        data.motherMobile || '',
        data.declarationAccepted !== false
      ]
    );

    await connection.commit();

    const newUser = {
      id: newUserId,
      username: usn,
      email,
      role: 'student'
    };

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Student registration completed successfully.',
      token,
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        role: newUser.role,
        fullName: data.fullName,
        branch: data.branch
      }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error('Registration error:', error);
    if (
      error.code === 'ER_DUP_ENTRY' &&
      error.message.includes('unique_student_abc_id')
    ) {
      return res.status(409).json({ message: 'This ABC ID is already registered.' });
    }
    res.status(500).json({ message: 'Internal server error during registration.', error: error.message });
  } finally {
    if (connection) connection.release();
  }
};

// 2. User login (Student USN / Faculty ID / HOD ID)
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const cleanUsername = username?.trim()?.toUpperCase();

    if (!cleanUsername || !password) {
      return res.status(400).json({ message: 'Identifier and Password are required.' });
    }

    // A. Check student users table first
    const [userRows] = await db.query(
      `SELECT u.id, u.username, u.email, u.password_hash, u.role, u.is_first_login,
              sp.full_name AS student_full_name, sp.branch, sp.section,
              sp.current_semester, sp.academic_year,
              fp.title AS faculty_title, fp.full_name AS faculty_full_name,
              fp.department AS faculty_department, fp.designation AS faculty_designation
       FROM users u
       LEFT JOIN student_profiles sp ON u.id = sp.user_id
       LEFT JOIN faculty_profiles fp ON u.id = fp.user_id
       WHERE UPPER(u.username) = ?
       LIMIT 1`,
      [cleanUsername]
    );

    if (userRows.length > 0) {
      const user = userRows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
      }

      const token = generateToken(user);
      const requiresFirstTimeFlow = Boolean(user.is_first_login);

      return res.json({
        message: 'Login successful.',
        token,
        requiresFirstTimeFlow,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
          category: user.role === 'faculty' ? 'faculty' : user.role,
          isFirstLogin: requiresFirstTimeFlow,
          name: user.role === 'faculty'
            ? `${user.faculty_title || ''} ${user.faculty_full_name || user.username}`.trim()
            : user.student_full_name || user.username,
          department: user.faculty_department || '',
          deptName: user.faculty_department || '',
          designation: user.faculty_designation || '',
          branch: user.branch || '',
          section: user.section || '',
          currentSemester: user.current_semester || 'Semester 1',
          academicYear: user.academic_year || '2026-27'
        }
      });
    }

    // B. Check faculty / HOD table
    const [facultyRows] = await db.query(
      `SELECT f.faculty_id, f.name, f.dept_code, f.designation, f.email, f.password_hash,
              f.is_hod, f.is_first_login, d.dept_name
       FROM faculty f
       JOIN departments d ON f.dept_code = d.dept_code
       WHERE UPPER(f.faculty_id) = ?
       LIMIT 1`,
      [cleanUsername]
    );

    if (facultyRows.length > 0) {
      const faculty = facultyRows[0];
      const isPasswordValid = await bcrypt.compare(password, faculty.password_hash);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Invalid credentials. Incorrect password.' });
      }

      const role = faculty.is_hod ? 'hod' : 'faculty';
      const userPayload = {
        id: faculty.faculty_id,
        username: faculty.faculty_id,
        email: faculty.email,
        role: role
      };

      const token = generateToken(userPayload);
      const requiresFirstTimeFlow = Boolean(faculty.is_first_login);

      return res.json({
        message: 'Login successful.',
        token,
        requiresFirstTimeFlow,
        user: {
          id: faculty.faculty_id,
          username: faculty.faculty_id,
          email: faculty.email,
          role: role, // 'hod' or 'faculty'
          subRole: faculty.is_hod ? 'HOD' : 'Subject Teacher',
          category: faculty.is_hod ? 'department' : 'faculty',
          isHod: faculty.is_hod,
          isFirstLogin: requiresFirstTimeFlow,
          name: faculty.name,
          designation: faculty.designation,
          deptCode: faculty.dept_code,
          deptName: faculty.dept_name
        }
      });
    }

    return res.status(401).json({ message: 'Invalid credentials. User not found.' });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login.', error: error.message });
  }
};

// 3. Update password (for first-time change or reset)
exports.updatePassword = async (req, res) => {
  try {
    const { username, newPassword } = req.body;
    const cleanUsername = username?.trim()?.toUpperCase();

    if (!cleanUsername || !newPassword) {
      return res.status(400).json({ message: 'Username and new password are required.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Try updating student user first
    const [userResult] = await db.query(
      'UPDATE users SET password_hash = ?, is_first_login = FALSE WHERE UPPER(username) = ?',
      [passwordHash, cleanUsername]
    );

    if (userResult.affectedRows > 0) {
      return res.json({ message: 'Password updated successfully.' });
    }

    // Try updating faculty user
    const [facultyResult] = await db.query(
      'UPDATE faculty SET password_hash = ?, is_first_login = FALSE WHERE UPPER(faculty_id) = ?',
      [passwordHash, cleanUsername]
    );

    if (facultyResult.affectedRows > 0) {
      return res.json({ message: 'Password updated successfully.' });
    }

    return res.status(404).json({ message: 'User not found.' });
  } catch (error) {
    console.error('Update password error:', error);
    res.status(500).json({ message: 'Failed to update password.', error: error.message });
  }
};

// 3. Get currently authenticated student profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await db.query(
      'SELECT * FROM student_profiles WHERE user_id = ? LIMIT 1',
      [userId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found.' });
    }

    res.json({ profile: rows[0] });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ message: 'Failed to fetch student profile.', error: error.message });
  }
};
