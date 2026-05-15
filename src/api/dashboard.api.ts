import axiosClient from './axiosClient';
import type { DashboardStats, ActivityItem } from '../types/dashboard.types';

export const getDashboardStats = async (): Promise<DashboardStats> =>
  (await axiosClient.get<DashboardStats>('/applications/stats')).data;

export const getRecentActivity  = async (): Promise<ActivityItem[]> =>
  (await axiosClient.get<ActivityItem[]>('/dashboard/activity')).data;