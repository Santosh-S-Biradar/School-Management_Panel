import { pool } from '../config/db.js';

export const createAnnouncement = async (req, res) => {
  try {
    const { title, content, audience, class_id } = req.body;
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO announcements (title, content, audience, class_id, created_by)
       VALUES (?,?,?,?,?)`,
      [title, content, audience || 'all', class_id || null, req.user.name]
    );
    const [rows] = await pool.query('SELECT * FROM announcements WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getAnnouncements = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM announcements ORDER BY created_at DESC LIMIT 100'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
