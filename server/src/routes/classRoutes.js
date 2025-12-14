import express from 'express';
import { getClasses, createClass, deleteClass } from '../controllers/classController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect(['admin', 'teacher']), getClasses);
router.post('/', protect(['admin']), createClass);
router.delete('/:id', protect(['admin']), deleteClass);

export default router;
