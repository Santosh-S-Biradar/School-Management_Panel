const StatCard = ({ title, value, hint }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
    <div className="text-sm text-ink-500">{title}</div>
    <div className="mt-2 text-2xl font-semibold text-ink-900">{value}</div>
    {hint && <div className="mt-2 text-xs text-ink-500">{hint}</div>}
  </div>
);

export default StatCard;
