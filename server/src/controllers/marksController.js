import { pool } from '../config/db.js';

export const addMark = async (req, res) => {
  try {
    const { student_id, subject, exam_name, max_marks, obtained_marks } = req.body;
    if (!student_id || !subject || !exam_name) {
      return res.status(400).json({ message: 'student_id, subject and exam_name are required' });
    }
    const [result] = await pool.query(
      `INSERT INTO marks (student_id, subject, exam_name, max_marks, obtained_marks)
       VALUES (?,?,?,?,?)`,
      [student_id, subject, exam_name, max_marks || null, obtained_marks || null]
    );
    const [rows] = await pool.query('SELECT * FROM marks WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const getMarksByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;
    const [rows] = await pool.query(
      `SELECT * FROM marks WHERE student_id = ? ORDER BY created_at DESC`,
      [studentId]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
