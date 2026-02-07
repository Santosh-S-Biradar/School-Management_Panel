import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

const TeacherAssignmentsPage = () => (
  <AppLayout>
    <PageHeader title="Assignments" subtitle="Upload assignments and share with students." action={<button className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Create Assignment</button>} />
    <div className="mt-6">
      <EmptyState title="No assignments" description="Assignments created by you will appear here." />
    </div>
  </AppLayout>
);

export default TeacherAssignmentsPage;
