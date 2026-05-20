import axiosClient from './axiosClient';
import type { JobSearchResponse, JobSearchParams } from '../types/job.types';

export const searchJobs = async (params: JobSearchParams): Promise<JobSearchResponse[]> => {
  const { data } = await axiosClient.get<JobSearchResponse[]>('/jobs/search', { params });
  return data;
};