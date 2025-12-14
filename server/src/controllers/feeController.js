import { pool } from '../config/db.js';

export const createFeeRecord = async (req, res) => {
  try {
    const { student_id, amount, status, payment_date } = req.body;
    if (!student_id || !amount) {
      return res.status(400).json({ message: 'student_id and amount are required' });
    }
    const [result] = await pool.query(
      'INSERT INTO fees (student_id, amount, status, payment_date) VALUES (?,?,?,?)',
      [student_id, amount, status || 'Due', payment_date || null]
    );
    const [rows] = await pool.query('SELECT * FROM fees WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getFeesByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM fees WHERE student_id = ? ORDER BY created_at DESC',
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// For admin: see all students in a class with latest fee status
export const getFeesByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const [rows] = await pool.query(
      `SELECT 
          s.id AS student_id,
          s.name AS student_name,
          MAX(f.created_at) AS last_update,
          SUBSTRING_INDEX(
            GROUP_CONCAT(f.status ORDER BY f.created_at DESC),
            ',', 1
          ) AS latest_status,
          SUBSTRING_INDEX(
            GROUP_CONCAT(f.amount ORDER BY f.created_at DESC),
            ',', 1
          ) AS latest_amount
        FROM students s
        LEFT JOIN fees f ON f.student_id = s.id
        WHERE s.class_id = ?
        GROUP BY s.id, s.name
        ORDER BY s.name`,
      [classId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
