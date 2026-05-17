import { useState, useEffect } from 'react';
import {
  User, Briefcase, FileText, Phone, MapPin, Globe, Plus, X,
  Save, Loader2, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronUp,
  Shield
} from 'lucide-react';
import { useProfile, useUpdateProfile } from '../../hooks/useProfile';
import { useAuthContext } from '../../context/AuthContext';
import type { ProfileRequest } from '../../types/profile.types';
import { toast } from 'sonner';
import { changePassword } from '../../api/auth.api';
import { useMutation } from '@tanstack/react-query';

//  Completion checker
const getCompletion = (form: ProfileRequest) => {
  const fields = [
    form.fullName, form.title, form.summary,
    form.skills?.length, form.baseResumeText,
  ];
  const filled = fields.filter(Boolean).length;
  return Math.round((filled / fields.length) * 100);
};

const inputCls = 'w-full bg-white border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors';

// ── Section wrapper ───────────────────────────────────────
const Section = ({
  title, icon: Icon, iconBg, iconColor, children, defaultOpen = true
}: {
  title: string; icon: React.ElementType;
  iconBg: string; iconColor: string;
  children: React.ReactNode; defaultOpen?: boolean;
}) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-4 border-b border-slate-100 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
            <Icon className={`w-4 h-4 ${iconColor}`} />
          </div>
          <span className="text-sm font-semibold text-slate-700"
            style={{ fontFamily: 'Syne, sans-serif' }}>{title}</span>
        </div>
        {open
          ? <ChevronUp className="w-4 h-4 text-slate-400" />
          : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>
      {open && <div className="px-6 py-5 space-y-4">{children}</div>}
    </div>
  );
};

// ── Field wrapper ─────────────────────────────────────────
const Field = ({ label, hint, required, children }: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) => (
  <div>
    <label className="block text-sm font-medium text-slate-700 mb-1.5">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

// ── Skeleton ──────────────────────────────────────────────
const Skeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-24 bg-slate-200 rounded-2xl" />
    <div className="h-48 bg-slate-200 rounded-2xl" />
    <div className="h-40 bg-slate-200 rounded-2xl" />
  </div>
);

