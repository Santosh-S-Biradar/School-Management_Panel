const attendanceModel = require('../models/attendanceModel');
const assignmentModel = require('../models/assignmentModel');
const markModel = require('../models/markModel');
const teacherAssignmentModel = require('../models/teacherAssignmentModel');
const materialModel = require('../models/materialModel');
const { query } = require('../config/db');

const getTeacherId = async (userId) => {
  const rows = await query('SELECT id FROM teachers WHERE user_id = ? LIMIT 1', [userId]);
  return rows[0]?.id || null;
};

const dashboard = async (req, res, next) => {
  try {
    const teacherId = await getTeacherId(req.user.id);
    const assignments = teacherId ? await teacherAssignmentModel.listTeacherAssignments(teacherId) : [];
    res.json({ assignments });
  } catch (err) {
    next(err);
  }
};

const assignedClasses = async (req, res, next) => {
  try {
    const teacherId = await getTeacherId(req.user.id);
    res.json(teacherId ? await teacherAssignmentModel.listTeacherAssignments(teacherId) : []);
  } catch (err) {
    next(err);
  }
};

const markAttendance = async (req, res, next) => {
  try {
    const records = (req.body.records || []).map(r => ({
      studentId: r.studentId,
      date: r.date,
      status: r.status,
      markedBy: req.user.id,
      remarks: r.remarks
    }));
    await attendanceModel.markAttendance(records);
    res.json({ message: 'Attendance saved' });
  } catch (err) {
    next(err);
  }
};

const uploadAssignment = async (req, res, next) => {
  try {
    const teacherId = await getTeacherId(req.user.id);
    const id = await assignmentModel.createAssignment({ ...req.body, teacherId });
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

const enterMarks = async (req, res, next) => {
  try {
    await markModel.upsertMarks(req.body.records || []);
    res.json({ message: 'Marks saved' });
  } catch (err) {
    next(err);
  }
};

const studentPerformance = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    res.json(await markModel.getMarksByStudent(studentId));
  } catch (err) {
    next(err);
  }
};

const uploadMaterial = async (req, res, next) => {
  try {
    const id = await materialModel.createMaterial(req.body);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

const notifications = async (req, res, next) => {
  try {
    const { listNotificationsForUser } = require('../models/notificationModel');
    res.json(await listNotificationsForUser(req.user.id, req.user.role));
  } catch (err) {
    next(err);
  }
};

const listStudentsByClass = async (req, res, next) => {
  try {
    const { classId, sectionId } = req.query;
    const rows = await query(
      `SELECT s.id, s.admission_no, u.name
       FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE s.class_id = ? AND s.section_id = ?
       ORDER BY u.name`,
      [classId, sectionId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  dashboard,
  assignedClasses,
  markAttendance,
  uploadAssignment,
  enterMarks,
  studentPerformance,
  uploadMaterial,
  listStudentsByClass,
  notifications
};
