import type {
  GetReviewsRequest,
  GetReviewsResponse,
  CmsProductReview,
  ToggleVisibilityRequest,
  CreateCmsReviewRequest,
} from 'src/types/reviews';
import axiosInstance from 'src/utils/axios';

/**
 * Map backend response to frontend format
 */
const mapToFrontend = (item: any): CmsProductReview => ({
  reviewId: item.reviewId,
  productId: item.productId,
  variantId: item.variantId || null,
  productName: item.productName,
  productImage: item.productImage || null,
  rating: item.rating,
  heightCm: item.heightCm,
  weightKg: item.weightKg,
  fitLevel: item.fitLevel,
  content: item.content || null,
  media: item.media || [],
  status: item.status,
  orderNumber: item.orderNumber,
  nhanhOrderId: item.nhanhOrderId || null,
  orderId: item.orderId,
  userName: item.userName,
  createdAt: item.createdAt,
});

/**
 * Review Repository
 * Handles CMS review API calls
 */
class ReviewRepository {
  /**
   * Get reviews with filters and pagination
   */
  getReviews = async (params: GetReviewsRequest): Promise<GetReviewsResponse> => {
    const { page = 1, limit = 10, filters } = params;

    const queryParams: Record<string, string | number> = {
      page,
      limit,
    };

    if (filters) {
      if (filters.keyword) queryParams.keyword = filters.keyword;
      if (filters.status) queryParams.status = filters.status;
      if (filters.rating) queryParams.rating = filters.rating;
      if (filters.fitLevel) queryParams.fitLevel = filters.fitLevel;
      if (filters.height) queryParams.heightCm = filters.height;
      if (filters.weight) queryParams.weightKg = filters.weight;
      if (filters.sortBy) queryParams.sortBy = filters.sortBy;
    }

    const response = await axiosInstance.get<any>('/reviews', {
      params: queryParams,
    });

    const data = response.data;

    return {
      data: (data.data || []).map(mapToFrontend),
      total: data.total || 0,
      page: data.page || page,
      limit: data.limit || limit,
      totalPages: data.totalPages || Math.ceil((data.total || 0) / limit),
    };
  };

  /**
   * Toggle product review visibility
   */
  toggleVisibility = async (
    reviewId: string,
    productId: string,
    body: ToggleVisibilityRequest
  ): Promise<any> => {
    const response = await axiosInstance.patch<any>(
      `/reviews/${reviewId}/products/${productId}/visibility`,
      body
    );
    return response.data;
  };

  /**
   * Create seeding review (CMS)
   */
  createReview = async (data: CreateCmsReviewRequest): Promise<any> => {
    const response = await axiosInstance.post<any>('/reviews', data);
    return response.data;
  };
}

export const reviewRepository = new ReviewRepository();
