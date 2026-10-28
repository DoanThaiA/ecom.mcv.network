import { describe, it, expect } from 'vitest';
import type {
  NewsStatus,
  News,
  CreateNewsRequest,
  UpdateNewsRequest,
  GetNewsListRequest,
  GetNewsListResponse,
  NewsPagination,
} from 'src/types/news';

describe('News Types', () => {
  describe('NewsStatus', () => {
    it('accepts active status', () => {
      const status: NewsStatus = 'active';
      expect(status).toBe('active');
    });

    it('accepts inactive status', () => {
      const status: NewsStatus = 'inactive';
      expect(status).toBe('inactive');
    });
  });

  describe('News', () => {
    it('has all required properties', () => {
      const news: News = {
        id: '1',
        title: 'Test News',
        content: '<p>Test content</p>',
        thumbnail: 'https://image.url',
        status: 'active',
        publishedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(news.id).toBe('1');
      expect(news.title).toBe('Test News');
      expect(news.content).toBe('<p>Test content</p>');
    });

    it('has string id', () => {
      const news: News = {
        id: 'news-123',
        title: 'Test',
        content: 'Content',
        thumbnail: 'url',
        status: 'active',
        publishedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(typeof news.id).toBe('string');
    });

    it('content can be HTML', () => {
      const news: News = {
        id: '1',
        title: 'Test',
        content: '<div><h1>Title</h1><p>Paragraph</p></div>',
        thumbnail: 'url',
        status: 'active',
        publishedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(news.content).toContain('<h1>');
    });

    it('status can be active or inactive', () => {
      const activeNews: News = {
        id: '1',
        title: 'Test',
        content: 'Content',
        thumbnail: 'url',
        status: 'active',
        publishedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(activeNews.status).toBe('active');

      const inactiveNews: News = { ...activeNews, status: 'inactive' };
      expect(inactiveNews.status).toBe('inactive');
    });
  });

  describe('CreateNewsRequest', () => {
    it('has required properties', () => {
      const request: CreateNewsRequest = {
        title: 'New Article',
        content: '<p>Content</p>',
        thumbnail: 'https://thumb.url',
        status: 'active',
      };
      expect(request.title).toBe('New Article');
      expect(request.content).toBe('<p>Content</p>');
      expect(request.thumbnail).toBe('https://thumb.url');
      expect(request.status).toBe('active');
    });

    it('has optional publishedAt', () => {
      const request: CreateNewsRequest = {
        title: 'Test',
        content: 'Content',
        thumbnail: 'url',
        status: 'active',
        publishedAt: '2024-01-01T00:00:00Z',
      };
      expect(request.publishedAt).toBe('2024-01-01T00:00:00Z');
    });

    it('works without publishedAt', () => {
      const request: CreateNewsRequest = {
        title: 'Test',
        content: 'Content',
        thumbnail: 'url',
        status: 'inactive',
      };
      expect(request.publishedAt).toBeUndefined();
    });
  });

  describe('UpdateNewsRequest', () => {
    it('extends CreateNewsRequest', () => {
      const request: UpdateNewsRequest = {
        id: 'news-1',
        title: 'Updated Article',
        content: '<p>Updated content</p>',
        thumbnail: 'https://new-thumb.url',
        status: 'active',
      };
      expect(request.id).toBe('news-1');
      expect(request.title).toBe('Updated Article');
    });

    it('includes all CreateNewsRequest properties', () => {
      const request: UpdateNewsRequest = {
        id: '1',
        title: 'Test',
        content: 'Content',
        thumbnail: 'url',
        status: 'active',
        publishedAt: '2024-01-01T00:00:00Z',
      };
      expect(request).toHaveProperty('title');
      expect(request).toHaveProperty('content');
      expect(request).toHaveProperty('thumbnail');
      expect(request).toHaveProperty('status');
      expect(request).toHaveProperty('publishedAt');
    });
  });

  describe('GetNewsListRequest', () => {
    it('has required pagination properties', () => {
      const request: GetNewsListRequest = {
        page: 1,
        limit: 10,
      };
      expect(request.page).toBe(1);
      expect(request.limit).toBe(10);
    });

    it('has optional search property', () => {
      const request: GetNewsListRequest = {
        page: 1,
        limit: 20,
        search: 'keyword',
      };
      expect(request.search).toBe('keyword');
    });

    it('works without search', () => {
      const request: GetNewsListRequest = {
        page: 2,
        limit: 15,
      };
      expect(request.search).toBeUndefined();
    });
  });

  describe('GetNewsListResponse', () => {
    it('has all required properties', () => {
      const response: GetNewsListResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      expect(response.data).toEqual([]);
      expect(response.total).toBe(0);
      expect(response.page).toBe(1);
      expect(response.limit).toBe(10);
      expect(response.totalPages).toBe(0);
    });

    it('data contains News items', () => {
      const news: News = {
        id: '1',
        title: 'Test',
        content: 'Content',
        thumbnail: 'url',
        status: 'active',
        publishedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      const response: GetNewsListResponse = {
        data: [news],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      expect(response.data).toHaveLength(1);
      expect(response.data[0]).toEqual(news);
    });

    it('calculates correct pagination', () => {
      const response: GetNewsListResponse = {
        data: [],
        total: 45,
        page: 2,
        limit: 20,
        totalPages: 3,
      };
      expect(response.total).toBe(45);
      expect(response.page).toBe(2);
      expect(response.limit).toBe(20);
      expect(response.totalPages).toBe(3);
    });
  });

  describe('NewsPagination', () => {
    it('has all pagination properties', () => {
      const pagination: NewsPagination = {
        page: 1,
        limit: 10,
        total: 100,
        totalPages: 10,
      };
      expect(pagination.page).toBe(1);
      expect(pagination.limit).toBe(10);
      expect(pagination.total).toBe(100);
      expect(pagination.totalPages).toBe(10);
    });

    it('represents current page state', () => {
      const pagination: NewsPagination = {
        page: 5,
        limit: 25,
        total: 200,
        totalPages: 8,
      };
      expect(pagination.page).toBe(5);
      expect(pagination.totalPages).toBe(8);
    });
  });

  describe('Type exports', () => {
    it('exports NewsStatus type', () => {
      const status: NewsStatus = 'active';
      expect(status).toBeDefined();
    });

    it('exports News interface', () => {
      const news: News = {
        id: '1',
        title: 'Test',
        content: 'Content',
        thumbnail: 'url',
        status: 'active',
        publishedAt: '2024-01-01T00:00:00Z',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z',
      };
      expect(news).toBeDefined();
    });

    it('exports CreateNewsRequest interface', () => {
      const request: CreateNewsRequest = {
        title: 'Test',
        content: 'Content',
        thumbnail: 'url',
        status: 'active',
      };
      expect(request).toBeDefined();
    });

    it('exports UpdateNewsRequest interface', () => {
      const request: UpdateNewsRequest = {
        id: '1',
        title: 'Test',
        content: 'Content',
        thumbnail: 'url',
        status: 'active',
      };
      expect(request).toBeDefined();
    });

    it('exports GetNewsListRequest interface', () => {
      const request: GetNewsListRequest = {
        page: 1,
        limit: 10,
      };
      expect(request).toBeDefined();
    });

    it('exports GetNewsListResponse interface', () => {
      const response: GetNewsListResponse = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      expect(response).toBeDefined();
    });

    it('exports NewsPagination interface', () => {
      const pagination: NewsPagination = {
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };
      expect(pagination).toBeDefined();
    });
  });
});
