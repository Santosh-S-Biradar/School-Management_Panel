const PageHeader = ({ title, subtitle, action }) => (
  <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
    <div>
      <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
      {subtitle && <p className="text-sm text-ink-500">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export default PageHeader;
