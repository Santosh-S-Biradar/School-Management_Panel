const EmptyState = ({ title, description }) => (
  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-ink-500">
    <div className="text-base font-semibold text-ink-700">{title}</div>
    <div className="mt-2">{description}</div>
  </div>
);

export default EmptyState;
