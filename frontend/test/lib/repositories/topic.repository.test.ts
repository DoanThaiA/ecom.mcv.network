import { describe, it, expect, beforeEach, vi } from 'vitest';
import { topicRepository } from '@/lib/repositories/topic.repository';
import axiosInstance from '@/lib/axios';
import type {
  ShopTopicListResponse,
  ShopTopicProductsResponse,
} from '@/types/gen/shop/shop/topics/topic-service';

// Mock fetch
global.fetch = vi.fn();

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('TopicRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getShopTopics', () => {
    it('fetches shop topics successfully', async () => {
      const mockResponse: ShopTopicListResponse = {
        topics: [
          { id: '1', name: 'Topic 1', slug: 'topic-1' },
          { id: '2', name: 'Topic 2', slug: 'topic-2' },
        ],
      };

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const result = await topicRepository.getShopTopics();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:3001/api/shop/topics',
        expect.objectContaining({
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          next: {
            revalidate: 300,
          },
        })
      );

      expect(result).toEqual(mockResponse);
      expect(result.topics).toHaveLength(2);
    });

    it('returns empty topics array when fetch fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await topicRepository.getShopTopics();

      expect(result).toEqual({ topics: [] });
    });

    it('returns empty topics array when fetch throws error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await topicRepository.getShopTopics();

      expect(result).toEqual({ topics: [] });
    });

    it('returns empty topics array when JSON parsing fails', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      const result = await topicRepository.getShopTopics();

      expect(result).toEqual({ topics: [] });
    });

    it('uses correct API endpoint', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ topics: [] }),
      } as Response);

      await topicRepository.getShopTopics();

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('/shop/topics'),
        expect.any(Object)
      );
    });

    it('sets revalidate to 300 seconds', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ topics: [] }),
      } as Response);

      await topicRepository.getShopTopics();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: {
            revalidate: 300,
          },
        })
      );
    });

    it('handles empty topics array response', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ topics: [] }),
      } as Response);

      const result = await topicRepository.getShopTopics();

      expect(result.topics).toEqual([]);
    });
  });

  describe('getTopicProducts', () => {
    it('fetches topic products with default pagination', async () => {
      const mockResponse: ShopTopicProductsResponse = {
        products: [
          { id: '1', name: 'Product 1' },
          { id: '2', name: 'Product 2' },
        ],
        total: 2,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await topicRepository.getTopicProducts({ slug: 'hot-deals' });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/topics/hot-deals/products',
        {
          params: {
            page: 1,
            limit: 20,
          },
        }
      );

      expect(result).toEqual(mockResponse);
      expect(result.products).toHaveLength(2);
    });

    it('fetches topic products with custom pagination', async () => {
      const mockResponse: ShopTopicProductsResponse = {
        products: [],
        total: 0,
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      await topicRepository.getTopicProducts({
        slug: 'new-arrivals',
        page: 2,
        limit: 50,
      });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/topics/new-arrivals/products',
        {
          params: {
            page: 2,
            limit: 50,
          },
        }
      );
    });

    it('handles page parameter', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      await topicRepository.getTopicProducts({
        slug: 'test-topic',
        page: 5,
      });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            page: 5,
          }),
        })
      );
    });

    it('handles limit parameter', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      await topicRepository.getTopicProducts({
        slug: 'test-topic',
        limit: 100,
      });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            limit: 100,
          }),
        })
      );
    });

    it('constructs correct URL with slug', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      await topicRepository.getTopicProducts({ slug: 'special-offers' });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/topics/special-offers/products',
        expect.any(Object)
      );
    });

    it('handles empty products response', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      const result = await topicRepository.getTopicProducts({ slug: 'empty' });

      expect(result.products).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('propagates axios errors', async () => {
      const error = new Error('Network error');
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(error);

      await expect(
        topicRepository.getTopicProducts({ slug: 'error-topic' })
      ).rejects.toThrow('Network error');
    });

    it('handles slug with special characters', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      await topicRepository.getTopicProducts({ slug: 'sale-50%-off' });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/topics/sale-50%-off/products',
        expect.any(Object)
      );
    });

    it('uses page 1 when page is 0', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      await topicRepository.getTopicProducts({
        slug: 'test',
        page: 0,
      });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            page: 0,
          }),
        })
      );
    });

    it('passes through all pagination parameters', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { products: [], total: 0 },
      });

      await topicRepository.getTopicProducts({
        slug: 'test',
        page: 3,
        limit: 30,
      });

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/topics/test/products',
        {
          params: {
            page: 3,
            limit: 30,
          },
        }
      );
    });
  });
});
