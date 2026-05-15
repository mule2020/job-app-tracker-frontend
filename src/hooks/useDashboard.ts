import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api/dashboard.api';
import type { ActivityItem } from '../types/dashboard.types';
import axiosClient from '../api/axiosClient';

const getRecentActivity = async (): Promise<ActivityItem[]> => {
  const res = await axiosClient.get<ActivityItem[]>('/dashboard/activity');
  return res.data;
};

export const useDashboard = () => {
  const stats = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
  });

  const activity = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: getRecentActivity,
    retry: false,          // don't retry if endpoint doesn't exist yet
    enabled: true,
    throwOnError: false,   // silently fail — won't crash the page
  });

  return { stats, activity };
};