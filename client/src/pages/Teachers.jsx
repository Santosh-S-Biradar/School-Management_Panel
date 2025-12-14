import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

const emptyForm = {
  name: '',
  email: '',
  subject: '',
  phone: ''
};

const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const loadTeachers = async () => {
    const { data } = await api.get('/teachers');
    setTeachers(data);
  };

  useEffect(() => {
    loadTeachers();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/teachers/${editingId}`, form);
    } else {
      await api.post('/teachers', form);
    }
    setForm(emptyForm);
    setEditingId(null);
    loadTeachers();
  };

  const handleEdit = (t) => {
    setEditingId(t.id);
    setForm({
      name: t.name || '',
      email: t.email || '',
      subject: t.subject || '',
      phone: t.phone || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this teacher?')) return;
    await api.delete(`/teachers/${id}`);
    loadTeachers();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Teachers</h1>
          <p className="text-sm text-slate-400">Manage teaching staff.</p>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-slate-100 mb-3">
            {editingId ? 'Edit Teacher' : 'Add Teacher'}
          </h2>
          <form className="space-y-3" onSubmit={handleSubmit}>
            {['name','email','subject','phone'].map((field) => (
              <div key={field}>
                <label className="block text-[11px] text-slate-400 mb-1 capitalize">
                  {field}
                </label>
                <input
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </form>
        </div>
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-4 overflow-auto">
          <table className="min-w-full text-xs text-left text-slate-300">
            <thead className="border-b border-slate-800 text-[11px] uppercase text-slate-400">
              <tr>
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Subject</th>
                <th className="py-2 pr-3">Phone</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-b border-slate-800/60">
                  <td className="py-2 pr-3">{t.name}</td>
                  <td className="py-2 pr-3">{t.subject}</td>
                  <td className="py-2 pr-3">{t.phone}</td>
                  <td className="py-2 pr-3 space-x-2">
                    <button
                      onClick={() => handleEdit(t)}
                      className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="text-[11px] px-2 py-1 rounded bg-red-600 hover:bg-red-500"
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}
              {!teachers.length && (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-slate-500">
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Teachers;