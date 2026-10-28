import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';

import i18next from 'src/i18next';
import { promotionRepository } from 'src/repositories/promotion.repository';
import type { Promotion, PromotionListResponse } from 'src/types/promotion';
import { showError, showSuccess } from 'src/utils/toast';

import {
  createPromotionRequest,
  deletePromotionRequest,
  getPromotionByIdRequest,
  getPromotionsRequest,
  updatePromotionRequest,
  pausePromotionRequest,
  resumePromotionRequest,
  bulkAddPromotionProductsRequest,
  setCreatePromotionError,
  setCreatePromotionLoading,
  setCreatePromotionSuccess,
  setCurrentPromotionError,
  setCurrentPromotionLoading,
  setCurrentPromotionSuccess,
  setDeletePromotionError,
  setDeletePromotionLoading,
  setDeletePromotionSuccess,
  setPromotionError,
  setPromotionLoading,
  setPromotionsSuccess,
  setUpdatePromotionError,
  setUpdatePromotionLoading,
  setUpdatePromotionSuccess,
  setPausePromotionLoading,
  setPausePromotionSuccess,
  setPausePromotionError,
  setResumePromotionSuccess,
  setResumePromotionError,
  setAddProductLoading,
  setAddProductSuccess,
  setAddProductError,
  setBulkAddProgress,
  setBulkAddResult,
  type CreatePromotionPayload,
  type DeletePromotionPayload,
  type GetPromotionByIdPayload,
  type GetPromotionsPayload,
  type UpdatePromotionPayload,
  type PausePromotionPayload,
  type ResumePromotionPayload,
  type BulkAddPromotionProductsPayload,
} from '../store/promotionSlice';

/**
 * Get Promotions Saga
 * Fetches promotions with filters and pagination
 */
function* getPromotionsSaga(action: PayloadAction<GetPromotionsPayload>) {
  const { page = 1, limit = 10, filters, onSuccess } = action.payload;

  try {
    yield put(setPromotionLoading(true));

    const response: PromotionListResponse = yield call(promotionRepository.queryPromotions, {
      page,
      limit,
      type: filters?.type,
      status: filters?.status,
      keyword: filters?.keyword,
    });

    yield put(
      setPromotionsSuccess({
        promotions: response.data || [],
        pagination: {
          page: response.page || 1,
          limit: response.limit || 10,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
        },
      })
    );

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setPromotionError());
    showError(error);
  }
}

/**
 * Get Promotion By ID Saga
 * Fetches a single promotion by ID
 */
function* getPromotionByIdSaga(action: PayloadAction<GetPromotionByIdPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setCurrentPromotionLoading(true));

    const response: Promotion = yield call(promotionRepository.getPromotion, id);

    yield put(setCurrentPromotionSuccess(response));

    if (onSuccess) {
      onSuccess(response);
    }
  } catch (error) {
    yield put(setCurrentPromotionError());
    showError(error);
  }
}

/**
 * Create Promotion Saga
 * Creates a new promotion
 */
function* createPromotionSaga(action: PayloadAction<CreatePromotionPayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setCreatePromotionLoading(true));

    const response: Promotion = yield call(promotionRepository.createPromotion, data);

    yield put(setCreatePromotionSuccess());
    showSuccess(i18next.t('createPromotionSuccess'));

    if (onSuccess) {
      onSuccess(response);
    }
  } catch (error) {
    yield put(setCreatePromotionError());
    showError(error);
  }
}

/**
 * Update Promotion Saga
 * Updates an existing promotion
 */
function* updatePromotionSaga(action: PayloadAction<UpdatePromotionPayload>) {
  const { id, data, onSuccess } = action.payload;

  try {
    yield put(setUpdatePromotionLoading(true));

    const response: Promotion = yield call(promotionRepository.updatePromotion, id, data);

    yield put(setUpdatePromotionSuccess(response));
    showSuccess(i18next.t('updatePromotionSuccess'));

    if (onSuccess) {
      onSuccess(response);
    }
  } catch (error) {
    yield put(setUpdatePromotionError());
    showError(error);
  }
}

/**
 * Delete Promotion Saga
 * Deletes a promotion
 */
