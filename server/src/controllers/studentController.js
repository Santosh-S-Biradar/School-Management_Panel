import { pool } from '../config/db.js';

/**
 * GET students
 * joins users + classes
 */
export const getStudents = async (req, res) => {
  try {
    const { classId } = req.query;

    let query = `
      SELECT 
        s.id,
        u.id AS user_id,
        u.name,
        u.email,
        s.parent_contact,
        s.address,
        s.achievements,
        c.id AS class_id,
        c.name AS class_name,
        c.section AS class_section
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
    `;

    const params = [];
    if (classId) {
      query += ' WHERE s.class_id = ?';
      params.push(classId);
    }

    query += ' ORDER BY u.name';

    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * CREATE student (profile only)
 */
export const createStudent = async (req, res) => {
  try {
    const { user_id, class_id, parent_contact, address, achievements } = req.body;

    if (!user_id || !class_id) {
      return res.status(400).json({ message: 'user_id and class_id required' });
    }

    const [result] = await pool.query(
      `INSERT INTO students (user_id, class_id, parent_contact, address, achievements)
       VALUES (?, ?, ?, ?, ?)`,
      [user_id, class_id, parent_contact || null, address || null, achievements || null]
    );

    const [rows] = await pool.query(
      `
      SELECT 
        s.id,
        u.name,
        u.email,
        s.parent_contact,
        s.address,
        c.name AS class_name,
        c.section AS class_section
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
      `,
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * UPDATE student
 */
export const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { class_id, parent_contact, address, achievements } = req.body;

    await pool.query(
      `
      UPDATE students
      SET class_id = ?, parent_contact = ?, address = ?, achievements = ?
      WHERE id = ?
      `,
      [class_id, parent_contact, address, achievements, id]
    );

    const [rows] = await pool.query(
      `
      SELECT 
        s.id,
        u.name,
        u.email,
        s.parent_contact,
        s.address,
        c.name AS class_name,
        c.section AS class_section
      FROM students s
      JOIN users u ON s.user_id = u.id
      LEFT JOIN classes c ON s.class_id = c.id
      WHERE s.id = ?
      `,
      [id]
    );

    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * DELETE student
 */
export const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM students WHERE id = ?', [id]);
    res.json({ message: 'Student removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
