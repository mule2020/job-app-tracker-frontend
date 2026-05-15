import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, ExternalLink, FileText, Mail, Pencil,
  Trash2, Loader2, Save, X, CheckCircle2, MapPin, DollarSign
} from 'lucide-react';
import { useApplication, useUpdateApplication, useDeleteApplication } from '../../hooks/useApplications';
import type { ApplicationStatus, UpdateApplicationRequest } from '../../types/application.types';

const STATUS_CONFIG: Record<ApplicationStatus, { label: string; bg: string; text: string; dot: string; border: string }> = {
  PENDING:      { label: 'Pending',      bg: 'bg-amber-50',   text: 'text-amber-700',   dot: 'bg-amber-400',   border: 'border-amber-200'   },
  APPLIED:      { label: 'Applied',      bg: 'bg-blue-50',    text: 'text-blue-700',    dot: 'bg-blue-400',    border: 'border-blue-200'    },
  INTERVIEWING: { label: 'Interviewing', bg: 'bg-violet-50',  text: 'text-violet-700',  dot: 'bg-violet-400',  border: 'border-violet-200'  },
  OFFERED:      { label: 'Offered',      bg: 'bg-cyan-50',    text: 'text-cyan-700',    dot: 'bg-cyan-400',    border: 'border-cyan-200'    },
  ACCEPTED:     { label: 'Accepted',     bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-400', border: 'border-emerald-200' },
  REJECTED:     { label: 'Rejected',     bg: 'bg-red-50',     text: 'text-red-700',     dot: 'bg-red-400',     border: 'border-red-200'     },
  WITHDRAWN:    { label: 'Withdrawn',    bg: 'bg-slate-50',   text: 'text-slate-600',   dot: 'bg-slate-400',   border: 'border-slate-200'   },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG) as ApplicationStatus[];

const inputCls = 'w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';

interface FormState {
  company: string; jobTitle: string; jobDescription: string;
  status: ApplicationStatus; jobUrl: string; salaryRange: string;
  location: string; notes: string; appliedAt: string;
}

const Skeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-8 bg-slate-200 rounded-xl w-1/3" />
    <div className="h-40 bg-slate-200 rounded-2xl" />
    <div className="h-32 bg-slate-200 rounded-2xl" />
  </div>
);

