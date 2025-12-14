import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { addMark, getMarksByStudent } from '../controllers/marksController.js';

const router = express.Router();

router.post('/', protect(['teacher', 'admin']), addMark);
router.get('/:studentId', protect(['teacher', 'admin', 'student']), getMarksByStudent);

export default router;