function* deletePromotionSaga(action: PayloadAction<DeletePromotionPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setDeletePromotionLoading(true));

    yield call(promotionRepository.deletePromotion, id);

    yield put(setDeletePromotionSuccess(id));
    showSuccess(i18next.t('deletePromotionSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setDeletePromotionError());
    showError(error);
  }
}

/**
 * Pause Promotion Saga
 * Pauses a promotion
 */
function* pausePromotionSaga(action: PayloadAction<PausePromotionPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setPausePromotionLoading(true));

    const response: Promotion = yield call(promotionRepository.pausePromotion, id);

    yield put(setPausePromotionSuccess(response));
    showSuccess(i18next.t('pausePromotionSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setPausePromotionError());
    showError(error);
  }
}

/**
 * Resume Promotion Saga
 * Resumes a paused promotion
 */
function* resumePromotionSaga(action: PayloadAction<ResumePromotionPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setPausePromotionLoading(true));

    const response: Promotion = yield call(promotionRepository.resumePromotion, id);

    yield put(setResumePromotionSuccess(response));
    showSuccess(i18next.t('resumePromotionSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setResumePromotionError());
    showError(error);
  }
}

const BULK_ADD_CHUNK_SIZE = 200;

/**
 * Bulk Add Promotion Products Saga
 * Splits products into chunks and sends sequentially with progress tracking.
 */
function* bulkAddPromotionProductsSaga(action: PayloadAction<BulkAddPromotionProductsPayload>) {
  const { promotionId, products, onSuccess } = action.payload;
  const totalProducts = products.length;

  try {
    yield put(setAddProductLoading(true));
    yield put(setBulkAddProgress({ current: 0, total: totalProducts }));

    let totalAdded = 0;
    let totalFailed = 0;
    const allFailedProducts: Array<{ productId: string; productCode: string; reason: string }> = [];

    for (let i = 0; i < totalProducts; i += BULK_ADD_CHUNK_SIZE) {
      const chunk = products.slice(i, i + BULK_ADD_CHUNK_SIZE);

      const result: { addedCount: number; failedCount: number; failedProducts: any[] } = yield call(
        promotionRepository.bulkAddPromotionProducts,
        promotionId,
        chunk
      );

      totalAdded += result.addedCount;
      totalFailed += result.failedCount;
      allFailedProducts.push(
        ...result.failedProducts.map((fp: any) => ({
          productId: fp.productId,
          productCode: fp.productCode || fp.productId,
          reason: fp.reason,
        }))
      );

      const processed = Math.min(i + chunk.length, totalProducts);
      yield put(setBulkAddProgress({ current: processed, total: totalProducts }));
    }

    yield put(setBulkAddProgress(null));
    yield put(setAddProductSuccess());

    if (totalFailed > 0) {
      yield put(
        setBulkAddResult({
          addedCount: totalAdded,
          failedCount: totalFailed,
          failedProducts: allFailedProducts,
        })
      );
    } else {
      showSuccess(i18next.t('addProductSuccess'));
      if (onSuccess) {
        onSuccess();
      }
    }
  } catch (error) {
    yield put(setBulkAddProgress(null));
    yield put(setAddProductError());
    showError(error);
  }
}

/**
 * Root Promotion Saga Watcher
 */
function* watchPromotion() {
  yield takeLatest(getPromotionsRequest.type, getPromotionsSaga);
  yield takeLatest(getPromotionByIdRequest.type, getPromotionByIdSaga);
  yield takeLatest(createPromotionRequest.type, createPromotionSaga);
  yield takeLatest(updatePromotionRequest.type, updatePromotionSaga);
  yield takeLatest(deletePromotionRequest.type, deletePromotionSaga);
  yield takeLatest(pausePromotionRequest.type, pausePromotionSaga);
  yield takeLatest(resumePromotionRequest.type, resumePromotionSaga);
  yield takeLatest(bulkAddPromotionProductsRequest.type, bulkAddPromotionProductsSaga);
}

/**
 * Root Promotion Saga
 */
export function* promotionSaga() {
  yield call(watchPromotion);
}
