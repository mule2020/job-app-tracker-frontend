import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Plus, Trash2, Eye, Search,
  Calendar, Building2, Briefcase, Wand2, Sparkles
} from 'lucide-react';
import { useCoverLetters, useDeleteCoverLetter } from '../../hooks/useCoverLetters';
import type { CoverLetter } from '../../types/coverLetter.types';

// ── Cover letter renderer ─────────────────────────────────
const CoverLetterContent = ({ content }: { content: string }) => {
  const paragraphs = content
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-sm text-slate-700 leading-relaxed">
      {paragraphs.map((para, i) => {
        // Salutation line (Dear ...,)
        if (para.startsWith('Dear') || para.startsWith('To ')) {
          return (
            <p key={i} className="font-semibold text-slate-800">{para}</p>
          );
        }
        // Closing lines (Sincerely, Best regards, etc.)
        if (
          para.startsWith('Sincerely') ||
          para.startsWith('Best') ||
          para.startsWith('Regards') ||
          para.startsWith('Yours')
        ) {
          return (
            <div key={i} className="pt-2">
              <p className="text-slate-700">{para}</p>
            </div>
          );
        }
        // Subject / Re: lines
        if (para.startsWith('Re:') || para.startsWith('Subject:') || para.startsWith('RE:')) {
          return (
            <p key={i} className="font-semibold text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-lg px-3 py-1.5 inline-block text-xs uppercase tracking-wider">
              {para}
            </p>
          );
        }
        // Single-line short paragraph = likely name/title at end
        if (para.split('\n').length === 1 && para.length < 40 && i > paragraphs.length - 3) {
          return <p key={i} className="font-bold text-slate-900">{para}</p>;
        }
        // Normal paragraph
        return <p key={i} className="text-slate-600 leading-7">{para}</p>;
      })}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────
const Skeleton = () => (
  <div className="animate-pulse space-y-3">
    {[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-slate-200 rounded-2xl" />)}
  </div>
);

// ── Delete Modal ──────────────────────────────────────────
const DeleteModal = ({ cl, onConfirm, onCancel, loading }: {
  cl: CoverLetter; onConfirm: () => void; onCancel: () => void; loading: boolean;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/50">
    <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl animate-fadeInUp">
      <h3 className="text-base font-bold text-slate-800 mb-2"
        style={{ fontFamily: 'Syne, sans-serif' }}>
        Delete Cover Letter?
      </h3>
      <p className="text-sm text-slate-500 mb-6">
        <span className="font-medium text-slate-700">{cl.name}</span> will be permanently removed.
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
const PreviewModal = ({ cl, onClose }: { cl: CoverLetter; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/60">
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-fadeInUp">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="text-base font-bold text-slate-800"
            style={{ fontFamily: 'Syne, sans-serif' }}>{cl.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{cl.company} · {cl.jobTitle}</p>
        </div>
        <button onClick={onClose}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 hover:border-slate-300 px-3 py-1.5 rounded-lg transition-colors">
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <CoverLetterContent content={cl.content} />
      </div>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────
const CoverLetterList = () => {
  const { data: coverLetters, isLoading, isError } = useCoverLetters();
  const deleteMutation = useDeleteCoverLetter();

  const [search, setSearch]               = useState('');
  const [deleteTarget, setDeleteTarget]   = useState<CoverLetter | null>(null);
  const [previewTarget, setPreviewTarget] = useState<CoverLetter | null>(null);

  const filtered = (coverLetters ?? []).filter(cl =>
    cl.company.toLowerCase().includes(search.toLowerCase()) ||
    cl.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
    cl.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-5 animate-fadeIn">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            Cover Letters
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {coverLetters ? `${coverLetters.length} saved` : ''}
          </p>
        </div>
        <Link to="/cover-letters/generate"
          className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-cyan-600/20 self-start sm:self-auto">
          <Wand2 className="w-4 h-4" /> Generate Cover Letter
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search by company, job title or name…"
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors" />
      </div>

      {/* Content */}
      {isLoading ? <Skeleton /> : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-5 py-4 rounded-xl">
          Failed to load cover letters. Please refresh.
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
          <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-cyan-400" />
          </div>
          <p className="text-slate-700 font-semibold mb-1">
            {search ? 'No matching cover letters' : 'No cover letters yet'}
          </p>
          <p className="text-slate-400 text-sm mb-6 max-w-xs mx-auto">
            {search
              ? 'Try a different search term.'
              : 'Generate an AI-written cover letter tailored to any job application.'}
          </p>
          {!search && (
            <Link to="/cover-letters/generate"
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <Wand2 className="w-4 h-4" /> Generate Cover Letter
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filtered.map(cl => (
            <div key={cl.id}
              className="group bg-white border border-slate-200 hover:border-cyan-200 hover:shadow-md rounded-2xl p-5 shadow-sm transition-all duration-200">
              <div className="flex items-start gap-4">

                {/* Icon */}
                <div className="w-11 h-11 rounded-xl bg-cyan-50 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-cyan-600" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800 truncate">{cl.name}</p>
                        <span className="inline-flex items-center gap-1 text-xs text-cyan-600 bg-cyan-50 border border-cyan-100 px-2 py-0.5 rounded-full shrink-0">
                          <Sparkles className="w-2.5 h-2.5" /> AI
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Building2 className="w-3 h-3" /> {cl.company}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500">
                          <Briefcase className="w-3 h-3" /> {cl.jobTitle}
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="w-3 h-3" /> {formatDate(cl.createdAt)}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button onClick={() => setPreviewTarget(cl)}
                        className="p-2 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                        title="Preview">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button onClick={() => setDeleteTarget(cl)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Preview snippet */}
                  <div className="mt-3 bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 max-h-20 overflow-hidden relative">
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-3">
                      {cl.content.replace(/\n+/g, ' ').slice(0, 200)}
                    </p>
                    <div className="absolute bottom-0 left-0 right-0 h-6 bg-gradient-to-t from-slate-50 to-transparent rounded-b-xl" />
                  </div>

                  <button onClick={() => setPreviewTarget(cl)}
                    className="mt-2 text-xs text-cyan-600 hover:text-cyan-500 font-medium transition-colors">
                    Read full letter →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Showing {filtered.length} of {coverLetters?.length ?? 0}
        </p>
      )}

      {deleteTarget && (
        <DeleteModal cl={deleteTarget}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => setDeleteTarget(null),
          })}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteMutation.isPending} />
      )}

      {previewTarget && (
        <PreviewModal cl={previewTarget} onClose={() => setPreviewTarget(null)} />
      )}
    </div>
  );
};

export default CoverLetterList;