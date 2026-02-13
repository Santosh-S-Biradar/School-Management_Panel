const { query } = require('../config/db');

const markAttendance = async (records) => {
  const values = records.map(r => [r.studentId, r.date, r.status, r.markedBy, r.remarks || null]);
  if (values.length === 0) return;
  await query(
    `INSERT INTO attendance (student_id, date, status, marked_by, remarks)
     VALUES ?
     ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by), remarks = VALUES(remarks)`,
    [values]
  );
};

const getAttendanceByStudent = async (studentId) => {
  return query(
    `SELECT date, status, remarks
     FROM attendance WHERE student_id = ? ORDER BY date DESC`,
    [studentId]
  );
};

const getAttendanceOverview = async () => {
  return query(
    `SELECT
      c.id AS class_id,
      c.name AS class_name,
      COALESCE(sec.name, 'All Sections') AS section_name,
      COUNT(a.id) AS total_records,
      SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) AS present_count,
      ROUND(
        (SUM(CASE WHEN a.status = 'Present' THEN 1 ELSE 0 END) / NULLIF(COUNT(a.id), 0)) * 100,
        2
      ) AS attendance_percentage
     FROM attendance a
     JOIN students s ON s.id = a.student_id
     LEFT JOIN classes c ON c.id = s.class_id
     LEFT JOIN sections sec ON sec.id = s.section_id
     GROUP BY c.id, c.name, sec.id, sec.name
     ORDER BY c.id ASC, section_name ASC`
  );
};

module.exports = { markAttendance, getAttendanceByStudent, getAttendanceOverview };
