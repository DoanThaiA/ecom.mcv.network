import { describe, it, expect, vi } from 'vitest';

import newsReducer, {
  setNewsLoading,
  setNewsListSuccess,
  setNewsError,
  setCurrentNewsLoading,
  setCurrentNewsSuccess,
  setCurrentNewsError,
  clearCurrentNews,
  setCreateNewsLoading,
  setCreateNewsSuccess,
  setCreateNewsError,
  setUpdateNewsLoading,
  setUpdateNewsSuccess,
  setUpdateNewsError,
  setDeleteNewsLoading,
  setDeleteNewsSuccess,
  setDeleteNewsError,
  setSearchQuery,
  resetNewsState,
  getNewsListRequest,
  getNewsByIdRequest,
  createNewsRequest,
  updateNewsRequest,
  deleteNewsRequest,
  selectNewsList,
  selectCurrentNews,
  selectNewsLoading,
  selectCurrentNewsLoading,
  selectCreateNewsLoading,
  selectUpdateNewsLoading,
  selectDeleteNewsLoading,
  selectNewsPagination,
  selectNewsSearchQuery,
  type NewsState,
} from 'src/redux/store/newsSlice';
import type { News } from 'src/types/news';

describe('newsSlice', () => {
  const initialState: NewsState = {
    newsList: [],
    currentNews: null,
    loading: false,
    currentLoading: false,
    createLoading: false,
    updateLoading: false,
    deleteLoading: false,
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    searchQuery: '',
  };

  const mockNews: News = {
    id: 'news-1',
    title: 'Breaking News',
    slug: 'breaking-news',
    content: 'This is breaking news content',
    excerpt: 'Breaking news excerpt',
    thumbnail: 'https://example.com/news1.jpg',
    author: 'John Doe',
    publishedAt: '2024-01-01T00:00:00Z',
    isPublished: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  const mockNewsList: News[] = [
    mockNews,
    {
      id: 'news-2',
      title: 'Tech Update',
      slug: 'tech-update',
      content: 'Latest tech update content',
      excerpt: 'Tech news excerpt',
      thumbnail: 'https://example.com/news2.jpg',
      author: 'Jane Smith',
      publishedAt: '2024-01-02T00:00:00Z',
      isPublished: true,
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    },
  ];

  describe('reducers', () => {
    describe('setNewsLoading', () => {
      it('sets loading to true', () => {
        const state = newsReducer(initialState, setNewsLoading(true));

        expect(state.loading).toBe(true);
      });

      it('sets loading to false', () => {
        const loadingState: NewsState = {
          ...initialState,
          loading: true,
        };

        const state = newsReducer(loadingState, setNewsLoading(false));

        expect(state.loading).toBe(false);
      });
    });

    describe('setNewsListSuccess', () => {
      it('sets news list and pagination', () => {
        const payload = {
          newsList: mockNewsList,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
          },
        };

        const state = newsReducer(initialState, setNewsListSuccess(payload));

        expect(state.newsList).toEqual(mockNewsList);
        expect(state.pagination).toEqual(payload.pagination);
        expect(state.loading).toBe(false);
      });

      it('replaces existing news list', () => {
        const stateWithNews: NewsState = {
          ...initialState,
          newsList: mockNewsList,
        };

        const newNewsList: News[] = [
          {
            id: 'news-3',
            title: 'New Article',
            slug: 'new-article',
            content: 'New content',
            excerpt: 'New excerpt',
            thumbnail: 'https://example.com/news3.jpg',
            author: 'Bob Wilson',
            publishedAt: '2024-01-03T00:00:00Z',
            isPublished: false,
            createdAt: '2024-01-03T00:00:00Z',
            updatedAt: '2024-01-03T00:00:00Z',
          },
        ];

        const payload = {
          newsList: newNewsList,
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        };

        const state = newsReducer(stateWithNews, setNewsListSuccess(payload));

        expect(state.newsList).toEqual(newNewsList);
        expect(state.newsList).not.toEqual(mockNewsList);
      });
    });

    describe('setNewsError', () => {
      it('stops loading', () => {
        const loadingState: NewsState = {
          ...initialState,
          loading: true,
        };

        const state = newsReducer(loadingState, setNewsError());

        expect(state.loading).toBe(false);
      });
    });

    describe('setCurrentNewsLoading', () => {
      it('sets current loading to true', () => {
        const state = newsReducer(initialState, setCurrentNewsLoading(true));

        expect(state.currentLoading).toBe(true);
      });

      it('sets current loading to false', () => {
        const loadingState: NewsState = {
          ...initialState,
          currentLoading: true,
        };

        const state = newsReducer(loadingState, setCurrentNewsLoading(false));

        expect(state.currentLoading).toBe(false);
      });
    });

    describe('setCurrentNewsSuccess', () => {
      it('sets current news and stops loading', () => {
        const loadingState: NewsState = {
          ...initialState,
          currentLoading: true,
        };

        const state = newsReducer(loadingState, setCurrentNewsSuccess(mockNews));

        expect(state.currentNews).toEqual(mockNews);
        expect(state.currentLoading).toBe(false);
      });
    });

    describe('setCurrentNewsError', () => {
      it('stops current loading', () => {
        const loadingState: NewsState = {
          ...initialState,
          currentLoading: true,
        };

        const state = newsReducer(loadingState, setCurrentNewsError());

        expect(state.currentLoading).toBe(false);
      });
    });

    describe('clearCurrentNews', () => {
      it('clears current news', () => {
        const stateWithCurrent: NewsState = {
          ...initialState,
          currentNews: mockNews,
        };

        const state = newsReducer(stateWithCurrent, clearCurrentNews());

        expect(state.currentNews).toBe(null);
      });
    });

    describe('setCreateNewsLoading', () => {
      it('sets create loading to true', () => {
        const state = newsReducer(initialState, setCreateNewsLoading(true));

        expect(state.createLoading).toBe(true);
      });

      it('sets create loading to false', () => {
        const loadingState: NewsState = {
          ...initialState,
          createLoading: true,
        };

        const state = newsReducer(loadingState, setCreateNewsLoading(false));

        expect(state.createLoading).toBe(false);
      });
    });

    describe('setCreateNewsSuccess', () => {
      it('adds new news to beginning of list and stops loading', () => {
        const stateWithNews: NewsState = {
          ...initialState,
          newsList: mockNewsList,
          createLoading: true,
        };

        const newNews: News = {
          id: 'news-3',
          title: 'Brand New Article',
          slug: 'brand-new-article',
          content: 'Brand new content',
          excerpt: 'Brand new excerpt',
          thumbnail: 'https://example.com/news3.jpg',
          author: 'Alice Johnson',
          publishedAt: '2024-01-03T00:00:00Z',
          isPublished: true,
          createdAt: '2024-01-03T00:00:00Z',
          updatedAt: '2024-01-03T00:00:00Z',
        };

        const state = newsReducer(stateWithNews, setCreateNewsSuccess(newNews));

        expect(state.newsList).toHaveLength(3);
        expect(state.newsList[0]).toEqual(newNews);
        expect(state.createLoading).toBe(false);
      });

      it('works on empty list', () => {
        const state = newsReducer(initialState, setCreateNewsSuccess(mockNews));

        expect(state.newsList).toHaveLength(1);
        expect(state.newsList[0]).toEqual(mockNews);
      });
    });

    describe('setCreateNewsError', () => {
      it('stops create loading', () => {
        const loadingState: NewsState = {
          ...initialState,
          createLoading: true,
        };

        const state = newsReducer(loadingState, setCreateNewsError());

        expect(state.createLoading).toBe(false);
      });
    });

    describe('setUpdateNewsLoading', () => {
      it('sets update loading to true', () => {
        const state = newsReducer(initialState, setUpdateNewsLoading(true));

        expect(state.updateLoading).toBe(true);
      });
    });

    describe('setUpdateNewsSuccess', () => {
      it('updates news in list and stops loading', () => {
        const stateWithNews: NewsState = {
          ...initialState,
          newsList: mockNewsList,
          updateLoading: true,
        };

        const updatedNews: News = {
          ...mockNews,
          title: 'Updated Title',
        };

        const state = newsReducer(stateWithNews, setUpdateNewsSuccess(updatedNews));

        expect(state.newsList[0].title).toBe('Updated Title');
        expect(state.updateLoading).toBe(false);
      });

      it('updates current news if it matches', () => {
        const stateWithCurrent: NewsState = {
          ...initialState,
          newsList: mockNewsList,
          currentNews: mockNews,
        };

        const updatedNews: News = {
          ...mockNews,
          title: 'Updated Current',
        };

        const state = newsReducer(stateWithCurrent, setUpdateNewsSuccess(updatedNews));

        expect(state.currentNews?.title).toBe('Updated Current');
      });

      it('does not update current news if id does not match', () => {
        const stateWithCurrent: NewsState = {
          ...initialState,
          newsList: mockNewsList,
          currentNews: mockNews,
        };

        const updatedNews: News = {
          ...mockNewsList[1],
          title: 'Updated Other',
        };

        const state = newsReducer(stateWithCurrent, setUpdateNewsSuccess(updatedNews));

        expect(state.currentNews).toEqual(mockNews);
      });

      it('handles news not found in list', () => {
        const stateWithNews: NewsState = {
          ...initialState,
          newsList: mockNewsList,
        };

        const nonExistentNews: News = {
          id: 'news-999',
          title: 'Non Existent',
          slug: 'non-existent',
          content: 'Content',
          excerpt: 'Excerpt',
          thumbnail: '',
          author: 'Unknown',
          publishedAt: '2024-01-01T00:00:00Z',
          isPublished: false,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
        };

        const state = newsReducer(stateWithNews, setUpdateNewsSuccess(nonExistentNews));

        expect(state.newsList).toEqual(mockNewsList);
      });
    });

    describe('setUpdateNewsError', () => {
      it('stops update loading', () => {
        const loadingState: NewsState = {
          ...initialState,
          updateLoading: true,
        };

        const state = newsReducer(loadingState, setUpdateNewsError());

        expect(state.updateLoading).toBe(false);
      });
    });

    describe('setDeleteNewsLoading', () => {
      it('sets delete loading to true', () => {
        const state = newsReducer(initialState, setDeleteNewsLoading(true));

        expect(state.deleteLoading).toBe(true);
      });
    });

    describe('setDeleteNewsSuccess', () => {
      it('removes news from list and stops loading', () => {
        const stateWithNews: NewsState = {
          ...initialState,
          newsList: mockNewsList,
          deleteLoading: true,
        };

        const state = newsReducer(stateWithNews, setDeleteNewsSuccess('news-1'));

        expect(state.newsList).toHaveLength(1);
        expect(state.newsList[0].id).toBe('news-2');
        expect(state.deleteLoading).toBe(false);
      });

      it('clears current news if it matches deleted id', () => {
        const stateWithCurrent: NewsState = {
          ...initialState,
          newsList: mockNewsList,
          currentNews: mockNews,
        };

        const state = newsReducer(stateWithCurrent, setDeleteNewsSuccess('news-1'));

        expect(state.currentNews).toBe(null);
      });

      it('does not clear current news if id does not match', () => {
        const stateWithCurrent: NewsState = {
          ...initialState,
          newsList: mockNewsList,
          currentNews: mockNews,
        };

        const state = newsReducer(stateWithCurrent, setDeleteNewsSuccess('news-2'));

        expect(state.currentNews).toEqual(mockNews);
      });

      it('handles non-existent id', () => {
        const stateWithNews: NewsState = {
          ...initialState,
          newsList: mockNewsList,
        };

        const state = newsReducer(stateWithNews, setDeleteNewsSuccess('news-999'));

        expect(state.newsList).toHaveLength(2);
      });
    });

    describe('setDeleteNewsError', () => {
      it('stops delete loading', () => {
        const loadingState: NewsState = {
          ...initialState,
          deleteLoading: true,
        };

        const state = newsReducer(loadingState, setDeleteNewsError());

        expect(state.deleteLoading).toBe(false);
      });
    });

    describe('setSearchQuery', () => {
      it('sets search query', () => {
        const state = newsReducer(initialState, setSearchQuery('breaking'));

        expect(state.searchQuery).toBe('breaking');
      });

      it('replaces existing search query', () => {
        const stateWithQuery: NewsState = {
          ...initialState,
          searchQuery: 'old query',
        };

        const state = newsReducer(stateWithQuery, setSearchQuery('new query'));

        expect(state.searchQuery).toBe('new query');
      });

      it('handles empty string', () => {
        const state = newsReducer(initialState, setSearchQuery(''));

        expect(state.searchQuery).toBe('');
      });
    });

    describe('resetNewsState', () => {
      it('resets news list, loading, pagination, and search query', () => {
        const activeState: NewsState = {
          newsList: mockNewsList,
          currentNews: mockNews,
          loading: true,
          currentLoading: true,
          createLoading: true,
          updateLoading: true,
          deleteLoading: true,
          pagination: {
            page: 2,
            limit: 20,
            total: 50,
            totalPages: 3,
          },
          searchQuery: 'search term',
        };

        const state = newsReducer(activeState, resetNewsState());

        expect(state.newsList).toEqual([]);
        expect(state.loading).toBe(false);
        expect(state.pagination).toEqual(initialState.pagination);
        expect(state.searchQuery).toBe('');
      });

      it('does not reset current news', () => {
        const activeState: NewsState = {
          ...initialState,
          newsList: mockNewsList,
          currentNews: mockNews,
        };

        const state = newsReducer(activeState, resetNewsState());

        expect(state.currentNews).toEqual(mockNews);
      });

      it('does not reset CRUD loading states', () => {
        const activeState: NewsState = {
          ...initialState,
          createLoading: true,
          updateLoading: true,
          deleteLoading: true,
        };

        const state = newsReducer(activeState, resetNewsState());

        expect(state.createLoading).toBe(true);
        expect(state.updateLoading).toBe(true);
        expect(state.deleteLoading).toBe(true);
      });
    });
  });

  describe('saga actions', () => {
    describe('getNewsListRequest', () => {
      it('creates correct action type', () => {
        const action = getNewsListRequest({});

        expect(action.type).toBe('news/getNewsListRequest');
      });

      it('includes pagination in payload', () => {
        const payload = {
          page: 2,
          limit: 20,
        };

        const action = getNewsListRequest(payload);

        expect(action.payload).toEqual(payload);
      });

      it('includes search in payload', () => {
        const action = getNewsListRequest({ search: 'breaking' });

        expect(action.payload.search).toBe('breaking');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = vi.fn();
        const action = getNewsListRequest({ onSuccess });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('getNewsByIdRequest', () => {
      it('creates correct action type', () => {
        const action = getNewsByIdRequest({ id: 'news-1' });

        expect(action.type).toBe('news/getNewsByIdRequest');
      });

      it('includes id in payload', () => {
        const action = getNewsByIdRequest({ id: 'news-123' });

        expect(action.payload.id).toBe('news-123');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = vi.fn();
        const action = getNewsByIdRequest({ id: 'news-1', onSuccess });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('createNewsRequest', () => {
      it('creates correct action type', () => {
        const action = createNewsRequest({
          data: {
            title: 'New Article',
            content: 'Content',
          },
        });

        expect(action.type).toBe('news/createNewsRequest');
      });

      it('includes data in payload', () => {
        const data = {
          title: 'New Article',
          content: 'Content',
          excerpt: 'Excerpt',
        };

        const action = createNewsRequest({ data });

        expect(action.payload.data).toEqual(data);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = vi.fn();
        const action = createNewsRequest({
          data: { title: 'New', content: 'Content' },
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('updateNewsRequest', () => {
      it('creates correct action type', () => {
        const action = updateNewsRequest({
          id: 'news-1',
          data: { title: 'Updated' },
        });

        expect(action.type).toBe('news/updateNewsRequest');
      });

      it('includes id and data in payload', () => {
        const action = updateNewsRequest({
          id: 'news-1',
          data: { title: 'Updated Title' },
        });

        expect(action.payload.id).toBe('news-1');
        expect(action.payload.data).toEqual({ title: 'Updated Title' });
      });

      it('includes onSuccess callback', () => {
        const onSuccess = vi.fn();
        const action = updateNewsRequest({
          id: 'news-1',
          data: { title: 'Updated' },
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('deleteNewsRequest', () => {
      it('creates correct action type', () => {
        const action = deleteNewsRequest({ id: 'news-1' });

        expect(action.type).toBe('news/deleteNewsRequest');
      });

      it('includes id in payload', () => {
        const action = deleteNewsRequest({ id: 'news-123' });

        expect(action.payload.id).toBe('news-123');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = vi.fn();
        const action = deleteNewsRequest({ id: 'news-1', onSuccess });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });
  });

  describe('selectors', () => {
    describe('selectNewsList', () => {
      it('returns empty array for initial state', () => {
        const state = { news: initialState };

        const newsList = selectNewsList(state);

        expect(newsList).toEqual([]);
      });

      it('returns news list when present', () => {
        const state = {
          news: {
            ...initialState,
            newsList: mockNewsList,
          },
        };

        const newsList = selectNewsList(state);

        expect(newsList).toEqual(mockNewsList);
      });
    });

    describe('selectCurrentNews', () => {
      it('returns null for initial state', () => {
        const state = { news: initialState };

        const current = selectCurrentNews(state);

        expect(current).toBe(null);
      });

      it('returns current news when present', () => {
        const state = {
          news: {
            ...initialState,
            currentNews: mockNews,
          },
        };

        const current = selectCurrentNews(state);

        expect(current).toEqual(mockNews);
      });
    });

    describe('loading selectors', () => {
      it('selectNewsLoading returns false for initial state', () => {
        const state = { news: initialState };

        expect(selectNewsLoading(state)).toBe(false);
      });

      it('selectCurrentNewsLoading returns false for initial state', () => {
        const state = { news: initialState };

        expect(selectCurrentNewsLoading(state)).toBe(false);
      });

      it('selectCreateNewsLoading returns false for initial state', () => {
        const state = { news: initialState };

        expect(selectCreateNewsLoading(state)).toBe(false);
      });

      it('selectUpdateNewsLoading returns false for initial state', () => {
        const state = { news: initialState };

        expect(selectUpdateNewsLoading(state)).toBe(false);
      });

      it('selectDeleteNewsLoading returns false for initial state', () => {
        const state = { news: initialState };

        expect(selectDeleteNewsLoading(state)).toBe(false);
      });

      it('returns correct loading states', () => {
        const state = {
          news: {
            ...initialState,
            loading: true,
            currentLoading: true,
            createLoading: true,
            updateLoading: true,
            deleteLoading: true,
          },
        };

        expect(selectNewsLoading(state)).toBe(true);
        expect(selectCurrentNewsLoading(state)).toBe(true);
        expect(selectCreateNewsLoading(state)).toBe(true);
        expect(selectUpdateNewsLoading(state)).toBe(true);
        expect(selectDeleteNewsLoading(state)).toBe(true);
      });
    });

    describe('selectNewsPagination', () => {
      it('returns initial pagination for initial state', () => {
        const state = { news: initialState };

        const pagination = selectNewsPagination(state);

        expect(pagination).toEqual(initialState.pagination);
      });

      it('returns current pagination', () => {
        const customPagination = {
          page: 2,
          limit: 20,
          total: 50,
          totalPages: 3,
        };

        const state = {
          news: {
            ...initialState,
            pagination: customPagination,
          },
        };

        const pagination = selectNewsPagination(state);

        expect(pagination).toEqual(customPagination);
      });
    });

    describe('selectNewsSearchQuery', () => {
      it('returns empty string for initial state', () => {
        const state = { news: initialState };

        const query = selectNewsSearchQuery(state);

        expect(query).toBe('');
      });

      it('returns current search query', () => {
        const state = {
          news: {
            ...initialState,
            searchQuery: 'breaking news',
          },
        };

        const query = selectNewsSearchQuery(state);

        expect(query).toBe('breaking news');
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete CRUD flow', () => {
      // List news
      let state = newsReducer(initialState, setNewsLoading(true));
      state = newsReducer(
        state,
        setNewsListSuccess({
          newsList: mockNewsList,
          pagination: {
            page: 1,
            limit: 10,
            total: 2,
            totalPages: 1,
          },
        })
      );

      expect(selectNewsList({ news: state })).toHaveLength(2);

      // Create news
      state = newsReducer(state, setCreateNewsLoading(true));
      const newNews: News = {
        id: 'news-3',
        title: 'New Article',
        slug: 'new-article',
        content: 'Content',
        excerpt: 'Excerpt',
        thumbnail: '',
        author: 'Author',
        publishedAt: '2024-01-03T00:00:00Z',
        isPublished: true,
        createdAt: '2024-01-03T00:00:00Z',
        updatedAt: '2024-01-03T00:00:00Z',
      };
      state = newsReducer(state, setCreateNewsSuccess(newNews));

      expect(selectNewsList({ news: state })).toHaveLength(3);
      expect(selectNewsList({ news: state })[0]).toEqual(newNews);

      // Update news
      state = newsReducer(state, setUpdateNewsLoading(true));
      const updatedNews = { ...newNews, title: 'Updated Article' };
      state = newsReducer(state, setUpdateNewsSuccess(updatedNews));

      expect(selectNewsList({ news: state })[0].title).toBe('Updated Article');

      // Delete news
      state = newsReducer(state, setDeleteNewsLoading(true));
      state = newsReducer(state, setDeleteNewsSuccess('news-3'));

      expect(selectNewsList({ news: state })).toHaveLength(2);
    });

    it('handles search and filter flow', () => {
      let state = newsReducer(initialState, setSearchQuery('breaking'));
      expect(selectNewsSearchQuery({ news: state })).toBe('breaking');

      state = newsReducer(state, setNewsLoading(true));
      state = newsReducer(
        state,
        setNewsListSuccess({
          newsList: [mockNews],
          pagination: {
            page: 1,
            limit: 10,
            total: 1,
            totalPages: 1,
          },
        })
      );

      expect(selectNewsList({ news: state })).toHaveLength(1);
    });

    it('handles reset flow', () => {
      let state: NewsState = {
        newsList: mockNewsList,
        currentNews: mockNews,
        loading: false,
        currentLoading: false,
        createLoading: false,
        updateLoading: false,
        deleteLoading: false,
        pagination: {
          page: 2,
          limit: 20,
          total: 50,
          totalPages: 3,
        },
        searchQuery: 'search',
      };

      state = newsReducer(state, resetNewsState());

      expect(selectNewsList({ news: state })).toEqual([]);
      expect(selectNewsPagination({ news: state })).toEqual(initialState.pagination);
      expect(selectNewsSearchQuery({ news: state })).toBe('');
      expect(selectCurrentNews({ news: state })).toEqual(mockNews);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = newsReducer(initialState, { type: 'unknown' } as any);

      expect(state).toEqual(initialState);
    });

    it('handles multiple creates', () => {
      let state = initialState;

      const news1: News = { ...mockNews, id: 'news-1', title: 'First' };
      const news2: News = { ...mockNews, id: 'news-2', title: 'Second' };
      const news3: News = { ...mockNews, id: 'news-3', title: 'Third' };

      state = newsReducer(state, setCreateNewsSuccess(news1));
      state = newsReducer(state, setCreateNewsSuccess(news2));
      state = newsReducer(state, setCreateNewsSuccess(news3));

      expect(selectNewsList({ news: state })).toHaveLength(3);
      expect(selectNewsList({ news: state })[0].title).toBe('Third');
      expect(selectNewsList({ news: state })[1].title).toBe('Second');
      expect(selectNewsList({ news: state })[2].title).toBe('First');
    });

    it('handles independent loading states', () => {
      let state = newsReducer(initialState, setNewsLoading(true));
      state = newsReducer(state, setCurrentNewsLoading(true));
      state = newsReducer(state, setCreateNewsLoading(true));
      state = newsReducer(state, setUpdateNewsLoading(true));
      state = newsReducer(state, setDeleteNewsLoading(true));

      expect(state.loading).toBe(true);
      expect(state.currentLoading).toBe(true);
      expect(state.createLoading).toBe(true);
      expect(state.updateLoading).toBe(true);
      expect(state.deleteLoading).toBe(true);
    });
  });
});
