import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';

const TimetablePage = () => {
  const [timetable, setTimetable] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [filters, setFilters] = useState({ classId: '', sectionId: '' });
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    classId: '',
    sectionId: '',
    dayOfWeek: 'Monday',
    startTime: '09:00',
    endTime: '10:00',
    subjectId: '',
    teacherId: '',
    room: ''
  });
  const { query } = useSearch();

  useEffect(() => {
    const boot = async () => {
      const [{ data: classData }, { data: sectionData }, { data: subjectData }, { data: teacherData }] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/sections'),
        api.get('/admin/subjects'),
        api.get('/admin/teachers?page=1&limit=200')
      ]);
      setClasses(classData || []);
      setSections(sectionData || []);
      setSubjects(subjectData || []);
      setTeachers(teacherData.data || []);
    };
    boot().catch(() => {});
  }, []);

  const loadTimetable = async () => {
    if (!filters.classId || !filters.sectionId) {
      setTimetable([]);
      return;
    }
    const { data } = await api.get(`/admin/timetables?classId=${filters.classId}&sectionId=${filters.sectionId}`);
    setTimetable(data || []);
  };

  useEffect(() => {
    loadTimetable().catch(() => {});
  }, [filters.classId, filters.sectionId]);

  const submit = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/timetables/${editingId}`, {
          ...form,
          classId: Number(form.classId),
          sectionId: Number(form.sectionId),
          subjectId: Number(form.subjectId),
          teacherId: Number(form.teacherId)
        });
        toast.success('Timetable updated');
      } else {
        await api.post('/admin/timetables', {
          ...form,
          classId: Number(form.classId),
          sectionId: Number(form.sectionId),
          subjectId: Number(form.subjectId),
          teacherId: Number(form.teacherId)
        });
        toast.success('Timetable period added');
      }
      setShowForm(false);
      setEditingId(null);
      await loadTimetable();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to create timetable');
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setForm({
      classId: String(row.class_id),
      sectionId: String(row.section_id),
      dayOfWeek: row.day_of_week,
      startTime: row.start_time,
      endTime: row.end_time,
      subjectId: String(row.subject_id),
      teacherId: String(row.teacher_id),
      room: row.room || ''
    });
    setShowForm(true);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Timetable"
        subtitle="Publish class schedules and subject allocations."
        action={<button onClick={() => setShowForm(!showForm)} className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Add Period</button>}
      />
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={filters.classId} onChange={(e) => setFilters({ ...filters, classId: e.target.value })}>
          <option value="">Filter by class</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={filters.sectionId} onChange={(e) => setFilters({ ...filters, sectionId: e.target.value })}>
          <option value="">Filter by section</option>
          {sections.filter((s) => !filters.classId || String(s.class_id) === String(filters.classId)).map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      {showForm && (
        <form onSubmit={submit} className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 lg:grid-cols-3">
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.classId} onChange={(e) => setForm({ ...form, classId: e.target.value })} required>
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.sectionId} onChange={(e) => setForm({ ...form, sectionId: e.target.value })} required>
            <option value="">Select section</option>
            {sections.filter((s) => !form.classId || String(s.class_id) === String(form.classId)).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: e.target.value })}>
            {['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'].map((d) => <option key={d}>{d}</option>)}
          </select>
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} required />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} required />
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.subjectId} onChange={(e) => setForm({ ...form, subjectId: e.target.value })} required>
            <option value="">Select subject</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} required>
            <option value="">Select teacher</option>
            {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Room" value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} />
          <div className="lg:col-span-3 flex gap-3">
            <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">{editingId ? 'Update Period' : 'Save Period'}</button>
            <button type="button" onClick={() => { setShowForm(false); setEditingId(null); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-600">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-6">
        {timetable.length === 0 ? (
          <EmptyState title="No timetable" description="Create periods to generate a weekly schedule." />
        ) : (
          <DataTable
            columns={['Day', 'Start', 'End', 'Subject', 'Teacher', 'Actions']}
            rows={timetable
              .filter((t) => {
                if (!query) return true;
                const q = query.toLowerCase();
                return (
                  t.day_of_week?.toLowerCase().includes(q) ||
                  t.subject_name?.toLowerCase().includes(q) ||
                  t.teacher_name?.toLowerCase().includes(q) ||
                  t.start_time?.includes(q) ||
                  t.end_time?.includes(q)
                );
              })
              .map((t) => [
                t.day_of_week,
                t.start_time,
                t.end_time,
                t.subject_name,
                t.teacher_name,
                <div key={`actions-${t.id}`} className="flex gap-3">
                  <button onClick={() => startEdit(t)} className="text-brand-600 font-semibold">Edit</button>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete this timetable period?')) return;
                      try {
                        await api.delete(`/admin/timetables/${t.id}`);
                        toast.success('Period deleted');
                        await loadTimetable();
                      } catch (err) {
                        toast.error(err.friendlyMessage || 'Failed to delete period');
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

export default TimetablePage;
