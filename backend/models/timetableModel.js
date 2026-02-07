const { query } = require('../config/db');

const createTimetable = async (payload) => {
  const result = await query(
    `INSERT INTO timetables (class_id, section_id, day_of_week, start_time, end_time, subject_id, teacher_id, room)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.classId,
      payload.sectionId,
      payload.dayOfWeek,
      payload.startTime,
      payload.endTime,
      payload.subjectId,
      payload.teacherId,
      payload.room
    ]
  );
  return result.insertId;
};

const listTimetables = async (classId, sectionId) => {
  return query(
    `SELECT t.*, s.name AS subject_name, u.name AS teacher_name
     FROM timetables t
     JOIN subjects s ON s.id = t.subject_id
     JOIN teachers te ON te.id = t.teacher_id
     JOIN users u ON u.id = te.user_id
     WHERE t.class_id = ? AND t.section_id = ?
     ORDER BY FIELD(t.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), t.start_time`,
    [classId, sectionId]
  );
};

const deleteTimetable = async (id) => {
  await query('DELETE FROM timetables WHERE id = ?', [id]);
};

const updateTimetable = async (id, payload) => {
  const fields = [];
  const values = [];
  Object.entries(payload).forEach(([key, value]) => {
    fields.push(`${key} = ?`);
    values.push(value);
  });
  if (fields.length === 0) return false;
  values.push(id);
  await query(`UPDATE timetables SET ${fields.join(', ')} WHERE id = ?`, values);
  return true;
};

module.exports = { createTimetable, listTimetables, deleteTimetable, updateTimetable };
