import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

const fieldConfigByRole = {
  admin: [
    { key: 'name', label: 'Full Name', type: 'text', required: true },
    { key: 'phone', label: 'Phone', type: 'text' }
  ],
  teacher: [
    { key: 'name', label: 'Full Name', type: 'text', required: true },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'department', label: 'Department', type: 'text' },
    { key: 'qualification', label: 'Qualification', type: 'text' }
  ],
  student: [
    { key: 'name', label: 'Full Name', type: 'text', required: true },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'dob', label: 'Date of Birth', type: 'date' },
    {
      key: 'gender',
      label: 'Gender',
      type: 'select',
      options: ['', 'Male', 'Female', 'Other']
    },
    { key: 'address', label: 'Address', type: 'textarea' }
  ],
  parent: [
    { key: 'name', label: 'Full Name', type: 'text', required: true },
    { key: 'phone', label: 'Phone', type: 'text' },
    { key: 'occupation', label: 'Occupation', type: 'text' }
  ]
};

const inputClass =
  'w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-ink-800 outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100';

const ProfilePage = () => {
  const { user, updateCurrentUser } = useAuth();
  const role = user?.role || 'student';
  const [form, setForm] = useState({});
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fields = useMemo(() => fieldConfigByRole[role] || fieldConfigByRole.student, [role]);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/${role}/profile`);
        setProfile(data || null);

        const nextForm = {};
        fields.forEach((field) => {
          nextForm[field.key] = data?.[field.key] ?? '';
        });
        setForm(nextForm);
      } catch (err) {
        toast.error(err.friendlyMessage || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) {
      loadProfile();
    }
  }, [role, user?.id, fields]);

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onSubmit = async (event) => {
    event.preventDefault();
    try {
      setSaving(true);
      await api.put(`/${role}/profile`, form);
      setProfile((prev) => ({ ...(prev || {}), ...form }));
      if (form.name) updateCurrentUser({ name: form.name });
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Profile" subtitle="View and update your account information." />

      {loading ? (
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-ink-500">Loading profile...</div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">Account</div>
            <div className="mt-3 text-xl font-semibold text-ink-900">{profile?.name || user?.name}</div>
            <div className="mt-1 text-sm text-ink-600">{profile?.email || user?.email}</div>
            <div className="mt-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {role}
            </div>

            {role === 'student' && (
              <div className="mt-5 space-y-2 text-sm text-ink-600">
                <div>Class: {profile?.class_name || 'Not assigned'}</div>
                <div>Section: {profile?.section_name || 'All Sections'}</div>
                <div>Admission No: {profile?.admission_no || '-'}</div>
              </div>
            )}

            {role === 'teacher' && (
              <div className="mt-5 space-y-2 text-sm text-ink-600">
                <div>Employee No: {profile?.employee_no || '-'}</div>
              </div>
            )}

            {role === 'parent' && Array.isArray(profile?.children) && (
              <div className="mt-5">
                <div className="text-xs font-semibold uppercase tracking-wide text-ink-500">Children</div>
                <div className="mt-2 space-y-2">
                  {profile.children.length === 0 ? (
                    <div className="text-sm text-ink-500">No child linked yet.</div>
                  ) : (
                    profile.children.map((child) => (
                      <div key={child.id} className="rounded-xl border border-slate-200 px-3 py-2 text-sm text-ink-700">
                        {child.name} - {child.class_name || 'No class'}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-soft">
            <div className="grid gap-4 md:grid-cols-2">
              {fields.map((field) => (
                <label key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <div className="mb-1 text-sm font-medium text-ink-700">{field.label}</div>

                  {field.type === 'select' ? (
                    <select
                      className={inputClass}
                      value={form[field.key] || ''}
                      onChange={(e) => onChange(field.key, e.target.value)}
                    >
                      {field.options.map((option) => (
                        <option key={option || 'empty'} value={option}>
                          {option || 'Select'}
                        </option>
                      ))}
                    </select>
                  ) : field.type === 'textarea' ? (
                    <textarea
                      className={inputClass}
                      rows={4}
                      value={form[field.key] || ''}
                      onChange={(e) => onChange(field.key, e.target.value)}
                    />
                  ) : (
                    <input
                      type={field.type || 'text'}
                      className={inputClass}
                      value={form[field.key] || ''}
                      onChange={(e) => onChange(field.key, e.target.value)}
                      required={field.required}
                    />
                  )}
                </label>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between border-t border-slate-200 pt-4">
              <div className="text-xs text-ink-500">Email and role are managed by admin.</div>
              <button
                type="submit"
                disabled={saving}
                className="rounded-xl bg-ink-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-ink-800 disabled:opacity-70"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      )}
    </AppLayout>
  );
};

export default ProfilePage;
