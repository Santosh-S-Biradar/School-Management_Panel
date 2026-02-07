import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const StudentAttendancePage = () => {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    api.get('/student/attendance').then(({ data }) => setRecords(data || [])).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <PageHeader title="Attendance" subtitle="Track your attendance history." />
      <div className="mt-6">
        {records.length === 0 ? (
          <EmptyState title="No attendance records" description="Attendance logs will appear once submitted by your teacher." />
        ) : (
          <div className="space-y-3">
            {records.map((row, index) => (
              <div key={index} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4">
                <div className="text-sm font-medium text-ink-700">{row.date}</div>
                <div className="text-sm text-ink-500">{row.status}</div>
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
