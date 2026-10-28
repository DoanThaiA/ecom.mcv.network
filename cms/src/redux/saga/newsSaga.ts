import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { newsRepository } from 'src/repositories/news.repository';
import type { News, GetNewsListResponse } from 'src/types/news';
import { showError, showSuccess } from 'src/utils/toast';
import {
  createNewsRequest,
  deleteNewsRequest,
  getNewsByIdRequest,
  getNewsListRequest,
  updateNewsRequest,
  toggleNewsStatusRequest,
  setCreateNewsError,
  setCreateNewsLoading,
  setCreateNewsSuccess,
  setCurrentNewsError,
  setCurrentNewsLoading,
  setCurrentNewsSuccess,
  setDeleteNewsError,
  setDeleteNewsLoading,
  setDeleteNewsSuccess,
  setNewsError,
  setNewsLoading,
  setNewsListSuccess,
  setUpdateNewsError,
  setUpdateNewsLoading,
  setUpdateNewsSuccess,
  setToggleNewsStatusSuccess,
  type CreateNewsPayload,
  type DeleteNewsPayload,
  type GetNewsByIdPayload,
  type GetNewsListPayload,
  type UpdateNewsPayload,
  type ToggleNewsStatusPayload,
} from '../store/newsSlice';

/**
 * Get News List Saga
 * Fetches news with filters and pagination
 */
function* getNewsListSaga(action: PayloadAction<GetNewsListPayload>) {
  const { page = 1, limit = 10, search, onSuccess } = action.payload;

  try {
    yield put(setNewsLoading(true));

    // Call API to get news list
    const response: GetNewsListResponse = yield call(newsRepository.getNewsList, {
      page,
      limit,
      search,
    });

    // Update state with news list and pagination
    yield put(
      setNewsListSuccess({
        newsList: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
      })
    );

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setNewsError());
    showError(error);
  }
}

/**
 * Get News By ID Saga
 * Fetches a single news by ID
 */
function* getNewsByIdSaga(action: PayloadAction<GetNewsByIdPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setCurrentNewsLoading(true));

    // Call API to get news by ID
    const news: News | null = yield call(newsRepository.getNewsById, id);

    if (!news) {
      throw new Error('News not found');
    }

    // Update state with news
    yield put(setCurrentNewsSuccess(news));

    // Call success callback
    if (onSuccess) {
      onSuccess(news);
    }
  } catch (error) {
    yield put(setCurrentNewsError());
    showError(error);
  }
}

/**
 * Create News Saga
 * Creates a new news
 */
function* createNewsSaga(action: PayloadAction<CreateNewsPayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setCreateNewsLoading(true));

    // Call API to create news
    const news: News = yield call(newsRepository.createNews, data);

    // Update state with new news
    yield put(setCreateNewsSuccess(news));
    showSuccess(i18next.t('createNewsSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess(news);
    }
  } catch (error) {
    yield put(setCreateNewsError());
    showError(error);
  }
}

/**
 * Update News Saga
 * Updates an existing news
 */
function* updateNewsSaga(action: PayloadAction<UpdateNewsPayload>) {
  const { id, data, onSuccess } = action.payload;

  try {
    yield put(setUpdateNewsLoading(true));

    // Call API to update news
    const news: News = yield call(newsRepository.updateNews, id, data);

    // Update state with updated news
    yield put(setUpdateNewsSuccess(news));
    showSuccess(i18next.t('updateNewsSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess(news);
    }
  } catch (error) {
    yield put(setUpdateNewsError());
    showError(error);
  }
}

/**
 * Delete News Saga
 * Deletes a news
 */
function* deleteNewsSaga(action: PayloadAction<DeleteNewsPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setDeleteNewsLoading(true));

    // Call API to delete news
    yield call(newsRepository.deleteNews, id);

    // Update state - remove deleted news
    yield put(setDeleteNewsSuccess(id));
    showSuccess(i18next.t('deleteNewsSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setDeleteNewsError());
    showError(error);
  }
}

/**
 * Toggle News Status Saga
 * Toggles the status of a news article (active <-> inactive)
 */
function* toggleNewsStatusSaga(action: PayloadAction<ToggleNewsStatusPayload>) {
  const { id, currentStatus } = action.payload;

  try {
    const news: News = yield call(newsRepository.toggleNewsStatus, id, currentStatus);

    yield put(setToggleNewsStatusSuccess(news));
    showSuccess(i18next.t('updateNewsStatusSuccess'));
  } catch (error) {
    showError(error);
  }
}

/**
 * Root News Saga Watcher
 */
function* watchNews() {
  yield takeLatest(getNewsListRequest.type, getNewsListSaga);
  yield takeLatest(getNewsByIdRequest.type, getNewsByIdSaga);
  yield takeLatest(createNewsRequest.type, createNewsSaga);
  yield takeLatest(updateNewsRequest.type, updateNewsSaga);
  yield takeLatest(deleteNewsRequest.type, deleteNewsSaga);
  yield takeLatest(toggleNewsStatusRequest.type, toggleNewsStatusSaga);
}

/**
 * Root News Saga
 */
export function* newsSaga() {
  yield call(watchNews);
}
