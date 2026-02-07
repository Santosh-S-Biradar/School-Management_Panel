import { NavLink } from 'react-router-dom';
import { BookOpen, CalendarDays, GraduationCap, LayoutDashboard, Users, NotebookPen, ClipboardList, Bell, Wallet, UserSquare2 } from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const iconMap = {
  dashboard: LayoutDashboard,
  students: Users,
  teachers: UserSquare2,
  classes: GraduationCap,
  subjects: BookOpen,
  timetable: CalendarDays,
  exams: NotebookPen,
  attendance: ClipboardList,
  fees: Wallet,
  notifications: Bell
};

const menuByRole = {
  admin: [
    { key: 'dashboard', label: 'Dashboard', to: '/admin' },
    { key: 'students', label: 'Students', to: '/admin/students' },
    { key: 'teachers', label: 'Teachers', to: '/admin/teachers' },
    { key: 'classes', label: 'Classes & Sections', to: '/admin/classes' },
    { key: 'subjects', label: 'Subjects', to: '/admin/subjects' },
    { key: 'timetable', label: 'Timetable', to: '/admin/timetable' },
    { key: 'exams', label: 'Exams & Grades', to: '/admin/exams' },
    { key: 'fees', label: 'Fees', to: '/admin/fees' },
    { key: 'attendance', label: 'Attendance', to: '/admin/attendance' },
    { key: 'notifications', label: 'Notifications', to: '/admin/notifications' }
  ],
  teacher: [
    { key: 'dashboard', label: 'Dashboard', to: '/teacher' },
    { key: 'attendance', label: 'Attendance', to: '/teacher/attendance' },
    { key: 'exams', label: 'Marks & Grades', to: '/teacher/marks' },
    { key: 'subjects', label: 'Assignments', to: '/teacher/assignments' },
    { key: 'notifications', label: 'Notifications', to: '/teacher/notifications' }
  ],
  student: [
    { key: 'dashboard', label: 'Dashboard', to: '/student' },
    { key: 'timetable', label: 'Timetable', to: '/student/timetable' },
    { key: 'attendance', label: 'Attendance', to: '/student/attendance' },
    { key: 'subjects', label: 'Assignments', to: '/student/assignments' },
    { key: 'exams', label: 'Marks & Grades', to: '/student/marks' },
    { key: 'subjects', label: 'Materials', to: '/student/materials' },
    { key: 'notifications', label: 'Notifications', to: '/student/notifications' }
  ],
  parent: [
    { key: 'dashboard', label: 'Dashboard', to: '/parent' },
    { key: 'attendance', label: 'Attendance', to: '/parent/attendance' },
    { key: 'exams', label: 'Performance', to: '/parent/performance' },
    { key: 'fees', label: 'Fees', to: '/parent/fees' },
    { key: 'notifications', label: 'Notifications', to: '/parent/notifications' }
  ]
};

const Sidebar = () => {
  const { user } = useAuth();
  const menu = menuByRole[user?.role] || [];

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-slate-200">
      <div className="px-6 py-6">
        <div className="text-lg font-semibold text-ink-900">School Management</div>
        <div className="text-sm text-ink-500">Panel</div>
      </div>
      <nav className="flex-1 px-4 pb-6 space-y-1">
        {menu.map((item) => {
          const Icon = iconMap[item.key] || LayoutDashboard;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition',
                  isActive
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-ink-600 hover:bg-slate-100 hover:text-ink-900'
                )
              }
            >
              <Icon size={18} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>
      <div className="px-6 pb-6 text-xs text-ink-500">v1.0.0</div>
    </aside>
  );
};

export default Sidebar;
