import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const resolveFileUrl = (fileUrl) => {
  if (!fileUrl) return '';
  if (/^https?:\/\//i.test(fileUrl)) return fileUrl;
  const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  const serverBase = apiBase.replace(/\/api\/?$/, '');
  return `${serverBase}${fileUrl.startsWith('/') ? '' : '/'}${fileUrl}`;
};

const TeacherMaterialsPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [materials, setMaterials] = useState([]);
  const [teacherClasses, setTeacherClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    classId: '',
    sectionId: '',
    subjectId: '',
    title: '',
    description: '',
    fileUrl: ''
  });

  const loadMaterials = async () => {
    const { data } = await api.get('/teacher/materials');
    setMaterials(data || []);
  };

  useEffect(() => {
    Promise.all([api.get('/teacher/assigned-classes'), loadMaterials()])
      .then(([assigned]) => {
        setTeacherClasses(assigned.data || []);
      })
      .catch(() => {});
  }, []);

  const classOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    teacherClasses.forEach((row) => {
      const key = String(row.class_id);
      if (!seen.has(key)) {
        seen.add(key);
        options.push({ id: key, name: row.class_name });
      }
    });
    return options;
  }, [teacherClasses]);

  const sectionOptions = useMemo(() => {
    if (!form.classId) return [];
    const seen = new Set();
    const options = [];
    teacherClasses
      .filter((row) => String(row.class_id) === String(form.classId))
      .forEach((row) => {
        if (!row.section_id) return;
        const key = String(row.section_id);
        if (!seen.has(key)) {
          seen.add(key);
          options.push({ id: key, name: row.section_name });
        }
      });
    return options;
  }, [teacherClasses, form.classId]);

  useEffect(() => {
    const loadSubjects = async () => {
      try {
        const query = form.sectionId
          ? `?classId=${form.classId}&sectionId=${form.sectionId}`
          : (form.classId ? `?classId=${form.classId}` : '');
        const { data } = await api.get(`/teacher/subjects${query}`);
        setSubjects(data || []);
        setForm((prev) => ({ ...prev, subjectId: '' }));
      } catch (err) {
        toast.error(err.friendlyMessage || 'Failed to load subjects');
        setSubjects([]);
      }
    };

    loadSubjects().catch(() => {});
  }, [form.classId, form.sectionId]);

  const submit = async (event) => {
    event.preventDefault();
    if (!form.subjectId || !form.title.trim()) {
      toast.error('Subject and title are required');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/teacher/materials', {
        classId: form.classId ? Number(form.classId) : null,
        sectionId: form.sectionId ? Number(form.sectionId) : null,
        subjectId: Number(form.subjectId),
        title: form.title.trim(),
        description: form.description?.trim() || '',
        fileUrl: form.fileUrl?.trim() || ''
      });
      toast.success('Material posted');
      setShowForm(false);
      setForm({
        classId: '',
        sectionId: '',
        subjectId: '',
        title: '',
        description: '',
        fileUrl: ''
      });
      await loadMaterials();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to post material');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Materials"
        subtitle="Create and share study materials with your classes."
        action={(
          <button
            type="button"
            onClick={() => setShowForm((prev) => !prev)}
            className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
          >
            {showForm ? 'Close' : 'Add Material'}
          </button>
        )}
      />

      {showForm && (
        <form onSubmit={submit} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            <select
              value={form.classId}
              onChange={(e) => setForm((prev) => ({ ...prev, classId: e.target.value, sectionId: '' }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="">All my classes (optional)</option>
              {classOptions.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>

            <select
              value={form.sectionId}
              onChange={(e) => setForm((prev) => ({ ...prev, sectionId: e.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
            >
              <option value="">All sections (optional)</option>
              {sectionOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <select
              value={form.subjectId}
              onChange={(e) => setForm((prev) => ({ ...prev, subjectId: e.target.value }))}
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              required
            >
              <option value="">Select subject</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <input
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="Material title"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm md:col-span-2"
              required
            />

            <input
              value={form.fileUrl}
              onChange={(e) => setForm((prev) => ({ ...prev, fileUrl: e.target.value }))}
              placeholder="File URL (optional)"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
            />
          </div>

          <textarea
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={4}
            placeholder="Description"
            className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />

          <div className="mt-4">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
            >
              {submitting ? 'Posting...' : 'Post Material'}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        {materials.length === 0 ? (
          <EmptyState title="No materials" description="Materials posted by you will appear here." />
        ) : (
          <div className="space-y-4">
            {materials.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-ink-900">{item.title}</div>
                    <div className="mt-1 text-xs text-ink-500">
                      {item.class_name} | {item.section_name} | {item.subject_name}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-sm text-ink-600">{item.description || 'No description'}</div>
                {item.file_url ? (
                  <a href={resolveFileUrl(item.file_url)} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm font-semibold text-brand-600">
                    Open File
                  </a>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TeacherMaterialsPage;
