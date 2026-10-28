import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type { News, NewsPagination, CreateNewsRequest, UpdateNewsRequest } from 'src/types/news';

/**
 * News State
 */
export interface NewsState {
  newsList: News[];
  currentNews: News | null;
  loading: boolean;
  currentLoading: boolean;
  createLoading: boolean;
  updateLoading: boolean;
  deleteLoading: boolean;
  pagination: NewsPagination;
  searchQuery: string;
}

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

/**
 * Saga Action Payload Types
 */
export type GetNewsListPayload = {
  page?: number;
  limit?: number;
  search?: string;
  onSuccess?: () => void;
};

export type GetNewsByIdPayload = {
  id: string;
  onSuccess?: (news: News) => void;
};

export type CreateNewsPayload = {
  data: CreateNewsRequest;
  onSuccess?: (news: News) => void;
};

export type UpdateNewsPayload = {
  id: string;
  data: UpdateNewsRequest;
  onSuccess?: (news: News) => void;
};

export type DeleteNewsPayload = {
  id: string;
  onSuccess?: () => void;
};

export type ToggleNewsStatusPayload = {
  id: string;
  currentStatus: 'active' | 'inactive';
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getNewsListRequest = createAction<GetNewsListPayload>('news/getNewsListRequest');
export const getNewsByIdRequest = createAction<GetNewsByIdPayload>('news/getNewsByIdRequest');
export const createNewsRequest = createAction<CreateNewsPayload>('news/createNewsRequest');
export const updateNewsRequest = createAction<UpdateNewsPayload>('news/updateNewsRequest');
export const deleteNewsRequest = createAction<DeleteNewsPayload>('news/deleteNewsRequest');
export const toggleNewsStatusRequest = createAction<ToggleNewsStatusPayload>(
  'news/toggleNewsStatusRequest'
);

/**
 * News Slice
 */
export const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    // List news
    setNewsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setNewsListSuccess: (
      state,
      action: PayloadAction<{
        newsList: News[];
        pagination: NewsPagination;
      }>
    ) => {
      state.newsList = action.payload.newsList;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },

    setNewsError: (state) => {
      state.loading = false;
    },

    // Get single news by ID
    setCurrentNewsLoading: (state, action: PayloadAction<boolean>) => {
      state.currentLoading = action.payload;
    },

    setCurrentNewsSuccess: (state, action: PayloadAction<News>) => {
      state.currentNews = action.payload;
      state.currentLoading = false;
    },

    setCurrentNewsError: (state) => {
      state.currentLoading = false;
    },

    clearCurrentNews: (state) => {
      state.currentNews = null;
    },

    // Create news
    setCreateNewsLoading: (state, action: PayloadAction<boolean>) => {
      state.createLoading = action.payload;
    },

    setCreateNewsSuccess: (state, action: PayloadAction<News>) => {
      state.newsList.unshift(action.payload);
      state.createLoading = false;
    },

    setCreateNewsError: (state) => {
      state.createLoading = false;
    },

    // Update news
    setUpdateNewsLoading: (state, action: PayloadAction<boolean>) => {
      state.updateLoading = action.payload;
    },

    setUpdateNewsSuccess: (state, action: PayloadAction<News>) => {
      const index = state.newsList.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        state.newsList[index] = action.payload;
      }
      if (state.currentNews?.id === action.payload.id) {
        state.currentNews = action.payload;
      }
      state.updateLoading = false;
    },

    setUpdateNewsError: (state) => {
      state.updateLoading = false;
    },

    // Delete news
    setDeleteNewsLoading: (state, action: PayloadAction<boolean>) => {
      state.deleteLoading = action.payload;
    },

    setDeleteNewsSuccess: (state, action: PayloadAction<string>) => {
      state.newsList = state.newsList.filter((n) => n.id !== action.payload);
      if (state.currentNews?.id === action.payload) {
        state.currentNews = null;
      }
      state.deleteLoading = false;
    },

    setDeleteNewsError: (state) => {
      state.deleteLoading = false;
    },

    // Toggle status
    setToggleNewsStatusSuccess: (state, action: PayloadAction<News>) => {
      const index = state.newsList.findIndex((n) => n.id === action.payload.id);
      if (index !== -1) {
        state.newsList[index] = action.payload;
      }
    },

    // Filters
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    // Reset state
    resetNewsState: (state) => {
      state.newsList = [];
      state.loading = false;
      state.pagination = initialState.pagination;
      state.searchQuery = '';
    },
  },
});

export const {
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
  setToggleNewsStatusSuccess,
  setSearchQuery,
  resetNewsState,
} = newsSlice.actions;

/**
 * Selectors
 */
export const selectNewsList = (state: { news: NewsState }) => state.news.newsList;

export const selectCurrentNews = (state: { news: NewsState }) => state.news.currentNews;

export const selectNewsLoading = (state: { news: NewsState }) => state.news.loading;

export const selectCurrentNewsLoading = (state: { news: NewsState }) => state.news.currentLoading;

export const selectCreateNewsLoading = (state: { news: NewsState }) => state.news.createLoading;

export const selectUpdateNewsLoading = (state: { news: NewsState }) => state.news.updateLoading;

export const selectDeleteNewsLoading = (state: { news: NewsState }) => state.news.deleteLoading;

export const selectNewsPagination = (state: { news: NewsState }) => state.news.pagination;

export const selectNewsSearchQuery = (state: { news: NewsState }) => state.news.searchQuery;

export default newsSlice.reducer;
