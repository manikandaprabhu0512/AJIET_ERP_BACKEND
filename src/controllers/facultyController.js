const bcrypt = require('bcryptjs');
const db = require('../config/db');

exports.registerFaculty = async (req, res) => {
  let connection;

  try {
    const data = req.body;
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return res.status(400).json({ message: 'Faculty registration data is required.' });
    }

    const facultyId = typeof data.facultyId === 'string'
      ? data.facultyId.trim().toUpperCase()
      : '';
    const email = typeof data.email === 'string'
      ? data.email.trim().toLowerCase()
      : '';
    const fullName = typeof data.fullName === 'string' ? data.fullName.trim() : '';
    const department = typeof data.department === 'string' ? data.department.trim() : '';
    const designation = typeof data.designation === 'string' ? data.designation.trim() : '';
    const password = typeof data.password === 'string' && data.password.length
      ? data.password
      : facultyId;

    if (!/^[A-Z0-9]{10}$/.test(facultyId)) {
      return res.status(400).json({ message: 'Faculty ID must be exactly 10 alphanumeric characters.' });
    }
    if (!fullName || !department || !designation || !email) {
      return res.status(400).json({
        message: 'Full name, email, department, and designation are required.'
      });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'A valid email address is required.' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Initial password must be at least 8 characters.' });
    }

    const registrationData = { ...data };
    delete registrationData.password;
    registrationData.facultyId = facultyId;
    registrationData.fullName = fullName;
    registrationData.email = email;

    const passwordHash = await bcrypt.hash(password, 10);
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [userResult] = await connection.query(
      `INSERT INTO users (username, email, password_hash, role, is_first_login)
       VALUES (?, ?, ?, 'faculty', TRUE)`,
      [facultyId, email, passwordHash]
    );

    await connection.query(
      `INSERT INTO faculty_profiles (
         user_id, faculty_id, title, full_name, department, designation, registration_data
       ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userResult.insertId,
        facultyId,
        typeof data.title === 'string' ? data.title.trim() : '',
        fullName,
        department,
        designation,
        JSON.stringify(registrationData)
      ]
    );

    await connection.commit();
    return res.status(201).json({
      message: 'Faculty registration completed successfully.',
      user: {
        id: userResult.insertId,
        username: facultyId,
        email,
        role: 'faculty',
        name: `${typeof data.title === 'string' ? data.title.trim() : ''} ${fullName}`.trim(),
        department,
        designation,
        isFirstLogin: true
      }
    });
  } catch (error) {
    if (connection) await connection.rollback();
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        message: 'A faculty account with this Faculty ID or email is already registered.'
      });
    }
    console.error('Faculty registration error:', error);
    return res.status(500).json({ message: 'Unable to save faculty registration.' });
  } finally {
    if (connection) connection.release();
  }
};

exports.getFacultyProfile = async (req, res) => {
  try {
    if (req.user.role !== 'faculty') {
      return res.status(403).json({ message: 'Faculty access is required.' });
    }

    const [rows] = await db.query(
      'SELECT registration_data FROM faculty_profiles WHERE user_id = ? LIMIT 1',
      [req.user.id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Faculty profile not found.' });
    }

    const profile = typeof rows[0].registration_data === 'string'
      ? JSON.parse(rows[0].registration_data)
      : rows[0].registration_data;
    return res.json({ profile });
  } catch (error) {
    console.error('Faculty profile fetch error:', error);
    return res.status(500).json({ message: 'Unable to fetch faculty profile.' });
  }
};
