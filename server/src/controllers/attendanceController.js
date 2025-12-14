// src/controllers/attendanceController.js
import { pool } from "../config/db.js";

// GET Attendance Summary for Dashboard & Table List
export const getAttendanceSummary = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        c.id AS class_id,
        c.name AS class_name,
        COUNT(s.id) AS total_students,
        SUM(CASE WHEN a.status = 'Present' AND a.date = CURDATE() THEN 1 ELSE 0 END) AS present_count,
        SUM(CASE WHEN a.status = 'Absent' AND a.date = CURDATE() THEN 1 ELSE 0 END) AS absent_count
      FROM classes c
      LEFT JOIN students s ON s.class_id = c.id
      LEFT JOIN attendance a ON a.student_id = s.id
      GROUP BY c.id, c.name
      ORDER BY c.id;
    `);

    res.json(rows);
  } catch (error) {
    console.error("Attendance Summary Error:", error);
    res.status(500).json({ message: "Error fetching attendance summary", error: error?.message });
  }
};

// Helper: normalize date string (YYYY-MM-DD) or default to today
const sqlDateOrToday = (d) => {
  if (!d) return null;
  // accept either full ISO date or just YYYY-MM-DD
  return d.includes("T") ? d.split("T")[0] : d;
};

export const markAttendance = async (req, res) => {
  try {
    const { student_id, status, date } = req.body;
    if (!student_id || !status) {
      return res.status(400).json({ message: "student_id and status are required" });
    }

    const day = sqlDateOrToday(date) || new Date().toISOString().slice(0, 10);

    // Upsert attendance for that day
    const [exists] = await pool.query(
      "SELECT id FROM attendance WHERE student_id = ? AND date = ?",
      [student_id, day]
    );

    if (exists.length) {
      await pool.query(
        "UPDATE attendance SET status = ? WHERE id = ?",
        [status, exists[0].id]
      );
    } else {
      await pool.query(
        "INSERT INTO attendance (student_id, date, status) VALUES (?,?,?)",
        [student_id, day, status]
      );
    }

    res.json({ message: "Attendance saved", date: day });
  } catch (err) {
    console.error("markAttendance error:", err);
    res.status(500).json({ message: "Server error", error: err?.message });
  }
};

export const getStudentsByClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const day = sqlDateOrToday(req.query.date) || new Date().toISOString().slice(0, 10);

    const [rows] = await pool.query(
      `SELECT 
          s.id,
          s.name,
          s.roll_number,
          IFNULL(a.status, '') AS status,
          a.date
        FROM students s
        LEFT JOIN attendance a 
          ON a.student_id = s.id AND a.date = ?
        WHERE s.class_id = ?
        ORDER BY s.name`,
      [day, classId]
    );

    res.json({ date: day, students: rows });
  } catch (err) {
    console.error("getStudentsByClass error:", err);
    res.status(500).json({ message: "Server error", error: err?.message });
  }
};

export const getAttendanceByStudent = async (req, res) => {
  try {
    const { studentId } = req.params;

    const [rows] = await pool.query(
      `SELECT date, status 
       FROM attendance 
       WHERE student_id = ?
       ORDER BY date DESC`,
      [studentId]
    );

    const total_days = rows.length;
    const present_days = rows.filter(r => r.status === 'Present').length;
    const absent_days = rows.filter(r => r.status === 'Absent').length;
    const percentage = total_days ? Math.round((present_days / total_days) * 100) : 0;

    res.json({
      history: rows,
      stats: { total_days, present_days, absent_days, percentage }
    });
  } catch (err) {
    console.error("getAttendanceByStudent error:", err);
    res.status(500).json({ message: "Server error", error: err?.message });
  }
};
