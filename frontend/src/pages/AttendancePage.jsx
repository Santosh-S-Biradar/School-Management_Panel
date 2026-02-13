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
        subtitle="Class-wise attendance percentage." 
      />
      <div className="mt-6">
        {overview.length === 0 ? (
          <EmptyState title="No attendance data" description="Attendance insights will appear here once records are marked." />
        ) : (
          <div className="grid gap-4">
            {overview.map((row, index) => (
              <div key={index} className="rounded-2xl border border-slate-200 bg-white px-6 py-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-ink-900">{row.class_name || 'Unassigned Class'}</div>
                    <div className="text-xs text-ink-500">{row.section_name || 'All Sections'}</div>
                  </div>
                  <div className="text-sm font-semibold text-ink-900">{Number(row.attendance_percentage || 0).toFixed(2)}%</div>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-600"
                    style={{ width: `${Math.min(Number(row.attendance_percentage || 0), 100)}%` }}
                  />
                </div>
                <div className="mt-3 text-xs text-ink-600">
                  Present: {row.present_count} / {row.total_records} records
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AttendancePage;
