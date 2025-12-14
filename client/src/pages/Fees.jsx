import React, { useEffect, useState } from 'react';
import api from '../services/api.js';

const Fees = () => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [students, setStudents] = useState([]);
  const [form, setForm] = useState({ student_id: '', amount: '', status: 'Due' });

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/classes');
        setClasses(data || []);
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, []);

  const loadClassFees = async (classId) => {
    try {
      const { data } = await api.get(`/fees/class/${classId}`);
      setStudents(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleClassChange = (e) => {
    const id = e.target.value;
    setSelectedClass(id);
    setStudents([]);
    if (id) loadClassFees(id);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/fees', {
        student_id: Number(form.student_id),
        amount: Number(form.amount),
        status: form.status
      });
      if (selectedClass) loadClassFees(selectedClass);
      setForm({ student_id: '', amount: '', status: 'Due' });
    } catch (err) {
      console.error(err);
      alert('Failed to save fee record');
    }
  };

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold text-white">Fees (Admin)</h1>
      <p className="text-sm text-slate-400">
        Select a class to view all students and update fee status.
      </p>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">
              Class
            </label>
            <select
              value={selectedClass}
              onChange={handleClassChange}
              className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100"
            >
              <option value="">Select class</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.section && `(${c.section})`}
                </option>
              ))}
            </select>
          </div>

          <form className="space-y-2" onSubmit={handleCreate}>
            <h2 className="text-sm font-semibold text-slate-100 mb-1">
              Update / Add Fee
            </h2>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Student ID
              </label>
              <input
                type="number"
                value={form.student_id}
                onChange={(e) =>
                  setForm((f) => ({ ...f, student_id: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100"
                placeholder="Student ID"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Amount
              </label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) =>
                  setForm((f) => ({ ...f, amount: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100"
                placeholder="Amount"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">
                Status
              </label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-sm text-slate-100"
              >
                <option value="Due">Due</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-2 rounded-lg bg-primary-600 hover:bg-primary-500 text-white text-sm font-medium"
            >
              Save Fee Record
            </button>
            <p className="text-[11px] text-slate-500">
              Tip: Enter the student ID from the Students page.
            </p>
          </form>
        </div>

        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-800/60 text-slate-300">
              <tr>
                <th className="text-left px-4 py-2">Student</th>
                <th className="text-left px-4 py-2">Last Amount</th>
                <th className="text-left px-4 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.student_id} className="border-t border-slate-800">
                  <td className="px-4 py-2 text-slate-100">
                    {s.student_name} (ID: {s.student_id})
                  </td>
                  <td className="px-4 py-2 text-slate-300">
                    {s.latest_amount || '-'}
                  </td>
                  <td className="px-4 py-2">
                    {s.latest_status ? (
                      <span
                        className={
                          s.latest_status === 'Paid'
                            ? 'px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 text-xs'
                            : 'px-2 py-1 rounded bg-amber-500/10 text-amber-400 text-xs'
                        }
                      >
                        {s.latest_status}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-500">
                        No record
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {!students.length && (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center p-4 text-slate-500 text-sm"
                  >
                    Select a class to view fee details.
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

export default Fees;
