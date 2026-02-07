import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const StudentMarksPage = () => {
  const [marks, setMarks] = useState([]);

  useEffect(() => {
    api.get('/student/marks').then(({ data }) => setMarks(data || [])).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <PageHeader title="Marks & Grades" subtitle="Exam scores and grades." />
      <div className="mt-6">
        {marks.length === 0 ? (
          <EmptyState title="No marks" description="Marks will appear after exams are evaluated." />
        ) : (
          <DataTable
            columns={['Exam', 'Subject', 'Marks', 'Grade']}
            rows={marks.map((m) => [m.exam_name, m.subject_name, m.marks, m.grade || '-'])}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default StudentMarksPage;
