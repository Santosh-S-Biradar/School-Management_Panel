import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

const AppLayout = ({ children }) => (
  <div className="min-h-screen bg-slate-50 text-ink-900">
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Topbar />
        <main className="px-6 py-6 lg:px-10">{children}</main>
      </div>
    </div>
  </div>
);

export default AppLayout;
