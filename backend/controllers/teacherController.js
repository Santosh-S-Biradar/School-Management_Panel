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

const hasTeacherClassAccess = async ({ teacherId, classId, sectionId }) => {
  const rows = await query(
    `SELECT 1
     FROM teacher_assignments ta
     WHERE ta.teacher_id = ?
       AND ta.class_id = ?
       AND (
         ta.section_id = ?
         OR ta.section_id IS NULL
         OR ? IS NULL
       )
     LIMIT 1`,
    [teacherId, classId, sectionId || null, sectionId || null]
  );
  return Boolean(rows[0]);
};

const hasTeacherSubjectAccess = async ({ teacherId, classId, sectionId, subjectId }) => {
  const rows = await query(
    `SELECT 1
     FROM teacher_assignments ta
     WHERE ta.teacher_id = ?
       AND ta.class_id = ?
       AND ta.subject_id = ?
       AND (
         ta.section_id = ?
         OR ta.section_id IS NULL
         OR ? IS NULL
       )
     LIMIT 1`,
    [teacherId, classId, subjectId, sectionId || null, sectionId || null]
  );
  return Boolean(rows[0]);
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
    const classId = req.body.classId ? Number(req.body.classId) : null;
    const sectionId = req.body.sectionId ? Number(req.body.sectionId) : null;
    const subjectId = Number(req.body.subjectId);

    if (!subjectId) {
      return res.status(400).json({ message: 'subjectId is required' });
    }

    if (classId) {
      const allowed = await hasTeacherSubjectAccess({ teacherId, classId, sectionId, subjectId });
      if (!allowed) {
        return res.status(403).json({ message: 'You are not allowed to post assignment for this class/subject' });
      }

      const id = await assignmentModel.createAssignment({ ...req.body, classId, sectionId, subjectId, teacherId });
      return res.status(201).json({ id });
    }

    const targets = await query(
      `SELECT DISTINCT ta.class_id, ta.section_id
       FROM teacher_assignments ta
       WHERE ta.teacher_id = ? AND ta.subject_id = ?`,
      [teacherId, subjectId]
    );

    if (!targets.length) {
      return res.status(403).json({ message: 'No class assigned for this subject' });
    }

    const createdIds = [];
    for (const target of targets) {
      const id = await assignmentModel.createAssignment({
        ...req.body,
        classId: target.class_id,
        sectionId: target.section_id,
        subjectId,
        teacherId
      });
      createdIds.push(id);
    }

    res.status(201).json({ ids: createdIds, count: createdIds.length });
  } catch (err) {
    next(err);
  }
};

