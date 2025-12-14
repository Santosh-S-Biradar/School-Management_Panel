import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import classRoutes from './routes/classRoutes.js';
import announcementRoutes from './routes/announcementRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import marksRoutes from './routes/marksRoutes.js';
import { notFound, errorHandler } from './middleware/errorMiddleware.js';
import { pool } from './config/db.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Simple healthcheck
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'School Management Panel API' });
});

// Verify DB connection on startup (non-blocking for requests)
(async () => {
  try {
    await pool.query('SELECT 1');
    console.log('MySQL connected');
  } catch (err) {
    console.error('MySQL connection error:', err.message);
  }
})();

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/marks', marksRoutes);

// Fallbacks
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
