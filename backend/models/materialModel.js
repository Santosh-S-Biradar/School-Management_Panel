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

const listMaterialsByClass = async (classId, sectionId) => {
  return query(
    `SELECT m.*, s.name AS subject_name
     FROM materials m
     JOIN subjects s ON s.id = m.subject_id
     WHERE m.class_id = ? AND m.section_id = ?
     ORDER BY m.created_at DESC`,
    [classId, sectionId]
  );
};

module.exports = { createMaterial, listMaterialsByClass };
