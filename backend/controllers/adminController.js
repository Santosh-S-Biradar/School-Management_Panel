const bcrypt = require('bcryptjs');
const { pool, query } = require('../config/db');
const { ROLES } = require('../config/constants');
const roleModel = require('../models/roleModel');
const userModel = require('../models/userModel');
const studentModel = require('../models/studentModel');
const teacherModel = require('../models/teacherModel');
const parentModel = require('../models/parentModel');
const classModel = require('../models/classModel');
const sectionModel = require('../models/sectionModel');
const subjectModel = require('../models/subjectModel');
const teacherAssignmentModel = require('../models/teacherAssignmentModel');
const timetableModel = require('../models/timetableModel');
const examModel = require('../models/examModel');
const markModel = require('../models/markModel');
const feeModel = require('../models/feeModel');
const attendanceModel = require('../models/attendanceModel');
const notificationModel = require('../models/notificationModel');
const { parsePagination } = require('../utils/pagination');
const { toCsv } = require('../utils/report');

const dashboardStats = async (req, res, next) => {
  try {
    const [students, teachers, parents, classes] = await Promise.all([
      studentModel.countStudents(),
      teacherModel.countTeachers(),
      userModel.countByRole(ROLES.PARENT),
      query('SELECT COUNT(*) AS total FROM classes')
    ]);

    res.json({
      students,
      teachers,
      parents,
      classes: classes[0]?.total || 0
    });
  } catch (err) {
    next(err);
  }
};

