import { Review } from './review';
import { ReviewStatus } from './review-status.enum';
import { FitLevel } from './fit-level.enum';
import { PaginateResult } from 'mongoose';

/**
 * Query options for reviews
 */
export interface ReviewQueryOptions {
  productId?: string;
  status?: ReviewStatus;
  rating?: number;
  fitLevel?: FitLevel;
  heightCm?: number;
  weightKg?: number;
  keyword?: string;
  sortBy?: 'newest' | 'highest' | 'lowest';
}

/**
 * Review repository interface
 */
export abstract class ReviewRepository {
  /**
   * Create a new review
   */
  abstract create(
    data: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Review>;

  /**
   * Find review by ID
   */
  abstract findById(id: string): Promise<Review | null>;

  /**
   * Find review by order ID (unique constraint)
   */
  abstract findByOrderId(orderId: string): Promise<Review | null>;

  /**
   * Find review by order number
   */
  abstract findByOrderNumber(orderNumber: string): Promise<Review | null>;

  /**
   * Find all reviews by user ID
   */
  abstract findByUserId(userId: string): Promise<Review[]>;

  /**
   * Find reviews for a product (includes variants)
   */
  abstract findByProductId(
    productId: string,
    options: ReviewQueryOptions,
    page: number,
    limit: number,
  ): Promise<PaginateResult<Review>>;

  /**
   * Find all reviews with filters (CMS)
   */
  abstract findAll(
    options: ReviewQueryOptions,
    page: number,
    limit: number,
  ): Promise<PaginateResult<Review>>;

  /**
   * Delete review
   */
  abstract delete(id: string): Promise<boolean>;

  /**
   * Get all product IDs from reviews (for stats calculation)
   */
  abstract getProductIdsFromReview(reviewId: string): Promise<string[]>;

  /**
   * Calculate review stats for a product
   */
  abstract calculateProductStats(
    productId: string,
  ): Promise<{ averageRating: number; reviewCount: number }>;

  /**
   * Update status of a specific product review within a review
   * @param reviewId - Review ID
   * @param productId - Product ID within the review
   * @param status - New status
   */
  abstract updateProductReviewStatus(
    reviewId: string,
    productId: string,
    status: ReviewStatus,
  ): Promise<Review | null>;

  /**
   * Find all product reviews flattened (CMS) using aggregation
   * Returns each product review as a separate document
   */
  abstract findAllFlattened(
    options: ReviewQueryOptions,
    page: number,
    limit: number,
  ): Promise<{
    data: any[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>;

  /**
   * Update thumbnail URL for a specific media item in a product review
   * @param reviewId - Review ID
   * @param productIndex - Index of the product review in the array
   * @param mediaIndex - Index of the media item in the array
   * @param thumbnailUrl - Thumbnail URL to set
   */
  abstract updateMediaThumbnail(
    reviewId: string,
    productIndex: number,
    mediaIndex: number,
    thumbnailUrl: string,
  ): Promise<boolean>;
}
