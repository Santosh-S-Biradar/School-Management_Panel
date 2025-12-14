import express from 'express';
import { 
  getTeachers, 
  createTeacher, 
  updateTeacher, 
  deleteTeacher,
  getOwnTeacherProfile,
  updateOwnTeacherProfile
} from '../controllers/teacherController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin CRUD
router.get('/', protect(['admin']), getTeachers);
router.post('/', protect(['admin']), createTeacher);
router.put('/:id', protect(['admin']), updateTeacher);
router.delete('/:id', protect(['admin']), deleteTeacher);

// Teacher self-profile
router.get('/me/profile', protect(['teacher']), getOwnTeacherProfile);
router.put('/me/profile', protect(['teacher']), updateOwnTeacherProfile);

export default router;
