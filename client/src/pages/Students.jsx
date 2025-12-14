import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

const emptyForm = {
  name: '',
  email: '',
  class_id: '',
  parent_contact: '',
  address: ''
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [filterClass, setFilterClass] = useState('');

  const loadStudents = async () => {
    const { data } = await api.get('/students');
    setStudents(data);
  };

  const loadClasses = async () => {
    const { data } = await api.get('/classes');
    setClasses(data);
  };

  useEffect(() => {
    loadStudents();
    loadClasses();
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingId) {
      await api.put(`/students/${editingId}`, form);
    } else {
      await api.post('/students', form);
    }
    setForm(emptyForm);
    setEditingId(null);
    loadStudents();
  };

  const handleEdit = (student) => {
    setEditingId(student.id);
    setForm({
      name: student.name || '',
      email: student.email || '',
      class_id: student.class_id || '',
      parent_contact: student.parent_contact || '',
      address: student.address || ''
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this student?')) return;
    await api.delete(`/students/${id}`);
    loadStudents();
  };

  const filteredList = filterClass
    ? students.filter((s) => s.class_id == filterClass)
    : students;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-100">Students</h1>
          <p className="text-sm text-slate-400">Manage all enrolled students.</p>
        </div>

        <select
          onChange={(e) => setFilterClass(e.target.value)}
          className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name} - {c.section}
            </option>
          ))}
        </select>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1 bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h2 className="text-sm font-semibold text-slate-100 mb-3">
            {editingId ? 'Edit Student' : 'Add Student'}
          </h2>
          <form className="space-y-3" onSubmit={handleSubmit}>
            {['name', 'email', 'parent_contact', 'address'].map((field) => (
              <div key={field}>
                <label className="block text-[11px] text-slate-400 mb-1 capitalize">
                  {field.replace('_', ' ')}
                </label>
                <input
                  name={field}
                  value={form[field]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            ))}

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Class</label>
              <select
                name="class_id"
                value={form.class_id}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Select Class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} - {c.section}
                  </option>
                ))}
              </select>
            </div>

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
                <th className="py-2 pr-3">Class</th>
                <th className="py-2 pr-3">Parent</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.map((s) => (
                <tr key={s.id} className="border-b border-slate-800/60">
                  <td className="py-2 pr-3">{s.name}</td>
                  <td className="py-2 pr-3">
                    {classes.find((c) => c.id === s.class_id)?.name}
                  </td>
                  <td className="py-2 pr-3">{s.parent_contact}</td>
                  <td className="py-2 pr-3 space-x-2">
                    <button
                      onClick={() => handleEdit(s)}
                      className="text-[11px] px-2 py-1 rounded bg-slate-800 hover:bg-slate-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-[11px] px-2 py-1 rounded bg-red-600 hover:bg-red-500"
                    >
                      Del
                    </button>
                  </td>
                </tr>
              ))}
              {!filteredList.length && (
                <tr>
                  <td colSpan="4" className="py-4 text-center text-slate-500">
                    No students found.
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

export default Students;
