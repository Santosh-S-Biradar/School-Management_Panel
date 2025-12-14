import express from 'express';
import { createFeeRecord, getFeesByStudent, getFeesByClass } from '../controllers/feeController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin - create / update records (by creating new rows)
router.post('/', protect(['admin']), createFeeRecord);

// Admin & student - single student's history
router.get('/student/:studentId', protect(['admin', 'student', 'teacher']), getFeesByStudent);

// Admin - for a whole class
router.get('/class/:classId', protect(['admin']), getFeesByClass);

export default router;
