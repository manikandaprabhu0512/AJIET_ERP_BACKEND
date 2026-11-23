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

// Student Academic Grades & Attendance Ledger
router.get('/student-grades/:usn', academicController.getStudentGrades);

module.exports = router;
