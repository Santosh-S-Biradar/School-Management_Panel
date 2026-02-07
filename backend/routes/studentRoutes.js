const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { ROLES } = require('../config/constants');
const student = require('../controllers/studentController');

const router = express.Router();

router.use(auth, role(ROLES.STUDENT));

router.get('/dashboard', student.dashboard);
router.get('/profile', student.profile);
router.get('/timetable', student.timetable);
router.get('/attendance', student.attendance);
router.get('/assignments', student.assignments);
router.get('/marks', student.marks);
router.get('/materials', student.materials);
router.get('/notifications', student.notifications);

module.exports = router;
