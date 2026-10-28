import { describe, it, expect, beforeEach, vi } from 'vitest';
import { shopRepository } from '@/lib/repositories/shop.repository';
import { API_BASE_URL } from '@/lib/config/api';
import axiosInstance from '@/lib/axios';
import type { ShopLandingResponse } from '@/types/gen/shop/shop/products/product';
import type {
  GetFlashSaleProductsRequest,
  ShopActiveFlashSaleResponse,
  ShopFlashSaleProductsResponse,
} from '@/types/gen/shop/shop/shop/shop';
import { fetchWithTimeout } from '@/lib/utils/fetchWithTimeout';

// Mock fetchWithTimeout
vi.mock('@/lib/utils/fetchWithTimeout', () => ({
  fetchWithTimeout: vi.fn(),
}));

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('ShopRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getLandingPageData', () => {
    it('fetches landing page data successfully', async () => {
      const mockResponse: ShopLandingResponse = {
        featuredProducts: [{ id: '1', name: 'Featured 1' }],
        latestProducts: [{ id: '2', name: 'Latest 1' }],
        categories: [{ id: 'cat-1', name: 'Category 1' }],
        topics: [{ id: 'topic-1', name: 'Topic 1' }],
        banners: undefined,
      };

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await shopRepository.getLandingPageData();

      expect(fetchWithTimeout).toHaveBeenCalledWith(`${API_BASE_URL}/shop/landing`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 60,
        },
        timeout: 5000,
      });

      expect(result).toEqual(mockResponse);
    });

    it('returns empty arrays for null/undefined properties', async () => {
      const mockResponse = {
        featuredProducts: null,
        latestProducts: undefined,
        categories: null,
        topics: undefined,
      };

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await shopRepository.getLandingPageData();

      expect(result).toEqual({
        featuredProducts: [],
        latestProducts: [],
        categories: [],
        topics: [],
        banners: undefined,
      });
    });

    it('returns empty arrays when response is not ok', async () => {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await shopRepository.getLandingPageData();

      expect(result).toEqual({
        featuredProducts: [],
        latestProducts: [],
        categories: [],
        topics: [],
        banners: undefined,
      });
    });

    it('returns empty arrays when fetch throws error', async () => {
      vi.mocked(fetchWithTimeout).mockRejectedValueOnce(new Error('Network error'));

      const result = await shopRepository.getLandingPageData();

      expect(result).toEqual({
        featuredProducts: [],
        latestProducts: [],
        categories: [],
        topics: [],
        banners: undefined,
      });
    });

    it('returns empty arrays when JSON parsing fails', async () => {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      const result = await shopRepository.getLandingPageData();

      expect(result).toEqual({
        featuredProducts: [],
        latestProducts: [],
        categories: [],
        topics: [],
        banners: undefined,
      });
    });

    it('uses correct API base URL', async () => {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          featuredProducts: [],
          latestProducts: [],
          categories: [],
          topics: [],
        }),
      } as Response);

      await shopRepository.getLandingPageData();

      expect(fetchWithTimeout).toHaveBeenCalledWith(
        expect.stringContaining('/shop/landing'),
        expect.any(Object)
      );
    });

    it('sets revalidate to 60 seconds', async () => {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          featuredProducts: [],
          latestProducts: [],
          categories: [],
          topics: [],
        }),
      } as Response);

      await shopRepository.getLandingPageData();

      expect(fetchWithTimeout).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: {
            revalidate: 60,
          },
        })
      );
    });

    it('handles partial data response', async () => {
      const mockResponse = {
        featuredProducts: [{ id: '1' }],
        latestProducts: [],
        categories: null,
        topics: [{ id: 't1' }],
      };

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await shopRepository.getLandingPageData();

      expect(result.featuredProducts).toHaveLength(1);
      expect(result.latestProducts).toEqual([]);
      expect(result.categories).toEqual([]);
      expect(result.topics).toHaveLength(1);
    });

    it('handles large data response', async () => {
      const mockResponse: ShopLandingResponse = {
        featuredProducts: Array(50)
          .fill(null)
          .map((_, i) => ({ id: `${i}` })),
        latestProducts: Array(100)
          .fill(null)
          .map((_, i) => ({ id: `${i}` })),
        categories: Array(20)
          .fill(null)
          .map((_, i) => ({ id: `cat-${i}` })),
        topics: Array(30)
          .fill(null)
          .map((_, i) => ({ id: `topic-${i}` })),
      };

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await shopRepository.getLandingPageData();

      expect(result.featuredProducts).toHaveLength(50);
      expect(result.latestProducts).toHaveLength(100);
      expect(result.categories).toHaveLength(20);
      expect(result.topics).toHaveLength(30);
    });
  });

  describe('getActiveFlashSale', () => {
    it('fetches active flash sale successfully', async () => {
      const mockResponse: ShopActiveFlashSaleResponse = {
        id: 'flash-1',
        name: 'Flash Sale 1',
        startTime: new Date('2024-01-01T00:00:00Z'),
        endTime: new Date('2024-01-01T23:59:59Z'),
        data: [{ id: 'prod-1', name: 'Product 1' } as any],
        total: 1,
        hasNextPage: false,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await shopRepository.getActiveFlashSale();

      expect(fetchWithTimeout).toHaveBeenCalledWith(`${API_BASE_URL}/shop/flash-sale`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 60,
        },
        timeout: 5000,
      });

      expect(result).toEqual(mockResponse);
    });

    it('returns null when response is not ok', async () => {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response);

      const result = await shopRepository.getActiveFlashSale();

      expect(result).toBeNull();
    });

    it('returns null when fetch throws error', async () => {
      vi.mocked(fetchWithTimeout).mockRejectedValueOnce(new Error('Network error'));

      const result = await shopRepository.getActiveFlashSale();

      expect(result).toBeNull();
    });

    it('returns null when JSON parsing fails', async () => {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      const result = await shopRepository.getActiveFlashSale();

      expect(result).toBeNull();
    });

    it('uses correct API endpoint', async () => {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '',
          name: '',
          startTime: undefined,
          endTime: undefined,
          data: [],
          total: 0,
          hasNextPage: false,
          page: 1,
          limit: 20,
          totalPages: 0,
        }),
      } as Response);

      await shopRepository.getActiveFlashSale();

      expect(fetchWithTimeout).toHaveBeenCalledWith(
        expect.stringContaining('/shop/flash-sale'),
        expect.any(Object)
      );
    });

    it('sets revalidate to 60 seconds', async () => {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          id: '',
          name: '',
          startTime: undefined,
          endTime: undefined,
          data: [],
          total: 0,
          hasNextPage: false,
          page: 1,
          limit: 20,
          totalPages: 0,
        }),
      } as Response);

      await shopRepository.getActiveFlashSale();

      expect(fetchWithTimeout).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: {
            revalidate: 60,
          },
        })
      );
    });

    it('handles null flash sale response', async () => {
      const mockResponse: ShopActiveFlashSaleResponse = {
        id: '',
        name: '',
        startTime: undefined,
        endTime: undefined,
        data: [],
        total: 0,
        hasNextPage: false,
        page: 1,
        limit: 20,
        totalPages: 0,
      };

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await shopRepository.getActiveFlashSale();

      expect(result).toEqual(mockResponse);
    });

    it('handles flash sale with many products', async () => {
      const mockResponse: ShopActiveFlashSaleResponse = {
        id: 'flash-1',
        name: 'Flash Sale 1',
        startTime: new Date(),
        endTime: new Date(),
        data: Array(100)
          .fill(null)
          .map((_, i) => ({ id: `prod-${i}` } as any)),
        total: 100,
        hasNextPage: false,
        page: 1,
        limit: 20,
        totalPages: 5,
      };

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await shopRepository.getActiveFlashSale();

      expect(result?.data).toHaveLength(100);
    });
  });

  describe('getFlashSaleProducts', () => {
    it('fetches flash sale products without filters', async () => {
      const mockResponse: ShopFlashSaleProductsResponse = {
        data: [
          { id: 'prod-1', name: 'Product 1' },
          { id: 'prod-2', name: 'Product 2' },
        ],
        total: 2,
        hasNextPage: false,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const request: GetFlashSaleProductsRequest = { page: 1, limit: 20 };

      const result = await shopRepository.getFlashSaleProducts(request);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/flash-sale/products',
        { params: { page: 1, limit: 20 } }
      );

      expect(result).toEqual(mockResponse);
    });

    it('includes filters as JSON string', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: [],
          total: 0,
          hasNextPage: false,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });

      const request: GetFlashSaleProductsRequest = {
        filters: {
          categoryId: 'cat-123',
          minPrice: 100000,
          maxPrice: 500000,
        },
      };

      await shopRepository.getFlashSaleProducts(request);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/flash-sale/products',
        {
          params: {
            filters: JSON.stringify({
              categoryId: 'cat-123',
              minPrice: 100000,
              maxPrice: 500000,
            }),
          },
        }
      );
    });

    it('handles empty filters object', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: [],
          total: 0,
          hasNextPage: false,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });

      const request: GetFlashSaleProductsRequest = {
        filters: {},
      };

      await shopRepository.getFlashSaleProducts(request);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/flash-sale/products',
        {
          params: {
            filters: JSON.stringify({}),
          },
        }
      );
    });

    it('handles undefined filters', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      const request: GetFlashSaleProductsRequest = {
        filters: undefined,
      };

      await shopRepository.getFlashSaleProducts(request);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/flash-sale/products',
        { params: {} }
      );
    });

    it('handles complex filter objects', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: [],
          total: 0,
          hasNextPage: false,
          page: 1,
          limit: 20,
          totalPages: 1,
        },
      });

      const request: GetFlashSaleProductsRequest = {
        filters: {
          categoryId: 'cat-1',
          brandIds: ['brand-1', 'brand-2'],
          minPrice: 0,
          maxPrice: 10000000,
          inStock: true,
          sortBy: 'price',
        },
      };

      await shopRepository.getFlashSaleProducts(request);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/flash-sale/products',
        expect.objectContaining({
          params: expect.objectContaining({
            filters: expect.stringContaining('categoryId'),
          }),
        })
      );
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Flash sale not found')
      );

      await expect(
        shopRepository.getFlashSaleProducts({})
      ).rejects.toThrow('Flash sale not found');
    });

    it('handles empty products response', async () => {
      const mockResponse: ShopFlashSaleProductsResponse = {
        data: [],
        total: 0,
        hasNextPage: false,
        page: 1,
        limit: 20,
        totalPages: 1,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await shopRepository.getFlashSaleProducts({});

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('handles large products response', async () => {
      const mockResponse: ShopFlashSaleProductsResponse = {
        data: Array(200)
          .fill(null)
          .map((_, i) => ({ id: `prod-${i}` })),
        total: 200,
        hasNextPage: true,
        page: 1,
        limit: 200,
        totalPages: 1,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await shopRepository.getFlashSaleProducts({});

      expect(result.data).toHaveLength(200);
      expect(result.total).toBe(200);
    });
  });
});
