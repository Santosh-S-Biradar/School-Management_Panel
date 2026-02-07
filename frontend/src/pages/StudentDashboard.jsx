import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const StudentDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    Promise.all([
      api.get('/student/profile'),
      api.get('/student/assignments')
    ]).then(([profileRes, assignmentsRes]) => {
      setProfile(profileRes.data);
      setAssignments(assignmentsRes.data || []);
    }).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <div className="grid gap-6 lg:grid-cols-3">
        <StatCard title="Class" value={profile?.class_name || '--'} hint="Assigned class" />
        <StatCard title="Section" value={profile?.section_name || '--'} hint="Current section" />
        <StatCard title="Assignments" value={assignments.length} hint="Pending & published" />
      </div>

      <div className="mt-8">
        {profile ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6">
            <h3 className="text-base font-semibold text-ink-900">Profile Snapshot</h3>
            <div className="mt-4 grid gap-3 text-sm text-ink-600 lg:grid-cols-2">
              <div><span className="font-medium">Name:</span> {profile.name}</div>
              <div><span className="font-medium">Email:</span> {profile.email}</div>
              <div><span className="font-medium">Admission No:</span> {profile.admission_no}</div>
              <div><span className="font-medium">Phone:</span> {profile.phone || '-'}</div>
            </div>
          </div>
        ) : (
          <EmptyState title="Profile unavailable" description="Profile details will appear once enrollment is complete." />
        )}
      </div>
    </AppLayout>
  );
};

export default StudentDashboard;
