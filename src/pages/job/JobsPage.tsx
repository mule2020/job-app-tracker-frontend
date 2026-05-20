import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, MapPin, Building2, DollarSign, Calendar, ExternalLink, Plus, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { searchJobs } from '../../api/job.api';
import { getApplications } from '../../api/applications.api';
import { useProfile } from '../../hooks/useProfile';
import { createApplication } from '../../api/applications.api';
import type { JobSearchResponse } from '../../types/job.types';

const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-CA', {
        year: 'numeric', month: 'short', day: 'numeric',
    });
};

const toKebabCase = (str: string) =>
    str.trim().toLowerCase().replace(/\s+/g, '-');

const fromKebabCase = (str: string) =>
    str.replace(/-/g, ' ');

export default function JobsPage() {
    const { data: profile } = useProfile();
    const queryClient = useQueryClient();

    const [keyword, setKeyword] = useState('');
    const [location, setLocation] = useState('');
    const [page, setPage] = useState(1);
    const [searchParams, setSearchParams] = useState<{ keyword: string; location: string; page: number } | null>(null);
    const [addedJobs, setAddedJobs] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (profile) {
            const profileKeyword = profile.title ? toKebabCase(profile.title) : 'software-developer';
            const profileLocation = profile.location ?? 'Toronto';
            setKeyword(profileKeyword);
            setLocation(profileLocation);
            setSearchParams({ keyword: fromKebabCase(profileKeyword), location: profileLocation, page: 1 });
        }
    }, [profile]);

    const { data: jobs, isLoading, isFetching, isError } = useQuery({
        queryKey: ['jobs', searchParams],
        queryFn: () => searchJobs({
            keyword: searchParams!.keyword,
            location: searchParams!.location,
            page: searchParams!.page,
        }),
        enabled: !!searchParams,
        staleTime: 1000 * 60 * 10,
    });

    // Fetch existing applications to check duplicates across sessions
    const { data: existingApps } = useQuery({
        queryKey: ['applications-all'],
        queryFn: () => getApplications(0, 1000),
        staleTime: 1000 * 60 * 5,
    });

    // Build a Set of existing jobUrls from DB
    const existingJobUrls = useMemo(() => {
        const urls = new Set<string>();
        existingApps?.content?.forEach(app => {
            if (app.jobUrl) urls.add(app.jobUrl);
        });
        return urls;
    }, [existingApps]);

    // Check if job is already added — either in current session or DB
    const isAdded = (job: JobSearchResponse) =>
        addedJobs.has(job.id) || existingJobUrls.has(job.redirectUrl);

    const addMutation = useMutation({
        mutationFn: (job: JobSearchResponse) =>
            createApplication({
                company: job.company,
                jobTitle: job.title,
                status: 'PENDING',
                jobDescription: job.description,
                location: job.location,
                jobUrl: job.redirectUrl,
                salaryRange: job.salary ?? undefined,
                notes: `Added from JobTrackr job search`,
            }),
        onSuccess: (_, job) => {
            setAddedJobs(prev => new Set(prev).add(job.id));
            queryClient.invalidateQueries({ queryKey: ['applications'] });
            queryClient.invalidateQueries({ queryKey: ['applications-all'] });
            toast.success(`"${job.title}" added! For better AI results, paste the full job description in the application details.`, {
                duration: 5000,
            });
        },
        onError: () => {
            toast.error('Failed to add job. Please try again.');
        },
    });

    const handleSearch = () => {
        setPage(1);
        setSearchParams({ keyword: fromKebabCase(keyword), location, page: 1 });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        setSearchParams(prev => prev ? { ...prev, page: newPage } : null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const loading = isLoading || isFetching;

    return (
        <div className="max-w-4xl mx-auto space-y-6">

            {/* Header */}
            <div>
                <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: 'Syne, sans-serif' }}>
                    Find Jobs
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                    Search real jobs in Canada powered by Adzuna
                </p>
            </div>

            {/* Search bar */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={keyword}
                            onChange={e => setKeyword(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. software-developer"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <div className="flex-1 relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={location}
                            onChange={e => setLocation(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="e.g. Toronto"
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="flex items-center justify-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
                    >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        Search
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-2 ml-1">
                    Use hyphens for multi-word searches: <span className="font-medium">full-stack-developer</span>, <span className="font-medium">data-analyst</span>
                </p>
            </div>

            {/* Results */}
            {loading && (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                </div>
            )}

            {isError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                    <p className="text-red-600 text-sm font-medium">Failed to fetch jobs. Please try again.</p>
                </div>
            )}

            {!loading && jobs?.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
                    <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm">No jobs found. Try a different keyword or location.</p>
                </div>
            )}

            {!loading && jobs && jobs.length > 0 && (
                <div className="space-y-4">
                    {jobs.map(job => (
                        <div key={job.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                                <div className="min-w-0 flex-1">
                                    <h3 className="font-semibold text-slate-800 text-base leading-snug">
                                        {job.title}
                                    </h3>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1.5">
                                        <span className="flex items-center gap-1 text-sm text-slate-500">
                                            <Building2 className="w-3.5 h-3.5 shrink-0" />
                                            {job.company}
                                        </span>
                                        <span className="flex items-center gap-1 text-sm text-slate-500">
                                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                                            {job.location}
                                        </span>
                                        {job.salary && (
                                            <span className="flex items-center gap-1 text-sm text-emerald-600 font-medium">
                                                <DollarSign className="w-3.5 h-3.5 shrink-0" />
                                                {job.salary}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1 text-xs text-slate-400">
                                            <Calendar className="w-3.5 h-3.5 shrink-0" />
                                            {formatDate(job.postedDate)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                                        {job.description}
                                    </p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100">
                                <a
                                    href={job.redirectUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-blue-600 border border-blue-200 rounded-xl hover:bg-blue-50 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    View Job
                                </a>
                                <button
                                    onClick={() => addMutation.mutate(job)}
                                    disabled={isAdded(job) || addMutation.isPending}
                                    className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                                        isAdded(job)
                                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
                                            : 'bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50'
                                    }`}
                                >
                                    {isAdded(job)
                                        ? <><Check className="w-3.5 h-3.5" /> Added</>
                                        : <><Plus className="w-3.5 h-3.5" /> Add to Applications</>
                                    }
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Pagination */}
                    <div className="flex items-center justify-center gap-4 pt-2 pb-6">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 1 || loading}
                            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            ← Previous
                        </button>
                        <span className="text-sm text-slate-500 font-medium">Page {page}</span>
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={!jobs || jobs.length < 10 || loading}
                            className="px-4 py-2 text-sm font-medium text-slate-600 border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                            Next →
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}