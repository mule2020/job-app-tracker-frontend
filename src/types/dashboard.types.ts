export interface DashboardStats {
  totalApplications: number;
  pending: number;
  applied: number;
  interviewing: number;
  offered: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  totalResumes: number;
  totalCoverLetters: number;
}

export interface ActivityItem {
  id: string;
  type: 'APPLICATION_CREATED' | 'APPLICATION_UPDATED' | 'RESUME_GENERATED' | 'COVER_LETTER_SAVED' | 'STATUS_UPDATED'| 'RESUME_SAVED' | 'COVER_LETTER_GENERATED' ;
  description: string;
  company: string;
  jobTitle: string;
  createdAt: string;
}