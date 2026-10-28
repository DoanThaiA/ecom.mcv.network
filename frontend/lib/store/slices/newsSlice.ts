import type { NewsArticle, GetNewsListParams } from '@/types/news';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';

/**
 * News List State
 */
export interface NewsState {
  newsList: NewsArticle[];
  featuredNews: NewsArticle | null;
  latestNews: NewsArticle[];
  loading: boolean;
  error: string | null;
  total: number;
  page: number;
  limit: number;
}

const initialState: NewsState = {
  newsList: [],
  featuredNews: null,
  latestNews: [],
  loading: false,
  error: null,
  total: 0,
  page: 1,
  limit: 10,
};

/**
 * Saga Action Payload Types
 */
export type GetNewsListPayload = GetNewsListParams;

export type GetLatestNewsPayload = {
  limit?: number;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getNewsListRequest = createAction<GetNewsListPayload>(
  'news/getNewsListRequest'
);

export const getFeaturedNewsRequest = createAction(
  'news/getFeaturedNewsRequest'
);

export const getLatestNewsRequest = createAction<GetLatestNewsPayload>(
  'news/getLatestNewsRequest'
);

/**
 * News Slice
 */
export const newsSlice = createSlice({
  name: 'news',
  initialState,
  reducers: {
    setNewsLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setNewsListSuccess: (
      state,
      action: PayloadAction<{
        data: NewsArticle[];
        total: number;
        page: number;
        limit: number;
      }>
    ) => {
      state.newsList = action.payload.data;
      state.total = action.payload.total;
      state.page = action.payload.page;
      state.limit = action.payload.limit;
      state.loading = false;
      state.error = null;
    },
    setFeaturedNewsSuccess: (state, action: PayloadAction<NewsArticle | null>) => {
      state.featuredNews = action.payload;
    },
    setLatestNewsSuccess: (state, action: PayloadAction<NewsArticle[]>) => {
      state.latestNews = action.payload;
      state.loading = false;
    },
    setNewsError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearNewsList: (state) => {
      state.newsList = [];
      state.error = null;
    },
    resetNewsState: () => initialState,
  },
});

export const {
  setNewsLoading,
  setNewsListSuccess,
  setFeaturedNewsSuccess,
  setLatestNewsSuccess,
  setNewsError,
  clearNewsList,
  resetNewsState,
} = newsSlice.actions;

/**
 * Selectors
 */
export const selectNewsList = (state: { news: NewsState }) => state.news.newsList;
export const selectFeaturedNews = (state: { news: NewsState }) => state.news.featuredNews;
export const selectLatestNews = (state: { news: NewsState }) => state.news.latestNews;
export const selectNewsLoading = (state: { news: NewsState }) => state.news.loading;
export const selectNewsError = (state: { news: NewsState }) => state.news.error;
export const selectNewsTotal = (state: { news: NewsState }) => state.news.total;
export const selectNewsPage = (state: { news: NewsState }) => state.news.page;
export const selectNewsLimit = (state: { news: NewsState }) => state.news.limit;

export default newsSlice.reducer;