const createStudent = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const roleId = await roleModel.getRoleId(ROLES.STUDENT);
    const { name, email, password, phone, admissionNo, classId, sectionId, dob, gender, address, parentId, relationship } = req.body;
    const safeSectionId = sectionId ? sectionId : null;

    const passwordHash = await bcrypt.hash(password, 10);
    await conn.beginTransaction();
    const [userResult] = await conn.execute(
      `INSERT INTO users (role_id, name, email, password_hash, phone)
       VALUES (?, ?, ?, ?, ?)`
      , [roleId, name, email, passwordHash, phone || null]
    );
    const userId = userResult.insertId;
    const [studentResult] = await conn.execute(
      `INSERT INTO students (user_id, admission_no, class_id, section_id, dob, gender, address)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
      , [userId, admissionNo, classId, safeSectionId, dob, gender, address]
    );

    if (parentId) {
      await conn.execute(
        `INSERT INTO student_parents (parent_id, student_id, relationship) VALUES (?, ?, ?)`
        , [parentId, studentResult.insertId, relationship || 'Parent']
      );
    }

    await conn.commit();
    res.status(201).json({ id: studentResult.insertId });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

const listStudents = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const [data, total] = await Promise.all([
      studentModel.listStudents(limit, offset),
      studentModel.countStudents()
    ]);
    res.json({ data, page, limit, total });
  } catch (err) {
    next(err);
  }
};

const getStudent = async (req, res, next) => {
  try {
    const student = await studentModel.getStudent(req.params.id);
    if (!student) return res.status(404).json({ message: 'Student not found' });
    res.json(student);
  } catch (err) {
    next(err);
  }
};

const updateStudent = async (req, res, next) => {
  try {
    const { userId, ...studentPayload } = req.body;
    if (userId) {
      await userModel.updateUser(userId, req.body.user || {});
    }
    const mapped = {
      admission_no: studentPayload.admissionNo,
      class_id: studentPayload.classId,
      section_id: studentPayload.sectionId,
      dob: studentPayload.dob,
      gender: studentPayload.gender,
      address: studentPayload.address
    };
    Object.keys(mapped).forEach((k) => mapped[k] === undefined && delete mapped[k]);
    await studentModel.updateStudent(req.params.id, mapped);
    res.json({ message: 'Student updated' });
  } catch (err) {
    next(err);
  }
};

const deleteStudent = async (req, res, next) => {
  try {
    await studentModel.deleteStudent(req.params.id);
    res.json({ message: 'Student deleted' });
  } catch (err) {
    next(err);
  }
};

const createTeacher = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const roleId = await roleModel.getRoleId(ROLES.TEACHER);
    const { name, email, password, phone, employeeNo, department, qualification } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    await conn.beginTransaction();
    const [userResult] = await conn.execute(
      `INSERT INTO users (role_id, name, email, password_hash, phone)
       VALUES (?, ?, ?, ?, ?)`
      , [roleId, name, email, passwordHash, phone || null]
    );
    const userId = userResult.insertId;
    const [teacherResult] = await conn.execute(
      `INSERT INTO teachers (user_id, employee_no, department, qualification)
       VALUES (?, ?, ?, ?)`
      , [userId, employeeNo, department, qualification]
    );

    await conn.commit();
    res.status(201).json({ id: teacherResult.insertId });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

const listTeachers = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const [data, total] = await Promise.all([
      teacherModel.listTeachers(limit, offset),
      teacherModel.countTeachers()
    ]);
    res.json({ data, page, limit, total });
  } catch (err) {
    next(err);
  }
};

const getTeacher = async (req, res, next) => {
  try {
    const teacher = await teacherModel.getTeacher(req.params.id);
    if (!teacher) return res.status(404).json({ message: 'Teacher not found' });
    res.json(teacher);
  } catch (err) {
    next(err);
  }
};

const updateTeacher = async (req, res, next) => {
  try {
    const { userId, ...teacherPayload } = req.body;
    if (userId) {
      await userModel.updateUser(userId, req.body.user || {});
    }
    const mapped = {
      employee_no: teacherPayload.employeeNo,
      department: teacherPayload.department,
      qualification: teacherPayload.qualification
    };
    Object.keys(mapped).forEach((k) => mapped[k] === undefined && delete mapped[k]);
    await teacherModel.updateTeacher(req.params.id, mapped);
    res.json({ message: 'Teacher updated' });
  } catch (err) {
    next(err);
  }
};

const deleteTeacher = async (req, res, next) => {
  try {
    await teacherModel.deleteTeacher(req.params.id);
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    next(err);
  }
};

const createParent = async (req, res, next) => {
  const conn = await pool.getConnection();
  try {
    const roleId = await roleModel.getRoleId(ROLES.PARENT);
    const { name, email, password, phone, occupation } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);

    await conn.beginTransaction();
    const [userResult] = await conn.execute(
      `INSERT INTO users (role_id, name, email, password_hash, phone)
       VALUES (?, ?, ?, ?, ?)`
      , [roleId, name, email, passwordHash, phone || null]
    );
    const userId = userResult.insertId;
    const [parentResult] = await conn.execute(
      `INSERT INTO parents (user_id, occupation) VALUES (?, ?)`
      , [userId, occupation]
    );

    await conn.commit();
    res.status(201).json({ id: parentResult.insertId });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
};

const listParents = async (req, res, next) => {
  try {
    const { page, limit, offset } = parsePagination(req);
    const data = await query(
      `SELECT p.id, p.occupation, u.name, u.email, u.phone
       FROM parents p
       JOIN users u ON u.id = p.user_id
       ORDER BY p.id DESC
       LIMIT ? OFFSET ?`,
      [limit, offset]
    );
    const totalRows = await query('SELECT COUNT(*) AS total FROM parents');
    res.json({ data, page, limit, total: totalRows[0]?.total || 0 });
  } catch (err) {
    next(err);
  }
};

const createClass = async (req, res, next) => {
  try {
    const id = await classModel.createClass(req.body);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

const listClasses = async (req, res, next) => {
  try {
    res.json(await classModel.listClasses());
  } catch (err) {
    next(err);
  }
};

const updateClass = async (req, res, next) => {
  try {
    const mapped = {
      name: req.body.name,
      grade_level: req.body.gradeLevel
    };
    Object.keys(mapped).forEach((k) => mapped[k] === undefined && delete mapped[k]);
    await classModel.updateClass(req.params.id, mapped);
    res.json({ message: 'Class updated' });
  } catch (err) {
    next(err);
  }
};

const deleteClass = async (req, res, next) => {
  try {
    await classModel.deleteClass(req.params.id);
    res.json({ message: 'Class deleted' });
  } catch (err) {
    next(err);
  }
};

const createSection = async (req, res, next) => {
  try {
    const id = await sectionModel.createSection(req.body);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

const listSections = async (req, res, next) => {
  try {
    res.json(await sectionModel.listSections(req.query.classId));
  } catch (err) {
    next(err);
  }
};

const updateSection = async (req, res, next) => {
  try {
    const mapped = {
      class_id: req.body.classId,
      name: req.body.name
    };
    Object.keys(mapped).forEach((k) => mapped[k] === undefined && delete mapped[k]);
    await sectionModel.updateSection(req.params.id, mapped);
    res.json({ message: 'Section updated' });
  } catch (err) {
    next(err);
  }
};

const deleteSection = async (req, res, next) => {
  try {
    await sectionModel.deleteSection(req.params.id);
    res.json({ message: 'Section deleted' });
  } catch (err) {
    next(err);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const id = await subjectModel.createSubject(req.body);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

const listSubjects = async (req, res, next) => {
  try {
    res.json(await subjectModel.listSubjects());
  } catch (err) {
    next(err);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    await subjectModel.updateSubject(req.params.id, req.body);
    res.json({ message: 'Subject updated' });
  } catch (err) {
    next(err);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    await subjectModel.deleteSubject(req.params.id);
    res.json({ message: 'Subject deleted' });
  } catch (err) {
    next(err);
  }
};

const assignTeacher = async (req, res, next) => {
  try {
    const payload = {
      teacherId: req.body.teacherId,
      classId: req.body.classId,
      sectionId: req.body.sectionId || null,
      subjectId: req.body.subjectId
    };
    const id = await teacherAssignmentModel.createTeacherAssignment(payload);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

const createTimetable = async (req, res, next) => {
  try {
    const entryType = req.body.entryType || 'lecture';
    if (entryType !== 'lecture' && entryType !== 'break') {
      return res.status(400).json({ message: 'Invalid entry type' });
    }
    if (entryType === 'lecture' && (!req.body.subjectId || !req.body.teacherId)) {
      return res.status(400).json({ message: 'Lecture requires subject and teacher' });
    }
    if (entryType === 'break' && !req.body.title) {
      return res.status(400).json({ message: 'Break requires title' });
    }

    const classConflict = await timetableModel.hasClassConflict({
      classId: req.body.classId,
      dayOfWeek: req.body.dayOfWeek,
      startTime: req.body.startTime,
      endTime: req.body.endTime
    });
    if (classConflict) {
      return res.status(409).json({ message: 'Class has an overlapping timetable period' });
    }

    if (entryType === 'lecture') {
      const teacherConflict = await timetableModel.hasTeacherConflict({
        teacherId: req.body.teacherId,
        dayOfWeek: req.body.dayOfWeek,
        startTime: req.body.startTime,
        endTime: req.body.endTime
      });
      if (teacherConflict) {
        return res.status(409).json({ message: 'Teacher has an overlapping timetable period' });
      }
    }

    const id = await timetableModel.createTimetable({
      ...req.body,
      entryType,
      title: entryType === 'break' ? req.body.title : null,
      subjectId: entryType === 'lecture' ? req.body.subjectId : null,
      teacherId: entryType === 'lecture' ? req.body.teacherId : null
    });
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

const updateTimetable = async (req, res, next) => {
  try {
    const entryType = req.body.entryType || 'lecture';
    if (entryType !== 'lecture' && entryType !== 'break') {
      return res.status(400).json({ message: 'Invalid entry type' });
    }
    if (entryType === 'lecture' && (!req.body.subjectId || !req.body.teacherId)) {
      return res.status(400).json({ message: 'Lecture requires subject and teacher' });
    }
    if (entryType === 'break' && !req.body.title) {
      return res.status(400).json({ message: 'Break requires title' });
    }

    const classConflict = await timetableModel.hasClassConflict({
      classId: req.body.classId,
      dayOfWeek: req.body.dayOfWeek,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
      excludeId: req.params.id
    });
    if (classConflict) {
      return res.status(409).json({ message: 'Class has an overlapping timetable period' });
    }

    if (entryType === 'lecture') {
      const teacherConflict = await timetableModel.hasTeacherConflict({
        teacherId: req.body.teacherId,
        dayOfWeek: req.body.dayOfWeek,
        startTime: req.body.startTime,
        endTime: req.body.endTime,
        excludeId: req.params.id
      });
      if (teacherConflict) {
        return res.status(409).json({ message: 'Teacher has an overlapping timetable period' });
      }
    }

    const mapped = {
      class_id: req.body.classId,
      section_id: req.body.sectionId,
      day_of_week: req.body.dayOfWeek,
      start_time: req.body.startTime,
      end_time: req.body.endTime,
      entry_type: entryType,
      title: entryType === 'break' ? req.body.title : null,
      subject_id: entryType === 'lecture' ? req.body.subjectId : null,
      teacher_id: entryType === 'lecture' ? req.body.teacherId : null,
      room: req.body.room
    };
    Object.keys(mapped).forEach((k) => mapped[k] === undefined && delete mapped[k]);
    await timetableModel.updateTimetable(req.params.id, mapped);
    res.json({ message: 'Timetable updated' });
  } catch (err) {
    next(err);
  }
};

const listTimetableClasses = async (req, res, next) => {
  try {
    res.json(await timetableModel.listTimetableClasses());
  } catch (err) {
    next(err);
  }
};

const listTimetables = async (req, res, next) => {
  try {
    const { classId, sectionId } = req.query;
    res.json(await timetableModel.listTimetables(classId, sectionId));
  } catch (err) {
    next(err);
  }
};

const deleteTimetable = async (req, res, next) => {
  try {
    await timetableModel.deleteTimetable(req.params.id);
    res.json({ message: 'Timetable deleted' });
  } catch (err) {
    next(err);
  }
};

const deleteTimetableGroup = async (req, res, next) => {
  try {
    const classId = Number(req.params.classId);
    const sectionId = req.query.sectionId ? Number(req.query.sectionId) : null;
    await timetableModel.deleteTimetableGroup(classId, sectionId);
    res.json({ message: 'Timetable group deleted' });
  } catch (err) {
    next(err);
  }
};

const createExam = async (req, res, next) => {
  try {
    const id = await examModel.createExam(req.body);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

const updateExam = async (req, res, next) => {
  try {
    const mapped = {
      name: req.body.name,
      start_date: req.body.startDate,
      end_date: req.body.endDate
    };
    Object.keys(mapped).forEach((k) => mapped[k] === undefined && delete mapped[k]);
    await examModel.updateExam(req.params.id, mapped);
    res.json({ message: 'Exam updated' });
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

const deleteExam = async (req, res, next) => {
  try {
    await examModel.deleteExam(req.params.id);
    res.json({ message: 'Exam deleted' });
  } catch (err) {
    next(err);
  }
};

const addExamSubject = async (req, res, next) => {
  try {
    const payload = {
      examId: req.body.examId,
      classId: req.body.classId,
      sectionId: req.body.sectionId || null,
      subjectId: req.body.subjectId,
      maxMarks: req.body.maxMarks
    };
    const id = await examModel.addExamSubject(payload);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

const listExamSubjects = async (req, res, next) => {
  try {
    const { examId, classId, sectionId } = req.query;
    res.json(await examModel.listExamSubjects(examId, classId, sectionId));
  } catch (err) {
    next(err);
  }
};

const upsertMarks = async (req, res, next) => {
  try {
    await markModel.upsertMarks(req.body.records || []);
    res.json({ message: 'Marks saved' });
  } catch (err) {
    next(err);
  }
};

const createFee = async (req, res, next) => {
  try {
    const id = await feeModel.createFee(req.body);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

const updateFee = async (req, res, next) => {
  try {
    const mapped = {
      student_id: req.body.studentId,
      amount: req.body.amount,
      due_date: req.body.dueDate,
      status: req.body.status,
      paid_date: req.body.paidDate
    };
    Object.keys(mapped).forEach((k) => mapped[k] === undefined && delete mapped[k]);
    await feeModel.updateFee(req.params.id, mapped);
    res.json({ message: 'Fee updated' });
  } catch (err) {
    next(err);
  }
};

const deleteFee = async (req, res, next) => {
  try {
    await feeModel.deleteFee(req.params.id);
    res.json({ message: 'Fee deleted' });
  } catch (err) {
    next(err);
  }
};

const listFees = async (req, res, next) => {
  try {
    res.json(await feeModel.listFees(req.query.studentId));
  } catch (err) {
    next(err);
  }
};

const attendanceOverview = async (req, res, next) => {
  try {
    res.json(await attendanceModel.getAttendanceOverview());
  } catch (err) {
    next(err);
  }
};

const createNotification = async (req, res, next) => {
  try {
    const id = await notificationModel.createNotification(req.body);
    res.status(201).json({ id });
  } catch (err) {
    next(err);
  }
};

const updateNotification = async (req, res, next) => {
  try {
    const mapped = {
      title: req.body.title,
      message: req.body.message,
      target_role: req.body.targetRole,
      target_user_id: req.body.targetUserId
    };
    Object.keys(mapped).forEach((k) => mapped[k] === undefined && delete mapped[k]);
    await notificationModel.updateNotification(req.params.id, mapped);
    res.json({ message: 'Notification updated' });
  } catch (err) {
    next(err);
  }
};

const deleteNotification = async (req, res, next) => {
  try {
    await notificationModel.deleteNotification(req.params.id);
    res.json({ message: 'Notification deleted' });
  } catch (err) {
    next(err);
  }
};

const listNotifications = async (req, res, next) => {
  try {
    res.json(await notificationModel.listNotificationsForUser(req.user.id, req.user.role));
  } catch (err) {
    next(err);
  }
};

const reportStudents = async (req, res, next) => {
  try {
    const rows = await studentModel.listStudents(10000, 0);
    const csv = toCsv(rows, ['id', 'admission_no', 'name', 'email', 'phone', 'class_name', 'section_name']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="students.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

const reportTeachers = async (req, res, next) => {
  try {
    const rows = await teacherModel.listTeachers(10000, 0);
    const csv = toCsv(rows, ['id', 'employee_no', 'department', 'name', 'email', 'phone']);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="teachers.csv"');
    res.send(csv);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  dashboardStats,
  createStudent,
  listStudents,
  getStudent,
  updateStudent,
  deleteStudent,
  createTeacher,
  listTeachers,
  getTeacher,
  updateTeacher,
  deleteTeacher,
  createParent,
  listParents,
  createClass,
  listClasses,
  updateClass,
  deleteClass,
  createSection,
  listSections,
  updateSection,
  deleteSection,
  createSubject,
  listSubjects,
  updateSubject,
  deleteSubject,
  assignTeacher,
  createTimetable,
  listTimetableClasses,
  updateTimetable,
  listTimetables,
  deleteTimetable,
  deleteTimetableGroup,
  createExam,
  listExams,
  updateExam,
  deleteExam,
  addExamSubject,
  listExamSubjects,
  upsertMarks,
  createFee,
  updateFee,
  listFees,
  deleteFee,
  attendanceOverview,
  createNotification,
  updateNotification,
  deleteNotification,
  listNotifications,
  reportStudents,
  reportTeachers
};
