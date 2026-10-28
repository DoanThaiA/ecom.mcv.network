/**
 * CMS Review Types
 * Flattened product reviews for CMS table (each row = 1 product review)
 */

import type {
  ReviewStatus as ProtoReviewStatus,
  FitLevel as ProtoFitLevel,
} from 'src/types/gen/shared/shared/reviews/review';

// Re-export proto types
export { ReviewStatus, FitLevel } from 'src/types/gen/shared/shared/reviews/review';

/**
 * Review media
 */
export interface ReviewMedia {
  url: string;
  type: 'image' | 'video';
  thumbnail?: string | null;
}

/**
 * CMS Product Review - flattened (each row in table)
 */
export interface CmsProductReview {
  reviewId: string;
  productId: string;
  variantId?: string | null;
  productName: string;
  productImage?: string | null;
  rating: number;
  heightCm: number;
  weightKg: number;
  fitLevel: number;
  content?: string | null;
  media: ReviewMedia[];
  status: string;
  orderNumber: string;
  nhanhOrderId?: number | null;
  userName: string;
  createdAt: string;
  orderId?: string;
}

/**
 * Review Filters
 */
export interface ReviewFilters {
  keyword?: string;
  status?: string;
  rating?: number;
  fitLevel?: number;
  height?: number;
  weight?: number;
  sortBy?: 'newest' | 'highest' | 'lowest';
}

/**
 * Get Reviews Request
 */
export interface GetReviewsRequest {
  page: number;
  limit: number;
  filters?: ReviewFilters;
}

/**
 * Get Reviews Response
 */
export interface GetReviewsResponse {
  data: CmsProductReview[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Toggle Visibility Request
 */
export interface ToggleVisibilityRequest {
  visible?: boolean;
}

/**
 * Create CMS Product Review Request (cho seeding)
 */
export interface CreateCmsProductReviewRequest {
  productId: string;
  variantId?: string;
  rating: number;
  heightCm: number;
  weightKg: number;
  fitLevel: number;
  content?: string;
  mediaIds?: string[];
}

/**
 * Create CMS Review Request (cho seeding)
 */
export interface CreateCmsReviewRequest {
  userName: string;
  productReviews: CreateCmsProductReviewRequest[];
}

/**
 * Helper: Get status color
 */
export const getReviewStatusColor = (status: string): 'default' | 'success' | 'error' => {
  switch (status) {
    case 'visible':
      return 'success';
    case 'hidden':
      return 'error';
    default:
      return 'default';
  }
};

/**
 * Helper: Get rating color
 */
export const getRatingColor = (rating: number): string => {
  if (rating >= 4) return '#22C55E';
  if (rating >= 3) return '#F59E0B';
  return '#EF4444';
};

/**
 * Helper: Get fit level translation key
 */
export const getFitLevelKey = (fitLevel: number): string => {
  const map: Record<number, string> = {
    3: 'fitLevelTight',
    1: 'fitLevelFit',
    2: 'fitLevelLoose',
  };
  return map[fitLevel] || 'fitLevelFit';
};
