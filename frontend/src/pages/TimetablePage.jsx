import { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DEFAULT_TIME_SLOTS = [
  { label: '09:00 - 10:00', start: '09:00:00', end: '10:00:00' },
  { label: '10:00 - 11:00', start: '10:00:00', end: '11:00:00' },
  { label: '11:00 - 12:00', start: '11:00:00', end: '12:00:00' },
  { label: '12:00 - 01:00', start: '12:00:00', end: '13:00:00' }
];

const defaultCellForm = {
  entryType: 'lecture',
  title: '',
  subjectId: '',
  teacherId: '',
  room: ''
};

const buildKey = (day, start) => `${day}__${start}`;
const normalizeTime = (time) => (time || '').slice(0, 8);
const minutes = (t) => {
  const [h, m] = t.slice(0, 5).split(':').map(Number);
  return (h * 60) + m;
};
const toLabel = (start, end) => `${start.slice(0, 5)} - ${end.slice(0, 5)}`;
const normalizeSlot = (start, end) => ({
  start: normalizeTime(start),
  end: normalizeTime(end),
  label: toLabel(normalizeTime(start), normalizeTime(end))
});
const sortSlots = (slots) => [...slots].sort((a, b) => minutes(a.start) - minutes(b.start));
const buildSlotsFromEntries = (entries) => {
  const uniq = new Map();
  entries.forEach((e) => {
    const start = normalizeTime(e.start_time);
    const end = normalizeTime(e.end_time);
    uniq.set(`${start}-${end}`, normalizeSlot(start, end));
  });
  return sortSlots(Array.from(uniq.values()));
};

const LoadingState = () => (
  <div className="flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-12">
    <div className="h-9 w-9 animate-spin rounded-full border-4 border-slate-200 border-t-brand-600" />
  </div>
);

const TimetableGrid = ({ timetable, onCellClick, editable, timeSlots, onRemoveSlot }) => {
  const byCell = useMemo(() => {
    const map = new Map();
    timetable.forEach((item) => {
      map.set(buildKey(item.day_of_week, normalizeTime(item.start_time)), item);
    });
    return map;
  }, [timetable]);

  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
      <table className="min-w-[980px] w-full table-fixed border-collapse">
        <thead>
          <tr className="bg-slate-50">
            <th className="w-44 border-b border-r border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500">
              Time
            </th>
            {DAYS.map((day) => (
              <th
                key={day}
                className="border-b border-r border-slate-200 px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-ink-500 last:border-r-0"
              >
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((slot) => (
            <tr key={`${slot.start}-${slot.end}`}>
              <td className="align-top border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-ink-700">
                <div className="flex items-center justify-between gap-2">
                  <span>{slot.label}</span>
                  {editable && (
                    <button
                      type="button"
                      onClick={() => onRemoveSlot(slot)}
                      className="rounded-md border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700"
                    >
                      x
                    </button>
                  )}
                </div>
              </td>
              {DAYS.map((day) => {
                const entry = byCell.get(buildKey(day, normalizeTime(slot.start)));
                return (
                  <td key={buildKey(day, slot.start)} className="border-b border-r border-slate-200 p-2 align-top last:border-r-0">
                    <button
                      type="button"
                      onClick={() => editable && onCellClick({ day, slot, entry })}
                      className={`w-full rounded-xl p-2 text-left transition ${editable ? 'hover:bg-brand-50/50' : ''}`}
                    >
                      {entry ? (
                        entry.entry_type === 'break' ? (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
                            <div className="text-sm font-semibold text-amber-900">{entry.title || 'Break'}</div>
                            <div className="mt-1 text-xs text-amber-800">Room {entry.room || '-'}</div>
                            <div className="text-xs text-amber-700">{normalizeTime(entry.start_time).slice(0, 5)} - {normalizeTime(entry.end_time).slice(0, 5)}</div>
                          </div>
                        ) : (
                          <div className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-3 shadow-sm">
                            <div className="text-sm font-semibold text-ink-900">{entry.subject_name}</div>
                            <div className="mt-1 text-xs font-medium text-ink-600">{entry.teacher_name}</div>
                            <div className="mt-1 text-xs text-ink-500">Room {entry.room || '-'}</div>
                            <div className="text-xs text-ink-500">{normalizeTime(entry.start_time).slice(0, 5)} - {normalizeTime(entry.end_time).slice(0, 5)}</div>
                          </div>
                        )
                      ) : (
                        <div className="flex h-[82px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs font-semibold text-brand-600">
                          + Add
                        </div>
                      )}
                    </button>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const TimetablePage = () => {
  const [mode, setMode] = useState('list');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [classCards, setClassCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [viewTimetable, setViewTimetable] = useState([]);

  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [teachers, setTeachers] = useState([]);

  const [editorSelection, setEditorSelection] = useState({ classId: '', sectionId: '' });
  const [editorTimetable, setEditorTimetable] = useState([]);
  const [editorSlots, setEditorSlots] = useState(DEFAULT_TIME_SLOTS);
  const [newSlot, setNewSlot] = useState({ start: '09:00', end: '10:00' });

  const [modalOpen, setModalOpen] = useState(false);
  const [activeCell, setActiveCell] = useState(null);
  const [cellForm, setCellForm] = useState(defaultCellForm);
  const [saving, setSaving] = useState(false);

  const loadClassCards = async () => {
    const { data } = await api.get('/admin/timetables/classes');
    setClassCards(data || []);
  };

  const loadEditorMeta = async () => {
    const [{ data: classData }, { data: sectionData }, { data: subjectData }, { data: teacherData }] = await Promise.all([
      api.get('/admin/classes'),
      api.get('/admin/sections'),
      api.get('/admin/subjects'),
      api.get('/admin/teachers?page=1&limit=500')
    ]);
    setClasses(classData || []);
    setSections(sectionData || []);
    setSubjects(subjectData || []);
    setTeachers(teacherData.data || []);
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError('');
      try {
        await Promise.all([loadClassCards(), loadEditorMeta()]);
      } catch (err) {
        setError(err.friendlyMessage || 'Failed to load timetable module');
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const openClassView = async (card) => {
    setMode('view');
    setSelectedCard(card);
    setLoading(true);
    setError('');
    try {
      const url = card.section_id
        ? `/admin/timetables?classId=${card.class_id}&sectionId=${card.section_id}`
        : `/admin/timetables?classId=${card.class_id}`;
      const { data } = await api.get(url);
      setViewTimetable(data || []);
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load class timetable');
    } finally {
      setLoading(false);
    }
  };

  const openCreateMode = () => {
    setMode('create');
    setEditorSelection({ classId: '', sectionId: '' });
    setEditorTimetable([]);
    setEditorSlots(DEFAULT_TIME_SLOTS);
    setNewSlot({ start: '09:00', end: '10:00' });
    setModalOpen(false);
    setActiveCell(null);
    setCellForm(defaultCellForm);
    setError('');
  };

  const loadEditorTimetable = async () => {
    if (!editorSelection.classId) {
      setEditorTimetable([]);
      return;
    }
    setLoading(true);
    setError('');
    try {
      const url = editorSelection.sectionId
        ? `/admin/timetables?classId=${editorSelection.classId}&sectionId=${editorSelection.sectionId}`
        : `/admin/timetables?classId=${editorSelection.classId}`;
      const { data } = await api.get(url);
      const entries = data || [];
      setEditorTimetable(entries);
      const slots = buildSlotsFromEntries(entries);
      setEditorSlots(slots.length ? slots : DEFAULT_TIME_SLOTS);
    } catch (err) {
      setError(err.friendlyMessage || 'Failed to load timetable editor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (mode === 'create') {
      loadEditorTimetable().catch(() => {});
    }
  }, [mode, editorSelection.classId, editorSelection.sectionId]);

  const handleCellClick = ({ day, slot, entry }) => {
    setActiveCell({ day, slot, entry });
    setCellForm({
      entryType: entry?.entry_type || 'lecture',
      title: entry?.title || '',
      subjectId: entry?.subject_id ? String(entry.subject_id) : '',
      teacherId: entry?.teacher_id ? String(entry.teacher_id) : '',
      room: entry?.room || ''
    });
    setModalOpen(true);
  };

  const addTimeSlot = () => {
    const start = `${newSlot.start}:00`;
    const end = `${newSlot.end}:00`;
    if (minutes(start) >= minutes(end)) {
      toast.error('End time must be after start time');
      return;
    }
    const exists = editorSlots.some((s) => s.start === start && s.end === end);
    if (exists) {
      toast.error('Time slot already exists');
      return;
    }
    setEditorSlots(sortSlots([...editorSlots, normalizeSlot(start, end)]));
  };

  const removeTimeSlot = (slot) => {
    const hasEntries = editorTimetable.some((e) => normalizeTime(e.start_time) === slot.start && normalizeTime(e.end_time) === slot.end);
    if (hasEntries) {
      toast.error('Delete periods in this slot first');
      return;
    }
    setEditorSlots(editorSlots.filter((s) => !(s.start === slot.start && s.end === slot.end)));
  };

  const validateCell = () => {
    if (!editorSelection.classId) return 'Select class first';
    if (cellForm.entryType === 'lecture') {
      if (!cellForm.subjectId) return 'Select subject';
      if (!cellForm.teacherId) return 'Select teacher';
    }
    if (cellForm.entryType === 'break' && !cellForm.title.trim()) return 'Enter break title';
    return '';
  };

  const saveCell = async () => {
    const msg = validateCell();
    if (msg) {
      toast.error(msg);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        classId: Number(editorSelection.classId),
        sectionId: editorSelection.sectionId ? Number(editorSelection.sectionId) : null,
        dayOfWeek: activeCell.day,
        startTime: activeCell.slot.start,
        endTime: activeCell.slot.end,
        entryType: cellForm.entryType,
        title: cellForm.entryType === 'break' ? cellForm.title : null,
        subjectId: cellForm.entryType === 'lecture' ? Number(cellForm.subjectId) : null,
        teacherId: cellForm.entryType === 'lecture' ? Number(cellForm.teacherId) : null,
        room: cellForm.room || ''
      };

      if (activeCell.entry?.id) {
        await api.put(`/admin/timetables/${activeCell.entry.id}`, payload);
        toast.success('Period updated');
      } else {
        await api.post('/admin/timetables', payload);
        toast.success('Period saved');
      }

      setModalOpen(false);
      await loadEditorTimetable();
      await loadClassCards();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to save period');
    } finally {
      setSaving(false);
    }
  };

  const deleteCell = async () => {
    if (!activeCell?.entry?.id) return;
    setSaving(true);
    try {
      await api.delete(`/admin/timetables/${activeCell.entry.id}`);
      toast.success('Period deleted');
      setModalOpen(false);
      await loadEditorTimetable();
      await loadClassCards();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to delete period');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <PageHeader
        title="Timetable"
        subtitle="Create and manage weekly timetable in a structured grid."
        action={
          <div className="flex items-center gap-2">
            {mode !== 'list' && (
              <button
                onClick={() => setMode('list')}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-700"
              >
                Back
              </button>
            )}
            <button
              onClick={openCreateMode}
              className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
            >
              Create Timetable
            </button>
          </div>
        }
      />

      {error && (
        <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="mt-6">
          <LoadingState />
        </div>
      ) : null}

      {!loading && mode === 'list' && (
        <div className="mt-6">
          {classCards.length === 0 ? (
            <EmptyState title="No timetable found" description="Create timetable to show class cards here." />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {classCards.map((card, idx) => (
                <button
                  type="button"
                  key={`${card.class_id}-${card.section_id || 'all'}-${idx}`}
                  onClick={() => openClassView(card)}
                  className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-card transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold text-ink-900">{card.class_name}</div>
                      <div className="mt-1 text-sm text-ink-600">{card.section_name}</div>
                    </div>
                    <div className="rounded-lg bg-brand-50 px-2 py-1 text-xs font-semibold text-brand-700">
                      {card.total_periods} periods
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={async (event) => {
                        event.stopPropagation();
                        if (!window.confirm(`Delete timetable for ${card.class_name} (${card.section_name})?`)) return;
                        try {
                          const url = card.section_id
                            ? `/admin/timetables/class/${card.class_id}?sectionId=${card.section_id}`
                            : `/admin/timetables/class/${card.class_id}`;
                          await api.delete(url);
                          toast.success('Timetable deleted');
                          if (mode !== 'list') setMode('list');
                          await loadClassCards();
                        } catch (err) {
                          toast.error(err.friendlyMessage || 'Failed to delete timetable');
                        }
                      }}
                      className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 shadow-sm transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                    >
                      Delete timetable
                    </button>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {!loading && mode === 'view' && selectedCard && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-ink-700 shadow-card">
            <span className="font-semibold text-ink-900">Class:</span> {selectedCard.class_name} |{' '}
            <span className="font-semibold text-ink-900">Section:</span> {selectedCard.section_name}
          </div>
          {viewTimetable.length === 0 ? (
            <EmptyState title="No periods saved" description="This class/section has no timetable entries yet." />
          ) : (
            <TimetableGrid
              timetable={viewTimetable}
              editable={false}
              onCellClick={() => {}}
              timeSlots={buildSlotsFromEntries(viewTimetable)}
              onRemoveSlot={() => {}}
            />
          )}
        </div>
      )}

      {!loading && mode === 'create' && (
        <div className="mt-6 space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <div className="grid gap-4 md:grid-cols-2">
              <select
                value={editorSelection.classId}
                onChange={(e) => setEditorSelection({ ...editorSelection, classId: e.target.value, sectionId: '' })}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="">Select class</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={editorSelection.sectionId}
                onChange={(e) => setEditorSelection({ ...editorSelection, sectionId: e.target.value })}
                className="rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="">All sections (optional)</option>
                {sections
                  .filter((s) => !editorSelection.classId || String(s.class_id) === String(editorSelection.classId))
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
              </select>
            </div>
          </div>

          {!editorSelection.classId ? (
            <EmptyState title="Select class to start" description="Choose class and optional section to open the weekly editor." />
          ) : (
            <>
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
                <div className="mb-3 text-sm font-semibold text-ink-800">Add Time Slot</div>
                <div className="grid gap-3 md:grid-cols-4">
                  <input
                    type="time"
                    value={newSlot.start}
                    onChange={(e) => setNewSlot({ ...newSlot, start: e.target.value })}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                  <input
                    type="time"
                    value={newSlot.end}
                    onChange={(e) => setNewSlot({ ...newSlot, end: e.target.value })}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  />
                  <button
                    type="button"
                    onClick={addTimeSlot}
                    className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Add Slot
                  </button>
                </div>
              </div>

              <TimetableGrid
                timetable={editorTimetable}
                editable
                onCellClick={handleCellClick}
                timeSlots={editorSlots}
                onRemoveSlot={removeTimeSlot}
              />
            </>
          )}
        </div>
      )}

      {modalOpen && activeCell && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-900/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <div className="text-base font-semibold text-ink-900">{activeCell.day} | {activeCell.slot.label}</div>
            <div className="mt-4 space-y-3">
              <select
                value={cellForm.entryType}
                onChange={(e) => setCellForm({ ...cellForm, entryType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="lecture">Lecture</option>
                <option value="break">Break</option>
              </select>

              {cellForm.entryType === 'break' && (
                <input
                  value={cellForm.title}
                  onChange={(e) => setCellForm({ ...cellForm, title: e.target.value })}
                  placeholder="Break title (Lunch Break / Short Break)"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
                />
              )}

              {cellForm.entryType === 'lecture' && (
                <>
              <select
                value={cellForm.subjectId}
                onChange={(e) => setCellForm({ ...cellForm, subjectId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="">Select subject</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              <select
                value={cellForm.teacherId}
                onChange={(e) => setCellForm({ ...cellForm, teacherId: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              >
                <option value="">Select teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
                </>
              )}

              <input
                value={cellForm.room}
                onChange={(e) => setCellForm({ ...cellForm, room: e.target.value })}
                placeholder="Room"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm"
              />
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                disabled={saving}
                onClick={saveCell}
                className="rounded-xl bg-ink-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>

              {activeCell.entry?.id && (
                <button
                  disabled={saving}
                  onClick={deleteCell}
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 disabled:opacity-60"
                >
                  Delete
                </button>
              )}

              <button
                disabled={saving}
                onClick={() => setModalOpen(false)}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-ink-700 disabled:opacity-60"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
};

export default TimetablePage;
