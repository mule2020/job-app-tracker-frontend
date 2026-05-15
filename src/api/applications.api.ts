import axiosClient from './axiosClient';
import type {
  Application,
  CreateApplicationRequest,
  UpdateApplicationRequest,
  PagedResponse,
} from '../types/application.types';
import type { ApplicationStatus } from '../types/application.types';

export const getApplications = async (
  page = 0,
  size = 10,
  status?: ApplicationStatus
): Promise<PagedResponse<Application>> => {
  const params: Record<string, any> = { page, size };
  if (status) params.status = status;
  return (await axiosClient.get<PagedResponse<Application>>('/applications', { params })).data;
};

export const getApplication = async (id: string): Promise<Application> =>
  (await axiosClient.get<Application>(`/applications/${id}`)).data;

export const createApplication = async (data: CreateApplicationRequest): Promise<Application> =>
  (await axiosClient.post<Application>('/applications', data)).data;

export const updateApplication = async (id: string, data: UpdateApplicationRequest): Promise<Application> =>
  (await axiosClient.put<Application>(`/applications/${id}`, data)).data;

export const deleteApplication = async (id: string): Promise<void> =>
  void (await axiosClient.delete(`/applications/${id}`));