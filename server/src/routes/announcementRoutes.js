import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { createAnnouncement, getAnnouncements } from '../controllers/announcementController.js';

const router = express.Router();

// Everyone can read
router.get('/', protect(['admin', 'teacher', 'student']), getAnnouncements);

// Only admin can create
router.post('/', protect(['admin']), createAnnouncement);

export default router;
