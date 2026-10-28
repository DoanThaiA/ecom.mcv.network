import { describe, it, expect, beforeEach, vi } from 'vitest';
import { newsRepository } from '@/lib/repositories/news.repository';
import axiosInstance from '@/lib/axios';
import { API_BASE_URL } from '@/lib/config/api';

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Mock fetch for SSR methods
global.fetch = vi.fn();

describe('NewsRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockBackendArticles = Array.from({ length: 20 }, (_, i) => ({
    id: `${i + 1}`,
    title: `Article ${i + 1}`,
    content: `<p>Content ${i + 1}</p>`,
    thumbnail: `https://example.com/thumb${i + 1}.jpg`,
    status: 1,
    publishedAt: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
    createdAt: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
    updatedAt: `2024-01-${String(i + 1).padStart(2, '0')}T00:00:00Z`,
  }));

  describe('getNewsList', () => {
    it('returns paginated news with default parameters', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles.slice(0, 10),
          total: 20,
          page: 1,
          limit: 10,
          totalPages: 2,
          hasNextPage: true,
        },
      });

      const result = await newsRepository.getNewsList();

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/articles', {
        params: { page: 1, limit: 10 },
      });
      expect(result.data).toHaveLength(10);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(20);
    });

    it('returns paginated news with custom page and limit', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles.slice(5, 10),
          total: 20,
          page: 2,
          limit: 5,
          totalPages: 4,
          hasNextPage: true,
        },
      });

      const result = await newsRepository.getNewsList({ page: 2, limit: 5 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/articles', {
        params: { page: 2, limit: 5 },
      });
      expect(result.data).toHaveLength(5);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
    });

    it('returns empty array for page beyond total', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: [],
          total: 20,
          page: 100,
          limit: 10,
          totalPages: 2,
          hasNextPage: false,
        },
      });

      const result = await newsRepository.getNewsList({ page: 100, limit: 10 });

      expect(result.data).toEqual([]);
      expect(result.page).toBe(100);
    });

    it('handles a limit of one', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles.slice(0, 1),
          total: 20,
          page: 1,
          limit: 1,
          totalPages: 20,
          hasNextPage: true,
        },
      });

      const result = await newsRepository.getNewsList({ page: 1, limit: 1 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/articles', {
        params: { page: 1, limit: 1 },
      });
      expect(result.data).toHaveLength(1);
      expect(result.limit).toBe(1);
    });

    it('passes a large requested limit through to the API', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles,
          total: 20,
          page: 1,
          limit: 100,
          totalPages: 1,
          hasNextPage: false,
        },
      });

      const result = await newsRepository.getNewsList({ page: 1, limit: 100 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/articles', {
        params: { page: 1, limit: 100 },
      });
      expect(result.data).toHaveLength(20);
      expect(result.total).toBe(20);
    });

    it('maps backend articles to frontend format', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: [mockBackendArticles[0]],
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
          hasNextPage: false,
        },
      });

      const result = await newsRepository.getNewsList({ page: 1, limit: 10 });

      expect(result.data[0]).toMatchObject({
        id: '1',
        title: 'Article 1',
        content: '<p>Content 1</p>',
        thumbnail: 'https://example.com/thumb1.jpg',
      });
      expect(result.data[0].excerpt).toBeDefined();
    });
  });

  describe('getNewsById', () => {
    it('returns news article by ID', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockBackendArticles[0],
      } as Response);

      const result = await newsRepository.getNewsById('1');

      expect(fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/shop/articles/1`,
        expect.objectContaining({
          method: 'GET',
        })
      );
      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
      expect(result?.title).toBeDefined();
    });

    it('returns null for non-existent ID', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response);

      const result = await newsRepository.getNewsById('non-existent');

      expect(result).toBeNull();
    });

    it('returns null on fetch error', async () => {
      vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

      const result = await newsRepository.getNewsById('1');

      expect(result).toBeNull();
    });
  });

  describe('getFeaturedNews', () => {
    it('returns first news article', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: [mockBackendArticles[0]],
          total: 20,
          page: 1,
          limit: 1,
          totalPages: 20,
          hasNextPage: true,
        },
      });

      const result = await newsRepository.getFeaturedNews();

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/articles', {
        params: { page: 1, limit: 1 },
      });
      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
    });

    it('returns null when no articles available', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: [],
          total: 0,
          page: 1,
          limit: 1,
          totalPages: 0,
          hasNextPage: false,
        },
      });

      const result = await newsRepository.getFeaturedNews();

      expect(result).toBeNull();
    });

    it('returns null on API error', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(new Error('API error'));

      const result = await newsRepository.getFeaturedNews();

      expect(result).toBeNull();
    });
  });

  describe('getLatestNews', () => {
    it('returns latest news with default limit', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles.slice(0, 7),
          total: 20,
          page: 1,
          limit: 7,
          totalPages: 3,
          hasNextPage: true,
        },
      });

      const result = await newsRepository.getLatestNews();

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/articles', {
        params: { page: 1, limit: 7 },
      });
      // Skips first article (featured) and returns up to 6
      expect(result).toHaveLength(6);
      expect(result[0].id).toBe('2');
    });

    it('returns latest news with custom limit', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles.slice(0, 4),
          total: 20,
          page: 1,
          limit: 4,
          totalPages: 5,
          hasNextPage: true,
        },
      });

      const result = await newsRepository.getLatestNews(3);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/articles', {
        params: { page: 1, limit: 4 },
      });
      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('2');
      expect(result[1].id).toBe('3');
      expect(result[2].id).toBe('4');
    });

    it('handles a limit of one', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles.slice(0, 2),
          total: 20,
          page: 1,
          limit: 2,
          totalPages: 10,
          hasNextPage: true,
        },
      });

      const result = await newsRepository.getLatestNews(1);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/articles', {
        params: { page: 1, limit: 2 },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('handles a limit larger than the available article count', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles,
          total: 20,
          page: 1,
          limit: 101,
          totalPages: 1,
          hasNextPage: false,
        },
      });

      const result = await newsRepository.getLatestNews(100);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/articles', {
        params: { page: 1, limit: 101 },
      });
      expect(result).toHaveLength(19);
      expect(result[0].id).toBe('2');
    });
  });

  describe('getRelatedNews', () => {
    it('returns related news excluding current article', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles.slice(0, 4),
          total: 20,
          page: 1,
          limit: 4,
          totalPages: 5,
          hasNextPage: true,
        },
      });

      const result = await newsRepository.getRelatedNews('1', 3);

      expect(result).toHaveLength(3);
      expect(result.every((article) => article.id !== '1')).toBe(true);
    });

    it('returns related news with default limit', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles.slice(0, 4),
          total: 20,
          page: 1,
          limit: 4,
          totalPages: 5,
          hasNextPage: true,
        },
      });

      const result = await newsRepository.getRelatedNews('2');

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/articles', {
        params: { page: 1, limit: 4 },
      });
      expect(result).toHaveLength(3);
      expect(result.every((article) => article.id !== '2')).toBe(true);
    });

    it('excludes specified article ID', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles.slice(0, 6),
          total: 20,
          page: 1,
          limit: 6,
          totalPages: 4,
          hasNextPage: true,
        },
      });

      const result = await newsRepository.getRelatedNews('3', 5);

      expect(result.every((article) => article.id !== '3')).toBe(true);
    });

    it('handles a limit of one', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles.slice(0, 2),
          total: 20,
          page: 1,
          limit: 2,
          totalPages: 10,
          hasNextPage: true,
        },
      });

      const result = await newsRepository.getRelatedNews('1', 1);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/articles', {
        params: { page: 1, limit: 2 },
      });
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('returns the first articles when the current ID is absent', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles.slice(0, 4),
          total: 20,
          page: 1,
          limit: 4,
          totalPages: 5,
          hasNextPage: true,
        },
      });

      const result = await newsRepository.getRelatedNews('non-existent', 3);

      expect(result.map((article) => article.id)).toEqual(['1', '2', '3']);
    });

    it('handles a limit larger than the available article count', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: {
          data: mockBackendArticles,
          total: 20,
          page: 1,
          limit: 101,
          totalPages: 1,
          hasNextPage: false,
        },
      });

      const result = await newsRepository.getRelatedNews('1', 100);

      expect(axiosInstance.get).toHaveBeenCalledWith('/shop/articles', {
        params: { page: 1, limit: 101 },
      });
      expect(result).toHaveLength(19);
      expect(result.every((article) => article.id !== '1')).toBe(true);
    });
  });
});
