import { pool } from '../config/db.js';

export const getClasses = async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM classes');
  res.json(rows);
};

export const createClass = async (req, res) => {
  const { name, section } = req.body;
  const [result] = await pool.query(
    'INSERT INTO classes (name, section) VALUES (?, ?)',
    [name, section]
  );
  res.status(201).json({ id: result.insertId, name, section });
};

export const deleteClass = async (req, res) => {
  await pool.query('DELETE FROM classes WHERE id = ?', [req.params.id]);
  res.json({ message: 'Class removed' });
};
