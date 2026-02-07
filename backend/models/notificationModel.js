const { query } = require('../config/db');

const createNotification = async (payload) => {
  const result = await query(
    `INSERT INTO notifications (title, message, target_role, target_user_id)
     VALUES (?, ?, ?, ?)`,
    [payload.title, payload.message, payload.targetRole || null, payload.targetUserId || null]
  );
  return result.insertId;
};

const listNotificationsForUser = async (userId, role) => {
  return query(
    `SELECT * FROM notifications
     WHERE (target_user_id IS NULL OR target_user_id = ?)
       AND (target_role IS NULL OR target_role = ?)
     ORDER BY created_at DESC`,
    [userId, role]
  );
};

const updateNotification = async (id, payload) => {
  const fields = [];
  const values = [];
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });
  if (fields.length === 0) return false;
  values.push(id);
  await query(`UPDATE notifications SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

const deleteNotification = async (id) => {
  await query('DELETE FROM notifications WHERE id = ?', [id]);
};

module.exports = { createNotification, listNotificationsForUser, updateNotification, deleteNotification };
