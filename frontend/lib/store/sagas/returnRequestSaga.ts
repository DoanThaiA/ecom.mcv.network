import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import {
  submitReturnRequestAction,
  setLoading,
  setSuccess,
  setError,
  type SubmitReturnRequestPayload,
} from '../slices/returnRequestSlice';
import { showSuccessToast, showErrorToast } from '@/lib/helpers/toastHelper';
import { returnRequestRepository } from '@/lib/repositories/returnRequest.repository';
import type { ReturnRequestResponse } from '@/types/returnRequest';

/**
 * Submit Return Request Saga
 * Uses real API to submit return request
 */
function* submitReturnRequestSaga(
  action: PayloadAction<SubmitReturnRequestPayload>
): Generator {
  const { data, onSuccess, onError } = action.payload;

  try {
    yield put(setLoading(true));

    // Call real API
    const response = (yield call(
      [returnRequestRepository, returnRequestRepository.submitReturnRequest],
      data
    )) as ReturnRequestResponse;

    if (response.success) {
      yield put(setSuccess(true));
      showSuccessToast(response.message);

      if (onSuccess) {
        onSuccess();
      }
    } else {
      throw new Error(response.message || 'Failed to submit request');
    }
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message ||
      error?.message ||
      'Có lỗi xảy ra khi gửi yêu cầu';
    yield put(setError(errorMessage));
    showErrorToast(errorMessage);

    if (onError) {
      onError();
    }
  }
}

/**
 * Return Request Saga Watcher
 */
export function* returnRequestSaga(): Generator {
  yield takeLatest(submitReturnRequestAction.type, submitReturnRequestSaga);
}
