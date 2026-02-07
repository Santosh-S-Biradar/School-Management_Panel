import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';

const FeesPage = () => {
  const [fees, setFees] = useState([]);
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ studentId: '', amount: '', dueDate: '', status: 'Pending', paidDate: '' });
  const { query } = useSearch();

  useEffect(() => {
    const boot = async () => {
      const [{ data: feeData }, { data: studentData }] = await Promise.all([
        api.get('/admin/fees'),
        api.get('/admin/students?page=1&limit=200')
      ]);
      setFees(feeData || []);
      setStudents(studentData.data || []);
    };
    boot().catch(() => {});
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/fees/${editingId}`, {
          studentId: Number(form.studentId),
          amount: Number(form.amount),
          dueDate: form.dueDate,
          status: form.status,
          paidDate: form.paidDate || null
        });
        toast.success('Fee updated');
      } else {
        await api.post('/admin/fees', {
          studentId: Number(form.studentId),
          amount: Number(form.amount),
          dueDate: form.dueDate,
          status: form.status,
          paidDate: form.paidDate || null
        });
        toast.success('Fee created');
      }
      setShowForm(false);
      setEditingId(null);
      setForm({ studentId: '', amount: '', dueDate: '', status: 'Pending', paidDate: '' });
      const { data } = await api.get('/admin/fees');
      setFees(data || []);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to create fee');
    }
  };

  const startEdit = (fee) => {
    setEditingId(fee.id);
    setForm({
      studentId: String(fee.student_id || ''),
      amount: fee.amount,
      dueDate: fee.due_date,
      status: fee.status,
      paidDate: fee.paid_date || ''
    });
    setShowForm(true);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Fee Management"
        subtitle="Track fee schedules and payments."
        action={<button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Create Fee</button>}
      />
      {showForm && (
        <form onSubmit={submit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 lg:grid-cols-3">
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} required>
            <option value="">Select student</option>
            {students.map((s) => <option key={s.id} value={s.id}>{s.name} ({s.admission_no})</option>)}
          </select>
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} required />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} required />
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
            <option>Pending</option>
            <option>Paid</option>
            <option>Overdue</option>
          </select>
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="date" value={form.paidDate} onChange={(e) => setForm({ ...form, paidDate: e.target.value })} placeholder="Paid date" />
          <div className="lg:col-span-3 flex gap-3">
            <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">{editingId ? 'Update Fee' : 'Save Fee'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-600">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-6">
        {fees.length === 0 ? (
          <EmptyState title="No fee records" description="Add fee records to monitor payment status." />
        ) : (
          <DataTable
            columns={['Student', 'Amount', 'Due Date', 'Status', 'Actions']}
            rows={fees
              .filter((f) => {
                if (!query) return true;
                const q = query.toLowerCase();
                return (
                  String(f.student_name || f.student_id).toLowerCase().includes(q) ||
                  String(f.amount).includes(q) ||
                  f.due_date?.includes(q) ||
                  f.status?.toLowerCase().includes(q)
                );
              })
              .map((f) => [
                f.student_name || f.student_id,
                f.amount,
                f.due_date,
                f.status,
                <div key={`actions-${f.id}`} className="flex gap-3">
                  <button onClick={() => startEdit(f)} className="text-brand-600 font-semibold">Edit</button>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete this fee record?')) return;
                      try {
                        await api.delete(`/admin/fees/${f.id}`);
                        toast.success('Fee deleted');
                        const { data } = await api.get('/admin/fees');
                        setFees(data || []);
                      } catch (err) {
                        toast.error(err.friendlyMessage || 'Failed to delete fee');
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

export default FeesPage;
