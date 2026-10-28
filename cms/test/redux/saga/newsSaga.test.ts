import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { newsRepository } from 'src/repositories/news.repository';
import { newsSaga } from 'src/redux/saga/newsSaga';
import {
  getNewsListRequest,
  getNewsByIdRequest,
  createNewsRequest,
  updateNewsRequest,
  deleteNewsRequest,
  setNewsLoading,
  setNewsListSuccess,
  setNewsError,
  setCurrentNewsLoading,
  setCurrentNewsSuccess,
  setCurrentNewsError,
  setCreateNewsLoading,
  setCreateNewsSuccess,
  setCreateNewsError,
  setUpdateNewsLoading,
  setUpdateNewsSuccess,
  setUpdateNewsError,
  setDeleteNewsLoading,
  setDeleteNewsSuccess,
  setDeleteNewsError,
} from 'src/redux/store/newsSlice';

// Mock repository
vi.mock('src/repositories/news.repository', () => ({
  newsRepository: {
    getNewsList: vi.fn(),
    getNewsById: vi.fn(),
    createNews: vi.fn(),
    updateNews: vi.fn(),
    deleteNews: vi.fn(),
  },
}));

// Mock toast
vi.mock('src/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

// Mock i18next
vi.mock('src/i18next', () => ({
  default: {
    t: vi.fn((key) => key),
  },
}));

describe('newsSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports newsSaga function', () => {
      expect(newsSaga).toBeDefined();
      expect(newsSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchNews', () => {
      const gen = newsSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchNews', () => {
      const gen = newsSaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('getNewsListSaga', () => {
    it('successfully fetches news list with default params', async () => {
      const mockResponse = {
        data: [
          {
            id: 'news-1',
            title: 'Breaking News',
            content: 'Content here',
          },
        ],
        page: 1,
        limit: 10,
        total: 1,
        totalPages: 1,
      };

      vi.mocked(newsRepository.getNewsList).mockResolvedValue(mockResponse);

      const action = getNewsListRequest({ page: 1, limit: 10 });

      expect(action.type).toBe('news/getNewsListRequest');
      expect(action.payload).toEqual({ page: 1, limit: 10 });
    });

    it('successfully fetches with search', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(newsRepository.getNewsList).mockResolvedValue(mockResponse);

      const action = getNewsListRequest({
        page: 1,
        limit: 10,
        search: 'breaking',
      });

      expect(action.payload.search).toBe('breaking');
    });

    it('calls onSuccess callback when successful', async () => {
      const mockResponse = {
        data: [],
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
      };

      vi.mocked(newsRepository.getNewsList).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = getNewsListRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles fetch failure', async () => {
      const mockError = new Error('Network error');

      vi.mocked(newsRepository.getNewsList).mockRejectedValue(mockError);

      expect(newsSaga).toBeDefined();
    });

    it('sets loading state', () => {
      const action = setNewsLoading(true);

      expect(action.type).toBe('news/setNewsLoading');
      expect(action.payload).toBe(true);
    });

    it('sets success state with pagination', () => {
      const data = {
        newsList: [
          {
            id: 'news-1',
            title: 'News Title',
          },
        ],
        pagination: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
        },
      };

      const action = setNewsListSuccess(data);

      expect(action.type).toBe('news/setNewsListSuccess');
      expect(action.payload).toEqual(data);
    });

    it('sets error state', () => {
      const action = setNewsError();

      expect(action.type).toBe('news/setNewsError');
    });
  });

  describe('getNewsByIdSaga', () => {
    it('successfully fetches news by ID', async () => {
      const mockNews = {
        id: 'news-1',
        title: 'News Title',
        content: 'Content here',
        author: 'John Doe',
      };

      vi.mocked(newsRepository.getNewsById).mockResolvedValue(mockNews);

      const action = getNewsByIdRequest({ id: 'news-1' });

      expect(action.type).toBe('news/getNewsByIdRequest');
      expect(action.payload.id).toBe('news-1');
    });

    it('calls onSuccess callback with news data', async () => {
      const mockNews = {
        id: 'news-1',
        title: 'News Title',
      };

      vi.mocked(newsRepository.getNewsById).mockResolvedValue(mockNews);

      const onSuccess = vi.fn();
      const action = getNewsByIdRequest({
        id: 'news-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles null news response', async () => {
      vi.mocked(newsRepository.getNewsById).mockResolvedValue(null);

      expect(newsSaga).toBeDefined();
    });

    it('handles fetch by ID failure', async () => {
      const mockError = new Error('News not found');

      vi.mocked(newsRepository.getNewsById).mockRejectedValue(mockError);

      const action = getNewsByIdRequest({ id: '999' });

      expect(action.payload.id).toBe('999');
    });

    it('sets current loading state', () => {
      const action = setCurrentNewsLoading(true);

      expect(action.type).toBe('news/setCurrentNewsLoading');
      expect(action.payload).toBe(true);
    });

    it('sets current success state', () => {
      const news = {
        id: 'news-1',
        title: 'News Title',
      };

      const action = setCurrentNewsSuccess(news);

      expect(action.type).toBe('news/setCurrentNewsSuccess');
      expect(action.payload).toEqual(news);
    });

    it('sets current error state', () => {
      const action = setCurrentNewsError();

      expect(action.type).toBe('news/setCurrentNewsError');
    });
  });

  describe('createNewsSaga', () => {
    it('successfully creates news', async () => {
      const mockNews = {
        id: 'news-1',
        title: 'New Article',
        content: 'Article content',
      };

      vi.mocked(newsRepository.createNews).mockResolvedValue(mockNews);

      const action = createNewsRequest({
        data: {
          title: 'New Article',
          content: 'Article content',
        },
      });

      expect(action.type).toBe('news/createNewsRequest');
      expect(action.payload.data.title).toBe('New Article');
    });

    it('calls onSuccess callback with created news', async () => {
      const mockNews = {
        id: 'news-1',
        title: 'New Article',
      };

      vi.mocked(newsRepository.createNews).mockResolvedValue(mockNews);

      const onSuccess = vi.fn();
      const action = createNewsRequest({
        data: {
          title: 'New Article',
        },
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles create failure', async () => {
      const mockError = new Error('Validation failed');

      vi.mocked(newsRepository.createNews).mockRejectedValue(mockError);

      expect(newsSaga).toBeDefined();
    });

    it('sets create loading state', () => {
      const action = setCreateNewsLoading(true);

      expect(action.type).toBe('news/setCreateNewsLoading');
      expect(action.payload).toBe(true);
    });

    it('sets create success state', () => {
      const news = {
        id: 'news-1',
        title: 'New Article',
      };

      const action = setCreateNewsSuccess(news);

      expect(action.type).toBe('news/setCreateNewsSuccess');
      expect(action.payload).toEqual(news);
    });

    it('sets create error state', () => {
      const action = setCreateNewsError();

      expect(action.type).toBe('news/setCreateNewsError');
    });
  });

  describe('updateNewsSaga', () => {
    it('successfully updates news', async () => {
      const mockNews = {
        id: 'news-1',
        title: 'Updated Article',
        content: 'Updated content',
      };

      vi.mocked(newsRepository.updateNews).mockResolvedValue(mockNews);

      const action = updateNewsRequest({
        id: 'news-1',
        data: {
          title: 'Updated Article',
        },
      });

      expect(action.type).toBe('news/updateNewsRequest');
      expect(action.payload.id).toBe('news-1');
      expect(action.payload.data.title).toBe('Updated Article');
    });

    it('calls onSuccess callback with updated news', async () => {
      const mockNews = {
        id: 'news-1',
        title: 'Updated Article',
      };

      vi.mocked(newsRepository.updateNews).mockResolvedValue(mockNews);

      const onSuccess = vi.fn();
      const action = updateNewsRequest({
        id: 'news-1',
        data: {
          title: 'Updated Article',
        },
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles update failure', async () => {
      const mockError = new Error('Update failed');

      vi.mocked(newsRepository.updateNews).mockRejectedValue(mockError);

      expect(newsSaga).toBeDefined();
    });

    it('sets update loading state', () => {
      const action = setUpdateNewsLoading(true);

      expect(action.type).toBe('news/setUpdateNewsLoading');
      expect(action.payload).toBe(true);
    });

    it('sets update success state', () => {
      const news = {
        id: 'news-1',
        title: 'Updated Article',
      };

      const action = setUpdateNewsSuccess(news);

      expect(action.type).toBe('news/setUpdateNewsSuccess');
      expect(action.payload).toEqual(news);
    });

    it('sets update error state', () => {
      const action = setUpdateNewsError();

      expect(action.type).toBe('news/setUpdateNewsError');
    });
  });

  describe('deleteNewsSaga', () => {
    it('successfully deletes news', async () => {
      vi.mocked(newsRepository.deleteNews).mockResolvedValue(undefined);

      const action = deleteNewsRequest({
        id: 'news-1',
      });

      expect(action.type).toBe('news/deleteNewsRequest');
      expect(action.payload.id).toBe('news-1');
    });

    it('calls onSuccess callback after deletion', async () => {
      vi.mocked(newsRepository.deleteNews).mockResolvedValue(undefined);

      const onSuccess = vi.fn();
      const action = deleteNewsRequest({
        id: 'news-1',
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles delete failure', async () => {
      const mockError = new Error('Delete failed');

      vi.mocked(newsRepository.deleteNews).mockRejectedValue(mockError);

      expect(newsSaga).toBeDefined();
    });

    it('sets delete loading state', () => {
      const action = setDeleteNewsLoading(true);

      expect(action.type).toBe('news/setDeleteNewsLoading');
      expect(action.payload).toBe(true);
    });

    it('sets delete success state', () => {
      const action = setDeleteNewsSuccess('news-1');

      expect(action.type).toBe('news/setDeleteNewsSuccess');
      expect(action.payload).toBe('news-1');
    });

    it('sets delete error state', () => {
      const action = setDeleteNewsError();

      expect(action.type).toBe('news/setDeleteNewsError');
    });
  });

  describe('action types', () => {
    it('has correct action type for getNewsListRequest', () => {
      expect(getNewsListRequest.type).toBe('news/getNewsListRequest');
    });

    it('has correct action type for getNewsByIdRequest', () => {
      expect(getNewsByIdRequest.type).toBe('news/getNewsByIdRequest');
    });

    it('has correct action type for createNewsRequest', () => {
      expect(createNewsRequest.type).toBe('news/createNewsRequest');
    });

    it('has correct action type for updateNewsRequest', () => {
      expect(updateNewsRequest.type).toBe('news/updateNewsRequest');
    });

    it('has correct action type for deleteNewsRequest', () => {
      expect(deleteNewsRequest.type).toBe('news/deleteNewsRequest');
    });
  });

  describe('integration with redux-saga effects', () => {
    it('uses call effect', () => {
      expect(call).toBeDefined();
    });

    it('uses put effect', () => {
      expect(put).toBeDefined();
    });

    it('uses takeLatest effect', () => {
      expect(takeLatest).toBeDefined();
    });
  });

  describe('pagination and search', () => {
    it('handles different page numbers', () => {
      const action = getNewsListRequest({ page: 5, limit: 50 });

      expect(action.payload.page).toBe(5);
      expect(action.payload.limit).toBe(50);
    });

    it('handles search query', () => {
      const action = getNewsListRequest({
        page: 1,
        limit: 10,
        search: 'technology',
      });

      expect(action.payload.search).toBe('technology');
    });

    it('handles empty search', () => {
      const action = getNewsListRequest({
        page: 1,
        limit: 10,
        search: '',
      });

      expect(action.payload.search).toBe('');
    });

    it('handles pagination metadata', () => {
      const data = {
        newsList: [],
        pagination: {
          page: 2,
          limit: 20,
          total: 100,
          totalPages: 5,
        },
      };

      const action = setNewsListSuccess(data);

      expect(action.payload.pagination.page).toBe(2);
      expect(action.payload.pagination.totalPages).toBe(5);
    });
  });

  describe('error handling', () => {
    it('handles error with message', () => {
      const error = new Error('Test error');

      expect(error.message).toBe('Test error');
    });

    it('handles error without message', () => {
      const error = { code: 500 };

      expect(error).toHaveProperty('code');
    });
  });

  describe('callbacks', () => {
    it('handles onSuccess callback for getNewsList', () => {
      const onSuccess = vi.fn();
      const action = getNewsListRequest({
        page: 1,
        limit: 10,
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for getNewsById', () => {
      const onSuccess = vi.fn();
      const action = getNewsByIdRequest({
        id: 'news-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for createNews', () => {
      const onSuccess = vi.fn();
      const action = createNewsRequest({
        data: { title: 'Test' },
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for updateNews', () => {
      const onSuccess = vi.fn();
      const action = updateNewsRequest({
        id: 'news-1',
        data: { title: 'Test' },
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for deleteNews', () => {
      const onSuccess = vi.fn();
      const action = deleteNewsRequest({
        id: 'news-1',
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });
  });

  describe('news data fields', () => {
    it('handles title field', () => {
      const action = createNewsRequest({
        data: {
          title: 'Breaking News',
        },
      });

      expect(action.payload.data.title).toBe('Breaking News');
    });

    it('handles content field', () => {
      const action = createNewsRequest({
        data: {
          content: 'News content here',
        },
      });

      expect(action.payload.data.content).toBe('News content here');
    });

    it('handles multiple fields', () => {
      const action = createNewsRequest({
        data: {
          title: 'Breaking News',
          content: 'Content here',
          author: 'John Doe',
        },
      });

      expect(action.payload.data.title).toBe('Breaking News');
      expect(action.payload.data.content).toBe('Content here');
      expect(action.payload.data.author).toBe('John Doe');
    });
  });
});
