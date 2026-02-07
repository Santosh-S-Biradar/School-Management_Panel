import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: statData }, { data: attendanceData }] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get('/admin/attendance-overview')
      ]);
      setStats(statData);
      setAttendance(attendanceData);
    };
    load().catch(() => {});
  }, []);

  return (
    <AppLayout>
      <div className="grid gap-6 lg:grid-cols-4">
        <StatCard title="Students" value={stats?.students ?? '--'} hint="Active enrollments" />
        <StatCard title="Teachers" value={stats?.teachers ?? '--'} hint="Full-time faculty" />
        <StatCard title="Parents" value={stats?.parents ?? '--'} hint="Guardian profiles" />
        <StatCard title="Classes" value={stats?.classes ?? '--'} hint="Active classes" />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-ink-900">Attendance Overview</h3>
          {attendance.length === 0 ? (
            <EmptyState title="No attendance records" description="Attendance stats will appear here once teachers submit daily attendance." />
          ) : (
            <div className="mt-4 space-y-3 text-sm text-ink-600">
              {attendance.slice(0, 6).map((row, index) => (
                <div key={index} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div>{row.date}</div>
                  <div className="font-medium text-ink-900">{row.status}</div>
                  <div className="text-ink-500">{row.count} students</div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-ink-900">Admin Highlights</h3>
          <ul className="mt-4 space-y-3 text-sm text-ink-600">
            <li className="rounded-xl bg-brand-50 px-4 py-3">Upload new timetable for next week.</li>
            <li className="rounded-xl bg-slate-50 px-4 py-3">Review pending fee payments.</li>
            <li className="rounded-xl bg-slate-50 px-4 py-3">Publish exam schedule to students and parents.</li>
          </ul>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;
