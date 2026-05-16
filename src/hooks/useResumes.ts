import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllResumes,
  getOneResume,
  generateResume,
  saveResume,
  updateResume,
  deleteResume,
} from '../api/resume.api';
import type { GenerateResumeRequest, SaveResumeRequest, UpdateResumeRequest } from '../types/resume.types';
import { DASHBOARD_STATS_KEY } from './useApplications';

export const RESUMES_KEY = ['resumes'];

export const useResumes = () =>
  useQuery({ queryKey: RESUMES_KEY, queryFn: getAllResumes });

export const useResume = (id: string) =>
  useQuery({ queryKey: [...RESUMES_KEY, id], queryFn: () => getOneResume(id), enabled: !!id });

export const useGenerateResume = () =>
  useMutation({ mutationFn: (data: GenerateResumeRequest) => generateResume(data) });

export const useSaveResume = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveResumeRequest) => saveResume(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: RESUMES_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_STATS_KEY }); 
    },
  });
};

export const useUpdateResume = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateResumeRequest }) => updateResume(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: RESUMES_KEY }),
  });
};

export const useDeleteResume = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteResume(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: RESUMES_KEY, refetchType: 'all' });
      qc.invalidateQueries({ queryKey: DASHBOARD_STATS_KEY }); 
    },
  });
};