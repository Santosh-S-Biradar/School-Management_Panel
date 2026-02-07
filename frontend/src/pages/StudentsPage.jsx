import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';

const StudentsPage = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [parents, setParents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editingUserId, setEditingUserId] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    admissionNo: '',
    classId: '',
    sectionId: '',
    dob: '',
    gender: 'Male',
    address: '',
    parentId: '',
    relationship: 'Parent'
  });
  const [createParent, setCreateParent] = useState(true);
  const [parentForm, setParentForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    occupation: ''
  });
  const { query } = useSearch();

  const load = async () => {
    const { data } = await api.get('/admin/students?page=1&limit=10');
    setStudents(data.data || []);
  };

  useEffect(() => {
    const boot = async () => {
      const [{ data: classData }, { data: sectionData }, { data: parentData }] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/sections'),
        api.get('/admin/parents?page=1&limit=200')
      ]);
      setClasses(classData || []);
      setSections(sectionData || []);
      setParents(parentData.data || []);
      await load();
    };
    boot().catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/students/${editingId}`, {
          userId: editingUserId,
          user: {
            name: form.name,
            email: form.email,
            phone: form.phone
          },
          admissionNo: form.admissionNo,
          classId: Number(form.classId),
          sectionId: Number(form.sectionId),
          dob: form.dob || null,
          gender: form.gender,
          address: form.address || null
        });
        toast.success('Student updated');
      } else {
        let parentId = form.parentId ? Number(form.parentId) : null;
        if (createParent) {
          const { data: parentRes } = await api.post('/admin/parents', parentForm);
          parentId = parentRes.id;
        }
        await api.post('/admin/students', {
          ...form,
          classId: Number(form.classId),
          sectionId: form.sectionId ? Number(form.sectionId) : null,
          parentId: parentId || undefined
        });
        toast.success('Student created');
      }
      setShowForm(false);
      setEditingId(null);
      setEditingUserId(null);
      setForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        admissionNo: '',
        classId: '',
        sectionId: '',
        dob: '',
        gender: 'Male',
        address: '',
        parentId: '',
        relationship: 'Parent'
      });
      setParentForm({
        name: '',
        email: '',
        password: '',
        phone: '',
        occupation: ''
      });
      await load();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to create student');
    }
  };

  const startEdit = async (id) => {
    try {
      const { data } = await api.get(`/admin/students/${id}`);
      setEditingId(id);
      setEditingUserId(data.user_id);
      setForm({
        name: data.name || '',
        email: data.email || '',
        password: '',
        phone: data.phone || '',
        admissionNo: data.admission_no || '',
        classId: data.class_id ? String(data.class_id) : '',
        sectionId: data.section_id ? String(data.section_id) : '',
        dob: data.dob ? data.dob.slice(0, 10) : '',
        gender: data.gender || 'Male',
        address: data.address || '',
        parentId: '',
        relationship: 'Parent'
      });
      setCreateParent(false);
      setShowForm(true);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to load student');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Students"
        subtitle="Manage student records and enrollment data."
        action={<button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Add Student</button>}
      />
      {showForm && (
        <form onSubmit={submit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 lg:grid-cols-3">
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          {!editingId && (
            <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="password" placeholder="Temp password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          )}
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Admission No" value={form.admissionNo} onChange={(e) => setForm({ ...form, admissionNo: e.target.value })} required />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
            <option>Male</option>
            <option>Female</option>
            <option>Other</option>
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} required>
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })}>
            <option value="">All sections (optional)</option>
            {sections.filter((s) => !form.classId || String(s.class_id) === String(form.classId)).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.relationship} onChange={(e) => setForm({ ...form, relationship: e.target.value })}>
            <option>Parent</option>
            <option>Guardian</option>
            <option>Father</option>
            <option>Mother</option>
          </select>
          <textarea className="rounded-xl border border-slate-200 px-4 py-3 text-sm lg:col-span-3" placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          {!editingId && (
            <>
              <div className="lg:col-span-3 flex items-center gap-3 text-sm text-ink-600">
                <input type="checkbox" checked={createParent} onChange={(e) => setCreateParent(e.target.checked)} />
                Create parent account and link to this student
              </div>
              {!createParent && (
                <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm lg:col-span-2" value={form.parentId} onChange={(e) => setForm({ ...form, parentId: e.target.value })}>
                  <option value="">Select existing parent</option>
                  {parents.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.email})</option>)}
                </select>
              )}
              {createParent && (
                <>
                  <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Parent name" value={parentForm.name} onChange={(e) => setParentForm({ ...parentForm, name: e.target.value })} required />
                  <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="email" placeholder="Parent email" value={parentForm.email} onChange={(e) => setParentForm({ ...parentForm, email: e.target.value })} required />
                  <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="password" placeholder="Parent password" value={parentForm.password} onChange={(e) => setParentForm({ ...parentForm, password: e.target.value })} required />
                  <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Parent phone" value={parentForm.phone} onChange={(e) => setParentForm({ ...parentForm, phone: e.target.value })} />
                  <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm lg:col-span-2" placeholder="Occupation" value={parentForm.occupation} onChange={(e) => setParentForm({ ...parentForm, occupation: e.target.value })} />
                </>
              )}
            </>
          )}
          <div className="lg:col-span-3 flex gap-3">
            <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">{editingId ? 'Update Student' : 'Save Student'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); setEditingUserId(null); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-600">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-6">
        {students.length === 0 ? (
          <EmptyState title="No students yet" description="Create a student profile to start tracking attendance and academics." />
        ) : (
          <DataTable
            columns={['Admission No', 'Name', 'Email', 'Class', 'Section', 'Actions']}
            rows={students
              .filter((s) => {
                if (!query) return true;
                const q = query.toLowerCase();
                return (
                  s.admission_no?.toLowerCase().includes(q) ||
                  s.name?.toLowerCase().includes(q) ||
                  s.email?.toLowerCase().includes(q) ||
                  s.class_name?.toLowerCase().includes(q) ||
                  s.section_name?.toLowerCase().includes(q)
                );
              })
              .map((s) => [
                s.admission_no,
                s.name,
                s.email,
                s.class_name || '-',
                s.section_name || '-',
                <div key={`actions-${s.id}`} className="flex gap-3">
                  <button onClick={() => startEdit(s.id)} className="text-brand-600 font-semibold">Edit</button>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete this student?')) return;
                      try {
                        await api.delete(`/admin/students/${s.id}`);
                        toast.success('Student deleted');
                        await load();
                      } catch (err) {
                        toast.error(err.friendlyMessage || 'Failed to delete student');
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

export default StudentsPage;
