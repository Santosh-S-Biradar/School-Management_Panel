import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../services/api.js';

const AttendanceOverview = () => {
  const [classes, setClasses] = useState([]);
  const location = useLocation();
  const isTeacher = location.pathname.startsWith('/teacher');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/attendance/summary');
        setClasses(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-white">
        {isTeacher ? 'Attendance (Teacher View)' : 'Attendance (Admin View)'}
      </h1>
      <p className="text-sm text-slate-400">
        Select a class to see all students and mark attendance.
      </p>
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 text-slate-300">
            <tr>
              <th className="text-left px-4 py-2">Class</th>
              <th className="text-left px-4 py-2">Total Students</th>
              <th className="text-left px-4 py-2">Present Today</th>
              <th className="text-left px-4 py-2">Absent Today</th>
              <th className="text-left px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {classes.map((cls) => (
              <tr key={cls.class_id} className="border-t border-slate-800">
                <td className="px-4 py-2 text-slate-100">
                  {cls.class_name} {cls.section && <span>({cls.section})</span>}
                </td>
                <td className="px-4 py-2 text-slate-300">
                  {cls.total_students || 0}
                </td>
                <td className="px-4 py-2 text-emerald-400">
                  {cls.present_count || 0}
                </td>
                <td className="px-4 py-2 text-red-400">
                  {cls.absent_count || 0}
                </td>
                <td className="px-4 py-2">
                  <Link
                    to={`${isTeacher ? '/teacher' : ''}/attendance/class/${cls.class_id}`}
                    className="px-3 py-1 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-xs"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {!classes.length && (
              <tr>
                <td
                  colSpan="5"
                  className="text-center p-4 text-slate-500 text-sm"
                >
                  No classes found or attendance not recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceOverview;
