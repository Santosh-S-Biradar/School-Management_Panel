// src/routes/attendanceRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  markAttendance,
  getAttendanceSummary,
  getStudentsByClass,
  getAttendanceByStudent
} from "../controllers/attendanceController.js";

const router = express.Router();

router.post("/", protect(["admin", "teacher"]), markAttendance);
router.get("/summary", protect(["admin", "teacher"]), getAttendanceSummary);
router.get("/class/:classId", protect(["admin", "teacher"]), getStudentsByClass);
router.get("/student/:studentId", protect(["admin", "teacher", "student"]), getAttendanceByStudent);

export default router;
