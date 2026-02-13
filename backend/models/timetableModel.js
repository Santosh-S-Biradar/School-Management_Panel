const { query } = require('../config/db');

const createTimetable = async (payload) => {
  const result = await query(
    `INSERT INTO timetables (class_id, section_id, day_of_week, start_time, end_time, entry_type, title, subject_id, teacher_id, room)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      payload.classId,
      payload.sectionId,
      payload.dayOfWeek,
      payload.startTime,
      payload.endTime,
      payload.entryType || 'lecture',
      payload.title || null,
      payload.subjectId,
      payload.teacherId,
      payload.room
    ]
  );
  return result.insertId;
};

const listTimetableClasses = async () => {
  return query(
    `SELECT
      c.id AS class_id,
      c.name AS class_name,
      t.section_id,
      COALESCE(sec.name, 'All Sections') AS section_name,
      COUNT(*) AS total_periods
     FROM timetables t
     JOIN classes c ON c.id = t.class_id
     LEFT JOIN sections sec ON sec.id = t.section_id
     GROUP BY c.id, c.name, t.section_id, sec.name
     ORDER BY c.id ASC, section_name ASC`
  );
};

const listTimetables = async (classId, sectionId) => {
  if (sectionId) {
    return query(
      `SELECT t.*, s.name AS subject_name, u.name AS teacher_name
       FROM timetables t
       LEFT JOIN subjects s ON s.id = t.subject_id
       LEFT JOIN teachers te ON te.id = t.teacher_id
       LEFT JOIN users u ON u.id = te.user_id
       WHERE t.class_id = ? AND (t.section_id = ? OR t.section_id IS NULL)
       ORDER BY FIELD(t.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), t.start_time`,
      [classId, sectionId]
    );
  }

  return query(
    `SELECT t.*, s.name AS subject_name, u.name AS teacher_name
     FROM timetables t
     LEFT JOIN subjects s ON s.id = t.subject_id
     LEFT JOIN teachers te ON te.id = t.teacher_id
     LEFT JOIN users u ON u.id = te.user_id
     WHERE t.class_id = ?
     ORDER BY FIELD(t.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), t.start_time`,
    [classId]
  );
};

const hasClassConflict = async ({ classId, dayOfWeek, startTime, endTime, excludeId }) => {
  const rows = await query(
    `SELECT id
     FROM timetables
     WHERE class_id = ?
       AND day_of_week = ?
       AND start_time < ?
       AND end_time > ?
       ${excludeId ? 'AND id <> ?' : ''}
     LIMIT 1`,
    excludeId ? [classId, dayOfWeek, endTime, startTime, excludeId] : [classId, dayOfWeek, endTime, startTime]
  );
  return Boolean(rows[0]);
};

const hasTeacherConflict = async ({ teacherId, dayOfWeek, startTime, endTime, excludeId }) => {
  const rows = await query(
    `SELECT id
     FROM timetables
     WHERE teacher_id = ?
       AND day_of_week = ?
       AND start_time < ?
       AND end_time > ?
       ${excludeId ? 'AND id <> ?' : ''}
     LIMIT 1`,
    excludeId ? [teacherId, dayOfWeek, endTime, startTime, excludeId] : [teacherId, dayOfWeek, endTime, startTime]
  );
  return Boolean(rows[0]);
};

const deleteTimetable = async (id) => {
  await query('DELETE FROM timetables WHERE id = ?', [id]);
};

const deleteTimetableGroup = async (classId, sectionId) => {
  if (sectionId) {
    await query('DELETE FROM timetables WHERE class_id = ? AND section_id = ?', [classId, sectionId]);
    return;
  }
  await query('DELETE FROM timetables WHERE class_id = ? AND section_id IS NULL', [classId]);
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

module.exports = {
  createTimetable,
  listTimetableClasses,
  listTimetables,
  hasClassConflict,
  hasTeacherConflict,
  deleteTimetable,
  deleteTimetableGroup,
  updateTimetable
};
