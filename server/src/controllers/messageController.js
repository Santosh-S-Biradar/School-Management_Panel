import { pool } from '../config/db.js';

export const sendMessage = async (req, res) => {
  try {
    const { receiver_id, body } = req.body;
    if (!receiver_id || !body) {
      return res.status(400).json({ message: 'receiver_id and body are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO messages (sender_id, receiver_id, body) VALUES (?,?,?)',
      [req.user.id, receiver_id, body]
    );
    const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getInbox = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.*, u.name AS sender_name, u2.name AS receiver_name
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       LEFT JOIN users u2 ON m.receiver_id = u2.id
       WHERE m.sender_id = ? OR m.receiver_id = ?
       ORDER BY m.created_at DESC
       LIMIT 200`,
      [req.user.id, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getConversationWith = async (req, res) => {
  try {
    const { otherUserId } = req.params;
    const [rows] = await pool.query(
      `SELECT m.*, u.name AS sender_name, u2.name AS receiver_name
       FROM messages m
       LEFT JOIN users u ON m.sender_id = u.id
       LEFT JOIN users u2 ON m.receiver_id = u2.id
       WHERE (m.sender_id = ? AND m.receiver_id = ?)
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`,
      [req.user.id, otherUserId, otherUserId, req.user.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
