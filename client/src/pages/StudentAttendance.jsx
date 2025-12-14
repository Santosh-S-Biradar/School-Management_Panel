import React, { useEffect, useState } from 'react';
import api from '../services/api';

const StudentAttendance = () => {
  const [records, setRecords] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/attendance/student-history');
        setRecords(data.records || []);

        setSummary({
          total: data.totalDays || 0,
          present: data.presentDays || 0,
        });
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const percentage = summary.total > 0
    ? ((summary.present / summary.total) * 100).toFixed(2)
    : 0;

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold text-white">My Attendance</h1>

      <p className="text-slate-300 mt-2">
        Present: <strong className="text-emerald-400">{summary.present}</strong> /
        Total: <strong className="text-blue-400">{summary.total}</strong> days
        ➜ <span className="text-yellow-400">{percentage}%</span>
      </p>

      <div className="bg-slate-900 mt-4 p-4 rounded-lg">
        <table className="w-full text-left text-sm">
          <thead className="text-slate-400 border-b border-slate-700">
            <tr>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody className="text-slate-300">
            {records.map((r, idx) => (
              <tr key={idx}>
                <td>{new Date(r.date).toLocaleDateString()}</td>
                <td className={r.status === 'Present' ? 'text-emerald-400' : 'text-red-400'}>
                  {r.status}
                </td>
              </tr>
            ))}
            {!records.length && (
              <tr>
                <td colSpan="2" className="text-center text-slate-500 p-3">
                  No attendance records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentAttendance;
