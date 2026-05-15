import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Wand2, Save, Loader2, RefreshCw,
  Mail, Building2, CheckCircle2,
  AlertCircle, Download, FileDown, Eye, Pencil
} from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';
import { useGenerateCoverLetter, useSaveCoverLetter } from '../../hooks/useCoverLetters';
import { useToast } from '../../hooks/useToast';
import RichTextEditor from '../../components/editor/RichTextEditor';
import { exportToPDF, exportToWord } from '../../utils/exportUtils';

// ── Convert plain text to HTML ────────────────────────────
const textToHtml = (text: string): string => {
  const paragraphs = text.split(/\n\n+/).map(p => p.trim()).filter(Boolean);
  return paragraphs.map(para => {
    if (para.startsWith('Dear') || para.startsWith('To ')) {
      return `<p><strong>${para}</strong></p>`;
    }
    if (
      para.startsWith('Sincerely') ||
      para.startsWith('Best') ||
      para.startsWith('Regards') ||
      para.startsWith('Yours')
    ) {
      return `<p>${para}</p>`;
    }
    if (para.startsWith('Re:') || para.startsWith('Subject:')) {
      return `<p><em>${para}</em></p>`;
    }
    // Single lines with \n inside → preserve as separate lines
    if (para.includes('\n')) {
      return para.split('\n').map(line => `<p>${line.trim()}</p>`).join('');
    }
    return `<p>${para}</p>`;
  }).join('');
};

