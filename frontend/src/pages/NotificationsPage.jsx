import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';

const NotificationsPage = () => {
  const [items, setItems] = useState([]);
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', message: '', targetRole: '', targetUserId: '', targetType: 'class', classId: '', sectionId: '', studentIds: [] });
  const [assignedClasses, setAssignedClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const { query } = useSearch();

  useEffect(() => {
    const role = user?.role || 'student';
    api.get(`/${role}/notifications`).then(({ data }) => setItems(data || [])).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'teacher') return;
    api.get('/teacher/assigned-classes').then(({ data }) => setAssignedClasses(data || [])).catch(() => {});
  }, [user]);

  useEffect(() => {
    if (user?.role !== 'teacher') return;
    if (form.targetType !== 'students' || !form.classId) {
      setStudents([]);
      setForm((prev) => ({ ...prev, studentIds: [] }));
      return;
    }
    const fetchStudents = async () => {
      const queryString = form.sectionId
        ? `?classId=${form.classId}&sectionId=${form.sectionId}`
        : `?classId=${form.classId}`;
      const { data } = await api.get(`/teacher/students${queryString}`);
      setStudents(data || []);
      setForm((prev) => ({ ...prev, studentIds: [] }));
    };
    fetchStudents().catch(() => {});
  }, [user, form.targetType, form.classId, form.sectionId]);

  const classOptions = [...new Map(assignedClasses.map((row) => [String(row.class_id), { id: String(row.class_id), name: row.class_name }])).values()];
  const sectionOptions = assignedClasses
    .filter((row) => String(row.class_id) === String(form.classId) && row.section_id)
    .map((row) => ({ id: String(row.section_id), name: row.section_name }))
    .filter((row, index, arr) => arr.findIndex((x) => x.id === row.id) === index);

  const createNotification = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/notifications/${editingId}`, {
          title: form.title,
          message: form.message,
          targetRole: form.targetRole || null,
          targetUserId: form.targetUserId ? Number(form.targetUserId) : null
        });
        toast.success('Notification updated');
      } else {
        if (user?.role === 'admin') {
          await api.post('/admin/notifications', {
            title: form.title,
            message: form.message,
            targetRole: form.targetRole || null,
            targetUserId: form.targetUserId ? Number(form.targetUserId) : null
          });
        } else if (user?.role === 'teacher') {
          await api.post('/teacher/notifications', {
            title: form.title,
            message: form.message,
            targetType: form.targetType,
            classId: form.classId ? Number(form.classId) : null,
            sectionId: form.sectionId ? Number(form.sectionId) : null,
            studentIds: form.studentIds.map((id) => Number(id))
          });
        }
        toast.success('Notification sent');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: '', message: '', targetRole: '', targetUserId: '', targetType: 'class', classId: '', sectionId: '', studentIds: [] });
      const role = user?.role || 'student';
      const { data } = await api.get(`/${role}/notifications`);
      setItems(data || []);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to send notification');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      message: item.message,
      targetRole: item.target_role || '',
      targetUserId: item.target_user_id ? String(item.target_user_id) : '',
      targetType: 'class',
      classId: '',
      sectionId: '',
      studentIds: []
    });
    setShowForm(true);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Notifications"
        subtitle="Broadcast announcements and alerts."
        action={user?.role === 'admin' || user?.role === 'teacher' ? (
          <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">
            {user?.role === 'teacher' ? 'Post Notification' : 'Create Notice'}
          </button>
        ) : null}
      />
      {(user?.role === 'admin' || user?.role === 'teacher') && showForm && (
        <form onSubmit={createNotification} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 lg:grid-cols-3">
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          {user?.role === 'admin' ? (
            <>
              <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Target User ID (optional)" value={form.targetUserId} onChange={(e) => setForm({ ...form, targetUserId: e.target.value })} />
              <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
                <option value="">All roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
                <option value="parent">Parent</option>
              </select>
            </>
          ) : (
            <>
              <select
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                value={form.targetType}
                onChange={(e) => setForm({ ...form, targetType: e.target.value, studentIds: [] })}
              >
                <option value="class">Respective class</option>
                <option value="students">Selected students</option>
              </select>
              <select
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                value={form.classId}
                onChange={(e) => setForm({ ...form, classId: e.target.value, sectionId: '', studentIds: [] })}
              >
                <option value="">Select class</option>
                {classOptions.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
                value={form.sectionId}
                onChange={(e) => setForm({ ...form, sectionId: e.target.value, studentIds: [] })}
              >
                <option value="">All sections (optional)</option>
                {sectionOptions.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </>
          )}
          {user?.role === 'teacher' && form.targetType === 'students' && (
            <select
              multiple
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm lg:col-span-3 min-h-[120px]"
              value={form.studentIds}
              onChange={(e) => {
                const selected = Array.from(e.target.selectedOptions).map((option) => option.value);
                setForm({ ...form, studentIds: selected });
              }}
            >
              {students.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name} ({s.admission_no})
                </option>
              ))}
            </select>
          )}
          <textarea className="rounded-xl border border-slate-200 px-4 py-3 text-sm lg:col-span-3" placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <div className="lg:col-span-3 flex gap-3">
            <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">{editingId ? 'Update Notice' : (user?.role === 'teacher' ? 'Post Notification' : 'Send Notice')}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-600">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-6">
        {items.length === 0 ? (
          <EmptyState title="No notifications" description="Announcements will show up here for your role." />
        ) : (
          <div className="space-y-4">
            {items
              .filter((item) => {
                if (!query) return true;
                const q = query.toLowerCase();
                return (
                  item.title?.toLowerCase().includes(q) ||
                  item.message?.toLowerCase().includes(q) ||
                  item.target_role?.toLowerCase().includes(q)
                );
              })
              .map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5">
                <div className="text-sm font-semibold text-ink-900">{item.title}</div>
                <div className="mt-2 text-sm text-ink-600">{item.message}</div>
                {user?.role === 'admin' && (
                  <div className="mt-3 flex gap-3">
                    <button onClick={() => startEdit(item)} className="text-sm font-semibold text-brand-600">Edit</button>
                    <button
                      onClick={async () => {
                        if (!window.confirm('Delete this notification?')) return;
                        try {
                          await api.delete(`/admin/notifications/${item.id}`);
                          toast.success('Notification deleted');
                          const { data } = await api.get('/admin/notifications');
                          setItems(data || []);
                        } catch (err) {
                          toast.error(err.friendlyMessage || 'Failed to delete notification');
                        }
                      }}
                      className="text-sm font-semibold text-red-600"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default NotificationsPage;
