import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    email: params.get('email') || '',
    token: params.get('token') || '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/reset-password', form);
      toast.success('Password updated. You can login now.');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-ink-900">Reset Password</h1>
        <p className="mt-2 text-sm text-ink-500">Enter a new secure password.</p>
        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            type="text"
            placeholder="Token"
            value={form.token}
            onChange={(e) => setForm({ ...form, token: e.target.value })}
            required
          />
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
            type="password"
            placeholder="New password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-ink-900 py-3 text-sm font-semibold text-white"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
