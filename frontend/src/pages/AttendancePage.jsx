import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const AttendancePage = () => {
  const [overview, setOverview] = useState([]);

  useEffect(() => {
    api.get('/admin/attendance-overview').then(({ data }) => setOverview(data || [])).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <PageHeader
        title="Attendance Overview"
        subtitle="Daily attendance summary across classes." 
      />
      <div className="mt-6">
        {overview.length === 0 ? (
          <EmptyState title="No attendance data" description="Attendance insights will appear here once records are marked." />
        ) : (
          <div className="grid gap-4">
            {overview.slice(0, 12).map((row, index) => (
              <div key={index} className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4">
                <div className="text-sm font-medium text-ink-700">{row.date}</div>
                <div className="text-sm text-ink-500">{row.status}</div>
                <div className="text-sm font-semibold text-ink-900">{row.count} students</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AttendancePage;
