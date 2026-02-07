const { query } = require('../config/db');

const createTeacher = async ({ userId, employeeNo, department, qualification }) => {
  const result = await query(
    `INSERT INTO teachers (user_id, employee_no, department, qualification)
     VALUES (?, ?, ?, ?)`,
    [userId, employeeNo, department, qualification]
  );
  return result.insertId;
};

const updateTeacher = async (id, payload) => {
  const fields = [];
  const values = [];
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });
  if (fields.length === 0) return false;
  values.push(id);
  await query(`UPDATE teachers SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

const deleteTeacher = async (id) => {
  await query('DELETE FROM teachers WHERE id = ?', [id]);
};

const getTeacher = async (id) => {
  const rows = await query(
    `SELECT t.*, u.name, u.email, u.phone
     FROM teachers t
     JOIN users u ON u.id = t.user_id
     WHERE t.id = ?`,
    [id]
  );
  return rows[0];
};

const listTeachers = async (limit, offset) => {
  return query(
    `SELECT t.id, t.employee_no, t.department, u.name, u.email, u.phone
     FROM teachers t
     JOIN users u ON u.id = t.user_id
     ORDER BY t.id DESC
     LIMIT ? OFFSET ?`,
    [limit, offset]
  );
};

const countTeachers = async () => {
  const rows = await query('SELECT COUNT(*) AS total FROM teachers');
  return rows[0]?.total || 0;
};

module.exports = {
  createTeacher,
  updateTeacher,
  deleteTeacher,
  getTeacher,
  listTeachers,
  countTeachers
};
