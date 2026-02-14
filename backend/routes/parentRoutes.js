const express = require('express');
const auth = require('../middleware/auth');
const role = require('../middleware/role');
const { ROLES } = require('../config/constants');
const parent = require('../controllers/parentController');

const router = express.Router();

router.use(auth, role(ROLES.PARENT));

router.get('/dashboard', parent.dashboard);
router.get('/profile', parent.profile);
router.put('/profile', parent.updateProfile);
router.get('/children', parent.children);
router.get('/attendance/:studentId', parent.attendance);
router.get('/performance/:studentId', parent.performance);
router.get('/fees/:studentId', parent.fees);
router.get('/notifications', parent.notifications);

module.exports = router;

