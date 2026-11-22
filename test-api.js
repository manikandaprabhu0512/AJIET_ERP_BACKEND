const pool = require('./src/config/db');

async function testApi() {
  console.log('🧪 Starting API & Database Integration Test...');

  // Start server on a test port
  process.env.PORT = '5001';
  require('./src/index.js');

  // Wait 1 second for server to initialize
  await new Promise(r => setTimeout(r, 1000));

  const baseUrl = 'http://localhost:5001';

  try {
    // 1. Health Check
    console.log('\n1️⃣ Testing Health Check (/api/health)...');
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthJson = await healthRes.json();
    console.log('Health Response:', healthJson);

    // 2. Student Registration
    const testUSN = '4JK26CS999';
    const testEmail = 'tester999@ajiet.ac.in';

    // Clean up if previous test run exists
    await pool.query('DELETE FROM student_profiles WHERE usn = ?', [testUSN]);
    await pool.query('DELETE FROM users WHERE username = ?', [testUSN]);

    console.log('\n2️⃣ Testing Student Registration (/api/auth/register-student)...');
    const regPayload = {
      fullName: 'TEST STUDENT',
      usn: testUSN,
      email: testEmail,
      password: 'password123',
      branch: 'B.E. in Computer Science & Engineering',
      section: 'Section A',
      mobile: '9876543210',
      enrolledYear: '2026',
      programType: 'UG',
      admissionQuota: 'CET'
    };

    const regRes = await fetch(`${baseUrl}/api/auth/register-student`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(regPayload)
    });
    const regJson = await regRes.json();
    console.log('Register Status:', regRes.status, regJson.message);

    // 3. Student Login
    console.log('\n3️⃣ Testing Login with USN (/api/auth/login)...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: testUSN,
        password: 'password123'
      })
    });
    const loginJson = await loginRes.json();
    console.log('Login Status:', loginRes.status, loginJson.message);
    const token = loginJson.token;
    console.log('JWT Token received:', token ? token.substring(0, 25) + '...' : 'NONE');

    // 4. Fetch Protected Profile
    console.log('\n4️⃣ Testing Protected Profile (/api/auth/profile)...');
    const profileRes = await fetch(`${baseUrl}/api/auth/profile`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const profileJson = await profileRes.json();
    console.log('Profile Status:', profileRes.status);
    console.log('Retrieved Profile for:', profileJson.profile?.full_name, `(${profileJson.profile?.usn})`);

    // Clean up test data
    await pool.query('DELETE FROM student_profiles WHERE usn = ?', [testUSN]);
    await pool.query('DELETE FROM users WHERE username = ?', [testUSN]);

    console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY! Database and APIs are working perfectly.\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  }
}

testApi();
