const { query } = require('../config/db');

const createStudent = async ({ userId, admissionNo, classId, sectionId, dob, gender, address }) => {
  const result = await query(
    `INSERT INTO students (user_id, admission_no, class_id, section_id, dob, gender, address)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, admissionNo, classId, sectionId, dob, gender, address]
  );
  return result.insertId;
};

const updateStudent = async (id, payload) => {
  const fields = [];
  const values = [];
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });
  if (fields.length === 0) return false;
  values.push(id);
  await query(`UPDATE students SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

const deleteStudent = async (id) => {
  await query('DELETE FROM students WHERE id = ?', [id]);
};

const getStudent = async (id) => {
  const rows = await query(
    `SELECT s.*, u.name, u.email, u.phone, c.name AS class_name, sec.name AS section_name
     FROM students s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN classes c ON c.id = s.class_id
     LEFT JOIN sections sec ON sec.id = s.section_id
     WHERE s.id = ?`,
    [id]
  );
  return rows[0];
};

const listStudents = async (limit, offset) => {
  return query(
    `SELECT s.id, s.admission_no, u.name, u.email, u.phone, c.name AS class_name, sec.name AS section_name
     FROM students s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN classes c ON c.id = s.class_id
     LEFT JOIN sections sec ON sec.id = s.section_id
     ORDER BY s.id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
};

const countStudents = async () => {
  const rows = await query('SELECT COUNT(*) AS total FROM students');
  return rows[0]?.total || 0;
};

module.exports = {
  createStudent,
  updateStudent,
  deleteStudent,
  getStudent,
  listStudents,
  countStudents
};
