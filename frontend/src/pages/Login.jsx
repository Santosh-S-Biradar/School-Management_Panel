import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'admin' });

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      const user = await login(form.email, form.password, form.role);
      toast.success('Welcome back!');
      if (user.role === 'admin') navigate('/admin');
      if (user.role === 'teacher') navigate('/teacher');
      if (user.role === 'student') navigate('/student');
      if (user.role === 'parent') navigate('/parent');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-slate-100 flex items-center justify-center px-6">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-card">
        <h1 className="text-2xl font-semibold text-ink-900">School Management Panel</h1>
        <p className="mt-2 text-sm text-ink-500">Sign in to access your dashboard.</p>

        <form className="mt-6 space-y-4" onSubmit={onSubmit}>
          <div className="grid grid-cols-2 gap-2">
            {['admin', 'teacher', 'student', 'parent'].map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setForm({ ...form, role })}
                className={
                  form.role === role
                    ? 'rounded-xl border border-brand-500 bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700'
                    : 'rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-ink-500 hover:bg-slate-50'
                }
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
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
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
          <button
            type="submit"
            className="w-full rounded-xl bg-ink-900 py-3 text-sm font-semibold text-white hover:bg-ink-800"
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-xs text-ink-500">
          Selected role must match your account type.
        </div>
      </div>
    </div>
  );
};

export default Login;
