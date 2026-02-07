import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const TeacherDashboard = () => {
  const [assigned, setAssigned] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/teacher/assigned-classes').then(({ data }) => setAssigned(data || [])).catch(() => {});
    api.get('/teacher/notifications').then(({ data }) => setNotifications(data || [])).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <div className="grid gap-6 lg:grid-cols-3">
        <StatCard title="Assigned Classes" value={assigned.length} hint="Active class & subject pairs" />
        <StatCard title="Notifications" value={notifications.length} hint="Latest updates" />
        <StatCard title="Today" value={new Date().toLocaleDateString()} hint="Attendance window" />
      </div>

      <div className="mt-8">
        {assigned.length === 0 ? (
          <EmptyState title="No assignments" description="Once classes are assigned, they will show up here." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {assigned.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-ink-900">{item.subject_name}</div>
                <div className="mt-2 text-sm text-ink-600">{item.class_name} - {item.section_name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TeacherDashboard;
