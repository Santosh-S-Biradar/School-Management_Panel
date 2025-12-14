import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

const linkBase =
  'block px-3 py-2 rounded-lg text-sm font-medium transition-colors';
const linkActive = 'bg-primary-500 text-white';
const linkNormal = 'hover:bg-slate-800 text-slate-300';

const makeClassName = ({ isActive }) =>
  [linkBase, isActive ? linkActive : linkNormal].join(' ');

const Sidebar = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 min-h-screen p-4 border-r border-slate-800">
      <h1 className="text-2xl font-bold mb-6 text-primary-400 tracking-wide">
        School Panel
      </h1>

      <nav className="space-y-4 text-sm">
        {/* Admin links */}
        {user.role === 'admin' && (
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
              Admin
            </p>
            <NavLink to="/" end className={makeClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/classes" className={makeClassName}>
              Classes
            </NavLink>
            <NavLink to="/students" className={makeClassName}>
              Students
            </NavLink>
            <NavLink to="/teachers" className={makeClassName}>
              Teachers
            </NavLink>
            <NavLink to="/attendance" className={makeClassName}>
              Attendance
            </NavLink>
            <NavLink to="/fees" className={makeClassName}>
              Fees
            </NavLink>
            <NavLink to="/announcements" className={makeClassName}>
              Announcements
            </NavLink>
            <NavLink to="/messages" className={makeClassName}>
              Messages
            </NavLink>
            <NavLink to="/users" className={makeClassName}>
              Users
            </NavLink>

          </div>
        )}

        {/* Teacher links */}
        {user.role === 'teacher' && (
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
              Teacher
            </p>
            <NavLink to="/" end className={makeClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/teacher/profile" className={makeClassName}>
              My Profile
            </NavLink>
            <NavLink to="/teacher/attendance" className={makeClassName}>
              Attendance
            </NavLink>
            <NavLink to="/teacher/marks" className={makeClassName}>
              Exams & Marks
            </NavLink>
            <NavLink to="/announcements" className={makeClassName}>
              Announcements
            </NavLink>
            <NavLink to="/messages" className={makeClassName}>
              Messages
            </NavLink>
          </div>
        )}

        {/* Student links */}
        {user.role === 'student' && (
          <div className="space-y-1">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
              Student
            </p>
            <NavLink to="/" end className={makeClassName}>
              Dashboard
            </NavLink>
            <NavLink to="/student/profile" className={makeClassName}>
              My Profile
            </NavLink>
            <NavLink to="/student/attendance" className={makeClassName}>
              My Attendance
            </NavLink>
            <NavLink to="/student/fees" className={makeClassName}>
              My Fees
            </NavLink>
            <NavLink to="/student/marks" className={makeClassName}>
              My Marks
            </NavLink>
            <NavLink to="/announcements" className={makeClassName}>
              Announcements
            </NavLink>
            <NavLink to="/messages" className={makeClassName}>
              Messages
            </NavLink>
          </div>
        )}
      </nav>

      <div className="mt-8 text-xs text-slate-400 border-t border-slate-800 pt-3">
        Logged in as:{' '}
        <span className="font-semibold capitalize">
          {user.name} ({user.role})
        </span>
      </div>
    </aside>
  );
};

export default Sidebar;
