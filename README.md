# School Management Panel

Production-ready internship project featuring multi-role dashboards, secure authentication, and full school operations management.

## Overview
The School Management Panel is a full-stack system for administrators, teachers, students, and parents. It includes role-based dashboards, CRUD management, attendance, exams, fees, and notifications with a clean SaaS-style UI.

## Features
- JWT authentication (login, logout, forgot/reset password)
- Role-based access control (Admin, Teacher, Student, Parent)
- Admin: students/teachers/classes/sections/subjects CRUD, teacher assignments, timetables, exams, marks, fees, attendance overview, notifications, CSV reports
- Teacher: assigned classes, attendance marking, assignments, marks, materials
- Student: profile, timetable, attendance, assignments, marks, materials, notifications
- Parent: child details, attendance, performance, fees, notifications
- Responsive UI with sidebar/topbar layout, toast notifications, loading and empty states

## Tech Stack
Frontend: React (Vite), Tailwind CSS, React Router DOM, Axios, Context API
Backend: Node.js, Express.js, JWT, Bcrypt, MVC structure
Database: MySQL

## Installation
### 1) Backend
```bash
cd backend
npm install
```

Create `.env` using the example:
```bash
copy .env.example .env
```

Run the server:
```bash
npm run dev
```

### 2) Database
Open MySQL and run:
```sql
source backend/database.sql;
```

### 3) Frontend
```bash
cd frontend
npm install
```

Create `.env` using the example:
```bash
copy .env.example .env
```

Run the app:
```bash
npm run dev
```

## Environment Setup
Backend `.env`:
- `PORT`
- `CLIENT_ORIGIN`
- `JWT_SECRET`
- `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `DB_PORT`
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`

Frontend `.env`:
- `VITE_API_URL`

## Database Schema
Defined in `backend/database.sql` with full relational constraints:
- users, roles
- students, teachers, parents, student_parents
- classes, sections, subjects
- teacher_assignments
- timetables
- attendance
- exams, exam_subjects, marks
- fees
- notifications
- password_resets

## API Overview
Base URL: `/api`

Auth
- `POST /auth/login`
- `GET /auth/me`
- `POST /auth/forgot-password`
- `POST /auth/reset-password`

Admin
- `GET /admin/dashboard`
- `POST /admin/students`
- `GET /admin/students`
- `GET /admin/students/:id`
- `PUT /admin/students/:id`
- `DELETE /admin/students/:id`
- `POST /admin/teachers`
- `GET /admin/teachers`
- `PUT /admin/teachers/:id`
- `DELETE /admin/teachers/:id`
- `POST /admin/parents`
- `GET /admin/parents`
- `POST /admin/classes`
- `GET /admin/classes`
- `PUT /admin/classes/:id`
- `DELETE /admin/classes/:id`
- `POST /admin/sections`
- `GET /admin/sections`
- `PUT /admin/sections/:id`
- `DELETE /admin/sections/:id`
- `POST /admin/subjects`
- `GET /admin/subjects`
- `PUT /admin/subjects/:id`
- `DELETE /admin/subjects/:id`
- `POST /admin/teacher-assignments`
- `POST /admin/timetables`
- `GET /admin/timetables`
- `DELETE /admin/timetables/:id`
- `POST /admin/exams`
- `GET /admin/exams`
- `POST /admin/exam-subjects`
- `GET /admin/exam-subjects`
- `POST /admin/marks`
- `POST /admin/fees`
- `PUT /admin/fees/:id`
- `GET /admin/fees`
- `GET /admin/attendance-overview`
- `POST /admin/notifications`
- `GET /admin/notifications`
- `GET /admin/reports/students`
- `GET /admin/reports/teachers`

Teacher
- `GET /teacher/dashboard`
- `GET /teacher/assigned-classes`
- `GET /teacher/students`
- `POST /teacher/attendance`
- `POST /teacher/assignments`
- `POST /teacher/materials`
- `POST /teacher/marks`
- `GET /teacher/performance/:studentId`
- `GET /teacher/notifications`

Student
- `GET /student/dashboard`
- `GET /student/profile`
- `GET /student/timetable`
- `GET /student/attendance`
- `GET /student/assignments`
- `GET /student/marks`
- `GET /student/materials`
- `GET /student/notifications`

Parent
- `GET /parent/dashboard`
- `GET /parent/children`
- `GET /parent/attendance/:studentId`
- `GET /parent/performance/:studentId`
- `GET /parent/fees/:studentId`
- `GET /parent/notifications`

## Folder Structure
Frontend
```
frontend/
  src/
    components/
    pages/
    layouts/
    context/
    services/
    routes/
    assets/
    App.jsx
```

Backend
```
backend/
  controllers/
  routes/
  models/
  middleware/
  config/
  utils/
  server.js
```

## Testing Checklist
- Auth: login, forgot/reset password
- Role-based routing and API protection
- Admin CRUD for students, teachers, classes, subjects
- Teacher attendance and marks entry
- Student timetable, attendance, assignments, marks
- Parent performance and fee status
- Notifications and CSV reports

## Notes
- Use Postman to test protected APIs (add `Authorization: Bearer <token>`).
- Replace SMTP credentials to enable email reset.
