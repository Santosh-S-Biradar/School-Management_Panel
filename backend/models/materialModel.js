const { query } = require('../config/db');

const createMaterial = async (payload) => {
  const result = await query(
    `INSERT INTO materials (class_id, section_id, subject_id, title, description, file_url)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      payload.classId,
      payload.sectionId,
      payload.subjectId,
      payload.title,
      payload.description,
      payload.fileUrl
    ]
  );
  return result.insertId;
};

const listMaterialsForTeacher = async (teacherId) => {
  return query(
    `SELECT DISTINCT
      m.id,
      m.title,
      m.description,
      m.file_url,
      m.created_at,
      c.name AS class_name,
      COALESCE(sec.name, 'All Sections') AS section_name,
      s.name AS subject_name
     FROM materials m
     JOIN classes c ON c.id = m.class_id
     LEFT JOIN sections sec ON sec.id = m.section_id
     JOIN subjects s ON s.id = m.subject_id
     JOIN teacher_assignments ta
       ON ta.teacher_id = ?
      AND ta.class_id = m.class_id
      AND ta.subject_id = m.subject_id
      AND (
        ta.section_id = m.section_id
        OR ta.section_id IS NULL
        OR m.section_id IS NULL
      )
     ORDER BY m.created_at DESC`,
    [teacherId]
  );
};

const listMaterialsByClass = async (classId, sectionId) => {
  return query(
    `SELECT m.*, s.name AS subject_name
     FROM materials m
     JOIN subjects s ON s.id = m.subject_id
     WHERE m.class_id = ?
       AND (m.section_id = ? OR m.section_id IS NULL)
     ORDER BY m.created_at DESC`,
    [classId, sectionId]
  );
};

module.exports = { createMaterial, listMaterialsForTeacher, listMaterialsByClass };
