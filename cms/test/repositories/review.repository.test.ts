import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reviewRepository } from 'src/repositories/review.repository';
import axiosInstance from 'src/utils/axios';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe('reviewRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports reviewRepository instance', () => {
    expect(reviewRepository).toBeDefined();
    expect(reviewRepository).toHaveProperty('getReviews');
    expect(reviewRepository).toHaveProperty('toggleVisibility');
  });

  describe('getReviews', () => {
    it('calls GET /reviews with default page and limit', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await reviewRepository.getReviews({});

      expect(axiosInstance.get).toHaveBeenCalledWith('/reviews', {
        params: {
          page: 1,
          limit: 10,
        },
      });
    });

    it('uses provided page and limit', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await reviewRepository.getReviews({ page: 2, limit: 20 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/reviews', {
        params: {
          page: 2,
          limit: 20,
        },
      });
    });

    it('includes keyword filter when provided', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await reviewRepository.getReviews({
        filters: { keyword: 'great product' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/reviews', {
        params: {
          page: 1,
          limit: 10,
          keyword: 'great product',
        },
      });
    });

    it('includes status filter when provided', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await reviewRepository.getReviews({
        filters: { status: 'visible' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/reviews', {
        params: {
          page: 1,
          limit: 10,
          status: 'visible',
        },
      });
    });

    it('includes rating filter when provided', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await reviewRepository.getReviews({
        filters: { rating: 5 },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/reviews', {
        params: {
          page: 1,
          limit: 10,
          rating: 5,
        },
      });
    });

    it('includes fitLevel filter when provided', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await reviewRepository.getReviews({
        filters: { fitLevel: 'perfect' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/reviews', {
        params: {
          page: 1,
          limit: 10,
          fitLevel: 'perfect',
        },
      });
    });

    it('includes height filter when provided', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await reviewRepository.getReviews({
        filters: { height: 170 },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/reviews', {
        params: {
          page: 1,
          limit: 10,
          heightCm: 170,
        },
      });
    });

    it('includes weight filter when provided', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await reviewRepository.getReviews({
        filters: { weight: 65 },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/reviews', {
        params: {
          page: 1,
          limit: 10,
          weightKg: 65,
        },
      });
    });

    it('includes sortBy filter when provided', async () => {
      const mockResponse = { data: { data: [], total: 0 } };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await reviewRepository.getReviews({
        filters: { sortBy: 'createdAt' },
      });

      expect(axiosInstance.get).toHaveBeenCalledWith('/reviews', {
        params: {
          page: 1,
          limit: 10,
          sortBy: 'createdAt',
        },
      });
    });

    it('maps backend response to frontend format', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              reviewId: 'r1',
              productId: 'p1',
              variantId: 'v1',
              productName: 'Product 1',
              productImage: 'image.jpg',
              rating: 5,
              heightCm: 170,
              weightKg: 65,
              fitLevel: 'perfect',
              content: 'Great product!',
              media: ['media1.jpg'],
              status: 'visible',
              orderNumber: 'ORD123',
              nhanhOrderId: 'NH123',
              orderId: 'o1',
              userName: 'John',
              createdAt: '2024-01-01',
            },
          ],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await reviewRepository.getReviews({});

      expect(result.data[0]).toEqual({
        reviewId: 'r1',
        productId: 'p1',
        variantId: 'v1',
        productName: 'Product 1',
        productImage: 'image.jpg',
        rating: 5,
        heightCm: 170,
        weightKg: 65,
        fitLevel: 'perfect',
        content: 'Great product!',
        media: ['media1.jpg'],
        status: 'visible',
        orderNumber: 'ORD123',
        nhanhOrderId: 'NH123',
        orderId: 'o1',
        userName: 'John',
        createdAt: '2024-01-01',
      });
    });

    it('handles null variantId in mapping', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              reviewId: 'r1',
              productId: 'p1',
              productName: 'Product 1',
              rating: 5,
              heightCm: 170,
              weightKg: 65,
              fitLevel: 'perfect',
              status: 'visible',
              orderNumber: 'ORD123',
              orderId: 'o1',
              userName: 'John',
              createdAt: '2024-01-01',
            },
          ],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await reviewRepository.getReviews({});

      expect(result.data[0].variantId).toBeNull();
    });

    it('handles null productImage in mapping', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              reviewId: 'r1',
              productId: 'p1',
              productName: 'Product 1',
              rating: 5,
              heightCm: 170,
              weightKg: 65,
              fitLevel: 'perfect',
              status: 'visible',
              orderNumber: 'ORD123',
              orderId: 'o1',
              userName: 'John',
              createdAt: '2024-01-01',
            },
          ],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await reviewRepository.getReviews({});

      expect(result.data[0].productImage).toBeNull();
    });

    it('handles null content in mapping', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              reviewId: 'r1',
              productId: 'p1',
              productName: 'Product 1',
              rating: 5,
              heightCm: 170,
              weightKg: 65,
              fitLevel: 'perfect',
              status: 'visible',
              orderNumber: 'ORD123',
              orderId: 'o1',
              userName: 'John',
              createdAt: '2024-01-01',
            },
          ],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await reviewRepository.getReviews({});

      expect(result.data[0].content).toBeNull();
    });

    it('handles null nhanhOrderId in mapping', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              reviewId: 'r1',
              productId: 'p1',
              productName: 'Product 1',
              rating: 5,
              heightCm: 170,
              weightKg: 65,
              fitLevel: 'perfect',
              status: 'visible',
              orderNumber: 'ORD123',
              orderId: 'o1',
              userName: 'John',
              createdAt: '2024-01-01',
            },
          ],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await reviewRepository.getReviews({});

      expect(result.data[0].nhanhOrderId).toBeNull();
    });

    it('handles empty media array in mapping', async () => {
      const mockResponse = {
        data: {
          data: [
            {
              reviewId: 'r1',
              productId: 'p1',
              productName: 'Product 1',
              rating: 5,
              heightCm: 170,
              weightKg: 65,
              fitLevel: 'perfect',
              status: 'visible',
              orderNumber: 'ORD123',
              orderId: 'o1',
              userName: 'John',
              createdAt: '2024-01-01',
            },
          ],
          total: 1,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await reviewRepository.getReviews({});

      expect(result.data[0].media).toEqual([]);
    });

    it('calculates totalPages from total and limit', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 25,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await reviewRepository.getReviews({ limit: 10 });

      expect(result.totalPages).toBe(3);
    });

    it('uses default values for missing response fields', async () => {
      const mockResponse = {
        data: {},
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await reviewRepository.getReviews({ page: 2, limit: 20 });

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(20);
      expect(result.totalPages).toBe(0);
    });
  });

  describe('toggleVisibility', () => {
    it('calls PATCH /reviews/:reviewId/products/:productId/visibility', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await reviewRepository.toggleVisibility('r1', 'p1', { visible: true });

      expect(axiosInstance.patch).toHaveBeenCalledWith(
        '/reviews/r1/products/p1/visibility',
        { visible: true }
      );
    });

    it('handles visible true', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await reviewRepository.toggleVisibility('r1', 'p1', { visible: true });

      const callArgs = vi.mocked(axiosInstance.patch).mock.calls[0][1];
      expect(callArgs).toHaveProperty('visible', true);
    });

    it('handles visible false', async () => {
      const mockResponse = { data: { success: true } };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await reviewRepository.toggleVisibility('r1', 'p1', { visible: false });

      const callArgs = vi.mocked(axiosInstance.patch).mock.calls[0][1];
      expect(callArgs).toHaveProperty('visible', false);
    });

    it('returns response data', async () => {
      const mockResult = { success: true, status: 'visible' };
      const mockResponse = { data: mockResult };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await reviewRepository.toggleVisibility('r1', 'p1', { visible: true });

      expect(result).toEqual(mockResult);
    });
  });
});
