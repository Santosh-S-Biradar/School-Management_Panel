import express from 'express';
import { getStudents, createStudent, updateStudent, deleteStudent } from '../controllers/studentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect(['admin', 'teacher']), getStudents);
router.post('/', protect(['admin']), createStudent);
router.put('/:id', protect(['admin']), updateStudent);
router.delete('/:id', protect(['admin']), deleteStudent);

export default router;
