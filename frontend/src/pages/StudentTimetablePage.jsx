import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const StudentTimetablePage = () => {
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    api.get('/student/timetable').then(({ data }) => setTimetable(data || [])).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <PageHeader title="Timetable" subtitle="Your weekly class schedule." />
      <div className="mt-6">
        {timetable.length === 0 ? (
          <EmptyState title="No timetable" description="Your schedule will show up once published." />
        ) : (
          <DataTable
            columns={['Day', 'Start', 'End', 'Subject', 'Teacher']}
            rows={timetable.map((t) => [t.day_of_week, t.start_time, t.end_time, t.subject_name, t.teacher_name])}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default StudentTimetablePage;
