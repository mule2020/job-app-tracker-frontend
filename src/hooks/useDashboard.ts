import { useQuery } from '@tanstack/react-query';
import { getDashboardStats } from '../api/dashboard.api';
import type { ActivityItem } from '../types/dashboard.types';
import axiosClient from '../api/axiosClient';

const getRecentActivity = async (): Promise<ActivityItem[]> => {
  const res = await axiosClient.get<ActivityItem[]>('/dashboard/activity?limit=10');
  return res.data;
};

export const useDashboard = () => {
  const stats = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: getDashboardStats,
    refetchInterval: 30_000,
  });

  const activity = useQuery({
    queryKey: ['dashboard-activity'],
    queryFn: getRecentActivity,
    retry: false,
    throwOnError: false,
    refetchInterval: 30_000,
  });

  return { stats, activity };
};