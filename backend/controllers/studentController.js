const studentModel = require('../models/studentModel');
const attendanceModel = require('../models/attendanceModel');
const assignmentModel = require('../models/assignmentModel');
const markModel = require('../models/markModel');
const materialModel = require('../models/materialModel');
const timetableModel = require('../models/timetableModel');
const notificationModel = require('../models/notificationModel');
const { query } = require('../config/db');

const dashboard = async (req, res, next) => {
  try {
    const student = await query('SELECT * FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    res.json({ student: student[0] || null });
  } catch (err) {
    next(err);
  }
};

const profile = async (req, res, next) => {
  try {
    const rows = await query(
      `SELECT s.*, u.name, u.email, u.phone, c.name AS class_name, sec.name AS section_name
       FROM students s
       JOIN users u ON u.id = s.user_id
       LEFT JOIN classes c ON c.id = s.class_id
       LEFT JOIN sections sec ON sec.id = s.section_id
       WHERE s.user_id = ?`,
      [req.user.id]
    );
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

const timetable = async (req, res, next) => {
  try {
    const student = await query('SELECT class_id, section_id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    const { class_id, section_id } = student[0] || {};
    res.json(await timetableModel.listTimetables(class_id, section_id));
  } catch (err) {
    next(err);
  }
};

const attendance = async (req, res, next) => {
  try {
    const student = await query('SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    res.json(await attendanceModel.getAttendanceByStudent(student[0].id));
  } catch (err) {
    next(err);
  }
};

const assignments = async (req, res, next) => {
  try {
    const student = await query('SELECT class_id, section_id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    res.json(await assignmentModel.listAssignmentsByClass(student[0].class_id, student[0].section_id));
  } catch (err) {
    next(err);
  }
};

const marks = async (req, res, next) => {
  try {
    const student = await query('SELECT id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    res.json(await markModel.getMarksByStudent(student[0].id));
  } catch (err) {
    next(err);
  }
};

const materials = async (req, res, next) => {
  try {
    const student = await query('SELECT class_id, section_id FROM students WHERE user_id = ? LIMIT 1', [req.user.id]);
    res.json(await materialModel.listMaterialsByClass(student[0].class_id, student[0].section_id));
  } catch (err) {
    next(err);
  }
};

const notifications = async (req, res, next) => {
  try {
    res.json(await notificationModel.listNotificationsForUser(req.user.id, req.user.role));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  dashboard,
  profile,
  timetable,
  attendance,
  assignments,
  marks,
  materials,
  notifications
};
