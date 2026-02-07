const { query } = require('../config/db');

const findByEmail = async (email) => {
  const rows = await query(
    `SELECT u.*, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.email = ? LIMIT 1`,
    [email]
  );
  return rows[0];
};

const findById = async (id) => {
  const rows = await query(
    `SELECT u.*, r.name AS role_name
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE u.id = ? LIMIT 1`,
    [id]
  );
  return rows[0];
};

const createUser = async ({ roleId, name, email, passwordHash, phone }) => {
  const result = await query(
    `INSERT INTO users (role_id, name, email, password_hash, phone)
     VALUES (?, ?, ?, ?, ?)`,
    [roleId, name, email, passwordHash, phone || null]
  );
  return result.insertId;
};

const updateUser = async (id, payload) => {
  const fields = [];
  const values = [];
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });
  if (fields.length === 0) return false;
  values.push(id);
  await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

const updatePassword = async (id, passwordHash) => {
  await query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, id]);
};

const listByRole = async (roleName, limit, offset) => {
  const rows = await query(
    `SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE r.name = ?
     ORDER BY u.id DESC
     LIMIT ? OFFSET ?`,
    [roleName, limit, offset]
  );
  return rows;
};

const countByRole = async (roleName) => {
  const rows = await query(
    `SELECT COUNT(*) AS total
     FROM users u
     JOIN roles r ON r.id = u.role_id
     WHERE r.name = ?`,
    [roleName]
  );
  return rows[0]?.total || 0;
};

module.exports = {
  findByEmail,
  findById,
  createUser,
  updateUser,
  updatePassword,
  listByRole,
  countByRole
};
