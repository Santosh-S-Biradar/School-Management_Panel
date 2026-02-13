const { query } = require('../config/db');

const createExam = async ({ name, startDate, endDate }) => {
  const result = await query(
    `INSERT INTO exams (name, start_date, end_date) VALUES (?, ?, ?)`,
    [name, startDate, endDate]
  );
  return result.insertId;
};

const listExams = async () => {
  return query('SELECT * FROM exams ORDER BY start_date DESC');
};

const updateExam = async (id, payload) => {
  const fields = [];
  const values = [];
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });
  if (fields.length === 0) return false;
  values.push(id);
  await query(`UPDATE exams SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

const deleteExam = async (id) => {
  await query('DELETE FROM exams WHERE id = ?', [id]);
};

const addExamSubject = async (payload) => {
  const result = await query(
    `INSERT INTO exam_subjects (exam_id, class_id, section_id, subject_id, max_marks)
     VALUES (?, ?, ?, ?, ?)`
    , [payload.examId, payload.classId, payload.sectionId || null, payload.subjectId, payload.maxMarks]
  );
  return result.insertId;
};

const deleteExamSubject = async (id) => {
  await query('DELETE FROM exam_subjects WHERE id = ?', [id]);
};

const resolveExamSubjectId = async ({ examId, classId, subjectId, sectionId, createIfMissing = false, maxMarks = 100 }) => {
  const exactRows = await query(
    `SELECT id
     FROM exam_subjects
     WHERE exam_id = ? AND class_id = ? AND subject_id = ? AND section_id <=> ?
     LIMIT 1`,
    [examId, classId, subjectId, sectionId || null]
  );
  if (exactRows[0]?.id) {
    return exactRows[0].id;
  }

  if (sectionId) {
    const commonRows = await query(
      `SELECT id
       FROM exam_subjects
       WHERE exam_id = ? AND class_id = ? AND subject_id = ? AND section_id IS NULL
       LIMIT 1`,
      [examId, classId, subjectId]
    );
    if (commonRows[0]?.id) {
      return commonRows[0].id;
    }
  }

  if (!createIfMissing) {
    return null;
  }

  const insert = await query(
    `INSERT INTO exam_subjects (exam_id, class_id, section_id, subject_id, max_marks)
     VALUES (?, ?, ?, ?, ?)`,
    [examId, classId, sectionId || null, subjectId, maxMarks]
  );
  return insert.insertId;
};

const listExamSubjects = async (examId, classId, sectionId) => {
  const conditions = [];
  const params = [];

  if (examId) {
    conditions.push('es.exam_id = ?');
    params.push(examId);
  }
  if (classId) {
    conditions.push('es.class_id = ?');
    params.push(classId);
  }
  if (sectionId) {
    conditions.push('(es.section_id = ? OR es.section_id IS NULL)');
    params.push(sectionId);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return query(
    `SELECT
      es.*,
      e.name AS exam_name,
      c.name AS class_name,
      s.name AS subject_name,
      COALESCE(sec.name, 'All Sections') AS section_name
     FROM exam_subjects es
     JOIN exams e ON e.id = es.exam_id
     JOIN classes c ON c.id = es.class_id
     JOIN subjects s ON s.id = es.subject_id
     LEFT JOIN sections sec ON sec.id = es.section_id
     ${whereClause}
     ORDER BY e.start_date DESC, c.id ASC, section_name ASC, s.name ASC`,
    params
  );
};

module.exports = { createExam, listExams, updateExam, deleteExam, addExamSubject, deleteExamSubject, resolveExamSubjectId, listExamSubjects };
