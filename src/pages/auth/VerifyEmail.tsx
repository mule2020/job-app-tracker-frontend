import { useEffect, useState, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Briefcase, Mail } from 'lucide-react';
import { verifyEmail } from '../../api/auth.api';

type State = 'idle' | 'loading' | 'success' | 'error';

const VerifyEmail = () => {
  const [searchParams]          = useSearchParams();
  const token                   = searchParams.get('token');
  const [state, setState]       = useState<State>(token ? 'loading' : 'idle');
  const [errorMsg, setErrorMsg] = useState('');
  const calledRef               = useRef(false);

  useEffect(() => {
    if (!token) {
      setState('idle');
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    setState('loading');

    verifyEmail(token)
      .then(() => setState('success'))
      .catch((err) => {
        const msg = err?.response?.data?.message ?? '';
        if (msg.includes('Invalid') || msg.includes('expired')) {
          setErrorMsg(
            'This link has already been used or expired. If you already verified your email, just sign in.'
          );
        } else {
          setErrorMsg(msg || 'Verification failed. Please try again.');
        }
        setState('error');
      });
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative w-full max-w-md text-center animate-fadeInUp">

        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span
            className="font-extrabold text-xl text-white"
            style={{ fontFamily: 'Syne, sans-serif' }}>
            JobTrackr
          </span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10">

          {/* ── Idle — just registered, no token in URL ── */}
          {state === 'idle' && (
            <>
              <div className="w-16 h-16 rounded-full bg-blue-600/15 flex items-center justify-center mx-auto mb-5">
                <Mail className="w-8 h-8 text-blue-400" />
              </div>
              <h1
                className="text-2xl font-bold text-white mb-3"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                Check your email
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                We sent a verification link to your email address. Click the link
                to activate your account and start tracking your job applications.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors">
                Back to Sign In
              </Link>
            </>
          )}

          {/* ── Loading ── */}
          {state === 'loading' && (
            <>
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-5">
                <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
              </div>
              <h1
                className="text-xl font-bold text-white mb-2"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                Verifying your email…
              </h1>
              <p className="text-slate-400 text-sm">Just a moment.</p>
            </>
          )}

          {/* ── Success ── */}
          {state === 'success' && (
            <>
              <div className="w-16 h-16 rounded-full bg-emerald-600/15 flex items-center justify-center mx-auto mb-5">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h1
                className="text-2xl font-bold text-white mb-3"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                Email verified!
              </h1>
              <p className="text-slate-400 text-sm mb-6">
                Your account is now active. Sign in to start your job search.
              </p>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                Go to Sign In
              </Link>
            </>
          )}

          {/* ── Error ── */}
          {state === 'error' && (
            <>
              <div className="w-16 h-16 rounded-full bg-amber-600/15 flex items-center justify-center mx-auto mb-5">
                <XCircle className="w-8 h-8 text-amber-400" />
              </div>
              <h1
                className="text-2xl font-bold text-white mb-3"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                Already verified?
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                {errorMsg}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                  Go to Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center gap-2 border border-slate-700 text-slate-300 hover:text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
                  Register Again
                </Link>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;