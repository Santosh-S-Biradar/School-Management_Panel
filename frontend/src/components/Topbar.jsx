import { Bell, CircleUserRound, LogOut, Search } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSearch } from '../context/SearchContext';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const { user, logout } = useAuth();
  const { query, setQuery } = useSearch();
  const navigate = useNavigate();

  const onSearch = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  const role = user?.role || 'student';

  const goNotifications = () => {
    navigate(`/${role}/notifications`);
  };

  const goProfile = () => {
    navigate(`/${role}/profile`);
  };

  return (
    <header className="flex flex-col gap-4 border-b border-slate-200 bg-white px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-ink-900">Welcome back, {user?.name || 'User'}</h1>
        <p className="text-sm text-ink-500">Here is the latest snapshot of your school operations.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm text-ink-500 lg:flex">
          <Search size={16} />
          <input
            className="w-48 bg-transparent text-sm text-ink-700 outline-none"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onSearch}
          />
        </div>
        <button onClick={goNotifications} className="rounded-full border border-slate-200 p-2 text-ink-500 hover:text-ink-700">
          <Bell size={18} />
        </button>
        <button
          onClick={goProfile}
          className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-ink-700 hover:bg-slate-50"
        >
          <CircleUserRound size={16} />
          Profile
        </button>
        <button
          className="flex items-center gap-2 rounded-full bg-ink-900 px-4 py-2 text-sm font-semibold text-white"
          onClick={logout}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Topbar;
