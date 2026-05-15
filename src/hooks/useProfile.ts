import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile } from '../api/profile.api';
import type { ProfileRequest } from '../types/profile.types';

export const PROFILE_KEY = ['profile'];

export const useProfile = () =>
  useQuery({ queryKey: PROFILE_KEY, queryFn: getProfile });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProfileRequest) => updateProfile(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
  });
};