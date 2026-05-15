import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Plus, Trash2, Eye, Search,
  Calendar, Building2, Briefcase, Wand2
} from 'lucide-react';
import { useResumes, useDeleteResume } from '../../hooks/useResumes';
import type { Resume } from '../../types/resume.types';

// ── Formatted resume renderer ─────────────────────────────
const ResumeContent = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  return (
    <div className="space-y-1 text-sm text-slate-700 leading-relaxed font-sans">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-2" />;

        // ALL CAPS lines = section headers
        if (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && !/\d/.test(trimmed)) {
          return (
            <h3 key={i} className="font-bold text-slate-900 text-xs uppercase tracking-widest mt-4 mb-1 border-b border-slate-200 pb-1">
              {trimmed}
            </h3>
          );
        }
        // Lines starting with • or - = bullet points
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          return (
            <div key={i} className="flex gap-2 ml-2">
              <span className="text-blue-500 mt-0.5 shrink-0">•</span>
              <span>{trimmed.replace(/^[•\-\*]\s*/, '')}</span>
            </div>
          );
        }
        // Bold-like lines (short, ends with colon or all caps words)
        if (trimmed.endsWith(':') && trimmed.length < 40) {
          return <p key={i} className="font-semibold text-slate-800 mt-2">{trimmed}</p>;
        }
        return <p key={i}>{trimmed}</p>;
      })}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────
const Skeleton = () => (
  <div className="animate-pulse space-y-3">
    {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-slate-200 rounded-2xl" />)}
  </div>
);

// ── Delete Modal ──────────────────────────────────────────
const DeleteModal = ({ resume, onConfirm, onCancel, loading }: {
  resume: Resume; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fadeInUp">
      <h3 className="text-base font-bold text-slate-800 mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>
        Delete Resume?
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        <span className="font-medium text-slate-700">{resume.name}</span> will be permanently removed.
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel}
          className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-medium transition-colors">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

// ── Preview Modal ─────────────────────────────────────────
const PreviewModal = ({ resume, onClose }: { resume: Resume; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/60">
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-fadeInUp">
      {/* Modal header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="text-base font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
            {resume.name}
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {resume.company} · {resume.jobTitle}
          </p>
        </div>
        <button onClick={onClose}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors">
          Close
        </button>
      </div>
      {/* Modal content — rendered beautifully */}
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <ResumeContent content={resume.generatedContent} />
      </div>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────
const ResumeList = () => {
  const { data: resumes, isLoading, isError } = useResumes();
  const deleteMutation = useDeleteResume();

  const [search, setSearch]             = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Resume | null>(null);
  const [previewTarget, setPreviewTarget] = useState<Resume | null>(null);

  const filtered = (resumes ?? []).filter(r =>
    r.company.toLowerCase().includes(search.toLowerCase()) ||
    r.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-5 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
            Resumes
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {resumes ? `${resumes.length} saved` : ''}
          </p>
        </div>
        <Link to="/resumes/generate"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-violet-600/20 self-start sm:self-auto">
          <Wand2 className="w-4 h-4" /> Generate Resume
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search by company, job title or name…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors" />
      </div>

      {/* Content */}
      {isLoading ? <Skeleton /> : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-5 py-4 rounded-xl">
          Failed to load resumes. Please refresh.
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-violet-400" />
          </div>
          <p className="text-slate-700 font-semibold mb-1">
            {search ? 'No matching resumes' : 'No resumes yet'}
          </p>
          <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
            {search
              ? 'Try a different search term.'
              : 'Generate an AI-tailored resume for any of your job applications.'}
          </p>
          {!search && (
            <Link to="/resumes/generate"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <Wand2 className="w-4 h-4" /> Generate Resume
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(r => (
            <div key={r.id}
              className="group bg-white border border-slate-200 hover:border-violet-200 hover:shadow-md rounded-2xl p-5 shadow-sm transition-all duration-200">
              <div className="flex items-start gap-4">

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-violet-50 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-violet-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{r.name}</p>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Building2 className="w-3 h-3" /> {r.company}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Briefcase className="w-3 h-3" /> {r.jobTitle}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" /> {formatDate(r.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setPreviewTarget(r)}
                        className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                        title="Preview">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(r)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Preview snippet — rendered text */}
                  <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 max-h-24 overflow-hidden relative">
                    <ResumeContent content={r.generatedContent.slice(0, 300)} />
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent rounded-b-xl" />
                  </div>

                  <button onClick={() => setPreviewTarget(r)}
                    className="mt-2 text-xs text-violet-600 hover:text-violet-500 font-medium transition-colors">
                    Read full resume →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Showing {filtered.length} of {resumes?.length ?? 0}
        </p>
      )}

      {deleteTarget && (
        <DeleteModal resume={deleteTarget}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id, { onSuccess: () => setDeleteTarget(null) })}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteMutation.isPending} />
      )}

      {previewTarget && (
        <PreviewModal resume={previewTarget} onClose={() => setPreviewTarget(null)} />
      )}
    </div>
  );
};

export default ResumeList;