import React from 'react';
import { Link } from 'react-router-dom';

export default function StudentDashboard() {
  return (
    <div className="p-6 text-white space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Student Dashboard</h1>
        <p className="text-sm opacity-80">
          Welcome Student! Track your attendance, fees and marks here.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <Link
          to="/student/attendance"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm hover:border-primary-500"
        >
          <h2 className="font-semibold mb-1">My Attendance</h2>
          <p className="text-slate-400">
            View your full attendance history and percentage.
          </p>
        </Link>
        <Link
          to="/student/fees"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm hover:border-primary-500"
        >
          <h2 className="font-semibold mb-1">My Fees</h2>
          <p className="text-slate-400">
            Check paid, due and upcoming payments.
          </p>
        </Link>
        <Link
          to="/student/marks"
          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-sm hover:border-primary-500"
        >
          <h2 className="font-semibold mb-1">My Marks</h2>
          <p className="text-slate-400">
            See exam-wise marks and reports.
          </p>
        </Link>
      </div>
    </div>
  );
}
