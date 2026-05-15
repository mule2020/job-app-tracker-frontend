import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import {
  ArrowLeft, Wand2, Save, Loader2, RefreshCw,
  FileText, Building2, Briefcase, CheckCircle2, AlertCircle
} from 'lucide-react';
import { useApplications } from '../../hooks/useApplications';
import { useGenerateResume, useSaveResume } from '../../hooks/useResumes';

// ── Rendered resume viewer ────────────────────────────────
const ResumeContent = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  return (
    <div className="space-y-1 text-sm text-slate-700 leading-relaxed">
      {lines.map((line, i) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={i} className="h-3" />;

        if (trimmed === trimmed.toUpperCase() && trimmed.length > 2 && !/\d/.test(trimmed)) {
          return (
            <h3 key={i}
              className="font-extrabold text-slate-900 text-xs uppercase tracking-widest mt-5 mb-2 pb-1.5 border-b-2 border-violet-200 text-violet-800">
              {trimmed}
            </h3>
          );
        }
        if (trimmed.startsWith('•') || trimmed.startsWith('-') || trimmed.startsWith('*')) {
          return (
            <div key={i} className="flex gap-2.5 ml-3">
              <span className="text-violet-400 mt-1 shrink-0 text-xs">▸</span>
              <span className="text-slate-600">{trimmed.replace(/^[•\-\*]\s*/, '')}</span>
            </div>
          );
        }
        if (trimmed.endsWith(':') && trimmed.length < 50) {
          return <p key={i} className="font-bold text-slate-800 mt-3 text-xs uppercase tracking-wide">{trimmed}</p>;
        }
        // Name line — first non-empty line that's short and has no special chars
        if (i < 3 && trimmed.length < 40 && /^[A-Za-z\s]+$/.test(trimmed)) {
          return (
            <p key={i} className="text-xl font-extrabold text-slate-900 mb-1"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              {trimmed}
            </p>
          );
        }
        return <p key={i} className="text-slate-600">{trimmed}</p>;
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
  const navigate         = useNavigate();
  const [searchParams]   = useSearchParams();
  const preselectedId    = searchParams.get('applicationId');

  const { data: appsData, isLoading: appsLoading } = useApplications(0, 100);
  const apps = appsData?.content ?? [];

  const generateMutation = useGenerateResume();
  const saveMutation     = useSaveResume();

  const [selectedAppId, setSelectedAppId] = useState('');
  const [content, setContent]             = useState('');
  const [editMode, setEditMode]           = useState(false);
  const [step, setStep]                   = useState<1 | 2 | 3>(1);

  useEffect(() => {
    if (preselectedId) { setSelectedAppId(preselectedId); }
  }, [preselectedId]);

  const selectedApp = apps.find(a => a.id === selectedAppId);

  const handleGenerate = () => {
    if (!selectedAppId) return;
    generateMutation.mutate(
      { applicationId: selectedAppId },
      {
        onSuccess: (res) => {
          setContent(res.generatedContent);
          setStep(2);
          setEditMode(false);
        },
      }
    );
  };

  const handleSave = () => {
    saveMutation.mutate(
      { applicationId: selectedAppId, generatedContent: content },
      { onSuccess: () => { setStep(3); setTimeout(() => navigate('/resumes'), 1800); } }
    );
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5 animate-fadeIn">

      {/* Back */}
      <Link to="/resumes"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Resumes
      </Link>

      {/* Step bar */}
      <div className="flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-5 py-4 shadow-sm">
        <Step n={1} label="Select Job"   active={step === 1} done={step > 1} />
        <Divider />
        <Step n={2} label="Review & Edit" active={step === 2} done={step > 2} />
        <Divider />
        <Step n={3} label="Saved!"        active={step === 3} done={false} />
      </div>

      {/* ── Step 1 — Select application ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
              Generate AI Resume
            </h1>
            <p className="text-xs text-slate-400">
              Tailored to the job using your profile + job description
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
                onChange={e => { setSelectedAppId(e.target.value); setContent(''); setStep(1); }}
                className="w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors">
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
            <div className="flex items-center gap-3 bg-violet-50 border border-violet-100 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
                <span className="text-xs font-bold text-white">
                  {selectedApp.company.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-violet-900 truncate">{selectedApp.jobTitle}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="inline-flex items-center gap-1 text-xs text-violet-500">
                    <Building2 className="w-3 h-3" /> {selectedApp.company}
                  </span>
                  {selectedApp.location && (
                    <span className="text-xs text-violet-400">{selectedApp.location}</span>
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

          {/* Generate button */}
          <div className="flex items-center gap-3 pt-1">
            <button onClick={handleGenerate}
              disabled={!selectedAppId || generateMutation.isPending}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-violet-600/20">
              {generateMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Generating…</>
                : content
                  ? <><RefreshCw className="w-4 h-4" />Regenerate</>
                  : <><Wand2 className="w-4 h-4" />Generate Resume</>}
            </button>
            {generateMutation.isPending && (
              <p className="text-xs text-slate-400 animate-pulse">
                AI is crafting your resume…
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

      {/* ── Step 2 — Review ── */}
      {content && step === 2 && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-fadeInUp">

          {/* Toolbar */}
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-violet-500" />
              <h2 className="text-sm font-semibold text-slate-700" style={{ fontFamily: 'Syne, sans-serif' }}>
                Generated Resume
              </h2>
              {selectedApp && (
                <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                  {selectedApp.company} · {selectedApp.jobTitle}
                </span>
              )}
            </div>
            <button
              onClick={() => setEditMode(!editMode)}
              className={`text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors
                ${editMode
                  ? 'bg-violet-600 text-white border-violet-600'
                  : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              {editMode ? 'Preview' : 'Edit'}
            </button>
          </div>

          {/* Content area */}
          <div className="p-6">
            {editMode ? (
              /* Raw edit mode */
              <textarea value={content} onChange={e => setContent(e.target.value)} rows={28}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-700 font-mono leading-relaxed focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none" />
            ) : (
              /* Beautiful preview */
              <div className="bg-slate-50 border border-slate-100 rounded-xl px-6 py-6 min-h-[400px]">
                <ResumeContent content={content} />
              </div>
            )}
          </div>

          {/* Save bar */}
          <div className="px-6 pb-6 flex items-center gap-3">
            <button onClick={handleSave} disabled={saveMutation.isPending || !content.trim()}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-violet-600/20">
              {saveMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                : <><Save className="w-4 h-4" />Save Resume</>}
            </button>
            <Link to="/resumes"
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