// ── Main ──────────────────────────────────────────────────
const Profile = () => {
  const { user } = useAuthContext();
  const { data: profile, isLoading, isError } = useProfile();
  const updateMutation = useUpdateProfile();

  const [saved, setSaved] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState<ProfileRequest>({
    fullName: '', title: '', summary: '', skills: [],
    baseResumeText: '', phone: '', location: '',
    linkedinUrl: '', githubUrl: '', portfolioUrl: '',
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [pwErr, setPwErr] = useState('');

  // Populate form when profile loads
  useEffect(() => {
    if (profile) {
      setForm({
        fullName: profile.fullName ?? '',
        title: profile.title ?? '',
        summary: profile.summary ?? '',
        skills: profile.skills ?? [],
        baseResumeText: profile.baseResumeText ?? '',
        phone: profile.phone ?? '',
        location: profile.location ?? '',
        linkedinUrl: profile.linkedinUrl ?? '',
        githubUrl: profile.githubUrl ?? '',
        portfolioUrl: profile.portfolioUrl ?? '',
      });
    }
  }, [profile]);

  const set = (field: keyof ProfileRequest, value: any) =>
    setForm(prev => ({ ...prev, [field]: value }));

  // Skills management
  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    const existing = form.skills ?? [];
    if (existing.includes(trimmed)) return;
    set('skills', [...existing, trimmed]);
    setSkillInput('');
  };

  const removeSkill = (skill: string) =>
    set('skills', (form.skills ?? []).filter(s => s !== skill));

  const handleSkillKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(form, {
      onSuccess: () => {
        toast.success("Profile updated successfully!");
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      },
      onError: () => {
        toast.error("Failed to update profile. Please try again.");
      }
    });
  };

  const completion = getCompletion(form);

  const changePwMutation = useMutation({
    mutationFn: () => changePassword(pwForm),
    onSuccess: () => {
      toast.success('Password changed! Please log in again on other devices.');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPwErr('');
    },
    onError: (error: any) => {
      setPwErr(error?.response?.data?.message ?? 'Failed to change password.');
    },
  });

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    setPwErr('');
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      return setPwErr('New passwords do not match.');
    }
    if (pwForm.newPassword.length < 8) {
      return setPwErr('New password must be at least 8 characters.');
    }
    changePwMutation.mutate();
  };

  if (isLoading) return (
    <div className="max-w-2xl mx-auto animate-fadeIn">
      <Skeleton />
    </div>
  );

  if (isError) return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-5 py-4 rounded-xl">
        Failed to load profile. Please refresh.
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fadeIn">

      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-extrabold text-slate-800"
          style={{ fontFamily: 'Syne, sans-serif' }}>Profile</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Your profile powers AI resume and cover letter generation
        </p>
      </div>

      {/* ── Completion banner ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">Profile Completeness</span>
            {completion === 100 && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                <CheckCircle2 className="w-3 h-3" /> Complete
              </span>
            )}
          </div>
          <span className={`text-sm font-extrabold ${completion === 100 ? 'text-emerald-600' :
            completion >= 60 ? 'text-blue-600' :
              'text-amber-600'
            }`} style={{ fontFamily: 'Syne, sans-serif' }}>
            {completion}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${completion === 100 ? 'bg-emerald-500' :
              completion >= 60 ? 'bg-blue-500' :
                'bg-amber-500'
              }`}
            style={{ width: `${completion}%` }}
          />
        </div>

        {/* Warning if incomplete */}
        {completion < 100 && (
          <div className="mt-3 flex items-start gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
            <span>
              {completion < 40
                ? 'Your profile is incomplete. Fill in your details so the AI can generate tailored resumes and cover letters.'
                : 'Almost there! Add your base resume text and skills to unlock the best AI results.'}
            </span>
          </div>
        )}
      </div>

      {/* ── Avatar card ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-600/20 flex items-center justify-center shrink-0">
          <span className="text-2xl font-extrabold text-blue-600"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            {form.fullName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
          </span>
        </div>
        <div>
          <p className="text-base font-bold text-slate-800">
            {form.fullName || 'Your Name'}
          </p>
          <p className="text-sm text-slate-500">
            {form.title || 'Your Title'}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
        </div>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Saved toast */}
        {saved && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-xl animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 shrink-0" /> Profile saved successfully.
          </div>
        )}

        {/* ── Basic Info ── */}
        <Section title="Basic Information" icon={User} iconBg="bg-blue-50" iconColor="text-blue-600">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Full Name" required>
              <input type="text" value={form.fullName ?? ''} placeholder="John Doe"
                onChange={e => set('fullName', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Professional Title" required>
              <input type="text" value={form.title ?? ''} placeholder="e.g. Senior Java Developer"
                onChange={e => set('title', e.target.value)} className={inputCls} />
            </Field>
            <Field label="Phone">
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="tel" value={form.phone ?? ''} placeholder="+1 (416) 555-0000"
                  onChange={e => set('phone', e.target.value)}
                  className={`${inputCls} pl-9`} />
              </div>
            </Field>
            <Field label="Location">
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="text" value={form.location ?? ''} placeholder="Toronto, ON"
                  onChange={e => set('location', e.target.value)}
                  className={`${inputCls} pl-9`} />
              </div>
            </Field>
          </div>
          <Field label="Professional Summary"
            hint="2–3 sentences about your experience and what you bring to a role.">
            <textarea value={form.summary ?? ''} rows={3}
              placeholder="Experienced Full Stack Java Developer with 5+ years building scalable backend systems…"
              onChange={e => set('summary', e.target.value)}
              className={`${inputCls} resize-none`} />
          </Field>
        </Section>

        {/* ── Skills ── */}
        <Section title="Skills" icon={Briefcase} iconBg="bg-violet-50" iconColor="text-violet-600">
          <Field label="Add Skills"
            hint="Press Enter or click Add to add each skill. These are used in AI generation.">
            <div className="flex gap-2">
              <input type="text" value={skillInput}
                onChange={e => setSkillInput(e.target.value)}
                onKeyDown={handleSkillKeyDown}
                placeholder="e.g. Java, Spring Boot, React…"
                className={inputCls} />
              <button type="button" onClick={addSkill}
                className="inline-flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shrink-0">
                <Plus className="w-4 h-4" /> Add
              </button>
            </div>
          </Field>

          {/* Skills chips */}
          {(form.skills?.length ?? 0) > 0 ? (
            <div className="flex flex-wrap gap-2">
              {form.skills!.map(skill => (
                <span key={skill}
                  className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-medium px-3 py-1.5 rounded-full">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)}
                    className="text-violet-400 hover:text-violet-700 transition-colors ml-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 italic">No skills added yet.</p>
          )}
        </Section>

        {/* ── Base Resume ── */}
        <Section title="Base Resume" icon={FileText} iconBg="bg-emerald-50" iconColor="text-emerald-600">
          <Field
            label="Base Resume Text"
            required
            hint="Paste your full resume text here. The AI uses this as the foundation for every generated resume.">
            <textarea value={form.baseResumeText ?? ''} rows={10}
              placeholder={`Paste your full resume here...

EXPERIENCE
Senior Java Developer — Acme Corp (2021–Present)
- Built REST APIs using Spring Boot serving 1M+ requests/day
- Led migration from monolith to microservices

EDUCATION
B.Sc. Computer Science — University of Toronto (2019)

SKILLS
Java, Spring Boot, React, PostgreSQL, AWS, Docker`}
              onChange={e => set('baseResumeText', e.target.value)}
              className={`${inputCls} resize-none font-mono text-xs leading-relaxed`} />
          </Field>

          {/* Character count */}
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-400">
              {form.baseResumeText
                ? `${form.baseResumeText.length.toLocaleString()} characters`
                : 'No content yet'}
            </p>
            {(form.baseResumeText?.length ?? 0) < 200 && (
              <p className="text-xs text-amber-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Too short — add more detail
              </p>
            )}
          </div>
        </Section>

        {/* ── Links ── */}
        <Section title="Online Presence" icon={Globe} iconBg="bg-cyan-50" iconColor="text-cyan-600"
          defaultOpen={false}>
          <div className="space-y-3">
            <Field label="LinkedIn">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="url" value={form.linkedinUrl ?? ''}
                  placeholder="https://linkedin.com/in/yourname"
                  onChange={e => set('linkedinUrl', e.target.value)}
                  className={`${inputCls} pl-9`} />
              </div>
            </Field>
            <Field label="GitHub">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="url" value={form.githubUrl ?? ''}
                  placeholder="https://github.com/yourname"
                  onChange={e => set('githubUrl', e.target.value)}
                  className={`${inputCls} pl-9`} />
              </div>
            </Field>
            <Field label="Portfolio">
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input type="url" value={form.portfolioUrl ?? ''}
                  placeholder="https://yourportfolio.dev"
                  onChange={e => set('portfolioUrl', e.target.value)}
                  className={`${inputCls} pl-9`} />
              </div>
            </Field>
          </div>
        </Section>
        

        {/* ── Save button ── */}
        {updateMutation.isError && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
            Failed to save profile. Please try again.
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pb-6">
          <span className="text-xs text-slate-400">
            {completion < 100
              ? `${100 - completion}% left to complete`
              : 'Profile is complete ✓'}
          </span>
          <button type="submit" disabled={updateMutation.isPending}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-blue-600/20">
            {updateMutation.isPending
              ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
              : <><Save className="w-4 h-4" />Save Profile</>}
          </button>
        </div>
      </form>
      <Section title="Security" icon={Shield} iconBg="bg-slate-50" iconColor="text-slate-500"
          defaultOpen={false}>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {pwErr && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
                {pwErr}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Current Password
              </label>
              <input type="password" required value={pwForm.currentPassword}
                onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))}
                placeholder="••••••••"
                className={inputCls} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  New Password
                </label>
                <input type="password" required value={pwForm.newPassword}
                  onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))}
                  placeholder="Min. 8 characters"
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                  Confirm New Password
                </label>
                <input type="password" required value={pwForm.confirmPassword}
                  onChange={e => setPwForm(p => ({ ...p, confirmPassword: e.target.value }))}
                  placeholder="••••••••"
                  className={inputCls} />
              </div>
            </div>
            <div className="flex justify-end pt-1">
              <button type="submit" disabled={changePwMutation.isPending}
                className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                {changePwMutation.isPending
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Changing…</>
                  : <><Shield className="w-4 h-4" />Change Password</>}
              </button>
            </div>
          </form>
        </Section>
    </div>
  );
};

export default Profile;