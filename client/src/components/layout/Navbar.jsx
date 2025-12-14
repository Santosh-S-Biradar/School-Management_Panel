import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';

const Navbar = () => {
  const { logout } = useAuth();
  return (
    <header className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
      <div>
        <h2 className="text-lg font-semibold text-slate-100">School Management Panel</h2>
        <p className="text-xs text-slate-400">School Panal Dashboard</p>
      </div>
      <button
        onClick={logout}
        className="px-3 py-1 text-sm rounded-lg bg-red-500 hover:bg-red-600 text-white"
      >
        Logout
      </button>
    </header>
  );
};

export default Navbar;