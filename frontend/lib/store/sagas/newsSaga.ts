import { call, put, takeLatest, all, fork } from 'redux-saga/effects';
import { newsRepository } from '@/lib/repositories/news.repository';
import {
  getNewsListRequest,
  getFeaturedNewsRequest,
  getLatestNewsRequest,
  setNewsLoading,
  setNewsListSuccess,
  setFeaturedNewsSuccess,
  setLatestNewsSuccess,
  setNewsError,
  type GetNewsListPayload,
  type GetLatestNewsPayload,
} from '../slices/newsSlice';
import {
  getNewsByIdRequest,
  getRelatedNewsRequest,
  setNewsDetailLoading,
  setCurrentNewsSuccess,
  setRelatedNewsSuccess,
  setNewsDetailError,
  type GetNewsByIdPayload,
  type GetRelatedNewsPayload,
} from '../slices/newsDetailSlice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { NewsArticle, NewsListResponse } from '@/types/news';
import { showErrorToast } from '@/lib/helpers/toastHelper';

/**
 * Get News List Saga
 */
function* getNewsListSaga(action: PayloadAction<GetNewsListPayload>) {
  try {
    yield put(setNewsLoading(true));

    const response: NewsListResponse = yield call(
      newsRepository.getNewsList.bind(newsRepository),
      action.payload
    );

    yield put(setNewsListSuccess(response));
  } catch (error: any) {
    yield put(setNewsError(error.message || 'Failed to fetch news list'));
    showErrorToast(error);
  }
}

/**
 * Get Featured News Saga
 */
function* getFeaturedNewsSaga() {
  try {
    const featuredNews: NewsArticle | null = yield call(
      newsRepository.getFeaturedNews.bind(newsRepository)
    );

    yield put(setFeaturedNewsSuccess(featuredNews));
  } catch (error: any) {
    showErrorToast(error);
  }
}

/**
 * Get Latest News Saga
 */
function* getLatestNewsSaga(action: PayloadAction<GetLatestNewsPayload>) {
  try {
    yield put(setNewsLoading(true));

    const latestNews: NewsArticle[] = yield call(
      newsRepository.getLatestNews.bind(newsRepository),
      action.payload.limit || 6
    );

    yield put(setLatestNewsSuccess(latestNews));
  } catch (error: any) {
    yield put(setNewsError(error.message || 'Failed to fetch latest news'));
    showErrorToast(error);
  }
}

/**
 * Get News By ID Saga
 */
function* getNewsByIdSaga(action: PayloadAction<GetNewsByIdPayload>) {
  const { id } = action.payload;

  try {
    yield put(setNewsDetailLoading(true));

    const news: NewsArticle | null = yield call(
      newsRepository.getNewsById.bind(newsRepository),
      id
    );

    yield put(setCurrentNewsSuccess(news));
  } catch (error: any) {
    yield put(setNewsDetailError(error.message || 'Failed to fetch news'));
    showErrorToast(error);
  }
}

/**
 * Get Related News Saga
 */
function* getRelatedNewsSaga(action: PayloadAction<GetRelatedNewsPayload>) {
  const { currentId, limit } = action.payload;

  try {
    const relatedNews: NewsArticle[] = yield call(
      newsRepository.getRelatedNews.bind(newsRepository),
      currentId,
      limit || 3
    );

    yield put(setRelatedNewsSuccess(relatedNews));
  } catch (error: any) {
    showErrorToast(error);
  }
}

/**
 * News List Saga Watcher
 */
function* watchNewsList() {
  yield takeLatest(getNewsListRequest.type, getNewsListSaga);
  yield takeLatest(getFeaturedNewsRequest.type, getFeaturedNewsSaga);
  yield takeLatest(getLatestNewsRequest.type, getLatestNewsSaga);
}

/**
 * News Detail Saga Watcher
 */
function* watchNewsDetail() {
  yield takeLatest(getNewsByIdRequest.type, getNewsByIdSaga);
  yield takeLatest(getRelatedNewsRequest.type, getRelatedNewsSaga);
}

/**
 * Root News Saga
 */
export function* newsSaga() {
  yield all([fork(watchNewsList), fork(watchNewsDetail)]);
}
