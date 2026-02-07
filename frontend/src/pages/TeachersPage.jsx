import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';

const TeachersPage = () => {
  const [teachers, setTeachers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [assignment, setAssignment] = useState({ teacherId: '', classId: '', sectionId: '', subjectId: '' });
  const { query } = useSearch();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    employeeNo: '',
    department: '',
    qualification: ''
  });

  const load = async () => {
    const { data } = await api.get('/admin/teachers?page=1&limit=10');
    setTeachers(data.data || []);
  };

  useEffect(() => {
    const boot = async () => {
      await load();
      const [{ data: classData }, { data: sectionData }, { data: subjectData }] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/sections'),
        api.get('/admin/subjects')
      ]);
      setClasses(classData || []);
      setSections(sectionData || []);
      setSubjects(subjectData || []);
    };
    boot().catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/teachers/${editingId}`, {
          userId: editingUserId,
          user: {
            name: form.name,
            email: form.email,
            phone: form.phone
          },
          employeeNo: form.employeeNo,
          department: form.department,
          qualification: form.qualification
        });
        toast.success('Teacher updated');
      } else {
        await api.post('/admin/teachers', form);
        toast.success('Teacher created');
      }
      setShowForm(false);
      setEditingId(null);
      setEditingUserId(null);
      setForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        employeeNo: '',
        department: '',
        qualification: ''
      });
      await load();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to create teacher');
    }
  };

  const startEdit = async (id) => {
    try {
      const { data } = await api.get(`/admin/teachers/${id}`);
      setEditingId(id);
      setEditingUserId(data.user_id);
      setForm({
        name: data.name || '',
        email: data.email || '',
        password: '',
        phone: data.phone || '',
        employeeNo: data.employee_no || '',
        department: data.department || '',
        qualification: data.qualification || ''
      });
      setShowForm(true);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to load teacher');
    }
  };

  const assignTeacher = async (event) => {
    event.preventDefault();
    try {
      await api.post('/admin/teacher-assignments', {
        teacherId: Number(assignment.teacherId),
        classId: Number(assignment.classId),
        sectionId: assignment.sectionId ? Number(assignment.sectionId) : null,
        subjectId: Number(assignment.subjectId)
      });
      toast.success('Teacher assigned');
      setShowAssignForm(false);
      setAssignment({ teacherId: '', classId: '', sectionId: '', subjectId: '' });
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to assign teacher');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Teachers"
        subtitle="Manage teacher profiles and assignments."
        action={<button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Add Teacher</button>}
      />
      {showForm && (
        <form onSubmit={submit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 lg:grid-cols-3">
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          {!editingId && (
            <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="password" placeholder="Temp password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          )}
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Employee No" value={form.employeeNo} onChange={(e) => setForm({ ...form, employeeNo: e.target.value })} required />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Department" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm lg:col-span-2" placeholder="Qualification" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} />
          <div className="lg:col-span-3 flex gap-3">
            <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">{editingId ? 'Update Teacher' : 'Save Teacher'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setEditingUserId(null); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-600">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-4">
        <button onClick={() => setShowAssignForm(!showAssignForm)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-700">Assign Teacher</button>
      </div>
      {showAssignForm && (
        <form onSubmit={assignTeacher} className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 lg:grid-cols-3">
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={assignment.teacherId} onChange={(e) => setAssignment({ ...assignment, teacherId: e.target.value })} required>
            <option value="">Select teacher</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={assignment.classId} onChange={(e) => setAssignment({ ...assignment, classId: e.target.value })} required>
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={assignment.sectionId} onChange={(e) => setAssignment({ ...assignment, sectionId: e.target.value })}>
            <option value="">All sections (optional)</option>
            {sections.filter((s) => !assignment.classId || String(s.class_id) === String(assignment.classId)).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={assignment.subjectId} onChange={(e) => setAssignment({ ...assignment, subjectId: e.target.value })} required>
            <option value="">Select subject</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <div className="lg:col-span-3 flex gap-3">
            <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Save Assignment</button>
            <button type="button" onClick={() => setShowAssignForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-600">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-6">
        {teachers.length === 0 ? (
          <EmptyState title="No teachers yet" description="Add teachers to assign classes and subjects." />
        ) : (
          <DataTable
            columns={['Employee No', 'Name', 'Email', 'Department', 'Actions']}
            rows={teachers
              .filter((t) => {
                if (!query) return true;
                const q = query.toLowerCase();
                return (
                  t.employee_no?.toLowerCase().includes(q) ||
                  t.name?.toLowerCase().includes(q) ||
                  t.email?.toLowerCase().includes(q) ||
                  t.department?.toLowerCase().includes(q)
                );
              })
              .map((t) => [
                t.employee_no,
                t.name,
                t.email,
                t.department || '-',
                <div key={`actions-${t.id}`} className="flex gap-3">
                  <button onClick={() => startEdit(t.id)} className="text-brand-600 font-semibold">Edit</button>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete this teacher?')) return;
                      try {
                        await api.delete(`/admin/teachers/${t.id}`);
                        toast.success('Teacher deleted');
                        await load();
                      } catch (err) {
                        toast.error(err.friendlyMessage || 'Failed to delete teacher');
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

export default TeachersPage;
