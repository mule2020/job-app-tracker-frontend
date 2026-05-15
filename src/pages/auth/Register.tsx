import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { toast } from 'sonner';

const Register = () => {
  const { register } = useAuth();
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [err, setErr] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr('');
    if (form.password !== form.confirmPassword) return setErr('Passwords do not match.');
    if (form.password.length < 8) return setErr('Password must be at least 8 characters.');
    register.mutate(form,{
      onSuccess: () => {
        toast.success("Account created successfully! Please check your email to verify your account.");
      },
      onError: () => {
        toast.error("Failed to create account. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4 py-10">
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
            <span className="font-extrabold text-xl text-white" style={{ fontFamily: 'Syne, sans-serif' }}>JobTrackr</span>
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Free forever. No credit card needed.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8">
          {(err || register.isError) && (
            <div className="mb-5 bg-red-600/10 border border-red-600/30 text-red-400 text-sm px-4 py-3 rounded-xl">
              {err || 'Registration failed. Please try again.'}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            {[
              { label: 'Full Name',      key: 'fullName',        type: 'text',     placeholder: 'John Doe' },
              { label: 'Email address',  key: 'email',           type: 'email',    placeholder: 'you@example.com' },
              { label: 'Confirm Password', key: 'confirmPassword', type: 'password', placeholder: '••••••••' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{f.label}</label>
                <input type={f.type} required value={(form as any)[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  placeholder={f.placeholder}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
              </div>
            ))}
            {/* Password with toggle */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Min. 8 characters"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 pr-11 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={register.isPending}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
              {register.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account…</> : 'Create Account'}
            </button>
          </form>
        </div>
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;