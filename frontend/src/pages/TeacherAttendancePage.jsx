import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

const TeacherAttendancePage = () => (
  <AppLayout>
    <PageHeader title="Mark Attendance" subtitle="Record student presence for your assigned classes." />
    <div className="mt-6">
      <EmptyState title="No class selected" description="Select a class and section to start marking attendance." />
    </div>
  </AppLayout>
);

export default TeacherAttendancePage;
