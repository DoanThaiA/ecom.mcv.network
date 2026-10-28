import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { comboRepository } from 'src/repositories/combo.repository';
import type { ComboResponse as Combo } from 'src/types/gen/shared/shared/combos/combo';
import type { QueryCombosResponse } from 'src/types/gen/cms/cms/combos/combo';
import { showError, showSuccess } from 'src/utils/toast';
import {
  createComboRequest,
  deleteComboRequest,
  getComboByIdRequest,
  getCombosRequest,
  setComboError,
  setComboLoading,
  setCombosSuccess,
  setCreateComboError,
  setCreateComboLoading,
  setCreateComboSuccess,
  setCurrentComboError,
  setCurrentComboLoading,
  setCurrentComboSuccess,
  setDeleteComboError,
  setDeleteComboLoading,
  setDeleteComboSuccess,
  setUpdateComboError,
  setUpdateComboLoading,
  setUpdateComboSuccess,
  updateComboRequest,
  type CreateComboPayload,
  type DeleteComboPayload,
  type GetComboByIdPayload,
  type GetCombosPayload,
  type UpdateComboPayload,
} from '../store/comboSlice';

/**
 * Get Combos Saga
 * Fetches combos with filters, sorting, and pagination
 */
function* getCombosSaga(action: PayloadAction<GetCombosPayload>) {
  const { page = 1, limit = 10, filters, sort, onSuccess } = action.payload;

  try {
    yield put(setComboLoading(true));

    // Call API to get combos
    const response: QueryCombosResponse = yield call(comboRepository.getCombos, {
      page,
      limit,
      filters,
      sort,
    });

    console.log('Combos response:', response);

    // Update state with combos and pagination
    yield put(
      setCombosSuccess({
        combos: response.data,
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
    console.error('Get combos error:', error);
    yield put(setComboError());
    showError(error);
  }
}

/**
 * Get Combo By ID Saga
 * Fetches a single combo by ID
 */
function* getComboByIdSaga(action: PayloadAction<GetComboByIdPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setCurrentComboLoading(true));

    // Call API to get combo by ID
    const combo: Combo = yield call(comboRepository.getComboById, id);

    console.log('Combo detail response:', combo);

    // Update state with combo
    yield put(setCurrentComboSuccess(combo));

    // Call success callback
    if (onSuccess) {
      onSuccess(combo);
    }
  } catch (error) {
    console.error('Get combo by ID error:', error);
    yield put(setCurrentComboError());
    showError(error);
  }
}

/**
 * Create Combo Saga
 * Creates a new combo
 */
function* createComboSaga(action: PayloadAction<CreateComboPayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setCreateComboLoading(true));

    // Call API to create combo
    const combo: Combo = yield call(comboRepository.createCombo, data);

    console.log('Create combo response:', combo);

    // Update state with new combo
    yield put(setCreateComboSuccess(combo));
    showSuccess(i18next.t('createComboSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess(combo);
    }
  } catch (error) {
    console.error('Create combo error:', error);
    yield put(setCreateComboError());
    showError(error);
  }
}

/**
 * Update Combo Saga
 * Updates an existing combo
 */
function* updateComboSaga(action: PayloadAction<UpdateComboPayload>) {
  const { id, data, onSuccess } = action.payload;

  try {
    yield put(setUpdateComboLoading(true));

    // Call API to update combo
    const combo: Combo = yield call(comboRepository.updateCombo, id, data);

    console.log('Update combo response:', combo);

    // Update state with updated combo
    yield put(setUpdateComboSuccess(combo));
    showSuccess(i18next.t('updateComboSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess(combo);
    }
  } catch (error) {
    console.error('Update combo error:', error);
    yield put(setUpdateComboError());
    showError(error);
  }
}

/**
 * Delete Combo Saga
 * Deletes a combo
 */
function* deleteComboSaga(action: PayloadAction<DeleteComboPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setDeleteComboLoading(true));

    // Call API to delete combo
    yield call(comboRepository.deleteCombo, id);

    console.log('Delete combo success:', id);

    // Update state - remove deleted combo
    yield put(setDeleteComboSuccess(id));
    showSuccess(i18next.t('deleteComboSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    console.error('Delete combo error:', error);
    yield put(setDeleteComboError());
    showError(error);
  }
}

/**
 * Root Combo Saga Watcher
 */
function* watchCombo() {
  yield takeLatest(getCombosRequest.type, getCombosSaga);
  yield takeLatest(getComboByIdRequest.type, getComboByIdSaga);
  yield takeLatest(createComboRequest.type, createComboSaga);
  yield takeLatest(updateComboRequest.type, updateComboSaga);
  yield takeLatest(deleteComboRequest.type, deleteComboSaga);
}

/**
 * Root Combo Saga
 */
export function* comboSaga() {
  yield call(watchCombo);
}
