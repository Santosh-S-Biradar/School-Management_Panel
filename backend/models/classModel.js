const { query } = require('../config/db');

const createClass = async ({ name, gradeLevel }) => {
  const result = await query(
    `INSERT INTO classes (name, grade_level) VALUES (?, ?)`
    , [name, gradeLevel]
  );
  return result.insertId;
};

const updateClass = async (id, payload) => {
  const fields = [];
  const values = [];
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });
  if (fields.length === 0) return false;
  values.push(id);
  await query(`UPDATE classes SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

const deleteClass = async (id) => {
  await query('DELETE FROM classes WHERE id = ?', [id]);
};

const listClasses = async () => {
  return query('SELECT * FROM classes ORDER BY id DESC');
};

const getClass = async (id) => {
  const rows = await query('SELECT * FROM classes WHERE id = ?', [id]);
  return rows[0];
};

module.exports = { createClass, updateClass, deleteClass, listClasses, getClass };
