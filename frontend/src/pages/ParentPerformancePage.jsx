import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const ParentPerformancePage = () => {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    api.get('/parent/children').then(({ data }) => {
      if (data[0]) {
        api.get(`/parent/performance/${data[0].id}`).then(({ data: marks }) => setRows(marks || [])).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <PageHeader title="Academic Performance" subtitle="Exam performance and grades." />
      <div className="mt-6">
        {rows.length === 0 ? (
          <EmptyState title="No performance data" description="Performance data will appear after exams are graded." />
        ) : (
          <DataTable
            columns={['Exam', 'Subject', 'Marks', 'Grade']}
            rows={rows.map((m) => [m.exam_name, m.subject_name, m.marks, m.grade || '-'])}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default ParentPerformancePage;
