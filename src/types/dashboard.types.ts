export interface DashboardStats {
  total: number;
  pending: number;
  applied: number;
  interviewing: number;
  offered: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
}

export interface ActivityItem {
  id: number;
  type: 'APPLICATION_CREATED' | 'RESUME_GENERATED' | 'COVER_LETTER_SAVED' | 'STATUS_UPDATED';
  description: string;
  company: string;
  jobTitle: string;
  createdAt: string;
}