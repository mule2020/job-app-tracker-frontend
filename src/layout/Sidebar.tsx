import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, Mail, User, LogOut, X } from 'lucide-react';
import clsx from 'clsx';
import { useAuthContext } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard'    },
  { to: '/applications',  icon: Briefcase,       label: 'Applications' },
  { to: '/resumes',       icon: FileText,        label: 'Resumes'      },
  { to: '/cover-letters', icon: Mail,            label: 'Cover Letters'},
  { to: '/profile',       icon: User,            label: 'Profile'      },
];

interface Props {
  open: boolean;
  onClose: () => void;
}

const Sidebar = ({ open, onClose }: Props) => {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Use first letter of email as avatar initial
  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={onClose} />
      )}

      <aside className={clsx(
        'fixed top-0 left-0 z-30 h-full w-64 bg-slate-950 border-r border-slate-800 flex flex-col transition-transform duration-300',
        'lg:translate-x-0 lg:static lg:z-auto',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>

        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-white text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>
              JobTrackr
            </span>
          </div>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} onClick={onClose}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}>
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-slate-800 shrink-0">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-600/40 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-blue-400">{initial}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.email ?? 'User'}</p>
              <p className="text-xs text-slate-500 truncate">
                {user?.isVerified ? 'Verified' : 'Not verified'}
              </p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-600/10 transition-all duration-150">
            <LogOut className="w-4 h-4 shrink-0" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;