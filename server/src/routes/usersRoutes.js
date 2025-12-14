import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { pool } from '../config/db.js';

const router = express.Router();

router.get('/', protect(['admin', 'teacher', 'student']), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role FROM users ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
