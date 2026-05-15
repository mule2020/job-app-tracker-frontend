import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail, Trash2, Eye, Search,
  Calendar, Building2, Briefcase,
  Wand2, Download, FileDown, Sparkles
} from 'lucide-react';
import { useCoverLetters, useDeleteCoverLetter } from '../../hooks/useCoverLetters';
import { useToast } from '../../hooks/useToast';
import { exportToPDF, exportToWord } from '../../utils/exportUtils';
import type { CoverLetter } from '../../types/coverLetter.types';

// ── Skeleton ──────────────────────────────────────────────
const Skeleton = () => (
  <div className="animate-pulse space-y-2">
    {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-200 rounded-xl" />)}
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
          className="text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">
          Close
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: cl.content }} />
      </div>
    </div>
  </div>
);

// ── Main ──────────────────────────────────────────────────
const CoverLetterList = () => {
  const { data: coverLetters, isLoading, isError } = useCoverLetters();
  const deleteMutation = useDeleteCoverLetter();
  const toast = useToast();

  const [search, setSearch]               = useState('');
  const [deleteTarget, setDeleteTarget]   = useState<CoverLetter | null>(null);
  const [previewTarget, setPreviewTarget] = useState<CoverLetter | null>(null);
  const [exportingId, setExportingId]     = useState<string | null>(null);

  const filtered = (coverLetters ?? []).filter(cl =>
    cl.company.toLowerCase().includes(search.toLowerCase()) ||
    cl.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
    cl.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-CA', {
      year: 'numeric', month: 'short', day: 'numeric'
    });

  const handleExportPDF = async (cl: CoverLetter) => {
    setExportingId(cl.id);
    const div = document.getElementById('cover-letter-pdf-hidden');
    if (div) div.innerHTML = `<div class="p-10 bg-white prose prose-sm">${cl.content}</div>`;
    try {
      await exportToPDF('cover-letter-pdf-hidden', `${cl.company}-cover-letter`);
      toast.success('PDF exported!');
    } catch {
      toast.error('PDF export failed.');
    } finally {
      setExportingId(null);
    }
  };

  const handleExportWord = async (cl: CoverLetter) => {
    setExportingId(cl.id);
    try {
      await exportToWord(cl.content, `${cl.company}-cover-letter`, cl.name);
      toast.success('Word document exported!');
    } catch {
      toast.error('Word export failed.');
    } finally {
      setExportingId(null);
    }
  };

  return (
    <div className="space-y-5 animate-fadeIn">

      {/* Hidden PDF export area */}
      <div id="cover-letter-pdf-hidden"
        className="fixed -left-[9999px] top-0 w-[794px] bg-white" />

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
        <input type="text" placeholder="Search cover letters…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors" />
      </div>

      {/* Content */}
      {isLoading ? <Skeleton /> : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-5 py-4 rounded-xl">
          Failed to load cover letters.
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
          <div className="w-14 h-14 bg-cyan-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-7 h-7 text-cyan-400" />
          </div>
          <p className="text-slate-700 font-semibold mb-1">
            {search ? 'No matching cover letters' : 'No cover letters yet'}
          </p>
          <p className="text-slate-400 text-sm mb-6">
            {search
              ? 'Try a different search.'
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
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Job Title</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(cl => (
                  <tr key={cl.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-cyan-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-800 truncate max-w-[180px]">{cl.name}</p>
                          <span className="inline-flex items-center gap-1 text-xs text-cyan-600 bg-cyan-50 border border-cyan-100 px-1.5 py-0.5 rounded-full mt-0.5">
                            <Sparkles className="w-2.5 h-2.5" /> AI
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> {cl.company}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {cl.jobTitle}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(cl.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setPreviewTarget(cl)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition-colors"
                          title="Preview">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportPDF(cl)}
                          disabled={exportingId === cl.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Export PDF">
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleExportWord(cl)}
                          disabled={exportingId === cl.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Export Word">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(cl)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete">
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
            {filtered.map(cl => (
              <div key={cl.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-9 h-9 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-cyan-600" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 truncate text-sm">{cl.name}</p>
                    <p className="text-xs text-slate-500">{cl.company} · {cl.jobTitle}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{formatDate(cl.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPreviewTarget(cl)}
                      className="text-slate-400 hover:text-cyan-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleExportPDF(cl)}
                      className="text-slate-400 hover:text-red-600 transition-colors">
                      <FileDown className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleExportWord(cl)}
                      className="text-slate-400 hover:text-blue-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(cl)}
                      className="text-slate-400 hover:text-red-600 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {!isLoading && filtered.length > 0 && (
        <p className="text-xs text-slate-400 text-right">
          Showing {filtered.length} of {coverLetters?.length ?? 0}
        </p>
      )}

      {deleteTarget && (
        <DeleteModal cl={deleteTarget}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => {
              setDeleteTarget(null);
              toast.success('Cover letter deleted.');
            },
            onError: () => toast.error('Failed to delete.'),
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