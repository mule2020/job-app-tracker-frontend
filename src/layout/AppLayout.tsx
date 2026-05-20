import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const pageTitles: Record<string, string> = {
  '/dashboard':             'Dashboard',
  '/applications':          'Applications',
  '/applications/new':      'New Application',
  '/jobs':                  'Find Jobs',
  '/resumes':               'Resumes',
  '/resumes/generate':      'Generate Resume',
  '/cover-letters':         'Cover Letters',
  '/cover-letters/generate':'Generate Cover Letter',
  '/profile':               'Profile',
};

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { pathname } = useLocation();

  // Match dynamic routes like /applications/:id
  const title =
    pageTitles[pathname] ??
    (pathname.startsWith('/applications/') ? 'Application Details' : '');

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AppLayout;