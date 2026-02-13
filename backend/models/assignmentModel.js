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

const listAssignmentsByTeacher = async (teacherId) => {
  return query(
    `SELECT
      a.id,
      a.title,
      a.description,
      a.due_date,
      a.created_at,
      c.name AS class_name,
      COALESCE(sec.name, 'All Sections') AS section_name,
      s.name AS subject_name
     FROM assignments a
     JOIN classes c ON c.id = a.class_id
     LEFT JOIN sections sec ON sec.id = a.section_id
     JOIN subjects s ON s.id = a.subject_id
     WHERE a.teacher_id = ?
     ORDER BY a.created_at DESC`,
    [teacherId]
  );
};

const listAssignmentsByClass = async (classId, sectionId) => {
  return query(
    `SELECT a.*, s.name AS subject_name, u.name AS teacher_name
     FROM assignments a
     JOIN subjects s ON s.id = a.subject_id
     JOIN teachers t ON t.id = a.teacher_id
     JOIN users u ON u.id = t.user_id
     WHERE a.class_id = ?
       AND (a.section_id = ? OR a.section_id IS NULL)
     ORDER BY a.created_at DESC`,
    [classId, sectionId]
  );
};

module.exports = { createAssignment, listAssignmentsByTeacher, listAssignmentsByClass };
