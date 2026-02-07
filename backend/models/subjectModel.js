const { query } = require('../config/db');

const createSubject = async ({ name, code }) => {
  const result = await query(
    `INSERT INTO subjects (name, code) VALUES (?, ?)`
    , [name, code]
  );
  return result.insertId;
};

const updateSubject = async (id, payload) => {
  const fields = [];
  const values = [];
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });
  if (fields.length === 0) return false;
  values.push(id);
  await query(`UPDATE subjects SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

const deleteSubject = async (id) => {
  await query('DELETE FROM subjects WHERE id = ?', [id]);
};

const listSubjects = async () => {
  return query('SELECT * FROM subjects ORDER BY id DESC');
};

const getSubject = async (id) => {
  const rows = await query('SELECT * FROM subjects WHERE id = ?', [id]);
  return rows[0];
};

module.exports = { createSubject, updateSubject, deleteSubject, listSubjects, getSubject };
