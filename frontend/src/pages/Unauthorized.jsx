const Unauthorized = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6">
    <div className="rounded-2xl bg-white p-8 shadow-card text-center">
      <div className="text-xl font-semibold text-ink-900">Access Denied</div>
      <p className="mt-2 text-sm text-ink-500">You do not have permission to view this page.</p>
    </div>
  </div>
);

export default Unauthorized;
