// News types (frontend)

export interface NewsLocalization {
  vi?: string;
  en?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  titleLocalization?: NewsLocalization | null;
  content: string;
  contentLocalization?: NewsLocalization | null;
  thumbnail: string;
  publishedAt: string;
  excerpt?: string; // Short description for list view
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Get localized text with fallback to default value
 */
export function getLocalizedText(
  localization: NewsLocalization | null | undefined,
  locale: string,
  fallback: string,
): string {
  if (!localization) return fallback;
  const localized = locale === 'en' ? localization.en : localization.vi;
  return localized || fallback;
}

export interface NewsListResponse {
  data: NewsArticle[];
  total: number;
  page: number;
  limit: number;
}

export interface GetNewsListParams {
  page?: number;
  limit?: number;
}
