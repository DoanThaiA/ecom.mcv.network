import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { returnRepository } from 'src/repositories';
import type { GetReturnsResponse, ReturnRequest, ReturnTabCounts } from 'src/types/returns';
import { showError, showSuccess } from 'src/utils/toast';
import {
  getReturnByIdRequest,
  getReturnsRequest,
  getReturnTabCountsRequest,
  updateReturnStatusRequest,
  setCurrentReturnError,
  setCurrentReturnLoading,
  setCurrentReturnSuccess,
  setReturnError,
  setReturnLoading,
  setReturnsSuccess,
  setReturnTabCounts,
  type GetReturnByIdPayload,
  type GetReturnsPayload,
  type UpdateReturnStatusPayload,
} from '../store/returnSlice';

/**
 * Get Returns Saga
 * Fetches return requests with filters, sorting, and pagination
 */
function* getReturnsSaga(action: PayloadAction<GetReturnsPayload>) {
  const { page = 1, limit = 10, filters, sort, onSuccess } = action.payload;

  try {
    yield put(setReturnLoading(true));

    // Call API to get returns
    const response: GetReturnsResponse = yield call(returnRepository.getReturns, {
      page,
      limit,
      filters,
      sort,
    });

    // Update state with returns and pagination
    yield put(
      setReturnsSuccess({
        returns: response.data,
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
    yield put(setReturnError(''));
    showError(error);
  }
}

/**
 * Get Return Tab Counts Saga
 */
function* getReturnTabCountsSaga(action: PayloadAction<{ type?: 'refund' | 'exchange' }>) {
  try {
    const { type } = action.payload || {};
    const tabCounts: ReturnTabCounts = yield call(returnRepository.getTabCounts, type);
    yield put(setReturnTabCounts(tabCounts));
  } catch (error) {
    // Silently fail - tab counts are not critical
    console.error('Failed to fetch return tab counts:', error);
  }
}

/**
 * Get Return By ID Saga
 * Fetches a single return request by ID
 */
function* getReturnByIdSaga(action: PayloadAction<GetReturnByIdPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setCurrentReturnLoading(true));

    // Call API to get return by ID
    const returnRequest: ReturnRequest = yield call(returnRepository.getReturnById, id);

    // Update state with return
    yield put(setCurrentReturnSuccess(returnRequest));

    // Call success callback
    if (onSuccess) {
      onSuccess(returnRequest);
    }
  } catch (error) {
    yield put(setCurrentReturnError(''));
    showError(error);
  }
}

/**
 * Update Return Status Saga
 * Updates return request status
 */
function* updateReturnStatusSaga(action: PayloadAction<UpdateReturnStatusPayload>) {
  const { returnId, status, adminNote, onSuccess } = action.payload;

  try {
    yield put(setCurrentReturnLoading(true));

    // Call API to update return status
    const returnRequest: ReturnRequest = yield call(returnRepository.updateReturnStatus, returnId, {
      status,
      adminNote,
    });

    // Update state with updated return
    yield put(setCurrentReturnSuccess(returnRequest));

    showSuccess(i18next.t('updateReturnStatusSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setCurrentReturnError(''));
    showError(error);
  }
}

/**
 * Root Return Saga Watcher
 */
function* watchReturn() {
  yield takeLatest(getReturnsRequest.type, getReturnsSaga);
  yield takeLatest(getReturnByIdRequest.type, getReturnByIdSaga);
  yield takeLatest(updateReturnStatusRequest.type, updateReturnStatusSaga);
  yield takeLatest(getReturnTabCountsRequest.type, getReturnTabCountsSaga);
}

/**
 * Root Return Saga
 */
export function* returnSaga() {
  yield call(watchReturn);
}
