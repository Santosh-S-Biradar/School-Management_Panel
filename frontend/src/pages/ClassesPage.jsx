import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';

const ClassesPage = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [showClassForm, setShowClassForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);
  const [editingSectionId, setEditingSectionId] = useState(null);
  const [classForm, setClassForm] = useState({ name: '', gradeLevel: '' });
  const [sectionForm, setSectionForm] = useState({ classId: '', name: '' });
  const { query } = useSearch();

  useEffect(() => {
    const load = async () => {
      const [{ data: classData }, { data: sectionData }] = await Promise.all([
        api.get('/admin/classes'),
        api.get('/admin/sections')
      ]);
      setClasses(classData || []);
      setSections(sectionData || []);
    };
    load().catch(() => {});
  }, []);

  const createClass = async (event) => {
    event.preventDefault();
    try {
      if (editingClassId) {
        await api.put(`/admin/classes/${editingClassId}`, classForm);
        toast.success('Class updated');
      } else {
        await api.post('/admin/classes', classForm);
        toast.success('Class created');
      }
      setShowClassForm(false);
      setEditingClassId(null);
      setClassForm({ name: '', gradeLevel: '' });
      const { data } = await api.get('/admin/classes');
      setClasses(data || []);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to create class');
    }
  };

  const createSection = async (event) => {
    event.preventDefault();
    try {
      if (editingSectionId) {
        await api.put(`/admin/sections/${editingSectionId}`, { ...sectionForm, classId: Number(sectionForm.classId) });
        toast.success('Section updated');
      } else {
        await api.post('/admin/sections', { ...sectionForm, classId: Number(sectionForm.classId) });
        toast.success('Section created');
      }
      setShowSectionForm(false);
      setEditingSectionId(null);
      setSectionForm({ classId: '', name: '' });
      const { data } = await api.get('/admin/sections');
      setSections(data || []);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to create section');
    }
  };

  const startEditClass = (cls) => {
    setEditingClassId(cls.id);
    setClassForm({ name: cls.name, gradeLevel: cls.grade_level });
    setShowClassForm(true);
  };

  const startEditSection = (sec) => {
    setEditingSectionId(sec.id);
    setSectionForm({ classId: String(sec.class_id), name: sec.name });
    setShowSectionForm(true);
  };

  return (
    <AppLayout>
      <PageHeader
        title="Classes & Sections"
        subtitle="Organize grade levels and sections."
        action={<button onClick={() => setShowClassForm(!showClassForm)} className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Add Class</button>}
      />
      {showClassForm && (
        <form onSubmit={createClass} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 lg:grid-cols-3">
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Class name" value={classForm.name} onChange={(e) => setClassForm({ ...classForm, name: e.target.value })} required />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Grade level" value={classForm.gradeLevel} onChange={(e) => setClassForm({ ...classForm, gradeLevel: e.target.value })} required />
          <div className="lg:col-span-3 flex gap-3">
            <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">{editingClassId ? 'Update Class' : 'Save Class'}</button>
            <button type="button" onClick={() => { setShowClassForm(false); setEditingClassId(null); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-600">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-4">
        <button onClick={() => setShowSectionForm(!showSectionForm)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-700">Add Section</button>
      </div>
      {showSectionForm && (
        <form onSubmit={createSection} className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 lg:grid-cols-3">
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={sectionForm.classId} onChange={(e) => setSectionForm({ ...sectionForm, classId: e.target.value })} required>
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Section name" value={sectionForm.name} onChange={(e) => setSectionForm({ ...sectionForm, name: e.target.value })} required />
          <div className="lg:col-span-3 flex gap-3">
            <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">{editingSectionId ? 'Update Section' : 'Save Section'}</button>
            <button type="button" onClick={() => { setShowSectionForm(false); setEditingSectionId(null); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-600">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink-700">Classes</h3>
          {classes.length === 0 ? (
            <EmptyState title="No classes" description="Create classes to start managing sections and timetables." />
          ) : (
            <DataTable
              columns={['Class', 'Grade Level', 'Actions']}
              rows={classes
                .filter((c) => {
                  if (!query) return true;
                  const q = query.toLowerCase();
                  return c.name?.toLowerCase().includes(q) || c.grade_level?.toLowerCase().includes(q);
                })
                .map((c) => [
                  c.name,
                  c.grade_level,
                  <div key={`actions-${c.id}`} className="flex gap-3">
                    <button onClick={() => startEditClass(c)} className="text-brand-600 font-semibold">Edit</button>
                    <button
                      onClick={async () => {
                        if (!window.confirm('Delete this class?')) return;
                        try {
                          await api.delete(`/admin/classes/${c.id}`);
                          toast.success('Class deleted');
                          const { data } = await api.get('/admin/classes');
                          setClasses(data || []);
                        } catch (err) {
                          toast.error(err.friendlyMessage || 'Failed to delete class');
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
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink-700">Sections</h3>
          {sections.length === 0 ? (
            <EmptyState title="No sections" description="Add sections to each class for better organization." />
          ) : (
            <DataTable
              columns={['Section', 'Class Id', 'Actions']}
              rows={sections
                .filter((s) => {
                  if (!query) return true;
                  const q = query.toLowerCase();
                  return s.name?.toLowerCase().includes(q) || String(s.class_id).includes(q);
                })
                .map((s) => [
                  s.name,
                  s.class_id,
                  <div key={`actions-${s.id}`} className="flex gap-3">
                    <button onClick={() => startEditSection(s)} className="text-brand-600 font-semibold">Edit</button>
                    <button
                      onClick={async () => {
                        if (!window.confirm('Delete this section?')) return;
                        try {
                          await api.delete(`/admin/sections/${s.id}`);
                          toast.success('Section deleted');
                          const { data } = await api.get('/admin/sections');
                          setSections(data || []);
                        } catch (err) {
                          toast.error(err.friendlyMessage || 'Failed to delete section');
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
      </div>
    </AppLayout>
  );
};

export default ClassesPage;
