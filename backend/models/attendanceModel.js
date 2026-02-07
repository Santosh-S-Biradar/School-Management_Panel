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
    `SELECT date, status, COUNT(*) AS count
     FROM attendance
     GROUP BY date, status
     ORDER BY date DESC`
  );
};

module.exports = { markAttendance, getAttendanceByStudent, getAttendanceOverview };
