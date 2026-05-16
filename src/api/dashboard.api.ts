import axiosClient from './axiosClient';
import type { DashboardStats } from '../types/dashboard.types';

export const getDashboardStats = async (): Promise<DashboardStats> =>
  (await axiosClient.get<DashboardStats>('/dashboard/stats')).data;