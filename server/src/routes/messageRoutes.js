import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { sendMessage, getInbox, getConversationWith } from '../controllers/messageController.js';

const router = express.Router();

router.get('/', protect(['admin', 'teacher', 'student']), getInbox);
router.get('/with/:otherUserId', protect(['admin', 'teacher', 'student']), getConversationWith);
router.post('/', protect(['admin', 'teacher', 'student']), sendMessage);

export default router;
