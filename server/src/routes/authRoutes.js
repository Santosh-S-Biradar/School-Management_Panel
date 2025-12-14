import express from 'express';
import { 
  login, 
  registerAdmin, 
  getProfile, 
  registerTeacher, 
  registerStudent,
  adminCreateUser 
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register-admin', registerAdmin); // optional
router.get('/me', protect(), getProfile);
router.post('/register-teacher', protect(['admin']), registerTeacher);
router.post('/register-student', protect(['admin']), registerStudent);
router.post('/create-user', protect(['admin']), adminCreateUser);

export default router;
