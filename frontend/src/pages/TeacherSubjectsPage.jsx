import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const TeacherSubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    api.get('/teacher/subjects').then(({ data }) => setSubjects(data || [])).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <PageHeader title="Subjects" subtitle="Subjects assigned to you by admin." />
      <div className="mt-6">
        {subjects.length === 0 ? (
          <EmptyState title="No subjects assigned" description="Ask admin to assign subjects for your classes." />
        ) : (
          <DataTable
            columns={['Subject', 'Code']}
            rows={subjects.map((s) => [s.name, s.code])}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default TeacherSubjectsPage;
