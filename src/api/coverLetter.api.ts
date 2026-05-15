import axiosClient from './axiosClient';
import type {
  CoverLetter,
  GenerateCoverLetterRequest,
  GeneratedCoverLetterResponse,
  SaveCoverLetterRequest,
  UpdateCoverLetterRequest,
} from '../types/coverLetter.types';

export const generateCoverLetter = async (
  data: GenerateCoverLetterRequest
): Promise<GeneratedCoverLetterResponse> =>
  (await axiosClient.post<GeneratedCoverLetterResponse>('/cover-letters/generate', data)).data;

export const saveCoverLetter = async (data: SaveCoverLetterRequest): Promise<CoverLetter> =>
  (await axiosClient.post<CoverLetter>('/cover-letters', data)).data;

export const getAllCoverLetters = async (): Promise<CoverLetter[]> =>
  (await axiosClient.get<CoverLetter[]>('/cover-letters')).data;

export const getOneCoverLetter = async (id: string): Promise<CoverLetter> =>
  (await axiosClient.get<CoverLetter>(`/cover-letters/${id}`)).data;

export const getCoverLetterByApplicationId = async (applicationId: string): Promise<CoverLetter> =>
  (await axiosClient.get<CoverLetter>(`/cover-letters/by-application/${applicationId}`)).data;

export const updateCoverLetter = async (id: string, data: UpdateCoverLetterRequest): Promise<CoverLetter> =>
  (await axiosClient.put<CoverLetter>(`/cover-letters/${id}`, data)).data;

export const deleteCoverLetter = async (id: string): Promise<void> =>
  void (await axiosClient.delete(`/cover-letters/${id}`));