import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Wand2, Save, Loader2, RefreshCw,
  FileText, Building2, CheckCircle2,
  AlertCircle, Download, FileDown
} from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';
import { useGenerateResume, useSaveResume } from '../../hooks/useResumes';
import { useToast } from '../../hooks/useToast';
import RichTextEditor from '../../components/editor/RichTextEditor';
import { exportToPDF, exportToWord } from '../../utils/exportUtils';
import { getErrorMessage } from '../../api/axiosClient';

// ── Convert plain text to basic HTML ─────────────────────
const textToHtml = (text: string): string => {
  const lines = text.split('\n');
  let html = '';
  lines.forEach(line => {
    const trimmed = line.trim();
    if (!trimmed) { html += '<p></p>'; return; }
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && !/\d/.test(trimmed)) {
      html += `<h2>${trimmed}</h2>`;
    } else if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
      html += `<ul><li>${trimmed.replace(/^[•\-\*]\s*/, '')}</li></ul>`;
    } else {
      html += `<p>${trimmed}</p>`;
    }
  });
  return html;
};

// ── Step indicator ────────────────────────────────────────
const Step = ({ n, label, active, done }: {
  n: number; label: string; active: boolean; done: boolean;
}) => (
  <div className="flex items-center gap-2">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
      ${done ? 'bg-violet-600 text-white' : active ? 'bg-violet-100 text-violet-700 border-2 border-violet-400' : 'bg-slate-100 text-slate-400'}`}>
      {done ? '✓' : n}
    </div>
    <span className={`text-xs font-medium hidden sm:block ${active ? 'text-violet-700' : done ? 'text-slate-600' : 'text-slate-400'}`}>
      {label}
    </span>
  </div>
);
const Divider = () => <div className="flex-1 h-px bg-slate-200 hidden sm:block" />;

// ── Main ──────────────────────────────────────────────────
const ResumeGenerate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('applicationId');
  const toast = useToast();
  const exportRef = useRef<HTMLDivElement>(null);

  const { data: appsData, isLoading: appsLoading } = useApplications(0, 100);
  const apps = appsData?.content ?? [];

  const generateMutation = useGenerateResume();
  const saveMutation = useSaveResume();

  const [selectedAppId, setSelectedAppId] = useState('');
  const [rawContent, setRawContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (preselectedId) setSelectedAppId(preselectedId);
  }, [preselectedId]);

  const selectedApp = apps.find(a => a.id === selectedAppId);

  const handleGenerate = () => {
    if (!selectedAppId) return;
    generateMutation.mutate(
      { applicationId: selectedAppId },
      {
        onSuccess: (res) => {
          setRawContent(res.generatedContent);
          setHtmlContent(textToHtml(res.generatedContent));
          setStep(2);
        },
        onError: () => toast.error('Generation failed. Make sure your profile is complete.'),
      }
    );
  };

  const handleSave = () => {
    saveMutation.mutate(
      { applicationId: selectedAppId, generatedContent: rawContent },
      {
        onSuccess: () => {
          toast.success('Resume saved successfully!');
          setStep(3);
          setTimeout(() => navigate('/resumes'), 1800);
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      }
    );
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportToPDF('resume-export-area', `${selectedApp?.company ?? 'resume'}-resume`);
      toast.success('PDF exported!');
    } catch {
      toast.error('PDF export failed.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportWord = async () => {
    setExporting(true);
    try {
      await exportToWord(
        htmlContent,
        `${selectedApp?.company ?? 'resume'}-resume`,
        `${selectedApp?.jobTitle ?? 'Resume'} — ${selectedApp?.company ?? ''}`
      );
      toast.success('Word document exported!');
    } catch {
      toast.error('Word export failed.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fadeIn">

      <Link to="/resumes"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Resumes
      </Link>

      {/* Step bar */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
        <Step n={1} label="Select Job" active={step === 1} done={step > 1} />
        <Divider />
        <Step n={2} label="Edit & Export" active={step === 2} done={step > 2} />
        <Divider />
        <Step n={3} label="Saved!" active={step === 3} done={false} />
      </div>

      {/* Step 1 */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
              Generate AI Resume
            </h1>
            <p className="text-xs text-slate-400">Tailored to the job using your profile + job description</p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select Job Application <span className="text-red-500">*</span>
            </label>
            {appsLoading ? (
              <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
            ) : (
              <select value={selectedAppId}
                onChange={e => { setSelectedAppId(e.target.value); setRawContent(''); setStep(1); }}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors">
                <option value="">— Choose a job application —</option>
                {apps.map(a => (
                  <option key={a.id} value={a.id}>{a.jobTitle} @ {a.company}</option>
                ))}
              </select>
            )}
          </div>

          {selectedApp && (
            <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">{selectedApp.company.charAt(0).toUpperCase()}</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-violet-900 truncate">{selectedApp.jobTitle}</p>
                <span className="inline-flex items-center gap-1 text-xs text-violet-500">
                  <Building2 className="w-3 h-3" /> {selectedApp.company}
                </span>
              </div>
              {!selectedApp.jobDescription && (
                <div className="shrink-0 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                  <AlertCircle className="w-3 h-3" /> No job description
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button onClick={handleGenerate}
              disabled={!selectedAppId || generateMutation.isPending}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-violet-600/20">
              {generateMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</>
                : rawContent
                  ? <><RefreshCw className="w-4 h-4" />Regenerate</>
                  : <><Wand2 className="w-4 h-4" />Generate Resume</>}
            </button>
            {generateMutation.isPending && (
              <p className="text-xs text-slate-400 animate-pulse">AI is crafting your resume…</p>
            )}
          </div>
        </div>
      </div>

      {/* Step 2 — Rich Text Editor */}
      {htmlContent && step === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeInUp">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-semibold text-slate-700" style={{ fontFamily: 'Syne, sans-serif' }}>
                Edit Resume
              </h2>
              {selectedApp && (
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                  {selectedApp.company} · {selectedApp.jobTitle}
                </span>
              )}
            </div>

            {/* Export buttons */}
            <div className="flex items-center gap-2">
              <button onClick={handleExportPDF} disabled={exporting}
                className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                <FileDown className="w-3.5 h-3.5" />
                PDF
              </button>
              <button onClick={handleExportWord} disabled={exporting}
                className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                <Download className="w-3.5 h-3.5" />
                Word
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="p-5">
            {/* Hidden export area for PDF */}
            <div id="resume-export-area" className="hidden">
              <div className="p-8 bg-white" dangerouslySetInnerHTML={{ __html: htmlContent }} />
            </div>

            <RichTextEditor
              content={htmlContent}
              onChange={(val) => {
                setHtmlContent(val);
                // also update raw for saving
                setRawContent(val.replace(/<[^>]+>/g, '\n').replace(/\n{3,}/g, '\n\n').trim());
              }}
              placeholder="Your resume content will appear here…"
              minHeight="500px"
            />
          </div>

          {/* Save bar */}
          <div className="px-5 pb-5 flex items-center gap-3 border-t border-slate-100 pt-4">
            <button onClick={handleSave} disabled={saveMutation.isPending}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-violet-600/20">
              {saveMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                : <><Save className="w-4 h-4" />Save Resume</>}
            </button>
            <Link to="/resumes"
              className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
              Discard
            </Link>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm p-8 text-center animate-fadeInUp">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>
            Resume saved!
          </h2>
          <p className="text-sm text-slate-400">Redirecting to your resumes…</p>
        </div>
      )}
    </div>
  );
};

export default ResumeGenerate;