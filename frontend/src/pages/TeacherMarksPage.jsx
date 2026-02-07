import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';

const TeacherMarksPage = () => (
  <AppLayout>
    <PageHeader title="Marks & Grades" subtitle="Enter marks and review student performance." />
    <div className="mt-6">
      <EmptyState title="No grading records" description="Create an exam schedule to enter marks." />
    </div>
  </AppLayout>
);

export default TeacherMarksPage;
