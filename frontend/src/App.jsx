import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { SearchProvider } from './context/SearchContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Unauthorized from './pages/Unauthorized';
import AdminDashboard from './pages/AdminDashboard';
import StudentsPage from './pages/StudentsPage';
import TeachersPage from './pages/TeachersPage';
import ClassesPage from './pages/ClassesPage';
import SubjectsPage from './pages/SubjectsPage';
import TimetablePage from './pages/TimetablePage';
import ExamsPage from './pages/ExamsPage';
import FeesPage from './pages/FeesPage';
import AttendancePage from './pages/AttendancePage';
import NotificationsPage from './pages/NotificationsPage';
import TeacherDashboard from './pages/TeacherDashboard';
import TeacherAttendancePage from './pages/TeacherAttendancePage';
import TeacherAssignmentsPage from './pages/TeacherAssignmentsPage';
import TeacherMarksPage from './pages/TeacherMarksPage';
import TeacherTimetablePage from './pages/TeacherTimetablePage';
import TeacherSubjectsPage from './pages/TeacherSubjectsPage';
import TeacherMaterialsPage from './pages/TeacherMaterialsPage';
import StudentDashboard from './pages/StudentDashboard';
import StudentTimetablePage from './pages/StudentTimetablePage';
import StudentAttendancePage from './pages/StudentAttendancePage';
import StudentAssignmentsPage from './pages/StudentAssignmentsPage';
import StudentMarksPage from './pages/StudentMarksPage';
import StudentMaterialsPage from './pages/StudentMaterialsPage';
import ParentDashboard from './pages/ParentDashboard';
import ParentAttendancePage from './pages/ParentAttendancePage';
import ParentPerformancePage from './pages/ParentPerformancePage';
import ParentFeesPage from './pages/ParentFeesPage';
import ProfilePage from './pages/ProfilePage';

const App = () => (
  <AuthProvider>
    <SearchProvider>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/profile" element={<ProtectedRoute roles={['admin']}><ProfilePage /></ProtectedRoute>} />
        <Route path="/admin/students" element={<ProtectedRoute roles={['admin']}><StudentsPage /></ProtectedRoute>} />
        <Route path="/admin/teachers" element={<ProtectedRoute roles={['admin']}><TeachersPage /></ProtectedRoute>} />
        <Route path="/admin/classes" element={<ProtectedRoute roles={['admin']}><ClassesPage /></ProtectedRoute>} />
        <Route path="/admin/subjects" element={<ProtectedRoute roles={['admin']}><SubjectsPage /></ProtectedRoute>} />
        <Route path="/admin/timetable" element={<ProtectedRoute roles={['admin']}><TimetablePage /></ProtectedRoute>} />
        <Route path="/admin/exams" element={<ProtectedRoute roles={['admin']}><ExamsPage /></ProtectedRoute>} />
        <Route path="/admin/fees" element={<ProtectedRoute roles={['admin']}><FeesPage /></ProtectedRoute>} />
        <Route path="/admin/attendance" element={<ProtectedRoute roles={['admin']}><AttendancePage /></ProtectedRoute>} />
        <Route path="/admin/notifications" element={<ProtectedRoute roles={['admin']}><NotificationsPage /></ProtectedRoute>} />

        <Route path="/teacher" element={<ProtectedRoute roles={['teacher']}><TeacherDashboard /></ProtectedRoute>} />
        <Route path="/teacher/profile" element={<ProtectedRoute roles={['teacher']}><ProfilePage /></ProtectedRoute>} />
        <Route path="/teacher/timetable" element={<ProtectedRoute roles={['teacher']}><TeacherTimetablePage /></ProtectedRoute>} />
        <Route path="/teacher/subjects" element={<ProtectedRoute roles={['teacher']}><TeacherSubjectsPage /></ProtectedRoute>} />
        <Route path="/teacher/attendance" element={<ProtectedRoute roles={['teacher']}><TeacherAttendancePage /></ProtectedRoute>} />
        <Route path="/teacher/assignments" element={<ProtectedRoute roles={['teacher']}><TeacherAssignmentsPage /></ProtectedRoute>} />
        <Route path="/teacher/materials" element={<ProtectedRoute roles={['teacher']}><TeacherMaterialsPage /></ProtectedRoute>} />
        <Route path="/teacher/marks" element={<ProtectedRoute roles={['teacher']}><TeacherMarksPage /></ProtectedRoute>} />
        <Route path="/teacher/notifications" element={<ProtectedRoute roles={['teacher']}><NotificationsPage /></ProtectedRoute>} />

        <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentDashboard /></ProtectedRoute>} />
        <Route path="/student/profile" element={<ProtectedRoute roles={['student']}><ProfilePage /></ProtectedRoute>} />
        <Route path="/student/timetable" element={<ProtectedRoute roles={['student']}><StudentTimetablePage /></ProtectedRoute>} />
        <Route path="/student/attendance" element={<ProtectedRoute roles={['student']}><StudentAttendancePage /></ProtectedRoute>} />
        <Route path="/student/assignments" element={<ProtectedRoute roles={['student']}><StudentAssignmentsPage /></ProtectedRoute>} />
        <Route path="/student/marks" element={<ProtectedRoute roles={['student']}><StudentMarksPage /></ProtectedRoute>} />
        <Route path="/student/materials" element={<ProtectedRoute roles={['student']}><StudentMaterialsPage /></ProtectedRoute>} />
        <Route path="/student/notifications" element={<ProtectedRoute roles={['student']}><NotificationsPage /></ProtectedRoute>} />

        <Route path="/parent" element={<ProtectedRoute roles={['parent']}><ParentDashboard /></ProtectedRoute>} />
        <Route path="/parent/profile" element={<ProtectedRoute roles={['parent']}><ProfilePage /></ProtectedRoute>} />
        <Route path="/parent/attendance" element={<ProtectedRoute roles={['parent']}><ParentAttendancePage /></ProtectedRoute>} />
        <Route path="/parent/performance" element={<ProtectedRoute roles={['parent']}><ParentPerformancePage /></ProtectedRoute>} />
        <Route path="/parent/fees" element={<ProtectedRoute roles={['parent']}><ParentFeesPage /></ProtectedRoute>} />
        <Route path="/parent/notifications" element={<ProtectedRoute roles={['parent']}><NotificationsPage /></ProtectedRoute>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </SearchProvider>
  </AuthProvider>
);

export default App;
