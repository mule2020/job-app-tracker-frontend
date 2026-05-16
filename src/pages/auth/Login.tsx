import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { login } from '../../api/auth.api';
import { useAuthContext } from '../../context/AuthContext';
import { toast } from 'sonner';

const Login = () => {
  const { setAuth }  = useAuthContext();
  const navigate     = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm]     = useState({ email: '', password: '' });

  const loginMutation = useMutation({
    mutationFn: () => login(form),
    onSuccess: (res) => {
      // setAuth now takes 2 args no refreshToken
      setAuth(
        res.accessToken!,
        { email: res.email!, isVerified: res.isVerified! }
      );
      toast.success('Logged in successfully!');
      navigate('/dashboard');
    },
    onError: () => {
      toast.error('Invalid email or password. Please try again.');
    },
  });

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
            style={{ fontFamily: 'Syne, sans-serif' }}>Welcome back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your account</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {loginMutation.isError && (
            <div className="mb-5 bg-red-600/10 border border-red-600/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              Invalid email or password. Please try again.
            </div>
          )}
          <form onSubmit={(e) => { e.preventDefault(); loginMutation.mutate(); }}
            className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email address
              </label>
              <input type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loginMutation.isPending}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {loginMutation.isPending
                ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in…</>
                : 'Sign In'}
            </button>
            <div className="text-right">
              <Link to="/forgot-password"
                className="text-xs text-slate-500 hover:text-blue-400 transition-colors">
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
        <p className="text-center text-sm text-slate-500 mt-6">
          Don't have an account?{' '}
          <Link to="/register"
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;