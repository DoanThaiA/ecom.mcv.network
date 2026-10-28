// News Status
export type NewsStatus = 'active' | 'inactive';

// Localization type
export interface NewsLocalization {
  vi?: string;
  en?: string;
}

// News entity
export interface News {
  id: string;
  title: string;
  titleLocalization?: NewsLocalization | null;
  content: string; // HTML content from rich text editor
  contentLocalization?: NewsLocalization | null;
  thumbnail: string; // Image URL
  status: NewsStatus;
  publishedAt: string; // ISO datetime
  createdAt: string;
  updatedAt: string;
}

// Request/Response types
export interface CreateNewsRequest {
  title: string;
  titleLocalization?: NewsLocalization | null;
  content: string;
  contentLocalization?: NewsLocalization | null;
  thumbnail: string;
  status: NewsStatus;
  publishedAt?: string;
}

export interface UpdateNewsRequest extends CreateNewsRequest {
  id: string;
}

export interface GetNewsListRequest {
  page: number;
  limit: number;
  search?: string;
}

export interface GetNewsListResponse {
  data: News[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface NewsPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