const DeleteModal = ({ company, jobTitle, onConfirm, onCancel, loading }: {
  company: string; jobTitle: string;
  onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fadeInUp">
      <h3 className="text-base font-bold text-slate-800 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
        Delete Application?
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        <span className="font-medium text-slate-700">{jobTitle}</span> at{' '}
        <span className="font-medium text-slate-700">{company}</span> will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-medium transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2">
          {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Deleting…</> : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

const ApplicationDetails = () => {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();

  const { data: app, isLoading, isError } = useApplication(id!);
  const updateMutation = useUpdateApplication();
  const deleteMutation = useDeleteApplication();

  const [editing, setEditing]       = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [saved, setSaved]           = useState(false);

  const [form, setForm] = useState<FormState>({
    company: '', jobTitle: '', jobDescription: '', status: 'APPLIED',
    jobUrl: '', salaryRange: '', location: '', notes: '', appliedAt: '',
  });

  const startEdit = () => {
    if (!app) return;
    setForm({
      company:        app.company,
      jobTitle:       app.jobTitle,
      jobDescription: app.jobDescription ?? '',
      status:         app.status,
      jobUrl:         app.jobUrl       ?? '',
      salaryRange:    app.salaryRange  ?? '',
      location:       app.location     ?? '',
      notes:          app.notes        ?? '',
      appliedAt:      app.appliedAt    ?? '',
    });
    setEditing(true);
    setSaved(false);
  };

  const handleSave = () => {
    if (!app) return;
    const payload: UpdateApplicationRequest = {
      company:        form.company        || undefined,
      jobTitle:       form.jobTitle       || undefined,
      jobDescription: form.jobDescription || undefined,
      status:         form.status,
      jobUrl:         form.jobUrl         || undefined,
      salaryRange:    form.salaryRange    || undefined,
      location:       form.location       || undefined,
      notes:          form.notes          || undefined,
      appliedAt:      form.appliedAt      || undefined,
    };
    updateMutation.mutate(
      { id: app.id, data: payload },
      {
        onSuccess: () => {
          setEditing(false);
          setSaved(true);
          setTimeout(() => setSaved(false), 3000);
        },
      }
    );
  };

  const handleDelete = () => {
    if (!app) return;
    deleteMutation.mutate(app.id, {
      onSuccess: () => navigate('/applications'),
    });
  };

  const formatDate = (iso?: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (isLoading) return <div className="max-w-2xl mx-auto animate-fadeIn"><Skeleton /></div>;

  if (isError || !app) return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-5 py-4 rounded-xl">
        Application not found.{' '}
        <Link to="/applications" className="underline font-medium">Go back</Link>
      </div>
    </div>
  );

  const cfg = STATUS_CONFIG[app.status as ApplicationStatus];

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">

      <Link to="/applications"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Applications
      </Link>

      {saved && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> Changes saved successfully.
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        {/* Card header */}
        <div className="px-6 py-5 border-b border-slate-100">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                <span className="text-lg font-extrabold text-blue-600">
                  {app.company.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0">
                <h1 className="text-lg font-extrabold text-slate-800 truncate"
                  style={{ fontFamily: 'Syne, sans-serif' }}>{app.jobTitle}</h1>
                <p className="text-sm text-slate-500 truncate">{app.company}</p>
              </div>
            </div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shrink-0 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
          </div>
        </div>

        {/* VIEW mode */}
        {!editing && (
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Company</p>
                <p className="text-sm font-medium text-slate-700">{app.company}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Job Title</p>
                <p className="text-sm font-medium text-slate-700">{app.jobTitle}</p>
              </div>
              {app.location && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-sm font-medium text-slate-700">{app.location}</p>
                  </div>
                </div>
              )}
              {app.salaryRange && (
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Salary Range</p>
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <p className="text-sm font-medium text-slate-700">{app.salaryRange}</p>
                  </div>
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Applied</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(app.appliedAt ?? app.createdAt)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Last Updated</p>
                <p className="text-sm font-medium text-slate-700">{formatDate(app.updatedAt)}</p>
              </div>
            </div>

            {app.jobUrl && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Job Posting</p>
                <a href={app.jobUrl} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-500 font-medium transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" /> Open job listing
                </a>
              </div>
            )}

            {app.jobDescription && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Job Description</p>
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 max-h-40 overflow-y-auto">
                  {app.jobDescription}
                </p>
              </div>
            )}

            {app.notes && (
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Notes</p>
                <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                  {app.notes}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <button onClick={startEdit}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-600/20">
                <Pencil className="w-4 h-4" /> Edit
              </button>
              <button onClick={() => setShowDelete(true)}
                className="inline-flex items-center gap-2 border border-red-200 text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        )}

        {/* EDIT mode */}
        {editing && (
          <div className="px-6 py-5 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Company <span className="text-red-500">*</span></label>
                <input type="text" required value={form.company}
                  onChange={e => setForm(p => ({ ...p, company: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Title <span className="text-red-500">*</span></label>
                <input type="text" required value={form.jobTitle}
                  onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Location</label>
                <input type="text" value={form.location}
                  onChange={e => setForm(p => ({ ...p, location: e.target.value }))}
                  placeholder="e.g. Toronto, ON" className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Salary Range</label>
                <input type="text" value={form.salaryRange}
                  onChange={e => setForm(p => ({ ...p, salaryRange: e.target.value }))}
                  placeholder="e.g. $90k – $110k" className={inputCls} />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {ALL_STATUSES.map(s => {
                  const c = STATUS_CONFIG[s];
                  return (
                    <button key={s} type="button"
                      onClick={() => setForm(p => ({ ...p, status: s }))}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all
                        ${form.status === s
                          ? `${c.bg} ${c.text} ${c.border}`
                          : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Job URL</label>
              <input type="url" value={form.jobUrl}
                onChange={e => setForm(p => ({ ...p, jobUrl: e.target.value }))}
                placeholder="https://" className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Job Description</label>
              <textarea value={form.jobDescription} rows={4}
                onChange={e => setForm(p => ({ ...p, jobDescription: e.target.value }))}
                className={`${inputCls} resize-none`} />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Notes</label>
              <textarea value={form.notes} rows={3}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                className={`${inputCls} resize-none`} />
            </div>

            {updateMutation.isError && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                Failed to save. Please try again.
              </div>
            )}

            <div className="flex items-center gap-3 pt-2 border-t border-slate-100">
              <button onClick={handleSave} disabled={updateMutation.isPending}
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-600/20">
                {updateMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                  : <><Save className="w-4 h-4" />Save Changes</>}
              </button>
              <button onClick={() => setEditing(false)}
                className="inline-flex items-center gap-2 border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick actions */}
      {!editing && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link to={`/resumes/generate?applicationId=${app.id}`}
            className="group bg-white border border-slate-200 hover:border-violet-300 rounded-2xl p-5 flex items-center gap-4 shadow-sm transition-all hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-xl bg-violet-50 group-hover:bg-violet-100 flex items-center justify-center transition-colors shrink-0">
              <FileText className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Generate Resume</p>
              <p className="text-xs text-slate-400">
                {app.resumeExists ? '✓ Resume exists — regenerate?' : 'AI-tailored for this role'}
              </p>
            </div>
          </Link>
          <Link to={`/cover-letters/generate?applicationId=${app.id}`}
            className="group bg-white border border-slate-200 hover:border-cyan-300 rounded-2xl p-5 flex items-center gap-4 shadow-sm transition-all hover:-translate-y-0.5">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 group-hover:bg-cyan-100 flex items-center justify-center transition-colors shrink-0">
              <Mail className="w-5 h-5 text-cyan-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">Generate Cover Letter</p>
              <p className="text-xs text-slate-400">
                {app.coverLetterExists ? '✓ Cover letter exists — regenerate?' : 'AI-tailored for this role'}
              </p>
            </div>
          </Link>
        </div>
      )}

      {showDelete && (
        <DeleteModal company={app.company} jobTitle={app.jobTitle}
          onConfirm={handleDelete} onCancel={() => setShowDelete(false)}
          loading={deleteMutation.isPending} />
      )}
    </div>
  );
};

export default ApplicationDetails;