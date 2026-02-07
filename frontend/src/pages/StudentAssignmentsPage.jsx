import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const StudentAssignmentsPage = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/student/assignments').then(({ data }) => setItems(data || [])).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <PageHeader title="Assignments" subtitle="Track assignment deadlines and uploads." />
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState title="No assignments" description="Assignments will appear once your teacher uploads them." />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-ink-900">{item.title}</div>
                <div className="mt-2 text-sm text-ink-600">{item.description}</div>
                <div className="mt-2 text-xs text-ink-500">Due: {item.due_date || 'TBD'}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StudentAssignmentsPage;
