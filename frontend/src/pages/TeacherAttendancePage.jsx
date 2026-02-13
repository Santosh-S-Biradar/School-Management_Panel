import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const todayIso = () => new Date().toISOString().slice(0, 10);

const TeacherAttendancePage = () => {
  const [assignments, setAssignments] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [date, setDate] = useState(todayIso());
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/teacher/assigned-classes').then(({ data }) => setAssignments(data || [])).catch(() => {});
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

  const loadStudents = async () => {
    if (!selectedClassId) {
      setStudents([]);
      setAttendanceMap({});
      return;
    }

    setLoadingStudents(true);
    try {
      const query = selectedSectionId
        ? `?classId=${selectedClassId}&sectionId=${selectedSectionId}`
        : `?classId=${selectedClassId}`;
      const { data } = await api.get(`/teacher/students${query}`);
      const rows = data || [];
      setStudents(rows);
      const initial = {};
      rows.forEach((s) => {
        initial[s.id] = 'Present';
      });
      setAttendanceMap(initial);
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to load students');
      setStudents([]);
      setAttendanceMap({});
    } finally {
      setLoadingStudents(false);
    }
  };

  useEffect(() => {
    loadStudents().catch(() => {});
  }, [selectedClassId, selectedSectionId]);

  const updateStatus = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const markAll = (status) => {
    const next = {};
    students.forEach((s) => {
      next[s.id] = status;
    });
    setAttendanceMap(next);
  };

  const saveAttendance = async () => {
    if (!date) {
      toast.error('Select date');
      return;
    }
    if (students.length === 0) {
      toast.error('No students found for selected class/section');
      return;
    }

    const records = students.map((s) => ({
      studentId: s.id,
      date,
      status: attendanceMap[s.id] || 'Present'
    }));

    setSaving(true);
    try {
      await api.post('/teacher/attendance', { records });
      toast.success('Attendance saved');
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader title="Mark Attendance" subtitle="Select class and section to mark present/absent." />

      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="grid gap-3 md:grid-cols-3">
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

          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => markAll('Present')}
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700"
        >
          Mark all present
        </button>
        <button
          type="button"
          onClick={() => markAll('Absent')}
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700"
        >
          Mark all absent
        </button>
      </div>

      <div className="mt-4">
        {!selectedClassId ? (
          <EmptyState title="No class selected" description="Choose class and section to load students." />
        ) : loadingStudents ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-8 text-sm text-ink-600">Loading students...</div>
        ) : students.length === 0 ? (
          <EmptyState title="No students found" description="No students are available for this class/section." />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-ink-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Admission No</th>
                  <th className="px-4 py-3 font-medium">Student</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const status = attendanceMap[student.id] || 'Present';
                  return (
                    <tr key={student.id} className="border-t border-slate-200">
                      <td className="px-4 py-3 text-ink-700">{student.admission_no}</td>
                      <td className="px-4 py-3 text-ink-700">{student.name}</td>
                      <td className="px-4 py-3">
                        <div className="inline-flex rounded-lg border border-slate-200 p-1">
                          <button
                            type="button"
                            onClick={() => updateStatus(student.id, 'Present')}
                            className={`rounded-md px-3 py-1 text-xs font-semibold ${
                              status === 'Present' ? 'bg-emerald-100 text-emerald-700' : 'text-ink-600'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => updateStatus(student.id, 'Absent')}
                            className={`rounded-md px-3 py-1 text-xs font-semibold ${
                              status === 'Absent' ? 'bg-red-100 text-red-700' : 'text-ink-600'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4">
        <button
          type="button"
          disabled={saving || students.length === 0}
          onClick={saveAttendance}
          className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {saving ? 'Saving...' : 'Save attendance'}
        </button>
      </div>
    </AppLayout>
  );
};

export default TeacherAttendancePage;
