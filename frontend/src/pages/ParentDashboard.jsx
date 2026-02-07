import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const ParentDashboard = () => {
  const [children, setChildren] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    api.get('/parent/children').then(({ data }) => setChildren(data || [])).catch(() => {});
    api.get('/parent/notifications').then(({ data }) => setNotifications(data || [])).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <div className="grid gap-6 lg:grid-cols-3">
        <StatCard title="Children" value={children.length} hint="Linked student profiles" />
        <StatCard title="Notifications" value={notifications.length} hint="Latest updates" />
        <StatCard title="Last Update" value={new Date().toLocaleDateString()} hint="Latest data sync" />
      </div>
      <div className="mt-8">
        {children.length === 0 ? (
          <EmptyState title="No linked students" description="Ask the admin to link your parent profile to a student." />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">
            {children.map((child) => (
              <div key={child.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-ink-900">{child.name}</div>
                <div className="mt-2 text-sm text-ink-600">{child.class_name} - {child.section_name}</div>
                <div className="mt-2 text-xs text-ink-500">Admission: {child.admission_no}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default ParentDashboard;
