import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';

import i18next from 'src/i18next';
import { shippingPromotionRepository } from 'src/repositories/shipping-promotion.repository';
import type {
  ShippingPromotion,
  ShippingPromotionListItem,
} from 'src/types/gen/shared/shared/shipping/shipping-promotion';
import type { QueryShippingPromotionsResponse } from 'src/types/gen/cms/cms/shipping/shipping-promotion';
import { transformApiToListItem } from 'src/types/shipping-promotion';
import { showError, showSuccess } from 'src/utils/toast';

import {
  getShippingPromotionsRequest,
  getShippingPromotionByIdRequest,
  createShippingPromotionRequest,
  updateShippingPromotionRequest,
  deleteShippingPromotionRequest,
  toggleShippingPromotionRequest,
  setShippingPromotionLoading,
  setShippingPromotionsSuccess,
  setShippingPromotionError,
  setCurrentShippingPromotionLoading,
  setCurrentShippingPromotionSuccess,
  setCurrentShippingPromotionError,
  setCreateShippingPromotionLoading,
  setCreateShippingPromotionSuccess,
  setCreateShippingPromotionError,
  setUpdateShippingPromotionLoading,
  setUpdateShippingPromotionSuccess,
  setUpdateShippingPromotionError,
  setDeleteShippingPromotionLoading,
  setDeleteShippingPromotionSuccess,
  setDeleteShippingPromotionError,
  setToggleShippingPromotionLoading,
  setToggleShippingPromotionSuccess,
  setToggleShippingPromotionError,
  type GetShippingPromotionsPayload,
  type GetShippingPromotionByIdPayload,
  type CreateShippingPromotionPayload,
  type UpdateShippingPromotionPayload,
  type DeleteShippingPromotionPayload,
  type ToggleShippingPromotionPayload,
} from '../store/shippingPromotionSlice';

/**
 * Get Shipping Promotions Saga
 * Fetches shipping promotions with filters and pagination
 */
function* getShippingPromotionsSaga(action: PayloadAction<GetShippingPromotionsPayload>) {
  const { page = 1, limit = 10, filters, onSuccess } = action.payload;

  try {
    yield put(setShippingPromotionLoading(true));

    const response: QueryShippingPromotionsResponse = yield call(
      shippingPromotionRepository.queryShippingPromotions,
      {
        page,
        limit,
        filters,
        sort: [{ orderBy: 'createdAt', order: 'desc' }],
      }
    );

    // Transform API response to proper enum types
    const transformedData = response.data.map(
      (item) =>
        transformApiToListItem(
          item as unknown as Record<string, unknown>
        ) as unknown as ShippingPromotionListItem
    );

    yield put(
      setShippingPromotionsSuccess({
        promotions: transformedData,
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
    yield put(setShippingPromotionError());
    showError(error);
  }
}

/**
 * Get Shipping Promotion By ID Saga
 * Fetches a single shipping promotion by ID
 */
function* getShippingPromotionByIdSaga(action: PayloadAction<GetShippingPromotionByIdPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setCurrentShippingPromotionLoading(true));

    const promotion: ShippingPromotion = yield call(
      shippingPromotionRepository.getShippingPromotion,
      id
    );

    yield put(setCurrentShippingPromotionSuccess(promotion));

    if (onSuccess) {
      onSuccess(promotion);
    }
  } catch (error) {
    yield put(setCurrentShippingPromotionError());
    showError(error);
  }
}

/**
 * Create Shipping Promotion Saga
 * Creates a new shipping promotion
 */
function* createShippingPromotionSaga(action: PayloadAction<CreateShippingPromotionPayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setCreateShippingPromotionLoading(true));

    const promotion: ShippingPromotion = yield call(
      shippingPromotionRepository.createShippingPromotion,
      data
    );

    yield put(setCreateShippingPromotionSuccess());
    showSuccess(i18next.t('createShippingPromotionSuccess'));

    if (onSuccess) {
      onSuccess(promotion);
    }
  } catch (error) {
    yield put(setCreateShippingPromotionError());
    showError(error);
  }
}

/**
 * Update Shipping Promotion Saga
 * Updates an existing shipping promotion
 */
function* updateShippingPromotionSaga(action: PayloadAction<UpdateShippingPromotionPayload>) {
  const { id, data, onSuccess } = action.payload;

  try {
    yield put(setUpdateShippingPromotionLoading(true));

    const promotion: ShippingPromotion = yield call(
      shippingPromotionRepository.updateShippingPromotion,
      id,
      data
    );

    yield put(setUpdateShippingPromotionSuccess(promotion));
    showSuccess(i18next.t('updateShippingPromotionSuccess'));

    if (onSuccess) {
      onSuccess(promotion);
    }
  } catch (error) {
    yield put(setUpdateShippingPromotionError());
    showError(error);
  }
}

/**
 * Delete Shipping Promotion Saga
 * Deletes a shipping promotion
 */
function* deleteShippingPromotionSaga(action: PayloadAction<DeleteShippingPromotionPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setDeleteShippingPromotionLoading(true));

    yield call(shippingPromotionRepository.deleteShippingPromotion, id);

    yield put(setDeleteShippingPromotionSuccess(id));
    showSuccess(i18next.t('deleteShippingPromotionSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setDeleteShippingPromotionError());
    showError(error);
  }
}

/**
 * Toggle Shipping Promotion Saga
 * Toggles the enabled status of a shipping promotion
 */
function* toggleShippingPromotionSaga(action: PayloadAction<ToggleShippingPromotionPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setToggleShippingPromotionLoading(true));

    const promotion: ShippingPromotion = yield call(
      shippingPromotionRepository.toggleShippingPromotion,
      id
    );

    yield put(setToggleShippingPromotionSuccess(promotion));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setToggleShippingPromotionError());
    showError(error);
  }
}

/**
 * Root Shipping Promotion Saga Watcher
 */
function* watchShippingPromotion() {
  yield takeLatest(getShippingPromotionsRequest.type, getShippingPromotionsSaga);
  yield takeLatest(getShippingPromotionByIdRequest.type, getShippingPromotionByIdSaga);
  yield takeLatest(createShippingPromotionRequest.type, createShippingPromotionSaga);
  yield takeLatest(updateShippingPromotionRequest.type, updateShippingPromotionSaga);
  yield takeLatest(deleteShippingPromotionRequest.type, deleteShippingPromotionSaga);
  yield takeLatest(toggleShippingPromotionRequest.type, toggleShippingPromotionSaga);
}

/**
 * Root Shipping Promotion Saga
 */
export function* shippingPromotionSaga() {
  yield call(watchShippingPromotion);
}
