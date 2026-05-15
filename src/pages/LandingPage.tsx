import { Link } from 'react-router-dom';
import { Briefcase, FileText, Mail, BarChart3, TrendingUp, Shield, ArrowRight, Zap } from 'lucide-react';

const features = [
  { title: 'Application Tracking', desc: 'Log every job with company, title, status and notes. Never lose track again.', icon: Briefcase, bg: 'bg-blue-600/15', color: 'text-blue-400' },
  { title: 'AI Resume Generation', desc: 'Generate a tailored resume for each application in seconds.', icon: FileText, bg: 'bg-violet-600/15', color: 'text-violet-400' },
  { title: 'AI Cover Letters', desc: 'Personalised cover letters that speak directly to the role and company.', icon: Mail, bg: 'bg-cyan-600/15', color: 'text-cyan-400' },
  { title: 'Dashboard Analytics', desc: 'Visualise your job search with status breakdowns and activity feed.', icon: BarChart3, bg: 'bg-emerald-600/15', color: 'text-emerald-400' },
  { title: 'Status Management', desc: 'Move through Pending → Applied → Interview → Offer with colour badges.', icon: TrendingUp, bg: 'bg-amber-600/15', color: 'text-amber-400' },
  { title: 'Secure & Private', desc: 'JWT auth and protected routes keep your job search data safe.', icon: Shield, bg: 'bg-rose-600/15', color: 'text-rose-400' },
];

const steps = [
  { title: 'Create your profile', desc: 'Add your skills, title, and base resume so the AI knows your background.' },
  { title: 'Log your applications', desc: 'Add each job you apply to — company, role, status, notes.' },
  { title: 'Generate & send', desc: 'AI crafts a tailored resume and cover letter. Review, save, and apply.' },
];

const LandingPage = () => (
  <div className="min-h-screen bg-slate-950 text-white overflow-hidden">

    {/* NAV */}
    <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
            <Briefcase className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight" style={{ fontFamily: 'Syne, sans-serif' }}>JobTrackr</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors px-4 py-2">Sign In</Link>
          <Link to="/register" className="text-sm bg-blue-600 hover:bg-blue-500 transition-colors px-4 py-2 rounded-lg font-medium">Get Started Free</Link>
        </div>
      </div>
    </nav>

    {/* HERO */}
    <section className="relative pt-32 pb-20 px-6">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #2563eb 0%, transparent 70%)' }} />
      </div>
      <div className="relative max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-600/30 rounded-full px-4 py-1.5 mb-8 animate-fadeIn">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-xs font-medium text-blue-300 uppercase tracking-widest">AI-Powered Job Search</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 animate-fadeInUp" style={{ fontFamily: 'Syne, sans-serif' }}>
          Track every{' '}
          <span className="text-transparent bg-clip-text" style={{ backgroundImage: 'linear-gradient(135deg, #3b82f6, #06b6d4)' }}>
            application.
          </span>
          <br />Land your dream job.
        </h1>
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed animate-fadeInUp delay-100">
          Stop losing track of where you've applied. JobTrackr keeps every application organised
          and uses AI to generate tailored resumes and cover letters in seconds.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fadeInUp delay-200">
          <Link to="/register"
            className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/25">
            Start Tracking Free <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link to="/login"
            className="flex items-center gap-2 border border-slate-700 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-semibold transition-all">
            Sign In
          </Link>
        </div>
        <p className="mt-4 text-xs text-slate-600 animate-fadeInUp delay-300">No credit card required · Free to use</p>
      </div>
    </section>

    {/* STATS */}
    <section className="py-12 border-y border-slate-800 bg-slate-900/40">
      <div className="max-w-4xl mx-auto px-6 grid grid-cols-3 gap-8 text-center">
        {[{ value: '10k+', label: 'Applications tracked' }, { value: '3x', label: 'Faster job search' }, { value: '95%', label: 'User satisfaction' }]
          .map(s => (
            <div key={s.label}>
              <div className="text-3xl font-extrabold text-white mb-1" style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</div>
              <div className="text-sm text-slate-500">{s.label}</div>
            </div>
          ))}
      </div>
    </section>

    {/* FEATURES */}
    <section className="py-24 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Everything you need in one place</h2>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">From tracking to AI generation — handle the grunt work so you can focus on interviews.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.title} className="bg-slate-900 border border-slate-800 hover:border-slate-600 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.bg}`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* HOW IT WORKS */}
    <section className="py-24 px-6 bg-slate-900/40 border-y border-slate-800">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Get started in 3 steps</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={s.title} className="text-center">
              <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-600/40 flex items-center justify-center mx-auto mb-4">
                <span className="text-blue-400 font-bold text-lg" style={{ fontFamily: 'Syne, sans-serif' }}>{i + 1}</span>
              </div>
              <h3 className="font-semibold text-white mb-2" style={{ fontFamily: 'Syne, sans-serif' }}>{s.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* CTA */}
    <section className="py-24 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <div className="rounded-3xl p-10 border border-blue-600/20"
          style={{ background: 'linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(6,182,212,0.1) 100%)' }}>
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>Ready to take control?</h2>
          <p className="text-slate-400 mb-8">Join thousands of job seekers who stay organised and land roles faster.</p>
          <Link to="/register"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/25">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>

    {/* FOOTER */}
    <footer className="border-t border-slate-800 py-8 px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center">
            <Briefcase className="w-3 h-3 text-white" />
          </div>
          <span className="font-bold text-sm" style={{ fontFamily: 'Syne, sans-serif' }}>JobTrackr</span>
        </div>
        <p className="text-xs text-slate-600">© {new Date().getFullYear()} JobTrackr. Built with React + Spring Boot.</p>
        <div className="flex gap-6">
          <Link to="/login" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Sign In</Link>
          <Link to="/register" className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Register</Link>
        </div>
      </div>
    </footer>
  </div>
);

export default LandingPage;