import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Wand2, Save, Loader2, RefreshCw,
  Mail, Building2, Briefcase, CheckCircle2,
  AlertCircle, Sparkles, Eye, Pencil
} from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';
import { useGenerateCoverLetter, useSaveCoverLetter } from '../../hooks/useCoverLetters';
import { toast } from 'sonner';

// ── Cover letter renderer ─────────────────────────────────
const CoverLetterContent = ({ content }: { content: string }) => {
  const paragraphs = content
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean);

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      {paragraphs.map((para, i) => {
        if (para.startsWith('Dear') || para.startsWith('To ')) {
          return <p key={i} className="font-semibold text-slate-800 text-base">{para}</p>;
        }
        if (
          para.startsWith('Sincerely') ||
          para.startsWith('Best') ||
          para.startsWith('Regards') ||
          para.startsWith('Yours')
        ) {
          return (
            <div key={i} className="pt-3 border-t border-slate-100">
              <p className="text-slate-700 font-medium">{para}</p>
            </div>
          );
        }
        if (para.startsWith('Re:') || para.startsWith('Subject:')) {
          return (
            <p key={i}
              className="font-semibold text-cyan-700 bg-cyan-50 border border-cyan-100 rounded-lg px-3 py-1.5 text-xs uppercase tracking-wider inline-block">
              {para}
            </p>
          );
        }
        if (para.split('\n').length === 1 && para.length < 40 && i > paragraphs.length - 3) {
          return <p key={i} className="font-bold text-slate-900">{para}</p>;
        }
        return <p key={i} className="text-slate-600 leading-7">{para}</p>;
      })}
    </div>
  );
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

  const { data: appsData, isLoading: appsLoading } = useApplications(0, 100);
  const apps = appsData?.content ?? [];

  const generateMutation = useGenerateCoverLetter();
  const saveMutation     = useSaveCoverLetter();

  const [selectedAppId, setSelectedAppId] = useState('');
  const [content, setContent]             = useState('');
  const [editMode, setEditMode]           = useState(false);
  const [step, setStep]                   = useState<1 | 2 | 3>(1);

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
          setContent(res.content);
          setStep(2);
          setEditMode(false);
        },
      }
    );
  };

  const handleSave = () => {
    saveMutation.mutate(
      { applicationId: selectedAppId, content },
      {
        onSuccess: () => {
          toast.success("Cover letter saved successfully!");
          setStep(3);
          setTimeout(() => navigate('/cover-letters'), 1800);
        },
        onError: () => {
          toast.error("Failed to save cover letter. Please try again.");
        }
      }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">

      {/* Back */}
      <Link to="/cover-letters"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Cover Letters
      </Link>

      {/* Step bar */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
        <Step n={1} label="Select Job"    active={step === 1} done={step > 1} />
        <Divider />
        <Step n={2} label="Review & Edit" active={step === 2} done={step > 2} />
        <Divider />
        <Step n={3} label="Saved!"        active={step === 3} done={false} />
      </div>

      {/* ── Step 1 — Select app ── */}
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
          <span className="ml-auto inline-flex items-center gap-1 text-xs text-cyan-600 bg-cyan-50 border border-cyan-100 px-2.5 py-1 rounded-full">
            <Sparkles className="w-3 h-3" /> AI Powered
          </span>
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
                  setContent('');
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
                  <AlertCircle className="w-3 h-3" />
                  No job description
                </div>
              )}
            </div>
          )}

          {/* Info box */}
          {selectedApp?.jobDescription && (
            <div className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 flex items-start gap-2">
              <Briefcase className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                The AI will use your <span className="font-medium text-slate-600">profile</span>,{' '}
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
                : content
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

      {/* ── Step 2 — Review & Edit ── */}
      {content && step === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeInUp">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cyan-500" />
              <h2 className="text-sm font-semibold text-slate-700"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                Generated Cover Letter
              </h2>
              {selectedApp && (
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                  {selectedApp.company} · {selectedApp.jobTitle}
                </span>
              )}
            </div>
            <button onClick={() => setEditMode(!editMode)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                ${editMode
                  ? 'bg-cyan-600 text-white border-cyan-600'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {editMode
                ? <><Eye className="w-3.5 h-3.5" />Preview</>
                : <><Pencil className="w-3.5 h-3.5" />Edit</>}
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {editMode ? (
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={20}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-mono leading-relaxed focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none" />
            ) : (
              <div className="bg-white border border-slate-100 rounded-xl px-8 py-7 shadow-sm min-h-[380px]">
                {/* Letter header decoration */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-lg bg-cyan-50 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-cyan-500" />
                  </div>
                  <span className="text-xs text-slate-300 font-medium uppercase tracking-widest">
                    Cover Letter
                  </span>
                </div>
                <CoverLetterContent content={content} />
              </div>
            )}
          </div>

          {/* Save bar */}
          <div className="px-6 pb-6 flex items-center gap-3">
            <button onClick={handleSave}
              disabled={saveMutation.isPending || !content.trim()}
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