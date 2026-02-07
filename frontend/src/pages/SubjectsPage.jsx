import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';

const SubjectsPage = () => {
  const [subjects, setSubjects] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ name: '', code: '' });
  const { query } = useSearch();

  useEffect(() => {
    api.get('/admin/subjects').then(({ data }) => setSubjects(data || [])).catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/subjects/${editingId}`, form);
        toast.success('Subject updated');
      } else {
        await api.post('/admin/subjects', form);
        toast.success('Subject created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ name: '', code: '' });
      const { data } = await api.get('/admin/subjects');
      setSubjects(data || []);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to create subject');
    }
  };

  const startEdit = (subject) => {
    setEditingId(subject.id);
    setForm({ name: subject.name, code: subject.code });
    setShowForm(true);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Subjects"
        subtitle="Maintain the curriculum subjects list."
        action={<button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Add Subject</button>}
      />
      {showForm && (
        <form onSubmit={submit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 lg:grid-cols-3">
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Subject name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Subject code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} required />
          <div className="lg:col-span-3 flex gap-3">
            <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">{editingId ? 'Update Subject' : 'Save Subject'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-600">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-6">
        {subjects.length === 0 ? (
          <EmptyState title="No subjects" description="Add subjects to create timetables and exams." />
        ) : (
          <DataTable
            columns={['Subject', 'Code', 'Actions']}
            rows={subjects
              .filter((s) => {
                if (!query) return true;
                const q = query.toLowerCase();
                return s.name?.toLowerCase().includes(q) || s.code?.toLowerCase().includes(q);
              })
              .map((s) => [
                s.name,
                s.code,
                <div key={`actions-${s.id}`} className="flex gap-3">
                  <button onClick={() => startEdit(s)} className="text-brand-600 font-semibold">Edit</button>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete this subject?')) return;
                      try {
                        await api.delete(`/admin/subjects/${s.id}`);
                        toast.success('Subject deleted');
                        const { data } = await api.get('/admin/subjects');
                        setSubjects(data || []);
                      } catch (err) {
                        toast.error(err.friendlyMessage || 'Failed to delete subject');
                      }
                    }}
                    className="text-red-600 font-semibold"
                  >
                    Delete
                  </button>
                </div>
              ])}
          />
        )}
      </div>
    </AppLayout>
  );
};

export default SubjectsPage;
