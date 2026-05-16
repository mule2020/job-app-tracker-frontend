import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { forgotPassword } from '../../api/auth.api';

const ForgotPassword = () => {
  const [email, setEmail]   = useState('');
  const [sent, setSent]     = useState(false);

  const mutation = useMutation({
    mutationFn: () => forgotPassword(email),
    onSuccess: () => setSent(true),
  });

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[400px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }} />
      </div>

      <div className="relative w-full max-w-md animate-fadeInUp">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl text-white"
              style={{ fontFamily: 'Syne, sans-serif' }}>JobTrackr</span>
          </div>
          <h1 className="text-2xl font-bold text-white"
            style={{ fontFamily: 'Syne, sans-serif' }}>Forgot password?</h1>
          <p className="text-slate-400 text-sm mt-1">
            Enter your email and we'll send a reset link
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {sent ? (
            /* Success state */
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-emerald-600/15 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <h2 className="text-base font-bold text-white mb-2"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                Check your inbox
              </h2>
              <p className="text-slate-400 text-sm leading-relaxed">
                If <span className="text-white font-medium">{email}</span> is registered,
                you'll receive a reset link shortly.
              </p>
            </div>
          ) : (
            /* Form state */
            <>
              {mutation.isError && (
                <div className="mb-5 bg-red-600/10 border border-red-600/30 text-red-400 text-sm px-4 py-3 rounded-xl">
                  Something went wrong. Please try again.
                </div>
              )}
              <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(); }}
                className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Email address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input type="email" required value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                  </div>
                </div>
                <button type="submit" disabled={mutation.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
                  {mutation.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
                    : 'Send Reset Link'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="text-center mt-6">
          <Link to="/login"
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;