// ── Step indicator ────────────────────────────────────────
const Step = ({ n, label, active, done }: {
  n: number; label: string; active: boolean; done: boolean;
}) => (
  <div className="flex items-center gap-2">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all
      ${done ? 'bg-cyan-600 text-white' : active ? 'bg-cyan-100 text-cyan-700 border-2 border-cyan-400' : 'bg-slate-100 text-slate-400'}`}>
      {done ? '✓' : n}
    </div>
    <span className={`text-xs font-medium hidden sm:block
      ${active ? 'text-cyan-700' : done ? 'text-slate-600' : 'text-slate-400'}`}>
      {label}
    </span>
  </div>
);

const Divider = () => <div className="flex-1 h-px bg-slate-200 hidden sm:block" />;

// ── Main ──────────────────────────────────────────────────
const CoverLetterGenerate = () => {
  const navigate       = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId  = searchParams.get('applicationId');
  const toast          = useToast();

  const { data: appsData, isLoading: appsLoading } = useApplications(0, 100);
  const apps = appsData?.content ?? [];

  const generateMutation = useGenerateCoverLetter();
  const saveMutation     = useSaveCoverLetter();

  const [selectedAppId, setSelectedAppId] = useState('');
  const [rawContent, setRawContent]       = useState('');
  const [htmlContent, setHtmlContent]     = useState('');
  const [step, setStep]                   = useState<1 | 2 | 3>(1);
  const [exporting, setExporting]         = useState(false);

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
          setRawContent(res.content);
          setHtmlContent(textToHtml(res.content));
          setStep(2);
        },
        onError: () => toast.error('Generation failed. Make sure your profile is complete.'),
      }
    );
  };

  const handleSave = () => {
    saveMutation.mutate(
      { applicationId: selectedAppId, content: rawContent },
      {
        onSuccess: () => {
          toast.success('Cover letter saved successfully!');
          setStep(3);
          setTimeout(() => navigate('/cover-letters'), 1800);
        },
        onError: () => toast.error('Failed to save cover letter. Please try again.'),
      }
    );
  };

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      await exportToPDF(
        'cover-letter-export-area',
        `${selectedApp?.company ?? 'cover-letter'}-cover-letter`
      );
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
        `${selectedApp?.company ?? 'cover-letter'}-cover-letter`,
        `${selectedApp?.jobTitle ?? 'Cover Letter'} — ${selectedApp?.company ?? ''}`
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

      <Link to="/cover-letters"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Cover Letters
      </Link>

      {/* Step bar */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
        <Step n={1} label="Select Job"    active={step === 1} done={step > 1} />
        <Divider />
        <Step n={2} label="Edit & Export" active={step === 2} done={step > 2} />
        <Divider />
        <Step n={3} label="Saved!"        active={step === 3} done={false} />
      </div>

      {/* ── Step 1 ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-cyan-600" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              Generate AI Cover Letter
            </h1>
            <p className="text-xs text-slate-400">
              Personalised, human-toned, under 300 words
            </p>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* App selector */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select Job Application <span className="text-red-500">*</span>
            </label>
            {appsLoading ? (
              <div className="h-10 bg-slate-100 animate-pulse rounded-xl" />
            ) : (
              <select value={selectedAppId}
                onChange={e => {
                  setSelectedAppId(e.target.value);
                  setRawContent('');
                  setHtmlContent('');
                  setStep(1);
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors">
                <option value="">— Choose a job application —</option>
                {apps.map(a => (
                  <option key={a.id} value={a.id}>
                    {a.jobTitle} @ {a.company}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected app chip */}
          {selectedApp && (
            <div className="flex items-center gap-3 bg-cyan-50 border border-cyan-100 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-600 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">
                  {selectedApp.company.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-cyan-900 truncate">{selectedApp.jobTitle}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs text-cyan-600">
                    <Building2 className="w-3 h-3" /> {selectedApp.company}
                  </span>
                  {selectedApp.location && (
                    <span className="text-xs text-cyan-500">{selectedApp.location}</span>
                  )}
                </div>
              </div>
              {!selectedApp.jobDescription && (
                <div className="shrink-0 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                  <AlertCircle className="w-3 h-3" /> No job description
                </div>
              )}
            </div>
          )}

          {/* Info box */}
          {selectedApp?.jobDescription && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-start gap-2">
              <Mail className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                The AI will use your{' '}
                <span className="font-medium text-slate-600">profile</span>,{' '}
                <span className="font-medium text-slate-600">generated resume</span> (if available), and the{' '}
                <span className="font-medium text-slate-600">job description</span> to write a tailored cover letter.
              </p>
            </div>
          )}

          {/* Generate button */}
          <div className="flex items-center gap-3 pt-1">
            <button onClick={handleGenerate}
              disabled={!selectedAppId || generateMutation.isPending}
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-cyan-600/20">
              {generateMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Writing…</>
                : rawContent
                  ? <><RefreshCw className="w-4 h-4" />Regenerate</>
                  : <><Wand2 className="w-4 h-4" />Generate Cover Letter</>}
            </button>
            {generateMutation.isPending && (
              <p className="text-xs text-slate-400 animate-pulse">
                AI is writing your cover letter…
              </p>
            )}
          </div>

          {generateMutation.isError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              Generation failed. Make sure your profile is complete and try again.
            </div>
          )}
        </div>
      </div>

      {/* ── Step 2 — Rich Text Editor ── */}
      {htmlContent && step === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeInUp">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-500" />
              <h2 className="text-sm font-semibold text-slate-700"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                Edit Cover Letter
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
                className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                <FileDown className="w-3.5 h-3.5" /> PDF
              </button>
              <button onClick={handleExportWord} disabled={exporting}
                className="inline-flex items-center gap-1.5 border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-50 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                <Download className="w-3.5 h-3.5" /> Word
              </button>
            </div>
          </div>

          {/* Hidden PDF export area */}
          <div id="cover-letter-export-area" className="fixed -left-[9999px] top-0 w-[794px] bg-white">
            <div className="p-10 bg-white prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: htmlContent }} />
          </div>

          {/* Editor */}
          <div className="p-5">
            <RichTextEditor
              content={htmlContent}
              onChange={(val) => {
                setHtmlContent(val);
                setRawContent(val.replace(/<[^>]+>/g, '\n').replace(/\n{3,}/g, '\n\n').trim());
              }}
              placeholder="Your cover letter will appear here…"
              minHeight="450px"
            />
          </div>

          {/* Save bar */}
          <div className="px-5 pb-5 flex items-center gap-3 border-t border-slate-100 pt-4">
            <button onClick={handleSave}
              disabled={saveMutation.isPending || !rawContent.trim()}
              className="inline-flex items-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-cyan-600/20">
              {saveMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                : <><Save className="w-4 h-4" />Save Cover Letter</>}
            </button>
            <Link to="/cover-letters"
              className="px-4 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors">
              Discard
            </Link>
            {saveMutation.isError && (
              <p className="text-xs text-red-500 ml-2">Failed to save. Try again.</p>
            )}
          </div>
        </div>
      )}

      {/* ── Step 3 — Success ── */}
      {step === 3 && (
        <div className="bg-white border border-emerald-200 rounded-2xl shadow-sm p-8 text-center animate-fadeInUp">
          <div className="w-14 h-14 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-slate-800 mb-1"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            Cover letter saved!
          </h2>
          <p className="text-sm text-slate-400">Redirecting to your cover letters…</p>
        </div>
      )}
    </div>
  );
};

export default CoverLetterGenerate;