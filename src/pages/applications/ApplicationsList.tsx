import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus, Search, Briefcase, ExternalLink,
  Trash2, Eye, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useApplications, useDeleteApplication } from '../../hooks/useApplications';
import type { Application, ApplicationStatus } from '../../types/application.types';

// ── Status config ─────────────────────────────────────────
const STATUS_CONFIG: Record<ApplicationStatus, { label: string; bg: string; text: string; dot: string }> = {
  PENDING:      { label: 'Pending',      bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-400'   },
  APPLIED:      { label: 'Applied',      bg: 'bg-blue-100',    text: 'text-blue-700',    dot: 'bg-blue-400'    },
  INTERVIEWING: { label: 'Interviewing', bg: 'bg-violet-100',  text: 'text-violet-700',  dot: 'bg-violet-400'  },
  OFFERED:      { label: 'Offered',      bg: 'bg-cyan-100',    text: 'text-cyan-700',    dot: 'bg-cyan-400'    },
  ACCEPTED:     { label: 'Accepted',     bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-400' },
  REJECTED:     { label: 'Rejected',     bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-400'     },
  WITHDRAWN:    { label: 'Withdrawn',    bg: 'bg-slate-100',   text: 'text-slate-600',   dot: 'bg-slate-400'   },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as ApplicationStatus[];

const StatusBadge = ({ status }: { status: ApplicationStatus }) => {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
};

const formatDate = (iso?: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
};

const Skeleton = () => (
  <div className="animate-pulse space-y-3">
    {[...Array(5)].map((_, i) => <div key={i} className="h-16 bg-slate-200 rounded-xl" />)}
  </div>
);

// ── Delete Modal ──────────────────────────────────────────
const DeleteModal = ({ app, onConfirm, onCancel, loading }: {
  app: Application; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fadeInUp">
      <h3 className="text-base font-bold text-slate-800 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
        Delete Application?
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        <span className="font-medium text-slate-700">{app.jobTitle}</span> at{' '}
        <span className="font-medium text-slate-700">{app.company}</span> will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-medium transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────
const ApplicationsList = () => {
  const [page, setPage]               = useState(0);
  const [statusFilter, setStatusFilter] = useState<ApplicationStatus | undefined>();
  const [filterOpen, setFilterOpen]   = useState(false);
  const [search, setSearch]           = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Application | null>(null);

  const { data, isLoading, isError }  = useApplications(page, 10, statusFilter);
  const deleteMutation                = useDeleteApplication();

  const apps     = data?.content ?? [];
  const total    = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 0;

  // Client-side search on current page
  const filtered = apps.filter(a =>
    a.company.toLowerCase().includes(search.toLowerCase()) ||
    a.jobTitle.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    });
  };

  return (
    <div className="space-y-5 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
            Applications
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{total} total</p>
        </div>
        <Link to="/applications/new"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-600/20 self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Application
        </Link>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search company or job title…" value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
        </div>

        {/* Status filter */}
        <div className="relative">
          <button onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-600 hover:border-slate-300 transition-colors min-w-[160px] justify-between">
            <span>{statusFilter ? STATUS_CONFIG[statusFilter].label : 'All Statuses'}</span>
            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
          </button>
          {filterOpen && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-10 overflow-hidden">
              <button onClick={() => { setStatusFilter(undefined); setFilterOpen(false); setPage(0); }}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 ${!statusFilter ? 'font-semibold text-blue-600' : 'text-slate-600'}`}>
                All Statuses
              </button>
              {ALL_STATUSES.map(s => (
                <button key={s} onClick={() => { setStatusFilter(s); setFilterOpen(false); setPage(0); }}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-slate-50 flex items-center gap-2 ${statusFilter === s ? 'font-semibold text-blue-600' : 'text-slate-600'}`}>
                  <span className={`w-2 h-2 rounded-full ${STATUS_CONFIG[s].dot}`} />
                  {STATUS_CONFIG[s].label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      {isLoading ? <Skeleton /> : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-5 py-4 rounded-xl">
          Failed to load applications. Please refresh.
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-slate-600 font-medium mb-1">
            {search || statusFilter ? 'No matching applications' : 'No applications yet'}
          </p>
          <p className="text-slate-400 text-sm mb-5">
            {search || statusFilter ? 'Try adjusting your search or filter.' : 'Add your first job application to get started.'}
          </p>
          {!search && !statusFilter && (
            <Link to="/applications/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <Plus className="w-4 h-4" /> Add Application
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Location</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(app => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-600">
                            {app.company.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="font-medium text-slate-800">{app.company}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">{app.jobTitle}</td>
                    <td className="px-5 py-4"><StatusBadge status={app.status} /></td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{app.location ?? '—'}</td>
                    <td className="px-5 py-4 text-slate-500 text-xs">{formatDate(app.appliedAt ?? app.createdAt)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {app.jobUrl && (
                          <a href={app.jobUrl} target="_blank" rel="noreferrer"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <Link to={`/applications/${app.id}`}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button onClick={() => setDeleteTarget(app)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map(app => (
              <div key={app.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                      <span className="text-sm font-bold text-blue-600">{app.company.charAt(0).toUpperCase()}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{app.company}</p>
                      <p className="text-sm text-slate-500 truncate">{app.jobTitle}</p>
                    </div>
                  </div>
                  <StatusBadge status={app.status} />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                  <span>{app.location ?? formatDate(app.appliedAt ?? app.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    {app.jobUrl && (
                      <a href={app.jobUrl} target="_blank" rel="noreferrer"
                        className="hover:text-blue-600 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                    <Link to={`/applications/${app.id}`} className="hover:text-blue-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </Link>
                    <button onClick={() => setDeleteTarget(app)} className="hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-400">
                Page {page + 1} of {totalPages} · {total} total
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}
                  className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {deleteTarget && (
        <DeleteModal app={deleteTarget} onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)} loading={deleteMutation.isPending} />
      )}
    </div>
  );
};

export default ApplicationsList;