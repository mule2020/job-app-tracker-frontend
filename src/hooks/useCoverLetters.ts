import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAllCoverLetters,
  getOneCoverLetter,
  generateCoverLetter,
  saveCoverLetter,
  updateCoverLetter,
  deleteCoverLetter,
} from '../api/coverLetter.api';
import type {
  GenerateCoverLetterRequest,
  SaveCoverLetterRequest,
  UpdateCoverLetterRequest,
} from '../types/coverLetter.types';
import { DASHBOARD_STATS_KEY } from './useApplications';

export const COVER_LETTERS_KEY = ['cover-letters'];

export const useCoverLetters = () =>
  useQuery({ queryKey: COVER_LETTERS_KEY, queryFn: getAllCoverLetters });

export const useCoverLetter = (id: string) =>
  useQuery({
    queryKey: [...COVER_LETTERS_KEY, id],
    queryFn: () => getOneCoverLetter(id),
    enabled: !!id,
  });

export const useGenerateCoverLetter = () =>
  useMutation({
    mutationFn: (data: GenerateCoverLetterRequest) => generateCoverLetter(data),
  });

export const useSaveCoverLetter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: SaveCoverLetterRequest) => saveCoverLetter(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: COVER_LETTERS_KEY });
      qc.invalidateQueries({ queryKey: DASHBOARD_STATS_KEY }); 
    },
  });
};

export const useUpdateCoverLetter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCoverLetterRequest }) =>
      updateCoverLetter(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: COVER_LETTERS_KEY }),
  });
};

export const useDeleteCoverLetter = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteCoverLetter(id),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: COVER_LETTERS_KEY, refetchType: 'all' });
      qc.invalidateQueries({ queryKey: DASHBOARD_STATS_KEY }); 
    },
  });
};