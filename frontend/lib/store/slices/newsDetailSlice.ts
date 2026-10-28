import type { NewsArticle } from '@/types/news';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';

/**
 * News Detail State
 */
export interface NewsDetailState {
  currentNews: NewsArticle | null;
  relatedNews: NewsArticle[];
  loading: boolean;
  error: string | null;
}

const initialState: NewsDetailState = {
  currentNews: null,
  relatedNews: [],
  loading: false,
  error: null,
};

/**
 * Saga Action Payload Types
 */
export type GetNewsByIdPayload = {
  id: string;
};

export type GetRelatedNewsPayload = {
  currentId: string;
  limit?: number;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getNewsByIdRequest = createAction<GetNewsByIdPayload>(
  'newsDetail/getNewsByIdRequest'
);

export const getRelatedNewsRequest = createAction<GetRelatedNewsPayload>(
  'newsDetail/getRelatedNewsRequest'
);

/**
 * News Detail Slice
 */
export const newsDetailSlice = createSlice({
  name: 'newsDetail',
  initialState,
  reducers: {
    setNewsDetailLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },
    setCurrentNewsSuccess: (state, action: PayloadAction<NewsArticle | null>) => {
      state.currentNews = action.payload;
      state.loading = false;
      state.error = null;
    },
    setRelatedNewsSuccess: (state, action: PayloadAction<NewsArticle[]>) => {
      state.relatedNews = action.payload;
    },
    setNewsDetailError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    clearCurrentNews: (state) => {
      state.currentNews = null;
      state.relatedNews = [];
      state.error = null;
    },
    resetNewsDetailState: () => initialState,
  },
});

export const {
  setNewsDetailLoading,
  setCurrentNewsSuccess,
  setRelatedNewsSuccess,
  setNewsDetailError,
  clearCurrentNews,
  resetNewsDetailState,
} = newsDetailSlice.actions;

/**
 * Selectors
 */
export const selectCurrentNews = (state: { newsDetail: NewsDetailState }) =>
  state.newsDetail.currentNews;

export const selectRelatedNews = (state: { newsDetail: NewsDetailState }) =>
  state.newsDetail.relatedNews;

export const selectNewsDetailLoading = (state: { newsDetail: NewsDetailState }) =>
  state.newsDetail.loading;

export const selectNewsDetailError = (state: { newsDetail: NewsDetailState }) =>
  state.newsDetail.error;

export default newsDetailSlice.reducer;
