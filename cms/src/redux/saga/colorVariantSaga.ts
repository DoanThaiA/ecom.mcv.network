import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { colorVariantRepository } from 'src/repositories/color-variant.repository';
import type { ColorVariant, QueryColorVariantsResponse } from 'src/types/color-variant';
import { showError, showSuccess } from 'src/utils/toast';
import {
  getColorVariantsRequest,
  getColorVariantByIdRequest,
  createColorVariantRequest,
  updateColorVariantRequest,
  deleteColorVariantRequest,
  setColorVariantLoading,
  setColorVariantsSuccess,
  setColorVariantError,
  setCurrentColorVariantLoading,
  setCurrentColorVariantSuccess,
  setCurrentColorVariantError,
  setCreateColorVariantLoading,
  setCreateColorVariantSuccess,
  setCreateColorVariantError,
  setUpdateColorVariantLoading,
  setUpdateColorVariantSuccess,
  setUpdateColorVariantError,
  setDeleteColorVariantLoading,
  setDeleteColorVariantSuccess,
  setDeleteColorVariantError,
  type GetColorVariantsPayload,
  type GetColorVariantByIdPayload,
  type CreateColorVariantPayload,
  type UpdateColorVariantPayload,
  type DeleteColorVariantPayload,
} from '../store/colorVariantSlice';

/**
 * Get Color Variants Saga
 * Fetches color variants with filters and pagination
 */
function* getColorVariantsSaga(action: PayloadAction<GetColorVariantsPayload>) {
  const { page = 1, limit = 10, search, displayType } = action.payload;

  try {
    yield put(setColorVariantLoading(true));

    // Call API to get color variants
    const response: QueryColorVariantsResponse = yield call(
      colorVariantRepository.getColorVariants,
      {
        page,
        limit,
        search: search || undefined,
        displayType,
      }
    );

    // Update state with color variants and pagination
    yield put(
      setColorVariantsSuccess({
        colorVariants: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
      })
    );
  } catch (error) {
    yield put(setColorVariantError());
    showError(error);
  }
}

/**
 * Get Color Variant By ID Saga
 * Fetches a single color variant by ID
 */
function* getColorVariantByIdSaga(action: PayloadAction<GetColorVariantByIdPayload>) {
  const { id } = action.payload;

  try {
    yield put(setCurrentColorVariantLoading(true));

    // Call API to get color variant by ID
    const colorVariant: ColorVariant = yield call(colorVariantRepository.getColorVariantById, id);

    // Update state with color variant
    yield put(setCurrentColorVariantSuccess(colorVariant));
  } catch (error) {
    yield put(setCurrentColorVariantError());
    showError(error);
  }
}

/**
 * Create Color Variant Saga
 * Creates a new color variant
 */
function* createColorVariantSaga(action: PayloadAction<CreateColorVariantPayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setCreateColorVariantLoading(true));

    // Call API to create color variant
    const colorVariant: ColorVariant = yield call(colorVariantRepository.createColorVariant, data);

    // Update state with new color variant
    yield put(setCreateColorVariantSuccess(colorVariant));
    showSuccess(i18next.t('createColorVariantSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess(colorVariant);
    }
  } catch (error) {
    yield put(setCreateColorVariantError());
    showError(error);
  }
}

/**
 * Update Color Variant Saga
 * Updates an existing color variant
 */
function* updateColorVariantSaga(action: PayloadAction<UpdateColorVariantPayload>) {
  const { id, data, onSuccess } = action.payload;

  try {
    yield put(setUpdateColorVariantLoading(true));

    // Call API to update color variant
    const colorVariant: ColorVariant = yield call(
      colorVariantRepository.updateColorVariant,
      id,
      data
    );

    // Update state with updated color variant
    yield put(setUpdateColorVariantSuccess(colorVariant));
    showSuccess(i18next.t('updateColorVariantSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess(colorVariant);
    }
  } catch (error) {
    yield put(setUpdateColorVariantError());
    showError(error);
  }
}

/**
 * Delete Color Variant Saga
 * Deletes a color variant
 */
function* deleteColorVariantSaga(action: PayloadAction<DeleteColorVariantPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setDeleteColorVariantLoading(true));

    // Call API to delete color variant
    yield call(colorVariantRepository.deleteColorVariant, id);

    // Update state - remove deleted color variant
    yield put(setDeleteColorVariantSuccess(id));
    showSuccess(i18next.t('deleteColorVariantSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setDeleteColorVariantError());
    showError(error);
  }
}

/**
 * Root Color Variant Saga Watcher
 */
function* watchColorVariant() {
  yield takeLatest(getColorVariantsRequest.type, getColorVariantsSaga);
  yield takeLatest(getColorVariantByIdRequest.type, getColorVariantByIdSaga);
  yield takeLatest(createColorVariantRequest.type, createColorVariantSaga);
  yield takeLatest(updateColorVariantRequest.type, updateColorVariantSaga);
  yield takeLatest(deleteColorVariantRequest.type, deleteColorVariantSaga);
}

/**
 * Root Color Variant Saga
 */
export function* colorVariantSaga() {
  yield call(watchColorVariant);
}
