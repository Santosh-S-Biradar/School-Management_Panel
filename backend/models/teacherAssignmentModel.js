const { query } = require('../config/db');

const createTeacherAssignment = async ({ teacherId, classId, sectionId, subjectId }) => {
  const result = await query(
    `INSERT INTO teacher_assignments (teacher_id, class_id, section_id, subject_id)
     VALUES (?, ?, ?, ?)`,
    [teacherId, classId, sectionId || null, subjectId]
  );
  return result.insertId;
};

const listTeacherAssignments = async (teacherId) => {
  return query(
    `SELECT ta.id, c.name AS class_name, sec.name AS section_name, s.name AS subject_name
     FROM teacher_assignments ta
     JOIN classes c ON c.id = ta.class_id
     LEFT JOIN sections sec ON sec.id = ta.section_id
     JOIN subjects s ON s.id = ta.subject_id
     WHERE ta.teacher_id = ?`,
    [teacherId]
  );
};

module.exports = { createTeacherAssignment, listTeacherAssignments };
