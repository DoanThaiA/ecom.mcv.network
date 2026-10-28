import axiosInstance from "@/lib/axios";
import type {
  FrontendReview,
  CreateReviewPayload,
  ReviewStatus,
} from "@/lib/utils/reviewConverter";
import {
  convertGeneratedReviewToFrontend,
  convertPayloadToDto,
  convertPayloadsToBatchDto,
} from "@/lib/utils/reviewConverter";
import type {
  Review as GeneratedReview,
  ReviewStats,
  ReviewListResponse,
} from "@/types/gen/shared/shared/reviews/review";
import { REVIEW_CONSTANTS } from "@/lib/constants/review";

// Paginated Reviews Response
export interface PaginatedReviews {
  reviews: FrontendReview[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Review Repository
 * Handles all review-related API calls
 */

class ReviewRepository {
  /**
   * Create a product review
   * POST /shop/reviews
   */
  createReview = async (
    payload: Omit<CreateReviewPayload, "onSuccess">
  ): Promise<FrontendReview> => {
    const dto = convertPayloadToDto(payload);
    const response = await axiosInstance.post<GeneratedReview>(
      "/shop/reviews",
      dto
    );
    const reviews = convertGeneratedReviewToFrontend(response.data);
    return reviews[0]; // Return the first review (since we only submit one product at a time)
  };

  /**
   * Create multiple product reviews in a single order (batch submission)
   * POST /shop/reviews
   */
  createBatchReview = async (
    orderNumber: string,
    payloads: Array<Omit<CreateReviewPayload, "onSuccess" | "orderNumber">>
  ): Promise<FrontendReview[]> => {
    const dto = convertPayloadsToBatchDto(orderNumber, payloads);
    const response = await axiosInstance.post<GeneratedReview>(
      "/shop/reviews",
      dto
    );
    return convertGeneratedReviewToFrontend(response.data);
  };

  /**
   * Get reviews for a specific product (paginated)
   * GET /shop/products/{productId}/reviews
   */
  getProductReviews = async (
    productId: string,
    page = 1,
    pageSize = REVIEW_CONSTANTS.DEFAULT_PAGE_SIZE,
    sortBy?: string
  ): Promise<PaginatedReviews> => {
    const response = await axiosInstance.get<ReviewListResponse>(
      `/shop/products/${productId}/reviews`,
      {
        params: {
          page,
          limit: pageSize,
          ...(sortBy && { sortBy }),
        },
      }
    );

    // Convert generated reviews to frontend reviews
    const reviews: FrontendReview[] = [];
    for (const generatedReview of response.data.data) {
      reviews.push(...convertGeneratedReviewToFrontend(generatedReview));
    }

    return {
      reviews,
      total: response.data.total,
      page: response.data.page,
      pageSize: response.data.limit,
      totalPages: response.data.totalPages,
      hasMore: response.data.page < response.data.totalPages,
    };
  };

  /**
   * Check if an order has been reviewed and get the review
   * GET /shop/reviews/order/{orderNumber}
   */
  getOrderReview = async (
    orderNumber: string
  ): Promise<FrontendReview[] | null> => {
    try {
      const response = await axiosInstance.get<GeneratedReview>(
        `/shop/reviews/order/${orderNumber}`
      );
      return convertGeneratedReviewToFrontend(response.data);
    } catch (error: any) {
      // If 404, order hasn't been reviewed
      if (error?.response?.status === 404) {
        return null;
      }
      throw error;
    }
  };

  /**
   * Check if an order has been reviewed
   * GET /shop/reviews/check/{orderNumber}
   * Returns true if reviewed, false if not
   */
  checkOrderReviewed = async (orderNumber: string): Promise<boolean> => {
    try {
      const response = await axiosInstance.get<{ reviewed: boolean }>(
        `/shop/reviews/check/${orderNumber}`
      );
      return response.data.reviewed;
    } catch (error: any) {
      // If 404, order hasn't been reviewed
      if (error?.response?.status === 404) {
        return false;
      }
      // For other errors, return false to allow reviewing
      return false;
    }
  };

  /**
   * Get review statistics for a product
   * Fetches from product API endpoint which includes reviewStats
   * GET /shop/products/{productId}
   */
  getReviewStats = async (productId: string): Promise<ReviewStats> => {
    const response = await axiosInstance.get<{ reviewStats?: ReviewStats }>(
      `/shop/products/${productId}`
    );

    // Extract reviewStats from product response
    return (
      response.data.reviewStats || {
        averageRating: 0,
        reviewCount: 0,
      }
    );
  };

  /**
   * Get all reviews by the current authenticated user
   */
  getUserReviews = async (): Promise<FrontendReview[]> => {
    const response = await axiosInstance.get<GeneratedReview[]>(
      "/shop/reviews/my-reviews"
    );
    const reviews: FrontendReview[] = [];
    for (const generatedReview of response.data) {
      reviews.push(...convertGeneratedReviewToFrontend(generatedReview));
    }
    return reviews;
  };

  /**
   * Get review statuses for products in an order
   * Uses the order review endpoint to determine which products have been reviewed
   * GET /shop/reviews/order/{orderNumber}
   */
  getReviewStatuses = async (
    orderNumber: string
  ): Promise<ReviewStatus[]> => {
    const reviews = await this.getOrderReview(orderNumber);

    if (!reviews || reviews.length === 0) {
      return [];
    }

    // Map reviews to review statuses
    return reviews.map((review) => ({
      productId: review.productId,
      variantId: review.variantId,
      hasReview: true,
      reviewId: review.id,
    }));
  };
}

export const reviewRepository = new ReviewRepository();
