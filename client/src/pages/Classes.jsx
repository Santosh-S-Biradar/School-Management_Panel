import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

const emptyForm = { name: '', section: '' };

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  const load = async () => {
    const { data } = await api.get('/classes');
    setClasses(data);
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      // Update route optional (if implemented)
      await api.put(`/classes/${editingId}`, form);
    } else {
      await api.post('/classes', form);
    }
    setForm(emptyForm);
    setEditingId(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this class?')) return;
    await api.delete(`/classes/${id}`);
    load();
  };

  const handleEdit = (c) => {
    setEditingId(c.id);
    setForm({ name: c.name, section: c.section });
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">Classes</h1>
        <p className="text-sm text-slate-400">Manage school classes.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-slate-100 mb-3">
            {editingId ? 'Edit Class' : 'Add Class'}
          </h2>

          <form className="space-y-3" onSubmit={handleSubmit}>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Class Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 
                text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Section
              </label>
              <input
                name="section"
                value={form.section}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 
                text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-primary-600 hover:bg-primary-500
              text-white text-sm font-medium"
            >
              {editingId ? 'Update' : 'Create'}
            </button>
          </form>
        </div>

        {/* Right Table */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 
        rounded-2xl p-4 overflow-auto">

          <table className="min-w-full text-xs text-left text-slate-300">
            <thead className="border-b border-slate-800 text-[11px] uppercase text-slate-400">
              <tr>
                <th className="py-2 pr-3">Class</th>
                <th className="py-2 pr-3">Section</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {classes.map((c) => (
                <tr key={c.id} className="border-b border-slate-800/60">
                  <td className="py-2 pr-3">{c.name}</td>
                  <td className="py-2 pr-3">{c.section}</td>
                  <td className="py-2 pr-3 space-x-2">
                    <button
                      className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
                      onClick={() => handleEdit(c)}
                    >
                      Edit
                    </button>
                    <button
                      className="text-[11px] px-2 py-1 rounded bg-red-600 hover:bg-red-500"
                      onClick={() => handleDelete(c.id)}
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}

              {!classes.length && (
                <tr>
                  <td colSpan="3" className="py-4 text-center text-slate-500">
                    No classes found.
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

export default Classes;
