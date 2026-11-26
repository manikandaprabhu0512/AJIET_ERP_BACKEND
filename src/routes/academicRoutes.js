const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');

// HOD & Department Endpoints
router.get('/overview', academicController.getDepartmentOverview);
router.get('/faculties', academicController.getFaculties);
router.get('/subjects', academicController.getSubjects);
router.get('/allocations', academicController.getAllocations);
router.post('/allocate', academicController.saveAllocations);

// Faculty Specific Endpoints
router.get('/faculty-subjects', academicController.getFacultyAssignedSubjects);
router.get('/faculty-subjects/:faculty_id', academicController.getFacultyAssignedSubjects);
router.get('/faculty-subject-roster', academicController.getFacultySubjectRoster);

// Student Academic Grades & Attendance Ledger
router.get('/student-grades/:usn', academicController.getStudentGrades);

// Student Extracurricular Activities (Tab 3)
router.get('/student-activities/:usn', academicController.getStudentActivities);
router.post('/student-activities/:usn', academicController.addStudentActivity);

// Faculty Messages & Student Notifications
router.post('/messages', academicController.sendFacultyMessage);
router.get('/messages/faculty/:faculty_id', academicController.getFacultyMessages);
router.get('/messages/student/:usn', academicController.getStudentMessages);
router.post('/messages/:message_id/read/:usn', academicController.markStudentMessageRead);

module.exports = router;
