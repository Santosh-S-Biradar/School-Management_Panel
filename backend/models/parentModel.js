const { query } = require('../config/db');

const createParent = async ({ userId, occupation }) => {
  const result = await query(
    `INSERT INTO parents (user_id, occupation) VALUES (?, ?)`
    , [userId, occupation]
  );
  return result.insertId;
};

const linkParentToStudent = async ({ parentId, studentId, relationship }) => {
  await query(
    `INSERT INTO student_parents (parent_id, student_id, relationship)
     VALUES (?, ?, ?)`
    , [parentId, studentId, relationship]
  );
};

const getParentByUserId = async (userId) => {
  const rows = await query(
    `SELECT p.*, u.name, u.email, u.phone
     FROM parents p
     JOIN users u ON u.id = p.user_id
     WHERE p.user_id = ?`,
    [userId]
  );
  return rows[0];
};

const getParentChildren = async (parentId) => {
  return query(
    `SELECT s.id, s.admission_no, u.name, c.name AS class_name, sec.name AS section_name
     FROM student_parents sp
     JOIN students s ON s.id = sp.student_id
     JOIN users u ON u.id = s.user_id
     LEFT JOIN classes c ON c.id = s.class_id
     LEFT JOIN sections sec ON sec.id = s.section_id
     WHERE sp.parent_id = ?`,
    [parentId]
  );
};

module.exports = {
  createParent,
  linkParentToStudent,
  getParentByUserId,
  getParentChildren
};
