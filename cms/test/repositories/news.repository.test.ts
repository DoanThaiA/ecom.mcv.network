import { describe, it, expect, beforeEach, vi } from 'vitest';
import { newsRepository } from 'src/repositories/news.repository';

// Mock setTimeout to avoid actual delays in tests
vi.useFakeTimers();

describe('newsRepository', () => {
  beforeEach(() => {
    vi.clearAllTimers();
  });

  it('exports newsRepository instance', () => {
    expect(newsRepository).toBeDefined();
    expect(newsRepository).toHaveProperty('getNewsList');
    expect(newsRepository).toHaveProperty('getNewsById');
    expect(newsRepository).toHaveProperty('createNews');
    expect(newsRepository).toHaveProperty('updateNews');
    expect(newsRepository).toHaveProperty('deleteNews');
  });

  describe('getNewsList', () => {
    it('returns paginated news list with default params', async () => {
      const promise = newsRepository.getNewsList({ page: 1, limit: 10 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('total');
      expect(result).toHaveProperty('page');
      expect(result).toHaveProperty('limit');
      expect(result).toHaveProperty('totalPages');
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('returns correct page with pagination', async () => {
      const promise = newsRepository.getNewsList({ page: 2, limit: 5 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.page).toBe(2);
      expect(result.limit).toBe(5);
      expect(result.data.length).toBeLessThanOrEqual(5);
    });

    it('filters news by search term', async () => {
      const promise = newsRepository.getNewsList({
        page: 1,
        limit: 10,
        search: 'khách hàng',
      });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.data.every((news) => news.title.toLowerCase().includes('khách hàng'))).toBe(
        true
      );
    });

    it('returns empty array when search has no matches', async () => {
      const promise = newsRepository.getNewsList({
        page: 1,
        limit: 10,
        search: 'nonexistent-search-term-xyz',
      });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.data).toEqual([]);
      expect(result.total).toBe(0);
    });

    it('sorts news by publishedAt descending', async () => {
      const promise = newsRepository.getNewsList({ page: 1, limit: 10 });
      await vi.runAllTimersAsync();
      const result = await promise;

      for (let i = 0; i < result.data.length - 1; i++) {
        const current = new Date(result.data[i].publishedAt).getTime();
        const next = new Date(result.data[i + 1].publishedAt).getTime();
        expect(current).toBeGreaterThanOrEqual(next);
      }
    });

    it('calculates totalPages correctly', async () => {
      const promise = newsRepository.getNewsList({ page: 1, limit: 3 });
      await vi.runAllTimersAsync();
      const result = await promise;

      const expectedPages = Math.ceil(result.total / 3);
      expect(result.totalPages).toBe(expectedPages);
    });

    it('returns correct slice of data for page 1', async () => {
      const promise = newsRepository.getNewsList({ page: 1, limit: 3 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.data.length).toBeLessThanOrEqual(3);
    });

    it('returns correct slice of data for page 2', async () => {
      const promise = newsRepository.getNewsList({ page: 2, limit: 3 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.data.length).toBeLessThanOrEqual(3);
    });

    it('handles large limit that exceeds total items', async () => {
      const promise = newsRepository.getNewsList({ page: 1, limit: 1000 });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.data.length).toBe(result.total);
      expect(result.totalPages).toBe(1);
    });

    it('handles search with mixed case', async () => {
      const promise = newsRepository.getNewsList({
        page: 1,
        limit: 10,
        search: 'CHÍNH SÁCH',
      });
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data.every((news) => news.title.toLowerCase().includes('chính sách'))).toBe(
        true
      );
    });
  });

  describe('getNewsById', () => {
    it('returns news when ID exists', async () => {
      const promise = newsRepository.getNewsById('1');
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
    });

    it('returns null when ID does not exist', async () => {
      const promise = newsRepository.getNewsById('999');
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toBeNull();
    });

    it('returns news with all required fields', async () => {
      const promise = newsRepository.getNewsById('1');
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('title');
      expect(result).toHaveProperty('content');
      expect(result).toHaveProperty('thumbnail');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('publishedAt');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });

  describe('createNews', () => {
    it('creates news with provided data', async () => {
      const newNewsData = {
        title: 'Test News',
        content: '<p>Test content</p>',
        thumbnail: 'https://example.com/image.jpg',
        status: 'active' as const,
      };

      const promise = newsRepository.createNews(newNewsData);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result).toHaveProperty('id');
      expect(result.title).toBe(newNewsData.title);
      expect(result.content).toBe(newNewsData.content);
      expect(result.thumbnail).toBe(newNewsData.thumbnail);
      expect(result.status).toBe(newNewsData.status);
    });

    it('generates id for new news', async () => {
      const newNewsData = {
        title: 'Test News',
        content: '<p>Test</p>',
        thumbnail: 'https://example.com/image.jpg',
        status: 'active' as const,
      };

      const promise = newsRepository.createNews(newNewsData);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
    });

    it('uses provided publishedAt when specified', async () => {
      const publishedAt = '2025-01-15T00:00:00Z';
      const newNewsData = {
        title: 'Test News',
        content: '<p>Test</p>',
        thumbnail: 'https://example.com/image.jpg',
        status: 'active' as const,
        publishedAt,
      };

      const promise = newsRepository.createNews(newNewsData);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.publishedAt).toBe(publishedAt);
    });

    it('generates publishedAt when not provided', async () => {
      const newNewsData = {
        title: 'Test News',
        content: '<p>Test</p>',
        thumbnail: 'https://example.com/image.jpg',
        status: 'active' as const,
      };

      const promise = newsRepository.createNews(newNewsData);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.publishedAt).toBeDefined();
      expect(new Date(result.publishedAt).getTime()).not.toBeNaN();
    });

    it('sets createdAt and updatedAt timestamps', async () => {
      const newNewsData = {
        title: 'Test News',
        content: '<p>Test</p>',
        thumbnail: 'https://example.com/image.jpg',
        status: 'active' as const,
      };

      const promise = newsRepository.createNews(newNewsData);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(new Date(result.createdAt).getTime()).not.toBeNaN();
      expect(new Date(result.updatedAt).getTime()).not.toBeNaN();
    });

    it('adds new news to the beginning of list', async () => {
      const newNewsData = {
        title: 'Newest News',
        content: '<p>Newest</p>',
        thumbnail: 'https://example.com/new.jpg',
        status: 'active' as const,
      };

      const promise = newsRepository.createNews(newNewsData);
      await vi.runAllTimersAsync();
      const createdNews = await promise;

      const listPromise = newsRepository.getNewsList({ page: 1, limit: 1, search: 'Newest News' });
      await vi.runAllTimersAsync();
      const list = await listPromise;

      expect(list.data[0].title).toBe('Newest News');
    });
  });

  describe('updateNews', () => {
    it('updates existing news', async () => {
      const updateData = {
        title: 'Updated Title',
        content: '<p>Updated content</p>',
        thumbnail: 'https://example.com/updated.jpg',
        status: 'inactive' as const,
      };

      const promise = newsRepository.updateNews('1', updateData);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.id).toBe('1');
      expect(result.title).toBe(updateData.title);
      expect(result.content).toBe(updateData.content);
      expect(result.thumbnail).toBe(updateData.thumbnail);
      expect(result.status).toBe(updateData.status);
    });

    it('updates updatedAt timestamp', async () => {
      const updateData = {
        title: 'Updated Title',
        content: '<p>Updated</p>',
        thumbnail: 'https://example.com/image.jpg',
        status: 'active' as const,
      };

      const promise = newsRepository.updateNews('1', updateData);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.updatedAt).toBeDefined();
      expect(new Date(result.updatedAt).getTime()).not.toBeNaN();
    });

    it('uses provided publishedAt when specified', async () => {
      const newPublishedAt = '2025-02-01T00:00:00Z';
      const updateData = {
        title: 'Updated Title',
        content: '<p>Updated</p>',
        thumbnail: 'https://example.com/image.jpg',
        status: 'active' as const,
        publishedAt: newPublishedAt,
      };

      const promise = newsRepository.updateNews('1', updateData);
      await vi.runAllTimersAsync();
      const result = await promise;

      expect(result.publishedAt).toBe(newPublishedAt);
    });

    it('preserves original publishedAt when not provided', async () => {
      // Get original publishedAt
      const originalPromise = newsRepository.getNewsById('1');
      await vi.runAllTimersAsync();
      const original = await originalPromise;
      const originalPublishedAt = original?.publishedAt;

      const updateData = {
        title: 'Updated Title',
        content: '<p>Updated</p>',
        thumbnail: 'https://example.com/image.jpg',
        status: 'active' as const,
      };

      const updatePromise = newsRepository.updateNews('1', updateData);
      await vi.runAllTimersAsync();
      const result = await updatePromise;

      expect(result.publishedAt).toBe(originalPublishedAt);
    });

    it('throws error when news not found', async () => {
      const updateData = {
        title: 'Updated Title',
        content: '<p>Updated</p>',
        thumbnail: 'https://example.com/image.jpg',
        status: 'active' as const,
      };

      const promise = newsRepository.updateNews('999', updateData);
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('News not found');
    });
  });

  describe('deleteNews', () => {
    it('deletes news by id', async () => {
      // Verify news exists before deletion
      const beforePromise = newsRepository.getNewsById('1');
      await vi.runAllTimersAsync();
      const before = await beforePromise;
      expect(before).not.toBeNull();

      // Delete news
      const deletePromise = newsRepository.deleteNews('1');
      await vi.runAllTimersAsync();
      await deletePromise;

      // Verify news is deleted
      const afterPromise = newsRepository.getNewsById('1');
      await vi.runAllTimersAsync();
      const after = await afterPromise;
      expect(after).toBeNull();
    });

    it('throws error when news not found', async () => {
      const promise = newsRepository.deleteNews('999');
      await vi.runAllTimersAsync();

      await expect(promise).rejects.toThrow('News not found');
    });

    it('reduces total count after deletion', async () => {
      const beforePromise = newsRepository.getNewsList({ page: 1, limit: 1000 });
      await vi.runAllTimersAsync();
      const before = await beforePromise;
      const beforeTotal = before.total;

      const deletePromise = newsRepository.deleteNews('2');
      await vi.runAllTimersAsync();
      await deletePromise;

      const afterPromise = newsRepository.getNewsList({ page: 1, limit: 1000 });
      await vi.runAllTimersAsync();
      const after = await afterPromise;

      expect(after.total).toBe(beforeTotal - 1);
    });
  });
});
