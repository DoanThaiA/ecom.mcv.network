import { describe, it, expect, beforeEach, vi } from 'vitest';
import { reviewRepository } from '@/lib/repositories/review.repository';
import axiosInstance from '@/lib/axios';
import type {
  FrontendReview,
  CreateReviewPayload,
} from '@/lib/utils/reviewConverter';
import {
  convertGeneratedReviewToFrontend,
  convertPayloadToDto,
} from '@/lib/utils/reviewConverter';
import type {
  Review as GeneratedReview,
  ReviewListResponse,
} from '@/types/gen/shared/shared/reviews/review';
import { REVIEW_CONSTANTS } from '@/lib/constants/review';

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

// Mock reviewConverter
vi.mock('@/lib/utils/reviewConverter', () => ({
  convertGeneratedReviewToFrontend: vi.fn(),
  convertPayloadToDto: vi.fn(),
}));

describe('ReviewRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createReview', () => {
    it('creates review successfully', async () => {
      const payload: Omit<CreateReviewPayload, 'onSuccess'> = {
        orderNumber: 'ORD-001',
        products: [
          {
            productId: 'prod-1',
            variantId: 'var-1',
            rating: 5,
            comment: 'Great product!',
          },
        ],
      };

      const mockDto = { orderNumber: 'ORD-001', products: [] };
      const mockGeneratedReview: GeneratedReview = {
        id: 'review-123',
        orderNumber: 'ORD-001',
      } as GeneratedReview;

      const mockFrontendReviews: FrontendReview[] = [
        {
          id: 'review-123',
          productId: 'prod-1',
          rating: 5,
        } as FrontendReview,
      ];

      vi.mocked(convertPayloadToDto).mockReturnValueOnce(mockDto);
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockGeneratedReview,
      });
      vi.mocked(convertGeneratedReviewToFrontend).mockReturnValueOnce(
        mockFrontendReviews
      );

      const result = await reviewRepository.createReview(payload);

      expect(convertPayloadToDto).toHaveBeenCalledWith(payload);
      expect(axiosInstance.post).toHaveBeenCalledWith('/shop/reviews', mockDto);
      expect(convertGeneratedReviewToFrontend).toHaveBeenCalledWith(
        mockGeneratedReview
      );
      expect(result).toEqual(mockFrontendReviews[0]);
    });

    it('handles multiple products in payload', async () => {
      const payload: Omit<CreateReviewPayload, 'onSuccess'> = {
        orderNumber: 'ORD-002',
        products: [
          {
            productId: 'prod-1',
            rating: 4,
            comment: 'Good',
          },
          {
            productId: 'prod-2',
            rating: 5,
            comment: 'Excellent',
          },
        ],
      };

      vi.mocked(convertPayloadToDto).mockReturnValueOnce({});
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: {} as GeneratedReview,
      });
      vi.mocked(convertGeneratedReviewToFrontend).mockReturnValueOnce([
        { id: 'review-1', productId: 'prod-1' } as FrontendReview,
        { id: 'review-2', productId: 'prod-2' } as FrontendReview,
      ]);

      const result = await reviewRepository.createReview(payload);

      // Should return first review
      expect(result.id).toBe('review-1');
    });

    it('propagates API errors', async () => {
      const payload: Omit<CreateReviewPayload, 'onSuccess'> = {
        orderNumber: 'ORD-001',
        products: [],
      };

      vi.mocked(convertPayloadToDto).mockReturnValueOnce({});
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Review creation failed')
      );

      await expect(reviewRepository.createReview(payload)).rejects.toThrow(
        'Review creation failed'
      );
    });
  });

  describe('getProductReviews', () => {
    it('fetches product reviews with default pagination', async () => {
      const defaultPageSize = REVIEW_CONSTANTS.DEFAULT_PAGE_SIZE;
      const mockResponse: ReviewListResponse = {
        data: [
          { id: 'review-1', productId: 'prod-1' } as GeneratedReview,
          { id: 'review-2', productId: 'prod-1' } as GeneratedReview,
        ],
        total: 2,
        page: 1,
        limit: defaultPageSize,
        totalPages: 1,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });
      vi.mocked(convertGeneratedReviewToFrontend)
        .mockReturnValueOnce([
          { id: 'review-1', rating: 5 } as FrontendReview,
        ])
        .mockReturnValueOnce([
          { id: 'review-2', rating: 4 } as FrontendReview,
        ]);

      const result = await reviewRepository.getProductReviews('prod-1');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/products/prod-1/reviews',
        {
          params: {
            page: 1,
            limit: defaultPageSize,
          },
        }
      );

      expect(result).toEqual({
        reviews: [
          { id: 'review-1', rating: 5 },
          { id: 'review-2', rating: 4 },
        ],
        total: 2,
        page: 1,
        pageSize: defaultPageSize,
        totalPages: 1,
        hasMore: false,
      });
    });

    it('fetches product reviews with custom pagination', async () => {
      const mockResponse: ReviewListResponse = {
        data: [],
        total: 50,
        page: 2,
        limit: 20,
        totalPages: 3,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await reviewRepository.getProductReviews('prod-2', 2, 20);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/products/prod-2/reviews',
        {
          params: {
            page: 2,
            limit: 20,
          },
        }
      );

      expect(result.page).toBe(2);
      expect(result.pageSize).toBe(20);
      expect(result.hasMore).toBe(true); // page 2 < totalPages 3
    });

    it('indicates no more pages when on last page', async () => {
      const mockResponse: ReviewListResponse = {
        data: [],
        total: 30,
        page: 3,
        limit: 10,
        totalPages: 3,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await reviewRepository.getProductReviews('prod-3', 3, 10);

      expect(result.hasMore).toBe(false); // page 3 === totalPages 3
    });

    it('handles empty reviews', async () => {
      const mockResponse: ReviewListResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await reviewRepository.getProductReviews('prod-4');

      expect(result.reviews).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('converts all generated reviews to frontend format', async () => {
      const mockResponse: ReviewListResponse = {
        data: [
          { id: 'review-1' } as GeneratedReview,
          { id: 'review-2' } as GeneratedReview,
        ],
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });
      vi.mocked(convertGeneratedReviewToFrontend)
        .mockReturnValueOnce([{ id: 'fe-1' } as FrontendReview])
        .mockReturnValueOnce([{ id: 'fe-2' } as FrontendReview]);

      await reviewRepository.getProductReviews('prod-1');

      expect(convertGeneratedReviewToFrontend).toHaveBeenCalledTimes(2);
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Product not found')
      );

      await expect(
        reviewRepository.getProductReviews('invalid-id')
      ).rejects.toThrow('Product not found');
    });
  });

  describe('getOrderReview', () => {
    it('fetches order review successfully', async () => {
      const mockGeneratedReview: GeneratedReview = {
        id: 'review-123',
        orderNumber: 'ORD-001',
      } as GeneratedReview;

      const mockFrontendReviews: FrontendReview[] = [
        { id: 'review-123', rating: 5 } as FrontendReview,
      ];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockGeneratedReview,
      });
      vi.mocked(convertGeneratedReviewToFrontend).mockReturnValueOnce(
        mockFrontendReviews
      );

      const result = await reviewRepository.getOrderReview('ORD-001');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/reviews/order/ORD-001'
      );
      expect(result).toEqual(mockFrontendReviews);
    });

    it('returns null on 404 error', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce({
        response: { status: 404 },
      });

      const result = await reviewRepository.getOrderReview('ORD-999');

      expect(result).toBeNull();
    });

    it('throws error on non-404 errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce({
        response: { status: 500 },
        message: 'Server error',
      });

      await expect(
        reviewRepository.getOrderReview('ORD-001')
      ).rejects.toMatchObject({
        response: { status: 500 },
      });
    });

    it('throws error when error has no response', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Network error')
      );

      await expect(
        reviewRepository.getOrderReview('ORD-001')
      ).rejects.toThrow('Network error');
    });
  });

  describe('checkOrderReviewed', () => {
    it('returns true when order is reviewed', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { reviewed: true },
      });

      const result = await reviewRepository.checkOrderReviewed('ORD-001');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/reviews/check/ORD-001'
      );
      expect(result).toBe(true);
    });

    it('returns false when order is not reviewed', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { reviewed: false },
      });

      const result = await reviewRepository.checkOrderReviewed('ORD-002');

      expect(result).toBe(false);
    });

    it('returns false on 404 error', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce({
        response: { status: 404 },
      });

      const result = await reviewRepository.checkOrderReviewed('ORD-999');

      expect(result).toBe(false);
    });

    it('returns false on any other error', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await reviewRepository.checkOrderReviewed('ORD-001');

      expect(result).toBe(false);
    });

    it('returns false on 500 error', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce({
        response: { status: 500 },
      });

      const result = await reviewRepository.checkOrderReviewed('ORD-001');

      expect(result).toBe(false);
    });
  });

  describe('getReviewStats', () => {
    it('fetches review stats from product API', async () => {
      const mockStats = { averageRating: 4.5, reviewCount: 10 };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { reviewStats: mockStats },
      });

      const result = await reviewRepository.getReviewStats('prod-1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/products/prod-1');
      expect(result).toEqual(mockStats);
    });

    it('returns default stats when reviewStats is missing', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {},
      });

      const result = await reviewRepository.getReviewStats('prod-1');

      expect(result).toEqual({
        averageRating: 0,
        reviewCount: 0,
      });
    });
  });

  describe('getUserReviews', () => {
    it('fetches user reviews successfully', async () => {
      const mockGeneratedReviews: GeneratedReview[] = [
        { id: 'review-1' } as GeneratedReview,
        { id: 'review-2' } as GeneratedReview,
      ];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockGeneratedReviews,
      });
      vi.mocked(convertGeneratedReviewToFrontend)
        .mockReturnValueOnce([{ id: 'fe-1' } as FrontendReview])
        .mockReturnValueOnce([{ id: 'fe-2' } as FrontendReview]);

      const result = await reviewRepository.getUserReviews();

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/reviews/my-reviews'
      );
      expect(result).toEqual([{ id: 'fe-1' }, { id: 'fe-2' }]);
    });

    it('handles empty reviews array', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: [],
      });

      const result = await reviewRepository.getUserReviews();

      expect(result).toEqual([]);
    });

    it('converts all generated reviews to frontend format', async () => {
      const mockGeneratedReviews: GeneratedReview[] = [
        { id: 'review-1' } as GeneratedReview,
        { id: 'review-2' } as GeneratedReview,
        { id: 'review-3' } as GeneratedReview,
      ];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockGeneratedReviews,
      });
      vi.mocked(convertGeneratedReviewToFrontend)
        .mockReturnValueOnce([{ id: 'fe-1' } as FrontendReview])
        .mockReturnValueOnce([{ id: 'fe-2' } as FrontendReview])
        .mockReturnValueOnce([{ id: 'fe-3' } as FrontendReview]);

      await reviewRepository.getUserReviews();

      expect(convertGeneratedReviewToFrontend).toHaveBeenCalledTimes(3);
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Unauthorized')
      );

      await expect(reviewRepository.getUserReviews()).rejects.toThrow(
        'Unauthorized'
      );
    });
  });

  describe('getReviewStatuses', () => {
    it('maps order reviews to review statuses', async () => {
      const mockFrontendReviews: FrontendReview[] = [
        {
          id: 'review-1',
          productId: 'prod-1',
          variantId: 'var-1',
        } as FrontendReview,
        {
          id: 'review-2',
          productId: 'prod-2',
          variantId: 'var-2',
        } as FrontendReview,
      ];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {} as GeneratedReview,
      });
      vi.mocked(convertGeneratedReviewToFrontend).mockReturnValueOnce(
        mockFrontendReviews
      );

      const result = await reviewRepository.getReviewStatuses('ORD-001');

      expect(result).toEqual([
        {
          productId: 'prod-1',
          variantId: 'var-1',
          hasReview: true,
          reviewId: 'review-1',
        },
        {
          productId: 'prod-2',
          variantId: 'var-2',
          hasReview: true,
          reviewId: 'review-2',
        },
      ]);
    });

    it('returns empty array when no reviews found', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce({
        response: { status: 404 },
      });

      const result = await reviewRepository.getReviewStatuses('ORD-999');

      expect(result).toEqual([]);
    });

    it('returns empty array when reviews array is empty', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {} as GeneratedReview,
      });
      vi.mocked(convertGeneratedReviewToFrontend).mockReturnValueOnce([]);

      const result = await reviewRepository.getReviewStatuses('ORD-001');

      expect(result).toEqual([]);
    });

    it('handles reviews without variantId', async () => {
      const mockFrontendReviews: FrontendReview[] = [
        {
          id: 'review-1',
          productId: 'prod-1',
          variantId: undefined,
        } as FrontendReview,
      ];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {} as GeneratedReview,
      });
      vi.mocked(convertGeneratedReviewToFrontend).mockReturnValueOnce(
        mockFrontendReviews
      );

      const result = await reviewRepository.getReviewStatuses('ORD-001');

      expect(result[0].variantId).toBeUndefined();
      expect(result[0].hasReview).toBe(true);
    });
  });
});
