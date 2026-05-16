import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, Briefcase } from 'lucide-react';
import { useCreateApplication } from '../../hooks/useApplications';
import type { ApplicationStatus } from '../../types/application.types';
import { cleanJobDescription, wordCount } from '../../utils/textUtils';
import { toast } from 'sonner';
import { getErrorMessage } from '../../api/axiosClient';


const STATUS_OPTIONS: { value: ApplicationStatus; label: string; color: string }[] = [
  { value: 'PENDING', label: 'Pending', color: 'text-amber-600' },
  { value: 'APPLIED', label: 'Applied', color: 'text-blue-600' },
  { value: 'INTERVIEWING', label: 'Interviewing', color: 'text-violet-600' },
  { value: 'OFFERED', label: 'Offered', color: 'text-cyan-600' },
  { value: 'ACCEPTED', label: 'Accepted', color: 'text-emerald-600' },
  { value: 'REJECTED', label: 'Rejected', color: 'text-red-600' },
  { value: 'WITHDRAWN', label: 'Withdrawn', color: 'text-slate-500' },
];

const inputCls = 'w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';

const Field = ({ label, required, hint, children }: {
  label: string; required?: boolean; hint?: string; children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

const ApplicationCreate = () => {
  const navigate = useNavigate();
  const create = useCreateApplication();

  const [form, setForm] = useState({
    company: '',
    jobTitle: '',
    jobDescription: '',
    status: 'PENDING' as ApplicationStatus,
    jobUrl: '',
    salaryRange: '',
    location: '',
    notes: '',
    appliedAt: '',
  });

  const set = (field: string, value: string) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
      const toastId = toast.loading("Creating job application...");
    create.mutate(
      {
        company: form.company,
        jobTitle: form.jobTitle,
        jobDescription: form.jobDescription || undefined,
        status: form.status,
        jobUrl: form.jobUrl || undefined,
        salaryRange: form.salaryRange || undefined,
        location: form.location || undefined,
        notes: form.notes || undefined,
        appliedAt: form.appliedAt || undefined,
      },
      {
      onSuccess: (app) => {
        toast.dismiss(toastId);
        toast.success("Application created successfully!");
        navigate(`/applications/${app.id}`);
      },
      onError: (err: any) => {
        toast.dismiss(toastId);
        toast.error(getErrorMessage(err));
      },
    }
    );
  };

  return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <Link to="/applications"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Applications
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
              New Application
            </h1>
            <p className="text-xs text-slate-400">Fill in the details of the job you're applying to</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

          {/* Company + Job Title */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Company" required>
              <input type="text" required value={form.company}
                onChange={e => set('company', e.target.value)}
                placeholder="e.g. Google" className={inputCls} />
            </Field>
            <Field label="Job Title" required>
              <input type="text" required value={form.jobTitle}
                onChange={e => set('jobTitle', e.target.value)}
                placeholder="e.g. Senior Java Developer" className={inputCls} />
            </Field>
          </div>

          {/* Location + Salary */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Location">
              <input type="text" value={form.location}
                onChange={e => set('location', e.target.value)}
                placeholder="e.g. Toronto, ON or Remote" className={inputCls} />
            </Field>
            <Field label="Salary Range">
              <input type="text" value={form.salaryRange}
                onChange={e => set('salaryRange', e.target.value)}
                placeholder="e.g. $90k – $110k" className={inputCls} />
            </Field>
          </div>

          {/* Status */}
          <Field label="Status" required>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STATUS_OPTIONS.map(s => (
                <button key={s.value} type="button"
                  onClick={() => set('status', s.value)}
                  className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all
                    ${form.status === s.value
                      ? `border-current bg-slate-50 ${s.color}`
                      : 'border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50'}`}>
                  {s.label}
                </button>
              ))}
            </div>
          </Field>

          {/* Job URL + Applied At */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Field label="Job Posting URL">
              <input type="url" value={form.jobUrl}
                onChange={e => set('jobUrl', e.target.value)}
                placeholder="https://careers.example.com/…" className={inputCls} />
            </Field>
            <Field label="Applied At" hint="Leave blank if not applied yet">
              <input type="datetime-local" value={form.appliedAt}
                onChange={e => set('appliedAt', e.target.value)}
                className={inputCls} />
            </Field>
          </div>

          {/* Job Description */}
          <Field
            label="Job Description"
            hint="Paste the job posting — helps AI generate better resumes and cover letters.">
            <div className="relative">
              <textarea
                value={form.jobDescription}
                onChange={e => set('jobDescription', cleanJobDescription(e.target.value))}
                onPaste={e => {
                  e.preventDefault();
                  const pasted = e.clipboardData.getData('text');
                  set('jobDescription', cleanJobDescription(pasted));
                }}
                rows={6}
                placeholder="Paste job description here…"
                className={`${inputCls} resize-none`}
              />
              {form.jobDescription && (
                <div className="absolute bottom-2 right-3 flex items-center gap-2">
                  <span className="text-xs text-slate-400">
                    {wordCount(form.jobDescription)} words
                  </span>
                  {wordCount(form.jobDescription) < 50 && (
                    <span className="text-xs text-amber-500">too short for best AI results</span>
                  )}
                </div>
              )}
            </div>
          </Field>

          {/* Notes */}
          <Field label="Notes">
            <textarea value={form.notes}
              onChange={e => set('notes', e.target.value)}
              rows={3} placeholder="Recruiter name, interview rounds, anything worth noting…"
              className={`${inputCls} resize-none`} />
          </Field>

          {create.isError && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
              Failed to save. Please try again.
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
            <Link to="/applications"
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium transition-colors">
              Cancel
            </Link>
            <button type="submit" disabled={create.isPending}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white rounded-xl text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm shadow-blue-600/20">
              {create.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                : 'Save Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationCreate;