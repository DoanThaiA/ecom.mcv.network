import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';

import i18next from 'src/i18next';
import { popupAdsRepository } from 'src/repositories/popup-ads.repository';
import type { PopupAds } from 'src/types/gen/shared/shared/popup-ads/popup-ads';
import type { QueryPopupAdsResponse } from 'src/types/gen/cms/cms/popup-ads/popup-ads';
import { showError, showSuccess } from 'src/utils/toast';

import {
  getPopupAdsListRequest,
  getPopupAdsByIdRequest,
  createPopupAdsRequest,
  updatePopupAdsRequest,
  deletePopupAdsRequest,
  setPopupAdsLoading,
  setPopupAdsListSuccess,
  setPopupAdsListError,
  setCreatePopupAdsLoading,
  setCreatePopupAdsSuccess,
  setCreatePopupAdsError,
  setUpdatePopupAdsLoading,
  setUpdatePopupAdsSuccess,
  setUpdatePopupAdsError,
  setDeletePopupAdsLoading,
  setDeletePopupAdsSuccess,
  setDeletePopupAdsError,
  type GetPopupAdsListPayload,
  type GetPopupAdsByIdPayload,
  type CreatePopupAdsPayload,
  type UpdatePopupAdsPayload,
  type DeletePopupAdsPayload,
} from '../store/popupAdsSlice';

/**
 * Get PopupAds List Saga
 * Fetches popup ads with filters and pagination
 */
function* getPopupAdsListSaga(action: PayloadAction<GetPopupAdsListPayload>) {
  const { page = 1, limit = 10, filters, sort, onSuccess } = action.payload;

  try {
    yield put(setPopupAdsLoading(true));

    const response: QueryPopupAdsResponse = yield call(popupAdsRepository.queryPopupAds, {
      page,
      limit,
      filters,
      sort: sort ?? [],
    });

    yield put(
      setPopupAdsListSuccess({
        popupAds: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
      })
    );

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setPopupAdsListError());
    showError(error);
  }
}

/**
 * Get PopupAds By ID Saga
 */
function* getPopupAdsByIdSaga(action: PayloadAction<GetPopupAdsByIdPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    const popupAds: PopupAds = yield call(popupAdsRepository.getPopupAds, id);

    if (onSuccess) {
      onSuccess(popupAds);
    }
  } catch (error) {
    showError(error);
  }
}

/**
 * Create PopupAds Saga
 */
function* createPopupAdsSaga(action: PayloadAction<CreatePopupAdsPayload>) {
  const { image, startAt, endAt, name, link, order, isActive, onSuccess } = action.payload;

  try {
    yield put(setCreatePopupAdsLoading(true));

    const popupAds: PopupAds = yield call(popupAdsRepository.createPopupAds, {
      image,
      startAt,
      endAt,
      name,
      link,
      order,
      isActive,
    });

    yield put(setCreatePopupAdsSuccess());
    showSuccess(i18next.t('createPopupAdsSuccess'));

    if (onSuccess) {
      onSuccess(popupAds);
    }
  } catch (error) {
    yield put(setCreatePopupAdsError());
    showError(error);
  }
}

/**
 * Update PopupAds Saga
 */
function* updatePopupAdsSaga(action: PayloadAction<UpdatePopupAdsPayload>) {
  const { popupAdsId, image, startAt, endAt, name, link, order, isActive, onSuccess } =
    action.payload;

  try {
    yield put(setUpdatePopupAdsLoading(true));

    const popupAds: PopupAds = yield call(popupAdsRepository.updatePopupAds, {
      popupAdsId,
      image,
      startAt,
      endAt,
      name,
      link,
      order,
      isActive,
    });

    yield put(setUpdatePopupAdsSuccess(popupAds));
    showSuccess(i18next.t('updatePopupAdsSuccess'));

    if (onSuccess) {
      onSuccess(popupAds);
    }
  } catch (error) {
    yield put(setUpdatePopupAdsError());
    showError(error);
  }
}

/**
 * Delete PopupAds Saga
 */
function* deletePopupAdsSaga(action: PayloadAction<DeletePopupAdsPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setDeletePopupAdsLoading(true));

    yield call(popupAdsRepository.deletePopupAds, id);

    yield put(setDeletePopupAdsSuccess(id));
    showSuccess(i18next.t('deletePopupAdsSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setDeletePopupAdsError());
    showError(error);
  }
}

/**
 * Root PopupAds Saga Watcher
 */
function* watchPopupAds() {
  yield takeLatest(getPopupAdsListRequest.type, getPopupAdsListSaga);
  yield takeLatest(getPopupAdsByIdRequest.type, getPopupAdsByIdSaga);
  yield takeLatest(createPopupAdsRequest.type, createPopupAdsSaga);
  yield takeLatest(updatePopupAdsRequest.type, updatePopupAdsSaga);
  yield takeLatest(deletePopupAdsRequest.type, deletePopupAdsSaga);
}

/**
 * Root PopupAds Saga
 */
export function* popupAdsSaga() {
  yield call(watchPopupAds);
}
