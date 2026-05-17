import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText, Trash2, Eye, Search,
  Calendar, Building2, Briefcase, Wand2,
  Download, FileDown
} from 'lucide-react';
import { useResumes, useDeleteResume } from '../../hooks/useResumes';
import { useToast } from '../../hooks/useToast';
import { exportToPDF, exportToWord } from '../../utils/exportUtils';
import type { Resume } from '../../types/resume.types';

const Skeleton = () => (
  <div className="animate-pulse space-y-2">
    {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-slate-200 rounded-xl" />)}
  </div>
);

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
        <button onClick={onCancel} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 rounded-xl text-sm font-medium transition-colors">Cancel</button>
        <button onClick={onConfirm} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-500 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
          {loading ? 'Deleting…' : 'Delete'}
        </button>
      </div>
    </div>
  </div>
);

const PreviewModal = ({ resume, onClose }: { resume: Resume; onClose: () => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/60">
    <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl animate-fadeInUp">
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0">
        <div>
          <h3 className="text-base font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>{resume.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{resume.company} · {resume.jobTitle}</p>
        </div>
        <button onClick={onClose} className="text-sm font-medium text-slate-500 hover:text-slate-700 border border-slate-200 px-3 py-1.5 rounded-lg transition-colors">Close</button>
      </div>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        <div className="prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: resume.generatedContent }} />
      </div>
    </div>
  </div>
);

const ResumeList = () => {
  const { data: resumes, isLoading, isError } = useResumes();
  const deleteMutation = useDeleteResume();
  const toast = useToast();

  const [search, setSearch]               = useState('');
  const [deleteTarget, setDeleteTarget]   = useState<Resume | null>(null);
  const [previewTarget, setPreviewTarget] = useState<Resume | null>(null);
  const [exportingId, setExportingId]     = useState<string | null>(null);

  const filtered = (resumes ?? []).filter(r =>
    r.company.toLowerCase().includes(search.toLowerCase()) ||
    r.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
    r.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleExportPDF = async (resume: Resume) => {
    setExportingId(resume.id);
    // inject content into hidden div
    const div = document.getElementById('resume-pdf-hidden');
    if (div) div.innerHTML = `<div class="p-8 bg-white prose prose-sm">${resume.generatedContent}</div>`;
    try {
      await exportToPDF('resume-pdf-hidden', `${resume.company}-resume`);
      toast.success('PDF exported!');
    } catch {
      toast.error('PDF export failed.');
    } finally {
      setExportingId(null);
    }
  };

  const handleExportWord = async (resume: Resume) => {
    setExportingId(resume.id);
    try {
      await exportToWord(resume.generatedContent, `${resume.company}-resume`, resume.name);
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
      <div id="resume-pdf-hidden" className="fixed -left-[9999px] top-0 w-[794px] bg-white" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>Resumes</h1>
          <p className="text-sm text-slate-500 mt-0.5">{resumes ? `${resumes.length} saved` : ''}</p>
        </div>
        <Link to="/resumes/generate"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-violet-600/20 self-start sm:self-auto">
          <Wand2 className="w-4 h-4" /> Generate Resume
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input type="text" placeholder="Search resumes…" value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors" />
      </div>

      {/* Table */}
      {isLoading ? <Skeleton /> : isError ? (
        <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-5 py-4 rounded-xl">
          Failed to load resumes.
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center">
          <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-7 h-7 text-violet-400" />
          </div>
          <p className="text-slate-700 font-semibold mb-1">{search ? 'No matching resumes' : 'No resumes yet'}</p>
          <p className="text-slate-400 text-sm mb-6">
            {search ? 'Try a different search.' : 'Generate an AI-tailored resume for any job application.'}
          </p>
          {!search && (
            <Link to="/resumes/generate"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
              <Wand2 className="w-4 h-4" /> Generate Resume
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
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4 text-violet-600" />
                        </div>
                        <span className="font-medium text-slate-800 truncate max-w-[200px]">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" /> {r.company}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-600">
                        <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {r.jobTitle}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-slate-400 text-xs">
                        <Calendar className="w-3.5 h-3.5" /> {formatDate(r.createdAt)}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setPreviewTarget(r)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50 transition-colors" title="Preview">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleExportPDF(r)} disabled={exportingId === r.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Export PDF">
                          <FileDown className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleExportWord(r)} disabled={exportingId === r.id}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors" title="Export Word">
                          <Download className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteTarget(r)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors" title="Delete">
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
            {filtered.map(r => (
              <div key={r.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-violet-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate text-sm">{r.name}</p>
                      <p className="text-xs text-slate-500">{r.company} · {r.jobTitle}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-400">{formatDate(r.createdAt)}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setPreviewTarget(r)} className="text-slate-400 hover:text-violet-600 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleExportPDF(r)} className="text-slate-400 hover:text-red-600 transition-colors">
                      <FileDown className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleExportWord(r)} className="text-slate-400 hover:text-blue-600 transition-colors">
                      <Download className="w-4 h-4" />
                    </button>
                    <button onClick={() => setDeleteTarget(r)} className="text-slate-400 hover:text-red-600 transition-colors">
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
          Showing {filtered.length} of {resumes?.length ?? 0}
        </p>
      )}

      {deleteTarget && (
        <DeleteModal resume={deleteTarget}
          onConfirm={() => deleteMutation.mutate(deleteTarget.id, {
            onSuccess: () => { setDeleteTarget(null); toast.success('Resume deleted.'); },
            onError: () => toast.error('Failed to delete.'),
          })}
          onCancel={() => setDeleteTarget(null)}
          loading={deleteMutation.isPending} />
      )}

      {previewTarget && <PreviewModal resume={previewTarget} onClose={() => setPreviewTarget(null)} />}
    </div>
  );
};

export default ResumeList;