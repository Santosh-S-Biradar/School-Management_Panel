const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { ROLES } = require('../config/constants');
const teacher = require('../controllers/teacherController');

const router = express.Router();

router.use(auth, role(ROLES.TEACHER));

router.get('/dashboard', teacher.dashboard);
router.get('/assigned-classes', teacher.assignedClasses);
router.get('/timetable', teacher.timetable);
router.get('/exams', teacher.listExams);
router.get('/exam-subjects', teacher.listExamSubjects);
router.get('/marks-sheet', teacher.marksSheet);
router.get('/students', teacher.listStudentsByClass);
router.post('/attendance', teacher.markAttendance);
router.post('/assignments', teacher.uploadAssignment);
router.post('/materials', teacher.uploadMaterial);
router.post('/marks', teacher.enterMarks);
router.get('/performance/:studentId', teacher.studentPerformance);
router.get('/notifications', teacher.notifications);

module.exports = router;
