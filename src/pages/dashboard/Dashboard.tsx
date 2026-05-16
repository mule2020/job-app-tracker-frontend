import { Link } from 'react-router-dom';
import {
  Briefcase, FileText, Mail, TrendingUp,
  CheckCircle, Clock, XCircle, MinusCircle,
  Plus, Wand2, ArrowRight, Activity
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuthContext } from '../../context/AuthContext';

// ── Status config ─────────────────────────────────────────
const STATUSES = [
  { key: 'pending', label: 'Pending', color: '#f59e0b', bg: 'bg-amber-50', text: 'text-amber-600', icon: Clock },
  { key: 'applied', label: 'Applied', color: '#3b82f6', bg: 'bg-blue-50', text: 'text-blue-600', icon: Briefcase },
  { key: 'interviewing', label: 'Interviewing', color: '#8b5cf6', bg: 'bg-violet-50', text: 'text-violet-600', icon: TrendingUp },
  { key: 'offered', label: 'Offered', color: '#06b6d4', bg: 'bg-cyan-50', text: 'text-cyan-600', icon: CheckCircle },
  { key: 'accepted', label: 'Accepted', color: '#10b981', bg: 'bg-emerald-50', text: 'text-emerald-600', icon: CheckCircle },
  { key: 'rejected', label: 'Rejected', color: '#ef4444', bg: 'bg-red-50', text: 'text-red-600', icon: XCircle },
  { key: 'withdrawn', label: 'Withdrawn', color: '#94a3b8', bg: 'bg-slate-50', text: 'text-slate-500', icon: MinusCircle },
] as const;

type StatusKey = typeof STATUSES[number]['key'];

// ── Helpers ───────────────────────────────────────────────
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

const activityConfig = {
  APPLICATION_CREATED: { color: 'bg-blue-500', label: 'New Application' },
  APPLICATION_UPDATED: { color: 'bg-slate-400', label: 'Updated' },
  RESUME_GENERATED: { color: 'bg-violet-500', label: 'Resume' },
  COVER_LETTER_SAVED: { color: 'bg-cyan-500', label: 'Cover Letter' },
  STATUS_UPDATED: { color: 'bg-emerald-500', label: 'Status Changed' },
  RESUME_SAVED: { color: 'bg-cyan-500', label: 'Resume Saved' },
  COVER_LETTER_GENERATED: { color: 'bg-violet-500', label: 'Cover Letter Generated' },
};

const CustomPieTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl border border-slate-700">
      <span className="font-semibold">{payload[0].payload.label}</span>
      <span className="ml-2 text-slate-300">{payload[0].value}</span>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────
