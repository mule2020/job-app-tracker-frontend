import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Briefcase, Mail } from 'lucide-react';
import { verifyEmail } from '../../api/auth.api';

type State = 'idle' | 'loading' | 'success' | 'error';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [state, setState] = useState<State>(token ? 'loading' : 'idle');

  useEffect(() => {
    if (!token) return;
    verifyEmail(token).then(() => setState('success')).catch(() => setState('error'));
  }, [token]);

  const states = {
    idle:    { icon: Mail,          iconBg: 'bg-blue-600/15',    iconColor: 'text-blue-400',    title: 'Check your email',     body: "We sent a verification link to your email. Click it to activate your account.", link: '/login',    linkLabel: 'Back to Sign In' },
    loading: { icon: Loader2,       iconBg: 'bg-slate-800',      iconColor: 'text-blue-400 animate-spin', title: 'Verifying…', body: 'Just a moment.', link: null, linkLabel: '' },
    success: { icon: CheckCircle2,  iconBg: 'bg-emerald-600/15', iconColor: 'text-emerald-400', title: 'Email verified!',       body: 'Your account is active. Sign in to start your job search.', link: '/login',    linkLabel: 'Go to Sign In' },
    error:   { icon: XCircle,       iconBg: 'bg-red-600/15',     iconColor: 'text-red-400',     title: 'Verification failed',  body: 'The link may be expired. Please register again.', link: '/register', linkLabel: 'Back to Register' },
  };

  const s = states[state];

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }} />
      </div>
      <div className="relative w-full max-w-md text-center animate-fadeInUp">
        <div className="inline-flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <span className="font-extrabold text-xl text-white" style={{ fontFamily: 'Syne, sans-serif' }}>JobTrackr</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-10">
          <div className={`w-16 h-16 rounded-full ${s.iconBg} flex items-center justify-center mx-auto mb-5`}>
            <s.icon className={`w-8 h-8 ${s.iconColor}`} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'Syne, sans-serif' }}>{s.title}</h1>
          <p className="text-slate-400 text-sm mb-6">{s.body}</p>
          {s.link && (
            <Link to={s.link} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold text-sm transition-colors">
              {s.linkLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;