const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { ROLES } = require('../config/constants');
const admin = require('../controllers/adminController');
const { body } = require('express-validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(auth, role(ROLES.ADMIN));

router.get('/dashboard', admin.dashboardStats);

router.post('/students', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('admissionNo').notEmpty()
], validate, admin.createStudent);
router.get('/students', admin.listStudents);
router.get('/students/:id', admin.getStudent);
router.put('/students/:id', admin.updateStudent);
router.delete('/students/:id', admin.deleteStudent);

router.post('/teachers', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('employeeNo').notEmpty()
], validate, admin.createTeacher);
router.get('/teachers', admin.listTeachers);
router.get('/teachers/:id', admin.getTeacher);
router.put('/teachers/:id', admin.updateTeacher);
router.delete('/teachers/:id', admin.deleteTeacher);

router.post('/parents', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], validate, admin.createParent);
router.get('/parents', admin.listParents);

router.post('/classes', [
  body('name').notEmpty(),
  body('gradeLevel').notEmpty()
], validate, admin.createClass);
router.get('/classes', admin.listClasses);
router.put('/classes/:id', admin.updateClass);
router.delete('/classes/:id', admin.deleteClass);

router.post('/sections', [
  body('classId').isInt(),
  body('name').notEmpty()
], validate, admin.createSection);
router.get('/sections', admin.listSections);
router.put('/sections/:id', admin.updateSection);
router.delete('/sections/:id', admin.deleteSection);

router.post('/subjects', [
  body('name').notEmpty(),
  body('code').notEmpty()
], validate, admin.createSubject);
router.get('/subjects', admin.listSubjects);
router.put('/subjects/:id', admin.updateSubject);
router.delete('/subjects/:id', admin.deleteSubject);

router.post('/teacher-assignments', [
  body('teacherId').isInt(),
  body('classId').isInt(),
  body('sectionId').optional({ nullable: true }).isInt(),
  body('subjectId').isInt()
], validate, admin.assignTeacher);

router.post('/timetables', [
  body('classId').isInt(),
  body('sectionId').optional({ nullable: true }).isInt(),
  body('dayOfWeek').notEmpty(),
  body('startTime').notEmpty(),
  body('endTime').notEmpty(),
  body('entryType').optional().isIn(['lecture', 'break']),
  body('title').optional({ nullable: true }).isString(),
  body('subjectId').optional({ nullable: true }).isInt(),
  body('teacherId').optional({ nullable: true }).isInt()
], validate, admin.createTimetable);
router.get('/timetables/classes', admin.listTimetableClasses);
router.get('/timetables', admin.listTimetables);
router.put('/timetables/:id', admin.updateTimetable);
router.delete('/timetables/:id', admin.deleteTimetable);
router.delete('/timetables/class/:classId', admin.deleteTimetableGroup);

router.post('/exams', [
  body('name').notEmpty(),
  body('startDate').notEmpty(),
  body('endDate').notEmpty()
], validate, admin.createExam);
router.get('/exams', admin.listExams);
router.put('/exams/:id', admin.updateExam);
router.delete('/exams/:id', admin.deleteExam);
router.post('/exam-subjects', [
  body('examId').isInt(),
  body('classId').isInt(),
  body('sectionId').optional({ nullable: true }).isInt(),
  body('subjectId').isInt(),
  body('maxMarks').isInt()
], validate, admin.addExamSubject);
router.get('/exam-subjects', admin.listExamSubjects);
router.delete('/exam-subjects/:id', admin.deleteExamSubject);

router.post('/marks', admin.upsertMarks);

router.post('/fees', [
  body('studentId').isInt(),
  body('amount').isNumeric(),
  body('dueDate').notEmpty()
], validate, admin.createFee);
router.put('/fees/:id', admin.updateFee);
router.get('/fees', admin.listFees);
router.delete('/fees/:id', admin.deleteFee);

router.get('/attendance-overview', admin.attendanceOverview);

router.post('/notifications', [
  body('title').notEmpty(),
  body('message').notEmpty()
], validate, admin.createNotification);
router.put('/notifications/:id', admin.updateNotification);
router.delete('/notifications/:id', admin.deleteNotification);
router.get('/notifications', admin.listNotifications);

router.get('/reports/students', admin.reportStudents);
router.get('/reports/teachers', admin.reportTeachers);

module.exports = router;
