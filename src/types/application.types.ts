export type ApplicationStatus =
  | 'PENDING'
  | 'APPLIED'
  | 'INTERVIEWING'
  | 'OFFERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface Application {
  id: string;
  company: string;
  jobTitle: string;
  jobDescription?: string;
  status: ApplicationStatus;
  jobUrl?: string;
  salaryRange?: string;
  location?: string;
  notes?: string;
  appliedAt?: string;
  createdAt: string;
  updatedAt: string;
  resumeExists: boolean;
  resumePreview?: string;
  coverLetterExists: boolean;
  coverLetterPreview?: string;
}

export interface CreateApplicationRequest {
  company: string;
  jobTitle: string;
  jobDescription?: string;
  status: ApplicationStatus;
  jobUrl?: string;
  salaryRange?: string;
  location?: string;
  notes?: string;
  appliedAt?: string;
}

export interface UpdateApplicationRequest {
  company?: string;
  jobTitle?: string;
  jobDescription?: string;
  status?: ApplicationStatus;
  jobUrl?: string;
  salaryRange?: string;
  location?: string;
  notes?: string;
  appliedAt?: string;
}

// Backend returns paginated response
export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}