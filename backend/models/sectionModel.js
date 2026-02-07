const { query } = require('../config/db');

const createSection = async ({ classId, name }) => {
  const result = await query(
    `INSERT INTO sections (class_id, name) VALUES (?, ?)`
    , [classId, name]
  );
  return result.insertId;
};

const updateSection = async (id, payload) => {
  const fields = [];
  const values = [];
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });
  if (fields.length === 0) return false;
  values.push(id);
  await query(`UPDATE sections SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

const deleteSection = async (id) => {
  await query('DELETE FROM sections WHERE id = ?', [id]);
};

const listSections = async (classId) => {
  if (classId) {
    return query('SELECT * FROM sections WHERE class_id = ? ORDER BY id DESC', [classId]);
  }
  return query('SELECT * FROM sections ORDER BY id DESC');
};

const getSection = async (id) => {
  const rows = await query('SELECT * FROM sections WHERE id = ?', [id]);
  return rows[0];
};

module.exports = { createSection, updateSection, deleteSection, listSections, getSection };
