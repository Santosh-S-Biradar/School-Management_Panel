import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const StudentAttendancePage = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api
      .get('/student/attendance')
      .then(({ data }) => setRecords(data || []))
      .catch(() => {});
  }, []);

  const attendanceSummary = useMemo(() => {
    const total = records.length;
    const present = records.filter((row) => row.status === 'Present').length;
    const absent = total - present;
    const percentage = total ? ((present / total) * 100).toFixed(2) : '0.00';

    return { total, present, absent, percentage };
  }, [records]);

  return (
    <AppLayout>
      <PageHeader title="Attendance" subtitle="Track your attendance history." />

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-soft">
        <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">Attendance Percentage</div>
        <div className="mt-2 text-3xl font-semibold text-brand-700">{attendanceSummary.percentage}%</div>
        <div className="mt-2 text-sm text-ink-500">
          Present: {attendanceSummary.present} | Absent: {attendanceSummary.absent} | Total: {attendanceSummary.total}
        </div>
      </div>

      <div className="mt-6">
        {records.length === 0 ? (
          <EmptyState
            title="No attendance records"
            description="Attendance logs will appear once submitted by your teacher."
          />
        ) : (
          <div className="space-y-3">
            {records.map((row, index) => (
              <div
                key={index}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4"
              >
                <div className="text-sm font-medium text-ink-700">{row.date}</div>
                <div
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    row.status === 'Present'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {row.status}
                </div>
                <div className="text-xs text-ink-500">{row.remarks || '—'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StudentAttendancePage;
