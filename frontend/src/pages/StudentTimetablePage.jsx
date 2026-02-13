import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../layouts/AppLayout';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

const StudentTimetableGrid = ({ timetable }) => {
  const byCell = useMemo(() => {
    const map = new Map();
    timetable.forEach((item) => {
      map.set(buildKey(item.day_of_week, normalizeTime(item.start_time)), item);
    });
    return map;
  }, [timetable]);

  const slots = useMemo(() => buildSlotsFromEntries(timetable), [timetable]);

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
          {slots.map((slot) => (
            <tr key={`${slot.start}-${slot.end}`}>
              <td className="align-top border-b border-r border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-ink-700">
                {slot.label}
              </td>
              {DAYS.map((day) => {
                const entry = byCell.get(buildKey(day, slot.start));
                return (
                  <td key={buildKey(day, slot.start)} className="border-b border-r border-slate-200 p-2 align-top last:border-r-0">
                    {entry ? (
                      entry.entry_type === 'break' ? (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 shadow-sm">
                          <div className="text-sm font-semibold text-amber-900">{entry.title || 'Break'}</div>
                          <div className="mt-1 text-xs text-amber-800">Room {entry.room || '-'}</div>
                          <div className="text-xs text-amber-700">
                            {normalizeTime(entry.start_time).slice(0, 5)} - {normalizeTime(entry.end_time).slice(0, 5)}
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-3 shadow-sm">
                          <div className="text-sm font-semibold text-ink-900">{entry.subject_name || '-'}</div>
                          <div className="mt-1 text-xs font-medium text-ink-600">{entry.teacher_name || '-'}</div>
                          <div className="mt-1 text-xs text-ink-500">Room {entry.room || '-'}</div>
                          <div className="text-xs text-ink-500">
                            {normalizeTime(entry.start_time).slice(0, 5)} - {normalizeTime(entry.end_time).slice(0, 5)}
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="h-[82px] rounded-xl border border-dashed border-slate-300 bg-slate-50" />
                    )}
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

const StudentTimetablePage = () => {
  const [timetable, setTimetable] = useState([]);

  useEffect(() => {
    api.get('/student/timetable').then(({ data }) => setTimetable(data || [])).catch(() => {});
  }, []);

  return (
    <AppLayout>
      <PageHeader title="Timetable" subtitle="Your weekly class schedule." />
      <div className="mt-6">
        {timetable.length === 0 ? (
          <EmptyState title="No timetable" description="Your schedule will show up once published." />
        ) : (
          <StudentTimetableGrid timetable={timetable} />
        )}
      </div>
    </AppLayout>
  );
};

export default StudentTimetablePage;
