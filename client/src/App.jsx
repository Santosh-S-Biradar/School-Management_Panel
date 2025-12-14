import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";

import Students from "./pages/Students.jsx";
import Teachers from "./pages/Teachers.jsx";
import Classes from "./pages/Classes.jsx";

import AttendanceOverview from "./pages/AttendanceOverview.jsx";
import AttendanceClass from "./pages/AttendanceClass.jsx";
import Fees from "./pages/Fees.jsx";
import Users from "./pages/Users.jsx";
import NotFound from "./pages/NotFound.jsx";

//  FIX: Correct Import
import StudentAttendance from "./pages/StudentAttendance.jsx";

import Sidebar from "./components/layout/Sidebar.jsx";
import Navbar from "./components/layout/Navbar.jsx";

const ProtectedLayout = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Navbar />

        <main className="flex-1 overflow-y-auto">
          <Routes>

            {/* ADMIN ROUTES */}
            {user.role === "admin" && (
              <>
                <Route path="/" element={<Dashboard />} />
                <Route path="/students" element={<Students />} />
                <Route path="/teachers" element={<Teachers />} />
                <Route path="/classes" element={<Classes />} />
                <Route path="/attendance" element={<AttendanceOverview />} />
                <Route path="/attendance/class/:classId" element={<AttendanceClass />} />
                <Route path="/fees" element={<Fees />} />
                <Route path="/users" element={<Users />} />

                {/* Admin has no need to view student self attendance */}
              </>
            )}
            

            {/* TEACHER ROUTES */}
            {user.role === "teacher" && (
              <>
                <Route path="/teacher" element={<TeacherDashboard />} />
                <Route path="/attendance" element={<AttendanceOverview />} />
                <Route path="/attendance/class/:classId" element={<AttendanceClass />} />
              </>
            )}

            {/* STUDENT ROUTES */}
            {user.role === "student" && (
              <>
                {user.role === "student" && (
                <>
                  <Route path="/student" element={<StudentDashboard />} />
                  <Route path="/attendance" element={<StudentAttendance />} />
                  <Route path="/fees" element={<Fees />} />
                </>
                )}

              </>
            )}

            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={
          user ? (
            user.role === "admin" ? (
              <Navigate to="/" />
            ) : user.role === "teacher" ? (
              <Navigate to="/teacher" />
            ) : (
              <Navigate to="/student" />
            )
          ) : (
            <Login />
          )
        }
      />

      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
};

export default App;
