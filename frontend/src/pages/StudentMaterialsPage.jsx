import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const StudentMaterialsPage = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.get('/student/materials').then(({ data }) => setItems(data || [])).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <PageHeader title="Study Materials" subtitle="Download resources shared by your teachers." />
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState title="No materials" description="Materials will appear once teachers upload them." />
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-ink-900">{item.title}</div>
                <div className="mt-2 text-sm text-ink-600">{item.description}</div>
                {item.file_url && (
                  <a className="mt-3 inline-block text-sm font-semibold text-brand-600" href={item.file_url}>
                    Download
                  </a>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default StudentMaterialsPage;
