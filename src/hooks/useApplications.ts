import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getApplications,
  getApplication,
  createApplication,
  updateApplication,
  deleteApplication,
} from '../api/applications.api';
import type {
  CreateApplicationRequest,
  UpdateApplicationRequest,
  ApplicationStatus,
} from '../types/application.types';

export const APPLICATIONS_KEY = ['applications'];

export const useApplications = (page = 0, size = 10, status?: ApplicationStatus) =>
  useQuery({
    queryKey: [...APPLICATIONS_KEY, page, size, status],
    queryFn: () => getApplications(page, size, status),
  });

export const useApplication = (id: string) =>
  useQuery({
    queryKey: [...APPLICATIONS_KEY, id],
    queryFn: () => getApplication(id),
    enabled: !!id,
  });

export const useCreateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateApplicationRequest) => createApplication(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: APPLICATIONS_KEY }),
  });
};

export const useUpdateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateApplicationRequest }) =>
      updateApplication(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: APPLICATIONS_KEY }),
  });
};

export const useDeleteApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteApplication(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: APPLICATIONS_KEY }),
  });
};