const { query } = require('../config/db');

const createFee = async (payload) => {
  const result = await query(
    `INSERT INTO fees (student_id, amount, due_date, status, paid_date)
     VALUES (?, ?, ?, ?, ?)`,
    [payload.studentId, payload.amount, payload.dueDate, payload.status, payload.paidDate || null]
  );
  return result.insertId;
};

const updateFee = async (id, payload) => {
  const fields = [];
  const values = [];
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });
  if (!fields.length) return false;
  values.push(id);
  await query(`UPDATE fees SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

const listFees = async (studentId) => {
  if (studentId) {
    return query('SELECT * FROM fees WHERE student_id = ? ORDER BY due_date DESC', [studentId]);
  }
  return query(
    `SELECT f.*, u.name AS student_name
     FROM fees f
     JOIN students s ON s.id = f.student_id
     JOIN users u ON u.id = s.user_id
     ORDER BY f.due_date DESC`
  );
};

const deleteFee = async (id) => {
  await query('DELETE FROM fees WHERE id = ?', [id]);
};

module.exports = { createFee, updateFee, listFees, deleteFee };
