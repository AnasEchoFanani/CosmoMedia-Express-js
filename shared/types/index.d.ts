export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export interface PaginatedResponse<T> {
  total: number;
  totalPages: number;
  currentPage: number;
  data: T[];
}

export interface ServiceCategory {
  WEB_DEVELOPMENT: 'WEB_DEVELOPMENT';
  MOBILE_DEVELOPMENT: 'MOBILE_DEVELOPMENT';
  UI_UX_DESIGN: 'UI_UX_DESIGN';
  CLOUD_SERVICES: 'CLOUD_SERVICES';
  CONSULTING: 'CONSULTING';
  MAINTENANCE: 'MAINTENANCE';
}

export interface ErrorResponse {
  message: string;
  error?: string;
}

export interface ValidationError {
  errors: {
    msg: string;
    param: string;
    location: string;
  }[];
}

export interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export interface ServiceAnalytics {
  viewCount: number;
  inquiryCount: number;
  conversionRate: number;
  averageRating: number;
  totalReviews: number;
  completedProjects: number;
  averageCompletionTime?: number;
  revenue: number;
  popularityScore: number;
}

export interface ServiceReview {
  rating: number;
  review: string;
  clientId: number;
  projectId?: number;
  sentiment?: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  isVerified: boolean;
  response?: string;
  responseDate?: Date;
}
