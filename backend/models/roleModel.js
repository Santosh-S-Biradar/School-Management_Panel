const { query } = require('../config/db');

const getRoleId = async (name) => {
  const rows = await query('SELECT id FROM roles WHERE name = ? LIMIT 1', [name]);
  return rows[0]?.id || null;
};

module.exports = { getRoleId };
