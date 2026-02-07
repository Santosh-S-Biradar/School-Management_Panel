import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const ParentFeesPage = () => {
  const [fees, setFees] = useState([]);

  useEffect(() => {
    api.get('/parent/children').then(({ data }) => {
      if (data[0]) {
        api.get(`/parent/fees/${data[0].id}`).then(({ data: rows }) => setFees(rows || [])).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <PageHeader title="Fee Status" subtitle="Outstanding and paid fees." />
      <div className="mt-6">
        {fees.length === 0 ? (
          <EmptyState title="No fee records" description="Fee details will show once published by the admin." />
        ) : (
          <DataTable
            columns={['Amount', 'Due Date', 'Status', 'Paid Date']}
            rows={fees.map((f) => [f.amount, f.due_date, f.status, f.paid_date || '-'])}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ParentFeesPage;
