const attendanceModel = require('../models/attendanceModel');
const assignmentModel = require('../models/assignmentModel');
const examModel = require('../models/examModel');
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
    const allowed = new Set(['Present', 'Absent', 'Late']);
    const records = (req.body.records || []).map(r => ({
      studentId: r.studentId,
      date: r.date,
      status: r.status,
      markedBy: req.user.id,
      remarks: r.remarks
    }));
    if (records.length === 0) {
      return res.status(400).json({ message: 'No attendance records provided' });
    }
    if (records.some((r) => !allowed.has(r.status))) {
      return res.status(400).json({ message: 'Invalid attendance status' });
    }
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
    const teacherId = await getTeacherId(req.user.id);
    const records = req.body.records || [];
    if (!records.length) {
      return res.status(400).json({ message: 'No marks records provided' });
    }

    const examSubjectIds = [...new Set(records.map((r) => Number(r.examSubjectId)).filter(Boolean))];
    if (!examSubjectIds.length) {
      return res.status(400).json({ message: 'examSubjectId is required' });
    }

    const allowedRows = await query(
      `SELECT DISTINCT es.id
       FROM exam_subjects es
       JOIN teacher_assignments ta
         ON ta.teacher_id = ?
        AND ta.class_id = es.class_id
        AND ta.subject_id = es.subject_id
        AND (
          ta.section_id = es.section_id
          OR ta.section_id IS NULL
          OR es.section_id IS NULL
        )
       WHERE es.id IN (?)`,
      [teacherId, examSubjectIds]
    );
    const allowedIds = new Set(allowedRows.map((r) => Number(r.id)));
    if (examSubjectIds.some((id) => !allowedIds.has(id))) {
      return res.status(403).json({ message: 'You are not allowed to update marks for this exam subject' });
    }

    if (records.some((r) => r.marks === null || r.marks === undefined || Number.isNaN(Number(r.marks)))) {
      return res.status(400).json({ message: 'Valid marks are required for each record' });
    }

    const normalized = records.map((r) => ({
      examSubjectId: Number(r.examSubjectId),
      studentId: Number(r.studentId),
      marks: Number(r.marks),
      grade: r.grade || null,
      remarks: r.remarks || null
    }));

    await markModel.upsertMarks(normalized);
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
    const teacherId = await getTeacherId(req.user.id);
    if (!teacherId) {
      return res.json([]);
    }

    const { classId, sectionId } = req.query;
    if (!classId) {
      return res.status(400).json({ message: 'classId is required' });
    }

    const rows = await query(
      `SELECT DISTINCT s.id, s.admission_no, u.name
       FROM students s
       JOIN users u ON u.id = s.user_id
       WHERE s.class_id = ?
         AND (? IS NULL OR s.section_id = ?)
         AND EXISTS (
           SELECT 1
           FROM teacher_assignments ta
           WHERE ta.teacher_id = ?
             AND ta.class_id = s.class_id
             AND (
               ta.section_id = s.section_id
               OR ta.section_id IS NULL
               OR s.section_id IS NULL
             )
         )
       ORDER BY u.name`,
      [classId, sectionId || null, sectionId || null, teacherId]
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const timetable = async (req, res, next) => {
  try {
    const teacherId = await getTeacherId(req.user.id);
    if (!teacherId) {
      return res.json([]);
    }

    const rows = await query(
      `SELECT
        t.id,
        t.day_of_week,
        t.start_time,
        t.end_time,
        t.room,
        t.entry_type,
        t.title,
        c.name AS class_name,
        COALESCE(sec.name, 'All Sections') AS section_name,
        s.name AS subject_name
       FROM timetables t
       JOIN classes c ON c.id = t.class_id
       LEFT JOIN sections sec ON sec.id = t.section_id
       LEFT JOIN subjects s ON s.id = t.subject_id
       WHERE
         t.teacher_id = ?
         OR EXISTS (
           SELECT 1
           FROM teacher_assignments ta
           WHERE ta.teacher_id = ?
             AND ta.class_id = t.class_id
             AND (
               ta.section_id = t.section_id
               OR ta.section_id IS NULL
               OR t.section_id IS NULL
             )
         )
       ORDER BY FIELD(t.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'), t.start_time`,
      [teacherId, teacherId]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

const listExams = async (req, res, next) => {
  try {
    res.json(await examModel.listExams());
  } catch (err) {
    next(err);
  }
};

const listExamSubjects = async (req, res, next) => {
  try {
    const teacherId = await getTeacherId(req.user.id);
    const examId = Number(req.query.examId);
    const classId = Number(req.query.classId);
    const sectionId = req.query.sectionId ? Number(req.query.sectionId) : null;

    if (!examId || !classId) {
      return res.status(400).json({ message: 'examId and classId are required' });
    }

    const subjects = await examModel.listExamSubjects(examId, classId, sectionId);
    if (!subjects.length) {
      return res.json([]);
    }

    const assignedRows = await query(
      `SELECT DISTINCT ta.subject_id
       FROM teacher_assignments ta
       WHERE ta.teacher_id = ?
         AND ta.class_id = ?
         AND (
           ta.section_id = ?
           OR ta.section_id IS NULL
           OR ? IS NULL
         )`,
      [teacherId, classId, sectionId, sectionId]
    );
    const assignedSubjectIds = new Set(assignedRows.map((r) => Number(r.subject_id)));
    res.json(subjects.filter((s) => assignedSubjectIds.has(Number(s.subject_id))));
  } catch (err) {
    next(err);
  }
};

const marksSheet = async (req, res, next) => {
  try {
    const teacherId = await getTeacherId(req.user.id);
    const examSubjectId = Number(req.query.examSubjectId);
    const classId = Number(req.query.classId);
    const sectionId = req.query.sectionId ? Number(req.query.sectionId) : null;

    if (!examSubjectId || !classId) {
      return res.status(400).json({ message: 'examSubjectId and classId are required' });
    }

    const allowed = await query(
      `SELECT es.id
       FROM exam_subjects es
       JOIN teacher_assignments ta
         ON ta.teacher_id = ?
        AND ta.class_id = es.class_id
        AND ta.subject_id = es.subject_id
        AND (
          ta.section_id = es.section_id
          OR ta.section_id IS NULL
          OR es.section_id IS NULL
        )
       WHERE es.id = ?
         AND es.class_id = ?
         AND (? IS NULL OR es.section_id = ?)
       LIMIT 1`,
      [teacherId, examSubjectId, classId, sectionId, sectionId]
    );

    if (!allowed[0]) {
      return res.status(403).json({ message: 'You are not allowed to access this marks sheet' });
    }

    res.json(await markModel.getMarksSheet(examSubjectId, classId, sectionId));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  dashboard,
  assignedClasses,
  timetable,
  listExams,
  listExamSubjects,
  marksSheet,
  markAttendance,
  uploadAssignment,
  enterMarks,
  studentPerformance,
  uploadMaterial,
  listStudentsByClass,
  notifications
};
