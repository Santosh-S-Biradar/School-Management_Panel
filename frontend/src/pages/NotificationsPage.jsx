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
  const [form, setForm] = useState({ title: '', message: '', targetRole: '', targetUserId: '' });
  const { query } = useSearch();

  useEffect(() => {
    const role = user?.role || 'student';
    api.get(`/${role}/notifications`).then(({ data }) => setItems(data || [])).catch(() => {});
  }, [user]);

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
        await api.post('/admin/notifications', {
          title: form.title,
          message: form.message,
          targetRole: form.targetRole || null,
          targetUserId: form.targetUserId ? Number(form.targetUserId) : null
        });
        toast.success('Notification sent');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ title: '', message: '', targetRole: '', targetUserId: '' });
      const { data } = await api.get('/admin/notifications');
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
      targetUserId: item.target_user_id ? String(item.target_user_id) : ''
    });
    setShowForm(true);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Notifications"
        subtitle="Broadcast announcements and alerts."
        action={user?.role === 'admin' ? (
          <button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Create Notice</button>
        ) : null}
      />
      {user?.role === 'admin' && showForm && (
        <form onSubmit={createNotification} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 lg:grid-cols-3">
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Target User ID (optional)" value={form.targetUserId} onChange={(e) => setForm({ ...form, targetUserId: e.target.value })} />
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.targetRole} onChange={(e) => setForm({ ...form, targetRole: e.target.value })}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
            <option value="parent">Parent</option>
          </select>
          <textarea className="rounded-xl border border-slate-200 px-4 py-3 text-sm lg:col-span-3" placeholder="Message" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
          <div className="lg:col-span-3 flex gap-3">
            <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">{editingId ? 'Update Notice' : 'Send Notice'}</button>
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
