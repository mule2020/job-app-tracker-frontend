import { Briefcase, FileText, Mail, TrendingUp, CheckCircle, Clock } from 'lucide-react';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Link } from 'react-router-dom';
import { useDashboard } from '../../hooks/useDashboard';
import { useAuthContext } from '../../context/AuthContext';

// ── Status colour map ─────────────────────────────────────
const STATUS_CHART = [
  { key: 'pending',      label: 'Pending',      color: '#f59e0b' },
  { key: 'applied',      label: 'Applied',      color: '#3b82f6' },
  { key: 'interviewing', label: 'Interviewing', color: '#8b5cf6' },
  { key: 'offered',      label: 'Offered',      color: '#06b6d4' },
  { key: 'accepted',     label: 'Accepted',     color: '#10b981' },
  { key: 'rejected',     label: 'Rejected',     color: '#ef4444' },
  { key: 'withdrawn',    label: 'Withdrawn',    color: '#94a3b8' },
] as const;

type StatusKey = typeof STATUS_CHART[number]['key'];

// ── Skeleton ──────────────────────────────────────────────
const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
);

// ── Stat Card ─────────────────────────────────────────────
const StatCard = ({
  label, value, icon: Icon, iconBg, iconColor, loading
}: {
  label: string; value: number | undefined;
  icon: React.ElementType; iconBg: string; iconColor: string; loading: boolean;
}) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
      <Icon className={`w-5 h-5 ${iconColor}`} />
    </div>
    <div className="min-w-0">
      <p className="text-sm text-slate-500 font-medium">{label}</p>
      {loading
        ? <Skeleton className="h-7 w-16 mt-1" />
        : <p className="text-2xl font-extrabold text-slate-800 mt-0.5"
            style={{ fontFamily: 'Syne, sans-serif' }}>{value ?? 0}</p>
      }
    </div>
  </div>
);

// ── Tooltip ───────────────────────────────────────────────
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-slate-900 text-white text-xs px-3 py-2 rounded-lg shadow-xl">
      <span className="font-semibold">{d.label}</span>: {d.value}
    </div>
  );
};

// ── Activity icon ─────────────────────────────────────────
const activityIcon = (type: string) => {
  if (type === 'APPLICATION_CREATED') return <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
  if (type === 'RESUME_GENERATED')    return <FileText   className="w-3.5 h-3.5 text-violet-500" />;
  if (type === 'COVER_LETTER_SAVED')  return <Mail       className="w-3.5 h-3.5 text-cyan-500" />;
  return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
};

const timeAgo = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

// ── Main ──────────────────────────────────────────────────
const Dashboard = () => {
  const { user }          = useAuthContext();
  const { stats, activity } = useDashboard();
  const data              = stats.data;
  const loading           = stats.isLoading;

  // Build chart data — only statuses with values > 0
  const chartData = STATUS_CHART
    .map(s => ({ ...s, value: data?.[s.key as StatusKey] ?? 0 }))
    .filter(s => s.value > 0);

  const activePipeline =
    (data?.applied ?? 0) + (data?.interviewing ?? 0) + (data?.offered ?? 0);

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ── Welcome strip ── */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl px-6 py-5 text-white">
        <p className="text-sm text-blue-200 mb-0.5">Welcome back</p>
        <h1 className="text-xl font-extrabold" style={{ fontFamily: 'Syne, sans-serif' }}>
          {user?.email}
        </h1>
        {!loading && data && (
          <p className="text-sm text-blue-200 mt-1">
            You have{' '}
            <span className="font-bold text-white">{activePipeline}</span>{' '}
            active application{activePipeline !== 1 ? 's' : ''} in your pipeline
          </p>
        )}
      </div>

      {/* ── Top stat cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard label="Total"        value={data?.total}        icon={Briefcase}   iconBg="bg-blue-50"    iconColor="text-blue-600"    loading={loading} />
        <StatCard label="Interviewing" value={data?.interviewing} icon={TrendingUp}  iconBg="bg-violet-50"  iconColor="text-violet-600"  loading={loading} />
        <StatCard label="Offered"      value={data?.offered}      icon={Mail}        iconBg="bg-cyan-50"    iconColor="text-cyan-600"    loading={loading} />
        <StatCard label="Accepted"     value={data?.accepted}     icon={CheckCircle} iconBg="bg-emerald-50" iconColor="text-emerald-600" loading={loading} />
      </div>

      {/* ── Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Donut */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Applications by Status
          </h2>
          {loading ? <Skeleton className="h-56 w-full" /> :
           chartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
              No applications yet
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="55%" height={200}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" cx="50%" cy="50%"
                    innerRadius={55} outerRadius={85} paddingAngle={3}>
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {chartData.map(d => (
                  <div key={d.key} className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: d.color }} />
                      <span className="text-xs text-slate-600 truncate">{d.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-700">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700 mb-4" style={{ fontFamily: 'Syne, sans-serif' }}>
            Status Breakdown
          </h2>
          {loading ? <Skeleton className="h-56 w-full" /> :
           chartData.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-slate-400 text-sm">
              No applications yet
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={28}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }}
                  axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* ── 7-status mini grid ── */}
      {!loading && data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {STATUS_CHART.map(s => (
            <div key={s.key}
              className="bg-white border border-slate-200 rounded-2xl p-4 text-center shadow-sm">
              <div className="w-2.5 h-2.5 rounded-full mx-auto mb-2"
                style={{ backgroundColor: s.color }} />
              <p className="text-lg font-extrabold text-slate-800"
                style={{ fontFamily: 'Syne, sans-serif' }}>
                {data[s.key as StatusKey] ?? 0}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* ── Quick actions ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/applications/new', icon: Briefcase, label: 'Add Application',      sub: 'Log a new job',            bg: 'bg-blue-50',   color: 'text-blue-600',   border: 'hover:border-blue-200'   },
          { to: '/resumes/generate', icon: FileText,  label: 'Generate Resume',       sub: 'AI-tailored resume',       bg: 'bg-violet-50', color: 'text-violet-600', border: 'hover:border-violet-200' },
          { to: '/cover-letters/generate', icon: Mail, label: 'Generate Cover Letter', sub: 'AI-tailored cover letter', bg: 'bg-cyan-50',   color: 'text-cyan-600',   border: 'hover:border-cyan-200'   },
        ].map(action => (
          <Link key={action.to} to={action.to}
            className={`group bg-white border border-slate-200 ${action.border} rounded-2xl p-5 flex items-center gap-4 shadow-sm transition-all hover:-translate-y-0.5`}>
            <div className={`w-10 h-10 rounded-xl ${action.bg} flex items-center justify-center shrink-0`}>
              <action.icon className={`w-5 h-5 ${action.color}`} />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">{action.label}</p>
              <p className="text-xs text-slate-400">{action.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* ── Recent Activity ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-4 h-4 text-slate-400" />
          <h2 className="text-sm font-semibold text-slate-700" style={{ fontFamily: 'Syne, sans-serif' }}>
            Recent Activity
          </h2>
        </div>

        {activity.isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
          </div>
        ) : !activity.data?.length ? (
          <div className="py-10 text-center">
            <Clock className="w-8 h-8 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm font-medium">No activity yet</p>
            <p className="text-slate-300 text-xs mt-1">
              Activity will appear here once the feature is enabled.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activity.data.map(item => (
              <div key={item.id} className="flex items-start gap-3 py-3">
                <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                  {activityIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 font-medium truncate">{item.description}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{item.company} · {item.jobTitle}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0 mt-0.5">
                  {timeAgo(item.createdAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;