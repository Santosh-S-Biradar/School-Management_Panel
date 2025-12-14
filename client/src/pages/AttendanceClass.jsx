import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api.js';

const AttendanceClass = () => {
  const { classId } = useParams();
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/attendance/class/${classId}`, {
        params: { date }
      });
      setStudents(data.students || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classId, date]);

  const mark = async (studentId, status) => {
    try {
      await api.post('/attendance', { student_id: studentId, status, date });
      setStudents((prev) =>
        prev.map((s) =>
          s.id === studentId ? { ...s, status } : s
        )
      );
    } catch (err) {
      console.error(err);
      alert('Failed to mark attendance');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Class Attendance</h1>
          <p className="text-sm text-slate-400">
            Mark Present / Absent for each student on the selected date.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-slate-400">Date:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm"
          />
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-800/60 text-slate-300">
            <tr>
              <th className="text-left px-4 py-2">Name</th>
              <th className="text-left px-4 py-2">Roll</th>
              <th className="text-left px-4 py-2">Status</th>
              <th className="text-left px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-t border-slate-800">
                <td className="px-4 py-2 text-slate-100">{s.name}</td>
                <td className="px-4 py-2 text-slate-300">
                  {s.roll_number || '-'}
                </td>
                <td className="px-4 py-2">
                  {s.status ? (
                    <span
                      className={
                        s.status === 'Present'
                          ? 'px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs'
                          : 'px-2 py-1 rounded bg-red-500/10 text-red-400 text-xs'
                      }
                    >
                      {s.status}
                    </span>
                  ) : (
                    <span className="text-xs text-slate-500">Not marked</span>
                  )}
                </td>
                <td className="px-4 py-2 space-x-2">
                  <button
                    onClick={() => mark(s.id, 'Present')}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs"
                  >
                    Present
                  </button>
                  <button
                    onClick={() => mark(s.id, 'Absent')}
                    className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs"
                  >
                    Absent
                  </button>
                </td>
              </tr>
            ))}
            {!students.length && !loading && (
              <tr>
                <td
                  colSpan="4"
                  className="text-center p-4 text-slate-500 text-sm"
                >
                  No students available in this class.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AttendanceClass;
