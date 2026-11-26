const pool = require('./src/config/db');

const deptCode = 'EC';
const schemeYears = ['21', '25'];
const semesters = [2, 3, 4];
const categoryDefaults = [
  { category: 'PCC', teachingHours: 4, credits: 4 },
  { category: 'IPCC', teachingHours: 5, credits: 4 },
  { category: 'LAB', teachingHours: 3, credits: 1 },
  { category: 'Ability Enhancement', teachingHours: 2, credits: 2 },
  { category: 'Non-Credit', teachingHours: 1, credits: 0 },
];

async function seedCurriculumDummyData() {
  let connection;
  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    let insertedCount = 0;
    let existingCount = 0;

    for (const schemeYear of schemeYears) {
      await connection.query(
        `INSERT INTO curriculum_schemes (dept_code, scheme_year)
         VALUES (?, ?)
         ON DUPLICATE KEY UPDATE scheme_year = VALUES(scheme_year)`,
        [deptCode, schemeYear]
      );

      for (const semester of semesters) {
        const [existingSubjects] = await connection.query(
          `SELECT subject_number, subject_category
           FROM curriculum_subjects
           WHERE dept_code = ? AND scheme_year = ? AND semester = ?`,
          [deptCode, schemeYear, semester]
        );
        const existingCategories = new Set(
          existingSubjects.map((subject) => subject.subject_category)
        );
        const usedNumbers = new Set(
          existingSubjects.map((subject) => Number(subject.subject_number))
        );

        for (const item of categoryDefaults) {
          if (existingCategories.has(item.category)) {
            existingCount += 1;
            continue;
          }

          const subjectNumber = Array.from({ length: 9 }, (_, index) => index + 1)
            .find((number) => !usedNumbers.has(number));
          if (!subjectNumber) {
            throw new Error(
              `No subject number is available for Scheme ${schemeYear}, Semester ${semester}.`
            );
          }

          const subjectCode = `${schemeYear}${deptCode}${semester}${subjectNumber}`;
          const subjectName =
            `Sample ${item.category} Subject - Semester ${semester} (Scheme ${schemeYear})`;

          await connection.query(
            `INSERT INTO curriculum_subjects
               (dept_code, scheme_year, semester, subject_number, subject_code,
                subject_name, subject_category, teaching_hours, credits)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
              deptCode,
              schemeYear,
              semester,
              subjectNumber,
              subjectCode,
              subjectName,
              item.category,
              item.teachingHours,
              item.credits,
            ]
          );
          existingCategories.add(item.category);
          usedNumbers.add(subjectNumber);
          insertedCount += 1;
        }
      }
    }

    await connection.commit();
    console.log(
      `✅ Curriculum dummy data ready: inserted ${insertedCount} subjects; ${existingCount} category entries already existed and were kept.`
    );
  } catch (err) {
    if (connection) await connection.rollback();
    console.error('❌ Curriculum dummy data seeding failed:', err.message);
    process.exitCode = 1;
  } finally {
    if (connection) connection.release();
    await pool.end();
  }
}

seedCurriculumDummyData();
