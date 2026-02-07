const { query } = require('../config/db');

const createAssignment = async (payload) => {
  const result = await query(
    `INSERT INTO assignments (class_id, section_id, subject_id, teacher_id, title, description, due_date, file_url)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.classId,
      payload.sectionId,
      payload.subjectId,
      payload.teacherId,
      payload.title,
      payload.description,
      payload.dueDate,
      payload.fileUrl
    ]
  );
  return result.insertId;
};

const listAssignmentsByClass = async (classId, sectionId) => {
  return query(
    `SELECT a.*, s.name AS subject_name, u.name AS teacher_name
     FROM assignments a
     JOIN subjects s ON s.id = a.subject_id
     JOIN teachers t ON t.id = a.teacher_id
     JOIN users u ON u.id = t.user_id
     WHERE a.class_id = ? AND a.section_id = ?
     ORDER BY a.created_at DESC`,
    [classId, sectionId]
  );
};

module.exports = { createAssignment, listAssignmentsByClass };
