import { useEffect, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import { useSearch } from '../context/SearchContext';

const ExamsPage = () => {
  const [exams, setExams] = useState([]);
  const [examSubjects, setExamSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [showExamForm, setShowExamForm] = useState(false);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [examForm, setExamForm] = useState({ name: '', startDate: '', endDate: '' });
  const [subjectForm, setSubjectForm] = useState({ examId: '', classId: '', sectionId: '', subjectId: '', maxMarks: 100 });
  const { query } = useSearch();

  useEffect(() => {
    const boot = async () => {
      const [{ data: examData }, { data: classData }, { data: sectionData }, { data: subjectData }, { data: examSubjectData }] = await Promise.all([
        api.get('/admin/exams'),
        api.get('/admin/classes'),
        api.get('/admin/sections'),
        api.get('/admin/subjects'),
        api.get('/admin/exam-subjects')
      ]);
      setExams(examData || []);
      setClasses(classData || []);
      setSections(sectionData || []);
      setSubjects(subjectData || []);
      setExamSubjects(examSubjectData || []);
    };
    boot().catch(() => {});
  }, []);

  const createExam = async (event) => {
    event.preventDefault();
    try {
      if (editingId) {
        await api.put(`/admin/exams/${editingId}`, examForm);
        toast.success('Exam updated');
      } else {
        await api.post('/admin/exams', examForm);
        toast.success('Exam created');
      }
      setShowExamForm(false);
      setEditingId(null);
      setExamForm({ name: '', startDate: '', endDate: '' });
      const { data } = await api.get('/admin/exams');
      setExams(data || []);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to create exam');
    }
  };

  const startEdit = (exam) => {
    setEditingId(exam.id);
    setExamForm({
      name: exam.name,
      startDate: exam.start_date,
      endDate: exam.end_date
    });
    setShowExamForm(true);
  };

  const addExamSubject = async (event) => {
    event.preventDefault();
    try {
      await api.post('/admin/exam-subjects', {
        ...subjectForm,
        examId: Number(subjectForm.examId),
        classId: Number(subjectForm.classId),
        sectionId: subjectForm.sectionId ? Number(subjectForm.sectionId) : null,
        subjectId: Number(subjectForm.subjectId),
        maxMarks: Number(subjectForm.maxMarks)
      });
      toast.success('Exam subject added');
      setShowSubjectForm(false);
      setSubjectForm({ examId: '', classId: '', sectionId: '', subjectId: '', maxMarks: 100 });
      const { data } = await api.get('/admin/exam-subjects');
      setExamSubjects(data || []);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to add exam subject');
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Exams & Grades"
        subtitle="Manage exam schedules and grading." 
        action={<button onClick={() => setShowExamForm(!showExamForm)} className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Create Exam</button>}
      />
      {showExamForm && (
        <form onSubmit={createExam} className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 lg:grid-cols-3">
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" placeholder="Exam name" value={examForm.name} onChange={(e) => setExamForm({ ...examForm, name: e.target.value })} required />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="date" value={examForm.startDate} onChange={(e) => setExamForm({ ...examForm, startDate: e.target.value })} required />
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="date" value={examForm.endDate} onChange={(e) => setExamForm({ ...examForm, endDate: e.target.value })} required />
          <div className="lg:col-span-3 flex gap-3">
            <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">{editingId ? 'Update Exam' : 'Save Exam'}</button>
            <button type="button" onClick={() => { setShowExamForm(false); setEditingId(null); }} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-600">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-4">
        <button onClick={() => setShowSubjectForm(!showSubjectForm)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-700">Assign Subjects</button>
      </div>
      {showSubjectForm && (
        <form onSubmit={addExamSubject} className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 grid gap-4 lg:grid-cols-3">
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={subjectForm.examId} onChange={(e) => setSubjectForm({ ...subjectForm, examId: e.target.value })} required>
            <option value="">Select exam</option>
            {exams.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={subjectForm.classId} onChange={(e) => setSubjectForm({ ...subjectForm, classId: e.target.value })} required>
            <option value="">Select class</option>
            {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={subjectForm.sectionId} onChange={(e) => setSubjectForm({ ...subjectForm, sectionId: e.target.value })}>
            <option value="">All sections (optional)</option>
            {sections.filter((s) => !subjectForm.classId || String(s.class_id) === String(subjectForm.classId)).map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <select className="rounded-xl border border-slate-200 px-4 py-3 text-sm" value={subjectForm.subjectId} onChange={(e) => setSubjectForm({ ...subjectForm, subjectId: e.target.value })} required>
            <option value="">Select subject</option>
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <input className="rounded-xl border border-slate-200 px-4 py-3 text-sm" type="number" min="1" value={subjectForm.maxMarks} onChange={(e) => setSubjectForm({ ...subjectForm, maxMarks: e.target.value })} />
          <div className="lg:col-span-3 flex gap-3">
            <button type="submit" className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white">Save Subject</button>
            <button type="button" onClick={() => setShowSubjectForm(false)} className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-600">Cancel</button>
          </div>
        </form>
      )}
      <div className="mt-6">
        {exams.length === 0 ? (
          <EmptyState title="No exams" description="Create an exam to assign subjects and marks." />
        ) : (
          <DataTable
            columns={['Exam', 'Start Date', 'End Date', 'Actions']}
            rows={exams
              .filter((e) => {
                if (!query) return true;
                const q = query.toLowerCase();
                return e.name?.toLowerCase().includes(q) || e.start_date?.includes(q) || e.end_date?.includes(q);
              })
              .map((e) => [
                e.name,
                e.start_date,
                e.end_date,
                <div key={`actions-${e.id}`} className="flex gap-3">
                  <button onClick={() => startEdit(e)} className="text-brand-600 font-semibold">Edit</button>
                  <button
                    onClick={async () => {
                      if (!window.confirm('Delete this exam?')) return;
                      try {
                        await api.delete(`/admin/exams/${e.id}`);
                        toast.success('Exam deleted');
                        const { data } = await api.get('/admin/exams');
                        setExams(data || []);
                      } catch (err) {
                        toast.error(err.friendlyMessage || 'Failed to delete exam');
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

      <div className="mt-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-ink-900">Assigned Subjects (Classwise)</h3>
            <p className="mt-1 text-sm text-ink-500">View all subjects mapped to each exam, class and section.</p>
          </div>
          <button
            type="button"
            onClick={() => setShowSubjectForm(true)}
            className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Add Subject
          </button>
        </div>
        <div className="mt-4">
          {examSubjects.length === 0 ? (
            <EmptyState title="No subject assignments" description="Use 'Assign Subjects' to map subjects exam-wise." />
          ) : (
            <DataTable
              columns={['Exam', 'Class', 'Section', 'Subject', 'Max Marks', 'Actions']}
              rows={examSubjects.map((es) => [
                es.exam_name,
                es.class_name,
                es.section_name || 'All Sections',
                es.subject_name,
                es.max_marks,
                <button
                  key={`delete-exam-subject-${es.id}`}
                  type="button"
                  onClick={async () => {
                    if (!window.confirm('Delete this assigned subject?')) return;
                    try {
                      await api.delete(`/admin/exam-subjects/${es.id}`);
                      toast.success('Assigned subject deleted');
                      const { data } = await api.get('/admin/exam-subjects');
                      setExamSubjects(data || []);
                    } catch (err) {
                      toast.error(err.friendlyMessage || 'Failed to delete assigned subject');
                    }
                  }}
                  className="text-red-600 font-semibold"
                >
                  Delete
                </button>
              ])}
            />
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default ExamsPage;
