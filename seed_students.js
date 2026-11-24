const bcrypt = require('bcryptjs');
const db = require('./src/config/db');

const studentsData = [
  {
    usn: '4JK25EC001',
    name: 'Aarav Sharma',
    gender: 'Male',
    email: 'aarav.sharma@ajiet.ac.in',
    mobile: '9845000001',
    dob: '2004-03-12',
    bloodGroup: 'O+',
    father: 'Rajesh Sharma',
    mother: 'Sunita Sharma'
  },
  {
    usn: '4JK25EC002',
    name: 'Priya Nair',
    gender: 'Female',
    email: 'priya.nair@ajiet.ac.in',
    mobile: '9845000002',
    dob: '2004-06-25',
    bloodGroup: 'A+',
    father: 'Suresh Nair',
    mother: 'Radha Nair'
  },
  {
    usn: '4JK25EC003',
    name: 'Rohan Patel',
    gender: 'Male',
    email: 'rohan.patel@ajiet.ac.in',
    mobile: '9845000003',
    dob: '2004-01-18',
    bloodGroup: 'B+',
    father: 'Dinesh Patel',
    mother: 'Bhavna Patel'
  },
  {
    usn: '4JK25EC004',
    name: 'Sneha Reddy',
    gender: 'Female',
    email: 'sneha.reddy@ajiet.ac.in',
    mobile: '9845000004',
    dob: '2004-08-30',
    bloodGroup: 'AB+',
    father: 'Venkat Reddy',
    mother: 'Laxmi Reddy'
  },
  {
    usn: '4JK25EC005',
    name: 'Karthik Iyer',
    gender: 'Male',
    email: 'karthik.iyer@ajiet.ac.in',
    mobile: '9845000005',
    dob: '2004-11-14',
    bloodGroup: 'O+',
    father: 'Subramanian Iyer',
    mother: 'Gayatri Iyer'
  },
  {
    usn: '4JK25EC006',
    name: 'Ananya Gupta',
    gender: 'Female',
    email: 'ananya.gupta@ajiet.ac.in',
    mobile: '9845000006',
    dob: '2004-04-22',
    bloodGroup: 'A+',
    father: 'Manoj Gupta',
    mother: 'Ritu Gupta'
  },
  {
    usn: '4JK25EC007',
    name: 'Vikram Singh',
    gender: 'Male',
    email: 'vikram.singh@ajiet.ac.in',
    mobile: '9845000007',
    dob: '2004-09-05',
    bloodGroup: 'B+',
    father: 'Harinder Singh',
    mother: 'Gurpreet Kaur'
  },
  {
    usn: '4JK25EC008',
    name: 'Meera Joshi',
    gender: 'Female',
    email: 'meera.joshi@ajiet.ac.in',
    mobile: '9845000008',
    dob: '2004-07-19',
    bloodGroup: 'O-',
    father: 'Arun Joshi',
    mother: 'Shalini Joshi'
  },
  {
    usn: '4JK25EC009',
    name: 'Arjun Menon',
    gender: 'Male',
    email: 'arjun.menon@ajiet.ac.in',
    mobile: '9845000009',
    dob: '2004-12-03',
    bloodGroup: 'A-',
    father: 'Madhavan Menon',
    mother: 'Shobha Menon'
  },
  {
    usn: '4JK25EC010',
    name: 'Divya Kulkarni',
    gender: 'Female',
    email: 'divya.kulkarni@ajiet.ac.in',
    mobile: '9845000010',
    dob: '2004-02-28',
    bloodGroup: 'B+',
    father: 'Prabhakar Kulkarni',
    mother: 'Anjali Kulkarni'
  }
];

async function seedStudents() {
  console.log('--- Starting Student Seeding for 10 EC Students (4JK25EC001 - 4JK25EC010) ---');

  for (const s of studentsData) {
    const passwordHash = await bcrypt.hash(s.usn, 10);

    // 1. Check or Insert into users table
    const [existing] = await db.query('SELECT id FROM users WHERE username = ?', [s.usn]);
    let userId;

    if (existing.length > 0) {
      userId = existing[0].id;
      await db.query(
        'UPDATE users SET password_hash = ?, is_first_login = TRUE, email = ? WHERE id = ?',
        [passwordHash, s.email, userId]
      );
      console.log(`Updated user auth for: ${s.usn}`);
    } else {
      const [insertRes] = await db.query(
        'INSERT INTO users (username, email, password_hash, role, is_first_login) VALUES (?, ?, ?, ?, TRUE)',
        [s.usn, s.email, passwordHash, 'student']
      );
      userId = insertRes.insertId;
      console.log(`Created user auth for: ${s.usn} (User ID: ${userId})`);
    }

    // 2. Insert or update student_profiles
    const [existingProfile] = await db.query('SELECT id FROM student_profiles WHERE usn = ?', [s.usn]);

    if (existingProfile.length > 0) {
      await db.query(
        `UPDATE student_profiles SET
          full_name = ?, email = ?, mobile = ?, branch = ?, section = ?, enrolled_year = ?,
          program_type = 'UG', admission_quota = 'CET', dob = ?, gender = ?, blood_group = ?,
          religion = 'Hindu', caste = 'General', category = 'General Merit (GM)',
          place_of_stay = 'Hostel',
          state = 'Karnataka', district = 'Dakshina Kannada', city = 'Mangaluru', pincode = '575006',
          father_name = ?, mother_name = ?
         WHERE usn = ?`,
        [
          s.name, s.email, s.mobile, 'B.E. in Electronics & Communication Engineering',
          'Section A', '2025', s.dob, s.gender, s.bloodGroup, s.father, s.mother, s.usn
        ]
      );
      console.log(`Updated student profile for: ${s.usn} (${s.name})`);
    } else {
      await db.query(
        `INSERT INTO student_profiles (
          user_id, usn, full_name, email, mobile_country_code, mobile,
          branch, section, enrolled_year, program_type, admission_quota,
          dob, gender, blood_group, religion, caste, category,
          place_of_stay, state, district, city, pincode,
          father_name, mother_name, declaration_accepted
        ) VALUES (
          ?, ?, ?, ?, '+91', ?,
          'B.E. in Electronics & Communication Engineering', 'Section A', '2025', 'UG', 'CET',
          ?, ?, ?, 'Hindu', 'General', 'General Merit (GM)',
          'Hostel', 'Karnataka', 'Dakshina Kannada', 'Mangaluru', '575006',
          ?, ?, true
        )`,
        [
          userId, s.usn, s.name, s.email, s.mobile,
          s.dob, s.gender, s.bloodGroup, s.father, s.mother
        ]
      );
      console.log(`Created student profile for: ${s.usn} (${s.name})`);
    }
  }

  console.log('--- All 10 Student Profiles Seeded Successfully ---');
  process.exit(0);
}

seedStudents().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
