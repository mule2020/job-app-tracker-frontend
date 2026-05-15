import { Menu, Bell } from 'lucide-react';
import { useAuthContext } from '../context/AuthContext';

interface Props {
  onMenuClick: () => void;
  title?: string;
}

const Topbar = ({ onMenuClick, title }: Props) => {
  const { user } = useAuthContext();

  const initial = user?.email?.charAt(0).toUpperCase() ?? 'U';

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="text-base font-semibold text-slate-800 hidden sm:block" style={{ fontFamily: 'Syne, sans-serif' }}>
            {title}
          </h1>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button className="relative p-2 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-600/40 flex items-center justify-center ml-1"
          title={user?.email}>
          <span className="text-xs font-bold text-blue-600">{initial}</span>
        </div>
      </div>
    </header>
  );
};

export default Topbar;