const Dashboard = () => {
  const { user } = useAuthContext();
  const { stats, activity } = useDashboard();
  const data = stats.data;
  const loading = stats.isLoading;

  const activePipeline = (data?.applied ?? 0) + (data?.interviewing ?? 0) + (data?.offered ?? 0);
  const successRate = data?.totalApplications
    ? Math.round(((data.accepted ?? 0) / data.totalApplications) * 100)
    : 0;

  // Pie chart data — only statuses with values
  const pieData = STATUSES
    .map(s => ({ ...s, value: data?.[s.key as StatusKey] ?? 0 }))
    .filter(s => s.value > 0);

  // Fake area chart — pipeline progression over time
  // In real app this would come from backend
  const areaData = [
    { name: 'Mon', applications: 0 },
    { name: 'Tue', applications: 0 },
    { name: 'Wed', applications: 0 },
    { name: 'Thu', applications: 0 },
    { name: 'Fri', applications: 0 },
    { name: 'Sat', applications: 0 },
    { name: 'Today', applications: data?.totalApplications ?? 0 },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Hero welcome banner ── */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 px-8 py-8 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #3b82f6, transparent)' }} />
          <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full opacity-10"
            style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
              backgroundSize: '40px 40px'
            }} />
        </div>

        <div className="relative flex items-start justify-between gap-4 flex-wrap">
          <div>
            <p className="text-slate-400 text-sm font-medium mb-1">
              {new Date().toLocaleDateString('en-CA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <h1 className="text-2xl md:text-3xl font-extrabold mb-2"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              {loading ? 'Loading…' : (
                <>
                  {activePipeline > 0
                    ? `${activePipeline} active application${activePipeline !== 1 ? 's' : ''} 🎯`
                    : 'Start your job search 🚀'}
                </>
              )}
            </h1>
            <p className="text-slate-400 text-sm">
              {user?.email} · {data?.totalApplications ?? 0} total applications tracked
            </p>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-3">
            <Link to="/applications/new"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 shadow-lg shadow-blue-600/30">
              <Plus className="w-4 h-4" /> Add Application
            </Link>
            <Link to="/resumes/generate"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:-translate-y-0.5 backdrop-blur-sm border border-white/10">
              <Wand2 className="w-4 h-4" /> Generate Resume
            </Link>
          </div>
        </div>

        {/* Mini stats strip */}
        {!loading && data && (
          <div className="relative mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total', value: data.totalApplications, color: 'text-white' },
              { label: 'Active', value: activePipeline, color: 'text-blue-400' },
              { label: 'Resumes', value: data.totalResumes, color: 'text-violet-400' },
              { label: 'Letters', value: data.totalCoverLetters, color: 'text-cyan-400' },
            ].map(s => (
              <div key={s.label}
                className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <p className={`text-2xl font-extrabold ${s.color}`}
                  style={{ fontFamily: 'Syne, sans-serif' }}>{s.value}</p>
                <p className="text-slate-400 text-xs mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        )}
        {loading && (
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16" />)}
          </div>
        )}
      </div>

      {/* ── Main content grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left col — pipeline status ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Status breakdown cards */}
          <div>
            <h2 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-3">
              Pipeline Status
            </h2>
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-20" />)}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {STATUSES.map(s => {
                  const value = data?.[s.key as StatusKey] ?? 0;
                  const Icon = s.icon;
                  return (
                    <div key={s.key}
                      className={`relative overflow-hidden rounded-2xl p-4 border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                          <Icon className={`w-4 h-4 ${s.text}`} />
                        </div>
                        <span className={`text-xl font-extrabold ${value > 0 ? s.text : 'text-slate-300'}`}
                          style={{ fontFamily: 'Syne, sans-serif' }}>
                          {value}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-slate-500">{s.label}</p>
                      {/* Bottom accent bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ backgroundColor: s.color }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Success rate + Donut chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-sm font-bold text-slate-700"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                Application Breakdown
              </h2>
              {!loading && data && data.totalApplications > 0 && (
                <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span className="text-xs font-semibold text-emerald-700">
                    {successRate}% success rate
                  </span>
                </div>
              )}
            </div>

            {loading ? <Skeleton className="h-48 w-full" /> :
              pieData.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-slate-300" />
                  </div>
                  <p className="text-slate-400 text-sm">No applications yet</p>
                  <Link to="/applications/new"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-500 font-medium transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Add your first application
                  </Link>
                </div>
              ) : (
                <div className="flex items-center gap-8">
                  <ResponsiveContainer width="45%" height={180}>
                    <PieChart>
                      <Pie data={pieData} dataKey="value" cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80} paddingAngle={2} strokeWidth={0}>
                        {pieData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomPieTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2.5">
                    {pieData.map(d => (
                      <div key={d.key} className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                        <span className="text-xs text-slate-600 flex-1">{d.label}</span>
                        <span className="text-xs font-bold text-slate-800">{d.value}</span>
                        <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.round((d.value / (data?.totalApplications ?? 1)) * 100)}%`,
                              backgroundColor: d.color
                            }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
          </div>

          {/* Area chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-5"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              Application Trend
            </h2>
            {loading ? <Skeleton className="h-32 w-full" /> : (
              <ResponsiveContainer width="100%" height={120}>
                <AreaChart data={areaData} margin={{ top: 4, right: 4, left: -30, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: 'none', borderRadius: 8, fontSize: 12, color: '#fff' }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  />
                  <Area type="monotone" dataKey="applications" stroke="#3b82f6"
                    strokeWidth={2} fill="url(#areaGrad)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* ── Right col — activity + quick links ── */}
        <div className="space-y-6">

          {/* Quick actions */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-4"
              style={{ fontFamily: 'Syne, sans-serif' }}>
              Quick Actions
            </h2>
            <div className="space-y-2">
              {[
                { to: '/applications/new', icon: Plus, label: 'Add Application', sub: 'Log a new job', color: 'text-blue-600', bg: 'bg-blue-50' },
                { to: '/resumes/generate', icon: FileText, label: 'Generate Resume', sub: 'AI-tailored resume', color: 'text-violet-600', bg: 'bg-violet-50' },
                { to: '/cover-letters/generate', icon: Mail, label: 'Generate Cover Letter', sub: 'AI-tailored letter', color: 'text-cyan-600', bg: 'bg-cyan-50' },
                { to: '/applications', icon: Briefcase, label: 'View Applications', sub: 'See all your jobs', color: 'text-slate-600', bg: 'bg-slate-50' },
              ].map(action => (
                <Link key={action.to} to={action.to}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-all group">
                  <div className={`w-9 h-9 rounded-xl ${action.bg} flex items-center justify-center shrink-0`}>
                    <action.icon className={`w-4 h-4 ${action.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-700 truncate">{action.label}</p>
                    <p className="text-xs text-slate-400 truncate">{action.sub}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Activity feed */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center">
                  <Activity className="w-3.5 h-3.5 text-white" />
                </div>
                <h2 className="text-sm font-bold text-slate-800"
                  style={{ fontFamily: 'Syne, sans-serif' }}>
                  Recent Activity
                </h2>
              </div>
              {activity.data && activity.data.length > 0 && (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  {activity.data.length} events
                </span>
              )}
            </div>

            {activity.isLoading ? (
              <div className="p-4 space-y-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-8 h-8 rounded-xl bg-slate-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-slate-200 rounded-lg w-3/4" />
                      <div className="h-2.5 bg-slate-100 rounded-lg w-1/2" />
                    </div>
                    <div className="h-2.5 w-10 bg-slate-100 rounded-lg" />
                  </div>
                ))}
              </div>
            ) : !activity.data?.length ? (
              <div className="py-12 px-5 text-center">
                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Activity className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-slate-500 text-sm font-semibold">No activity yet</p>
                <p className="text-slate-300 text-xs mt-1">
                  Actions will appear here as you use the app
                </p>
              </div>
            ) : (
              <div className="px-4 py-3 space-y-1">
                {activity.data.map((item, i) => {
                  const typeStyles: Record<string, { iconBg: string; iconColor: string; dot: string; badge: string; badgeText: string; label: string }> = {
                    APPLICATION_CREATED: { iconBg: 'bg-blue-50', iconColor: 'text-blue-600', dot: 'bg-blue-500', badge: 'bg-blue-50 border-blue-100', badgeText: 'text-blue-600', label: 'New Application' },
                    APPLICATION_UPDATED: { iconBg: 'bg-slate-50', iconColor: 'text-slate-500', dot: 'bg-slate-400', badge: 'bg-slate-50 border-slate-200', badgeText: 'text-slate-500', label: 'Updated' },
                    RESUME_GENERATED: { iconBg: 'bg-violet-50', iconColor: 'text-violet-600', dot: 'bg-violet-500', badge: 'bg-violet-50 border-violet-100', badgeText: 'text-violet-600', label: 'Resume Generated' },
                    RESUME_SAVED: { iconBg: 'bg-violet-50', iconColor: 'text-violet-600', dot: 'bg-violet-500', badge: 'bg-violet-50 border-violet-100', badgeText: 'text-violet-600', label: 'Resume Saved' },
                    COVER_LETTER_SAVED: { iconBg: 'bg-cyan-50', iconColor: 'text-cyan-600', dot: 'bg-cyan-500', badge: 'bg-cyan-50 border-cyan-100', badgeText: 'text-cyan-600', label: 'Cover Letter' },
                    STATUS_UPDATED: { iconBg: 'bg-emerald-50', iconColor: 'text-emerald-600', dot: 'bg-emerald-500', badge: 'bg-emerald-50 border-emerald-100', badgeText: 'text-emerald-600', label: 'Status Changed' },
                  };

                  const cfg = typeStyles[item.type] ?? {
                    iconBg: 'bg-slate-50', iconColor: 'text-slate-500', dot: 'bg-slate-400',
                    badge: 'bg-slate-50 border-slate-200', badgeText: 'text-slate-500', label: 'Activity'
                  };

                  const icons: Record<string, React.ElementType> = {
                    APPLICATION_CREATED: Briefcase,
                    APPLICATION_UPDATED: Briefcase,
                    RESUME_GENERATED: FileText,
                    RESUME_SAVED: FileText,
                    COVER_LETTER_SAVED: Mail,
                    STATUS_UPDATED: TrendingUp,
                  };
                  const Icon = icons[item.type] ?? Activity;

                  return (
                    <div key={item.id}
                      className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">

                      {/* Icon */}
                      <div className={`w-9 h-9 rounded-xl ${cfg.iconBg} flex items-center justify-center shrink-0`}>
                        <Icon className={`w-4 h-4 ${cfg.iconColor}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {item.company}
                          </p>
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.badge} ${cfg.badgeText}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">{item.jobTitle}</p>
                      </div>

                      {/* Time */}
                      <span className="text-xs text-slate-300 shrink-0 group-hover:text-slate-400 transition-colors">
                        {timeAgo(item.createdAt)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Dashboard;