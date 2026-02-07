const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const validate = require('../middleware/validate');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login', [
  body('email').isEmail(),
  body('password').isLength({ min: 6 }),
  body('role').optional().isIn(['admin', 'teacher', 'student', 'parent'])
], validate, authController.login);

router.get('/me', auth, authController.me);

router.post('/forgot-password', [
  body('email').isEmail()
], validate, authController.forgotPassword);

router.post('/reset-password', [
  body('email').isEmail(),
  body('token').notEmpty(),
  body('password').isLength({ min: 6 })
], validate, authController.resetPassword);

module.exports = router;
