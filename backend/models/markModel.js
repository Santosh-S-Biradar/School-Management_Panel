const { query } = require('../config/db');

const upsertMarks = async (records) => {
  if (!records.length) return;
  const values = records.map(r => [r.examSubjectId, r.studentId, r.marks, r.grade, r.remarks || null]);
  await query(
    `INSERT INTO marks (exam_subject_id, student_id, marks, grade, remarks)
     VALUES ?
     ON DUPLICATE KEY UPDATE marks = VALUES(marks), grade = VALUES(grade), remarks = VALUES(remarks)`,
    [values]
  );
};

const getMarksByStudent = async (studentId) => {
  return query(
    `SELECT m.marks, m.grade, e.name AS exam_name, s.name AS subject_name
     FROM marks m
     JOIN exam_subjects es ON es.id = m.exam_subject_id
     JOIN exams e ON e.id = es.exam_id
     JOIN subjects s ON s.id = es.subject_id
     WHERE m.student_id = ?
     ORDER BY e.start_date DESC`,
    [studentId]
  );
};

const getMarksSheet = async (examSubjectId, classId, sectionId) => {
  return query(
    `SELECT
      s.id AS student_id,
      s.admission_no,
      u.name AS student_name,
      m.marks,
      m.grade
     FROM students s
     JOIN users u ON u.id = s.user_id
     LEFT JOIN marks m
       ON m.student_id = s.id
      AND (? IS NOT NULL AND m.exam_subject_id = ?)
     WHERE s.class_id = ?
       AND (? IS NULL OR s.section_id = ?)
     ORDER BY u.name ASC`,
    [examSubjectId || null, examSubjectId || null, classId, sectionId || null, sectionId || null]
  );
};

module.exports = { upsertMarks, getMarksByStudent, getMarksSheet };
