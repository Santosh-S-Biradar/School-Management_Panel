import { pool } from '../config/db.js';

export const getTeachers = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM teachers ORDER BY name');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const createTeacher = async (req, res) => {
  try {
    const { name, email, subject, phone, bio, experience_years } = req.body;
    if (!name) return res.status(400).json({ message: 'Name is required' });

    const [result] = await pool.query(
      `INSERT INTO teachers (name, email, subject, phone, bio, experience_years)
       VALUES (?,?,?,?,?,?)`,
      [name, email || null, subject || null, phone || null, bio || null, experience_years || 0]
    );

    const [rows] = await pool.query('SELECT * FROM teachers WHERE id = ?', [result.insertId]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, subject, phone, bio, experience_years } = req.body;

    await pool.query(
      `UPDATE teachers
       SET name = ?, email = ?, subject = ?, phone = ?, bio = ?, experience_years = ?
       WHERE id = ?`,
      [name, email, subject, phone, bio, experience_years, id]
    );

    const [rows] = await pool.query('SELECT * FROM teachers WHERE id = ?', [id]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const deleteTeacher = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM teachers WHERE id = ?', [id]);
    res.json({ message: 'Teacher removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// For teacher profile page - based on logged in user's email
export const getOwnTeacherProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const [rows] = await pool.query('SELECT * FROM teachers WHERE email = ? LIMIT 1', [email]);
    if (!rows[0]) return res.status(404).json({ message: 'Teacher profile not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const updateOwnTeacherProfile = async (req, res) => {
  try {
    const email = req.user.email;
    const { subject, phone, bio, experience_years } = req.body;
    await pool.query(
      `UPDATE teachers 
       SET subject = ?, phone = ?, bio = ?, experience_years = ?
       WHERE email = ?`,
      [subject, phone, bio, experience_years, email]
    );
    const [rows] = await pool.query('SELECT * FROM teachers WHERE email = ? LIMIT 1', [email]);
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
