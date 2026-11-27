const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');
const verifyToken = require('../middleware/auth');

// HOD & Department Endpoints
router.get('/overview', academicController.getDepartmentOverview);
router.get('/faculties', academicController.getFaculties);
router.get('/hod/students', verifyToken, academicController.getHodStudents);
router.get('/subjects', academicController.getSubjects);
router.get('/curriculum-schemes', academicController.getCurriculumSchemes);
router.get('/curriculum-subjects', academicController.getCurriculumSubjects);
router.post('/curriculum-subjects', academicController.createCurriculumSubject);
router.get('/allocations', academicController.getAllocations);
router.post('/allocate', academicController.saveAllocations);
router.get('/subject-allotments', academicController.getSubjectAllotments);
router.post('/subject-allotments', academicController.createSubjectAllotment);

// Faculty Specific Endpoints
router.get('/faculty-subjects', verifyToken, academicController.getFacultyAssignedSubjects);
router.get('/faculty-subjects/:faculty_id', verifyToken, academicController.getFacultyAssignedSubjects);
router.get('/faculty-subject-roster', verifyToken, academicController.getFacultySubjectRoster);
router.post('/faculty-attendance', verifyToken, academicController.submitFacultyAttendance);
router.post('/faculty-ia-marks', verifyToken, academicController.submitFacultyIaMarks);

// Student Academic Grades & Attendance Ledger
router.get('/student-grades/:usn', verifyToken, academicController.getStudentGrades);

// Student Extracurricular Activities (Tab 3)
router.get('/student-activities/:usn', academicController.getStudentActivities);
router.post('/student-activities/:usn', academicController.addStudentActivity);

// Faculty Messages & Student Notifications
router.post('/messages', academicController.sendFacultyMessage);
router.get('/messages/faculty/:faculty_id', academicController.getFacultyMessages);
router.get('/messages/student/:usn', academicController.getStudentMessages);
router.post('/messages/:message_id/read/:usn', academicController.markStudentMessageRead);

module.exports = router;
