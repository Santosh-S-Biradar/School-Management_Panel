import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secretkey';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// Seed an initial admin if table is empty (optional helper)
const ensureAdmin = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) AS cnt FROM users WHERE role = "admin"');
  if (rows[0].cnt === 0) {
    const hashed = await bcrypt.hash('admin123', 10);
    await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
      ['Super Admin', 'admin@example.com', hashed, 'admin']
    );
    console.log('Seeded default admin: admin@example.com / admin123');
  }
};

ensureAdmin().catch((e) => console.error('ensureAdmin error', e.message));

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password and role are required' });
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ? AND role = ?', [
      email,
      role
    ]);
    const user = rows[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Attach related ids for student/teacher
    let studentId = null;
    let teacherId = null;

    if (user.role === 'student') {
      const [sRows] = await pool.query('SELECT id FROM students WHERE email = ? LIMIT 1', [
        user.email
      ]);
      if (sRows[0]) studentId = sRows[0].id;
    } else if (user.role === 'teacher') {
      const [tRows] = await pool.query('SELECT id FROM teachers WHERE email = ? LIMIT 1', [
        user.email
      ]);
      if (tRows[0]) teacherId = tRows[0].id;
    }

    const token = generateToken(user);

    res.json({
      token,
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId,
      teacherId
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Basic profile endpoint
export const getProfile = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [
      req.user.id
    ]);
    if (!rows[0]) return res.status(404).json({ message: 'User not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Simple admin-only user creation (no email sending)
export const adminCreateUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
      [name, email, hashed, role]
    );

    // Optionally create linked teacher/student records
    if (role === 'student') {
      await pool.query('INSERT INTO students (name, email) VALUES (?,?)', [name, email]);
    } else if (role === 'teacher') {
      await pool.query('INSERT INTO teachers (name, email) VALUES (?,?)', [name, email]);
    }

    res.status(201).json({ id: result.insertId, name, email, role });
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Email already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
};

// Optional separate registration routes (not required but kept for completeness)
export const registerAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
      [name, email, hashed, 'admin']
    );
    res.status(201).json({ id: result.insertId, name, email, role: 'admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const registerTeacher = async (req, res) => {
  try {
    const { name, email, password, subject } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
      [name, email, hashed, 'teacher']
    );
    await pool.query(
      'INSERT INTO teachers (name, email, subject) VALUES (?,?,?)',
      [name, email, subject || null]
    );
    res.status(201).json({ id: result.insertId, name, email, role: 'teacher' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const registerStudent = async (req, res) => {
  try {
    const { name, email, password, class_id } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?,?,?,?)',
      [name, email, hashed, 'student']
    );
    await pool.query(
      'INSERT INTO students (name, email, class_id) VALUES (?,?,?)',
      [name, email, class_id || null]
    );
    res.status(201).json({ id: result.insertId, name, email, role: 'student' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
