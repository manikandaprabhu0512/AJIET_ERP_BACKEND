const express = require('express');
const router = express.Router();
const academicController = require('../controllers/academicController');

// HOD & Department Endpoints
router.get('/overview', academicController.getDepartmentOverview);
router.get('/faculties', academicController.getFaculties);
router.get('/subjects', academicController.getSubjects);
router.get('/curriculum-schemes', academicController.getCurriculumSchemes);
router.get('/curriculum-subjects', academicController.getCurriculumSubjects);
router.post('/curriculum-subjects', academicController.createCurriculumSubject);
router.get('/allocations', academicController.getAllocations);
router.post('/allocate', academicController.saveAllocations);
router.get('/subject-allotments', academicController.getSubjectAllotments);
router.post('/subject-allotments', academicController.createSubjectAllotment);

// Faculty Specific Endpoints
router.get('/faculty-subjects', academicController.getFacultyAssignedSubjects);
router.get('/faculty-subjects/:faculty_id', academicController.getFacultyAssignedSubjects);

// Student Academic Grades & Attendance Ledger
router.get('/student-grades/:usn', academicController.getStudentGrades);

// Student Extracurricular Activities (Tab 3)
router.get('/student-activities/:usn', academicController.getStudentActivities);
router.post('/student-activities/:usn', academicController.addStudentActivity);

module.exports = router;
