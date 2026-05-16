import { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Briefcase, Loader2, Eye, EyeOff, CheckCircle2, XCircle } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { resetPassword } from '../../api/auth.api';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token          = searchParams.get('token') ?? '';
  const navigate       = useNavigate();

  const [showPw, setShowPw] = useState(false);
  const [form, setForm]     = useState({ newPassword: '', confirmPassword: '' });
  const [err, setErr]       = useState('');

  const mutation = useMutation({
    mutationFn: () => resetPassword({ token, ...form }),
    onSuccess: () => setTimeout(() => navigate('/login'), 2000),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (form.newPassword !== form.confirmPassword) {
      return setErr('Passwords do not match.');
    }
    if (form.newPassword.length < 8) {
      return setErr('Password must be at least 8 characters.');
    }
    mutation.mutate();
  };

  if (!token) return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center max-w-sm w-full">
        <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-white mb-2"
          style={{ fontFamily: 'Syne, sans-serif' }}>Invalid link</h2>
        <p className="text-slate-400 text-sm mb-4">This reset link is invalid or has expired.</p>
        <Link to="/forgot-password"
          className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          Request a new one
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-md animate-fadeInUp">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-white"
              style={{ fontFamily: 'Syne, sans-serif' }}>JobTrackr</span>
          </div>
          <h1 className="text-2xl font-bold text-white"
            style={{ fontFamily: 'Syne, sans-serif' }}>Set new password</h1>
          <p className="text-slate-400 text-sm mt-1">Choose a strong password</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {mutation.isSuccess ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-600/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-base font-bold text-white mb-2"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                Password reset!
              </h2>
              <p className="text-slate-400 text-sm">Redirecting to sign in…</p>
            </div>
          ) : (
            <>
              {(err || mutation.isError) && (
                <div className="mb-5 bg-red-600/10 border border-red-600/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                  {err || 'Reset failed. The link may have expired.'}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <div className="relative">
                    <input type={showPw ? 'text' : 'password'} required
                      value={form.newPassword}
                      onChange={e => setForm({ ...form, newPassword: e.target.value })}
                      placeholder="Min. 8 characters"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Confirm Password
                  </label>
                  <input type="password" required value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                </div>
                <button type="submit" disabled={mutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {mutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Resetting…</>
                    : 'Reset Password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;