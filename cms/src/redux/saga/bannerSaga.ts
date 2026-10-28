import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';

import i18next from 'src/i18next';
import { bannerRepository } from 'src/repositories/banner.repository';
import type { Banner } from 'src/types/gen/shared/shared/banners/banner';
import type { QueryBannersResponse } from 'src/types/gen/cms/cms/banners/banner';
import { showError, showSuccess } from 'src/utils/toast';

import {
  createBannerRequest,
  deleteBannerRequest,
  getBannerByIdRequest,
  getBannersRequest,
  reorderBannersRequest,
  updateBannerRequest,
  setCreateBannerError,
  setCreateBannerLoading,
  setCreateBannerSuccess,
  setDeleteBannerError,
  setDeleteBannerLoading,
  setDeleteBannerSuccess,
  setBannerError,
  setBannerLoading,
  setBannersSuccess,
  setUpdateBannerError,
  setUpdateBannerLoading,
  setUpdateBannerSuccess,
  setReorderBannersLoading,
  setReorderBannersSuccess,
  setReorderBannersError,
  type CreateBannerPayload,
  type DeleteBannerPayload,
  type GetBannerByIdPayload,
  type GetBannersPayload,
  type UpdateBannerPayload,
  type ReorderBannersPayload,
} from '../store/bannerSlice';

/**
 * Get Banners Saga
 * Fetches banners with filters and pagination
 */
function* getBannersSaga(action: PayloadAction<GetBannersPayload>) {
  const { page = 1, limit = 50, filters, sort, onSuccess } = action.payload;

  try {
    yield put(setBannerLoading(true));

    const response: QueryBannersResponse = yield call(bannerRepository.queryBanners, {
      page,
      limit,
      filters,
      sort,
    });

    yield put(
      setBannersSuccess({
        banners: response.data,
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
    yield put(setBannerError());
    showError(error);
  }
}

/**
 * Get Banner By ID Saga
 * Fetches a single banner by ID
 */
function* getBannerByIdSaga(action: PayloadAction<GetBannerByIdPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    const banner: Banner = yield call(bannerRepository.getBanner, id);

    if (onSuccess) {
      onSuccess(banner);
    }
  } catch (error) {
    showError(error);
  }
}

/**
 * Create Banner Saga
 * Creates a new banner
 */
function* createBannerSaga(action: PayloadAction<CreateBannerPayload>) {
  const { position, mediaType, media, link, order, isActive, onSuccess } = action.payload;

  try {
    yield put(setCreateBannerLoading(true));

    const banner: Banner = yield call(bannerRepository.createBanner, {
      position,
      mediaType,
      media,
      link,
      order,
      isActive,
    });

    yield put(setCreateBannerSuccess());
    showSuccess(i18next.t('createBannerSuccess'));

    if (onSuccess) {
      onSuccess(banner);
    }
  } catch (error) {
    yield put(setCreateBannerError());
    showError(error);
  }
}

/**
 * Update Banner Saga
 * Updates an existing banner
 */
function* updateBannerSaga(action: PayloadAction<UpdateBannerPayload>) {
  const { bannerId, position, mediaType, media, link, order, isActive, onSuccess } = action.payload;

  try {
    yield put(setUpdateBannerLoading(true));

    const banner: Banner = yield call(bannerRepository.updateBanner, {
      bannerId,
      position,
      mediaType,
      media,
      link,
      order,
      isActive,
    });

    yield put(setUpdateBannerSuccess(banner));
    showSuccess(i18next.t('updateBannerSuccess'));

    if (onSuccess) {
      onSuccess(banner);
    }
  } catch (error) {
    yield put(setUpdateBannerError());
    showError(error);
  }
}

/**
 * Delete Banner Saga
 * Deletes a banner
 */
function* deleteBannerSaga(action: PayloadAction<DeleteBannerPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setDeleteBannerLoading(true));

    yield call(bannerRepository.deleteBanner, id);

    yield put(setDeleteBannerSuccess(id));
    showSuccess(i18next.t('deleteBannerSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setDeleteBannerError());
    showError(error);
  }
}

/**
 * Reorder Banners Saga
 * Updates display order of multiple banners
 */
function* reorderBannersSaga(action: PayloadAction<ReorderBannersPayload>) {
  const { banners, onSuccess } = action.payload;

  try {
    yield put(setReorderBannersLoading(true));

    yield call(bannerRepository.reorderBanners, { banners });

    yield put(setReorderBannersSuccess());
    showSuccess(i18next.t('reorderBannersSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setReorderBannersError());
    showError(error);
  }
}

/**
 * Root Banner Saga Watcher
 */
function* watchBanner() {
  yield takeLatest(getBannersRequest.type, getBannersSaga);
  yield takeLatest(getBannerByIdRequest.type, getBannerByIdSaga);
  yield takeLatest(createBannerRequest.type, createBannerSaga);
  yield takeLatest(updateBannerRequest.type, updateBannerSaga);
  yield takeLatest(deleteBannerRequest.type, deleteBannerSaga);
  yield takeLatest(reorderBannersRequest.type, reorderBannersSaga);
}

/**
 * Root Banner Saga
 */
export function* bannerSaga() {
  yield call(watchBanner);
}
