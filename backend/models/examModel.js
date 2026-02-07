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
    , [payload.examId, payload.classId, payload.sectionId, payload.subjectId, payload.maxMarks]
  );
  return result.insertId;
};

const listExamSubjects = async (examId, classId, sectionId) => {
  return query(
    `SELECT es.*, s.name AS subject_name
     FROM exam_subjects es
     JOIN subjects s ON s.id = es.subject_id
     WHERE es.exam_id = ? AND es.class_id = ? AND es.section_id = ?`,
    [examId, classId, sectionId]
  );
};

module.exports = { createExam, listExams, updateExam, deleteExam, addExamSubject, listExamSubjects };
