import { call, put, takeLatest } from 'redux-saga/effects';
import { showSuccess, showError } from 'src/utils/toast';
import { zaloRepository } from 'src/repositories/zalo.repository';
import type {
  ZaloRedirectResponse,
  ZaloCallbackResponse,
  ZaloCheckConnectionResponse,
} from 'src/types';
import {
  zaloRedirectRequest,
  zaloCallbackRequest,
  zaloCheckConnectionRequest,
  setZaloLoading,
  setZaloOAInfo,
  type ZaloRedirectPayload,
  type ZaloCallbackPayload,
  type ZaloCheckConnectionPayload,
} from '../store/zaloSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

/**
 * Redirect Saga
 * Gets redirect URL for Zalo OA authentication and redirects to it
 */
function* zaloRedirectSaga(action: PayloadAction<ZaloRedirectPayload>) {
  try {
    yield put(setZaloLoading(true));

    // Call API to get redirect URL
    const response: ZaloRedirectResponse = yield call(zaloRepository.getRedirectUrl);

    console.log('Zalo redirect response:', response);

    // Redirect to Zalo OA authentication page
    if (response.url) {
      window.location.href = response.url;
    }

    yield put(setZaloLoading(false));
  } catch (error: any) {
    console.error('Zalo redirect error:', error);
    yield put(setZaloLoading(false));
    showError(error);
  }
}

/**
 * Callback Saga
 * Handles callback from Zalo OA with authorization code
 */
function* zaloCallbackSaga(action: PayloadAction<ZaloCallbackPayload>) {
  const { code } = action.payload;
  try {
    yield put(setZaloLoading(true));

    // Call API to authenticate with authorization code
    const response: ZaloCallbackResponse = yield call(zaloRepository.handleCallback, {
      code,
    });

    console.log('Zalo callback response:', response);

    // Show success message
    showSuccess(response?.message || 'Xác thực thành công');

    yield put(setZaloLoading(false));
  } catch (error: any) {
    console.error('Zalo callback error:', error);
    yield put(setZaloLoading(false));
    showError(error);
  }
}

/**
 * Check Connection Saga
 * Checks if Zalo OA is connected
 */
function* zaloCheckConnectionSaga(action: PayloadAction<ZaloCheckConnectionPayload>) {
  try {
    // Call API to check connection
    const response: ZaloCheckConnectionResponse = yield call(zaloRepository.checkConnection);

    console.log('Zalo check connection response:', response);

    // Save OA info to Redux state (isConnected is derived from oaInfo presence)
    yield put(setZaloOAInfo(response?.oaInfo || null));
  } catch (error: any) {
    console.error('Zalo check connection error:', error);

    // Set oaInfo to null on error (marks as not connected)
    yield put(setZaloOAInfo(null));

    // Don't show error toast for check connection (silent check)
  }
}

/**
 * Root Zalo Saga Watcher
 */
function* watchZalo() {
  yield takeLatest(zaloRedirectRequest.type, zaloRedirectSaga);
  yield takeLatest(zaloCallbackRequest.type, zaloCallbackSaga);
  yield takeLatest(zaloCheckConnectionRequest.type, zaloCheckConnectionSaga);
}

/**
 * Root Zalo Saga
 */
export function* zaloSaga() {
  yield call(watchZalo);
}
