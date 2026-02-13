import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const GRADE_OPTIONS = ['', 'A+', 'A', 'B+', 'B', 'C', 'D', 'F'];

const TeacherMarksPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [exams, setExams] = useState([]);
  const [examSubjects, setExamSubjects] = useState([]);
  const [sheet, setSheet] = useState([]);

  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedExamId, setSelectedExamId] = useState('');
  const [selectedExamSubjectId, setSelectedExamSubjectId] = useState('');

  const [loadingSheet, setLoadingSheet] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([api.get('/teacher/assigned-classes'), api.get('/teacher/exams')])
      .then(([assignedRes, examsRes]) => {
        setAssignments(assignedRes.data || []);
        setExams(examsRes.data || []);
      })
      .catch(() => {});
  }, []);

  const classOptions = useMemo(() => {
    const seen = new Set();
    const options = [];
    assignments.forEach((a) => {
      const key = String(a.class_id);
      if (!seen.has(key)) {
        seen.add(key);
        options.push({ classId: key, className: a.class_name });
      }
    });
    return options;
  }, [assignments]);

  const sectionOptions = useMemo(() => {
    if (!selectedClassId) return [];
    const seen = new Set();
    const options = [];
    assignments
      .filter((a) => String(a.class_id) === String(selectedClassId))
      .forEach((a) => {
        const key = a.section_id === null ? 'all' : String(a.section_id);
        if (!seen.has(key)) {
          seen.add(key);
          options.push({
            sectionId: a.section_id === null ? '' : String(a.section_id),
            sectionName: a.section_name || 'All Sections'
          });
        }
      });
    return options;
  }, [assignments, selectedClassId]);

  const loadExamSubjects = async () => {
    if (!selectedClassId || !selectedExamId) {
      setExamSubjects([]);
      setSelectedExamSubjectId('');
      return;
    }
    try {
      const query = selectedSectionId
        ? `?examId=${selectedExamId}&classId=${selectedClassId}&sectionId=${selectedSectionId}`
        : `?examId=${selectedExamId}&classId=${selectedClassId}`;
      const { data } = await api.get(`/teacher/exam-subjects${query}`);
      setExamSubjects(data || []);
      setSelectedExamSubjectId('');
      setSheet([]);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to load exam subjects');
      setExamSubjects([]);
      setSelectedExamSubjectId('');
      setSheet([]);
    }
  };

  useEffect(() => {
    loadExamSubjects().catch(() => {});
  }, [selectedClassId, selectedSectionId, selectedExamId]);

  const loadSheet = async () => {
    if (!selectedClassId || !selectedExamSubjectId) {
      setSheet([]);
      return;
    }
    setLoadingSheet(true);
    try {
      const query = selectedSectionId
        ? `?examSubjectId=${selectedExamSubjectId}&classId=${selectedClassId}&sectionId=${selectedSectionId}`
        : `?examSubjectId=${selectedExamSubjectId}&classId=${selectedClassId}`;
      const { data } = await api.get(`/teacher/marks-sheet${query}`);
      setSheet((data || []).map((row) => ({
        ...row,
        marks: row.marks === null || row.marks === undefined ? '' : String(row.marks),
        grade: row.grade || ''
      })));
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to load marks sheet');
      setSheet([]);
    } finally {
      setLoadingSheet(false);
    }
  };

  useEffect(() => {
    loadSheet().catch(() => {});
  }, [selectedExamSubjectId]);

  const updateRow = (studentId, key, value) => {
    setSheet((prev) => prev.map((row) => (row.student_id === studentId ? { ...row, [key]: value } : row)));
  };

  const saveMarks = async () => {
    if (!selectedExamSubjectId) {
      toast.error('Select subject');
      return;
    }
    if (!sheet.length) {
      toast.error('No students to save');
      return;
    }

    const validRows = sheet.filter((row) => row.marks !== '');
    if (!validRows.length) {
      toast.error('Enter marks for at least one student');
      return;
    }
    if (validRows.some((row) => Number.isNaN(Number(row.marks)) || Number(row.marks) < 0)) {
      toast.error('Marks must be valid positive numbers');
      return;
    }

    const records = validRows.map((row) => ({
      examSubjectId: Number(selectedExamSubjectId),
      studentId: row.student_id,
      marks: Number(row.marks),
      grade: row.grade || null
    }));

    setSaving(true);
    try {
      await api.post('/teacher/marks', { records });
      toast.success('Marks updated successfully');
      await loadSheet();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to save marks');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Marks & Grades" subtitle="Select class, exam and subject to update student marks and grades." />

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <select
            value={selectedClassId}
            onChange={(e) => {
              setSelectedClassId(e.target.value);
              setSelectedSectionId('');
            }}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="">Select class</option>
            {classOptions.map((c) => (
              <option key={c.classId} value={c.classId}>{c.className}</option>
            ))}
          </select>

          <select
            value={selectedSectionId}
            onChange={(e) => setSelectedSectionId(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="">All sections</option>
            {sectionOptions
              .filter((s) => s.sectionId)
              .map((s) => (
                <option key={s.sectionId} value={s.sectionId}>{s.sectionName}</option>
              ))}
          </select>

          <select
            value={selectedExamId}
            onChange={(e) => setSelectedExamId(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="">Select exam</option>
            {exams.map((e) => (
              <option key={e.id} value={e.id}>{e.name}</option>
            ))}
          </select>

          <select
            value={selectedExamSubjectId}
            onChange={(e) => setSelectedExamSubjectId(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          >
            <option value="">Select subject</option>
            {examSubjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.subject_name} ({s.section_name || 'All Sections'})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-6">
        {!selectedClassId || !selectedExamId || !selectedExamSubjectId ? (
          <EmptyState title="Select required filters" description="Choose class, exam and subject to load students." />
        ) : loadingSheet ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-ink-600">Loading marks sheet...</div>
        ) : sheet.length === 0 ? (
          <EmptyState title="No students found" description="No student records are available for the selected class/section." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Admission No</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Marks</th>
                  <th className="px-4 py-3 font-medium">Grade</th>
                </tr>
              </thead>
              <tbody>
                {sheet.map((row) => (
                  <tr key={row.student_id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-ink-700">{row.admission_no}</td>
                    <td className="px-4 py-3 text-ink-700">{row.student_name}</td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        min="0"
                        value={row.marks}
                        onChange={(e) => updateRow(row.student_id, 'marks', e.target.value)}
                        className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                        placeholder="Enter"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={row.grade}
                        onChange={(e) => updateRow(row.student_id, 'grade', e.target.value)}
                        className="w-28 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                      >
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g || 'none'} value={g}>{g || '-'}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={saveMarks}
          disabled={saving || !sheet.length}
          className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save marks'}
        </button>
      </div>
    </AppLayout>
  );
};

export default TeacherMarksPage;
