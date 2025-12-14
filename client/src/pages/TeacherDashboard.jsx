import React from 'react';
import { Link } from 'react-router-dom';

export default function TeacherDashboard() {
  return (
    <div className="p-6 text-white space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Teacher Dashboard</h1>
        <p className="text-sm opacity-80">
          Welcome Teacher! Use the quick links below.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/teacher/attendance"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm hover:border-primary-500"
        >
          <h2 className="font-semibold mb-1">Attendance</h2>
          <p className="text-slate-400">
            View classes and mark daily attendance.
          </p>
        </Link>
        <Link
          to="/teacher/marks"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm hover:border-primary-500"
        >
          <h2 className="font-semibold mb-1">Exams & Marks</h2>
          <p className="text-slate-400">
            Enter exam marks and view reports.
          </p>
        </Link>
        <Link
          to="/teacher/profile"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm hover:border-primary-500"
        >
          <h2 className="font-semibold mb-1">My Profile</h2>
          <p className="text-slate-400">
            Update your experience, bio and contact details.
          </p>
        </Link>
      </div>
    </div>
  );
}