const listAssignments = async (req, res, next) => {
  try {
    const teacherId = await getTeacherId(req.user.id);
    res.json(teacherId ? await assignmentModel.listAssignmentsByTeacher(teacherId) : []);
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

    const examId = Number(req.body.examId);
    const classId = Number(req.body.classId);
    const sectionId = req.body.sectionId ? Number(req.body.sectionId) : null;
    const subjectId = Number(req.body.subjectId);

    let resolvedExamSubjectId = null;

    if (examId && classId && subjectId) {
      const allowed = await hasTeacherClassAccess({ teacherId, classId, sectionId });
      if (!allowed) {
        return res.status(403).json({ message: 'You are not allowed to update marks for this class' });
      }

      resolvedExamSubjectId = await examModel.resolveExamSubjectId({
        examId,
        classId,
        subjectId,
        sectionId,
        createIfMissing: true,
        maxMarks: req.body.maxMarks || 100
      });
    } else {
      const examSubjectIds = [...new Set(records.map((r) => Number(r.examSubjectId)).filter(Boolean))];
      if (!examSubjectIds.length) {
        return res.status(400).json({ message: 'Provide examId, classId, subjectId or examSubjectId in records' });
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
    }

    if (records.some((r) => r.marks === null || r.marks === undefined || Number.isNaN(Number(r.marks)))) {
      return res.status(400).json({ message: 'Valid marks are required for each record' });
    }

    const normalized = records.map((r) => ({
      examSubjectId: resolvedExamSubjectId || Number(r.examSubjectId),
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
    const teacherId = await getTeacherId(req.user.id);
    const classId = req.body.classId ? Number(req.body.classId) : null;
    const sectionId = req.body.sectionId ? Number(req.body.sectionId) : null;
    const subjectId = Number(req.body.subjectId);

    if (!subjectId) {
      return res.status(400).json({ message: 'subjectId is required' });
    }

    if (classId) {
      const allowed = await hasTeacherSubjectAccess({ teacherId, classId, sectionId, subjectId });
      if (!allowed) {
        return res.status(403).json({ message: 'You are not allowed to post material for this class/subject' });
      }

      const id = await materialModel.createMaterial({ ...req.body, classId, sectionId, subjectId });
      return res.status(201).json({ id });
    }

    const targets = await query(
      `SELECT DISTINCT ta.class_id, ta.section_id
       FROM teacher_assignments ta
       WHERE ta.teacher_id = ? AND ta.subject_id = ?`,
      [teacherId, subjectId]
    );

    if (!targets.length) {
      return res.status(403).json({ message: 'No class assigned for this subject' });
    }

    const createdIds = [];
    for (const target of targets) {
      const id = await materialModel.createMaterial({
        ...req.body,
        classId: target.class_id,
        sectionId: target.section_id,
        subjectId
      });
      createdIds.push(id);
    }

    res.status(201).json({ ids: createdIds, count: createdIds.length });
  } catch (err) {
    next(err);
  }
};

const listMaterials = async (req, res, next) => {
  try {
    const teacherId = await getTeacherId(req.user.id);
    res.json(teacherId ? await materialModel.listMaterialsForTeacher(teacherId) : []);
  } catch (err) {
    next(err);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const teacherId = await getTeacherId(req.user.id);
    const title = (req.body.title || '').trim();
    const message = (req.body.message || '').trim();
    const targetType = req.body.targetType || 'class';
    const classId = req.body.classId ? Number(req.body.classId) : null;
    const sectionId = req.body.sectionId ? Number(req.body.sectionId) : null;
    const studentIds = Array.isArray(req.body.studentIds) ? req.body.studentIds.map((id) => Number(id)).filter(Boolean) : [];

    if (!title || !message) {
      return res.status(400).json({ message: 'Title and message are required' });
    }

    const { createNotification: createNotificationModel } = require('../models/notificationModel');

    if (targetType === 'class') {
      if (!classId) {
        return res.status(400).json({ message: 'classId is required for class notification' });
      }

      const allowed = await hasTeacherClassAccess({ teacherId, classId, sectionId });
      if (!allowed) {
        return res.status(403).json({ message: 'You are not allowed to notify this class' });
      }

      const targets = await query(
        `SELECT DISTINCT s.user_id
         FROM students s
         WHERE s.class_id = ?
           AND (? IS NULL OR s.section_id = ?)`,
        [classId, sectionId, sectionId]
      );

      if (!targets.length) {
        return res.status(404).json({ message: 'No students found for this class/section' });
      }

      for (const row of targets) {
        await createNotificationModel({
          title,
          message,
          targetRole: 'student',
          targetUserId: row.user_id
        });
      }

      return res.status(201).json({ count: targets.length });
    }

    if (targetType === 'students') {
      if (!studentIds.length) {
        return res.status(400).json({ message: 'studentIds are required for selected students notification' });
      }

      const targets = await query(
        `SELECT DISTINCT s.user_id
         FROM students s
         WHERE s.id IN (?)
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
           )`,
        [studentIds, teacherId]
      );

      if (!targets.length) {
        return res.status(403).json({ message: 'No permitted students found in selection' });
      }

      for (const row of targets) {
        await createNotificationModel({
          title,
          message,
          targetRole: 'student',
          targetUserId: row.user_id
        });
      }

      return res.status(201).json({ count: targets.length });
    }

    return res.status(400).json({ message: 'Invalid targetType' });
  } catch (err) {
    next(err);
  }
};

const notifications = async (req, res, next) => {
  try {
    if (req.user.role === 'teacher') {
      const rows = await query(
        `SELECT *
         FROM notifications
         WHERE (target_user_id IS NULL OR target_user_id = ?)
           AND (
             target_role IS NULL
             OR target_role = 'teacher'
             OR target_role = 'admin'
           )
         ORDER BY created_at DESC`,
        [req.user.id]
      );
      return res.json(rows);
    }
    const { listNotificationsForUser } = require('../models/notificationModel');
    res.json(await listNotificationsForUser(req.user.id, req.user.role));
  } catch (err) {
    next(err);
  }
};

const listSubjects = async (req, res, next) => {
  try {
    const teacherId = await getTeacherId(req.user.id);
    if (!teacherId) {
      return res.json([]);
    }

    const classId = req.query.classId ? Number(req.query.classId) : null;
    const sectionId = req.query.sectionId ? Number(req.query.sectionId) : null;

    const rows = await query(
      `SELECT DISTINCT s.id, s.name, s.code
       FROM teacher_assignments ta
       JOIN subjects s ON s.id = ta.subject_id
       WHERE ta.teacher_id = ?
         AND (? IS NULL OR ta.class_id = ?)
         AND (
           ? IS NULL
           OR ta.section_id = ?
           OR ta.section_id IS NULL
         )
       ORDER BY s.name ASC`,
      [teacherId, classId, classId, sectionId, sectionId]
    );
    res.json(rows);
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
      `SELECT DISTINCT s.id, s.user_id, s.admission_no, u.name
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

    const allowed = await hasTeacherClassAccess({ teacherId, classId, sectionId });
    if (!allowed) {
      return res.status(403).json({ message: 'You are not allowed to access this class exam subjects' });
    }

    res.json(await examModel.listExamSubjects(examId, classId, sectionId));
  } catch (err) {
    next(err);
  }
};

const marksSheet = async (req, res, next) => {
  try {
    const teacherId = await getTeacherId(req.user.id);
    const examSubjectId = req.query.examSubjectId ? Number(req.query.examSubjectId) : null;
    const examId = req.query.examId ? Number(req.query.examId) : null;
    const classId = Number(req.query.classId);
    const subjectId = req.query.subjectId ? Number(req.query.subjectId) : null;
    const sectionId = req.query.sectionId ? Number(req.query.sectionId) : null;

    if (!classId) {
      return res.status(400).json({ message: 'classId is required' });
    }

    let resolvedExamSubjectId = examSubjectId;

    if (!resolvedExamSubjectId) {
      if (!examId || !subjectId) {
        return res.status(400).json({ message: 'Provide examSubjectId or examId + subjectId' });
      }

      const allowed = await hasTeacherClassAccess({ teacherId, classId, sectionId });
      if (!allowed) {
        return res.status(403).json({ message: 'You are not allowed to access this marks sheet' });
      }

      resolvedExamSubjectId = await examModel.resolveExamSubjectId({
        examId,
        classId,
        subjectId,
        sectionId,
        createIfMissing: false
      });
    } else {
      const allowed = await query(
        `SELECT es.id
         FROM exam_subjects es
         JOIN teacher_assignments ta
           ON ta.teacher_id = ?
          AND ta.class_id = es.class_id
          AND (
            ta.section_id = es.section_id
            OR ta.section_id IS NULL
            OR es.section_id IS NULL
          )
         WHERE es.id = ?
           AND es.class_id = ?
           AND (? IS NULL OR es.section_id = ?)
         LIMIT 1`,
        [teacherId, resolvedExamSubjectId, classId, sectionId, sectionId]
      );

      if (!allowed[0]) {
        return res.status(403).json({ message: 'You are not allowed to access this marks sheet' });
      }
    }

    res.json(await markModel.getMarksSheet(resolvedExamSubjectId, classId, sectionId));
  } catch (err) {
    next(err);
  }
};

module.exports = {
  dashboard,
  assignedClasses,
  listSubjects,
  timetable,
  listExams,
  listExamSubjects,
  marksSheet,
  listAssignments,
  listMaterials,
  createNotification,
  markAttendance,
  uploadAssignment,
  enterMarks,
  studentPerformance,
  uploadMaterial,
  listStudentsByClass,
  notifications
};
