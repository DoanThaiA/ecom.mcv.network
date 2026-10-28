import { call, put, takeLatest, takeEvery } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { showSuccess, showError } from 'src/utils/toast';
import { nhanhRepository, orderRepository } from 'src/repositories';
import type {
  NhanhRedirectResponse,
  NhanhCallbackResponse,
  NhanhSyncAllResponse,
  NhanhCheckConnectionResponse,
  NhanhSyncProductCategoriesResponse,
  NhanhSyncProductsResponse,
} from 'src/types';
import {
  nhanhRedirectRequest,
  nhanhCallbackRequest,
  nhanhSyncAllRequest,
  nhanhCheckConnectionRequest,
  nhanhSyncProductCategoriesRequest,
  nhanhSyncProductsRequest,
  nhanhUnsyncedCountRequest,
  nhanhRetryOrderSyncRequest,
  setNhanhLoading,
  setNhanhLoadingCategories,
  setNhanhLoadingProducts,
  setNhanhConnected,
  setNhanhError,
  setNhanhUnsyncedCount,
  setNhanhUnsyncedCountLoading,
  addRetryingOrderId,
  removeRetryingOrderId,
  type NhanhRedirectPayload,
  type NhanhCallbackPayload,
  type NhanhSyncAllPayload,
  type NhanhCheckConnectionPayload,
  type NhanhSyncProductCategoriesPayload,
  type NhanhSyncProductsPayload,
  type NhanhUnsyncedCountPayload,
  type NhanhRetryOrderSyncPayload,
} from '../store/nhanhSlice';
import type { PayloadAction } from '@reduxjs/toolkit';

/**
 * Redirect Saga
 * Gets redirect URL for Nhanh.vn authentication and opens it in a new window
 */
function* nhanhRedirectSaga(action: PayloadAction<NhanhRedirectPayload>) {
  const onSuccess = action.payload.onSuccess;
  const onError = action.payload.onError;
  try {
    yield put(setNhanhLoading(true));

    // Call API to get redirect URL
    const response: NhanhRedirectResponse = yield call(nhanhRepository.getRedirectUrl);

    console.log('Nhanh redirect response:', response);

    // Open redirect URL in a new window
    if (response.url) {
      window.location.href = response.url;
      // window.open(response.url, '_blank');
    }

    yield put(setNhanhLoading(false));

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    console.error('Nhanh redirect error:', error);
    yield put(setNhanhError(''));
    showError(error);

    // Call error callback
    if (onError) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Không thể lấy link xác thực';
      onError(errorMessage);
    }
  }
}

/**
 * Callback Saga
 * Handles callback from Nhanh.vn with access code
 * Consider status 200 or 304 as success (no need to check response.success)
 */
function* nhanhCallbackSaga(action: PayloadAction<NhanhCallbackPayload>) {
  const { accessCode, onSuccess, onError } = action.payload;
  try {
    yield put(setNhanhLoading(true));

    // Call API to authenticate with access code
    const response: NhanhCallbackResponse = yield call(nhanhRepository.handleCallback, {
      accessCode,
    });

    console.log('Nhanh callback response:', response);

    // If API call succeeds (status 200 or 304), mark as connected
    yield put(setNhanhConnected(true));

    // Show success message
    showSuccess(response?.message || 'Xác thực thành công');

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    console.error('Nhanh callback error:', error);
    yield put(setNhanhError(''));
    showError(error);

    // Call error callback
    if (onError) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Xác thực thất bại';
      onError(errorMessage);
    }
  }
}

/**
 * Sync All Saga
 * Syncs all data from Nhanh.vn (products, categories, orders, etc.)
 */
function* nhanhSyncAllSaga(action: PayloadAction<NhanhSyncAllPayload>) {
  const { onSuccess, onError } = action.payload;
  try {
    yield put(setNhanhLoading(true));

    // Call API to sync all data
    const response: NhanhSyncAllResponse = yield call(nhanhRepository.syncAll);

    console.log('Nhanh sync all response:', response);

    // Show success message with stats
    const message = response.message;

    showSuccess(message);

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
    yield put(setNhanhLoading(false));
  } catch (error: any) {
    console.error('Nhanh sync all error:', error);
    yield put(setNhanhError(''));
    showError(error);

    // Call error callback
    if (onError) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Đồng bộ thất bại';
      onError(errorMessage);
    }
  }
}

/**
 * Check Connection Saga
 * Checks if Nhanh.vn is connected
 */
function* nhanhCheckConnectionSaga(action: PayloadAction<NhanhCheckConnectionPayload>) {
  const { onSuccess, onError } = action.payload;
  try {
    // Call API to check connection
    const response: NhanhCheckConnectionResponse = yield call(nhanhRepository.checkConnection);

    console.log('Nhanh check connection response:', response);

    // Update connection state
    yield put(setNhanhConnected(true));

    // Call success callback
    if (onSuccess) {
      onSuccess(true);
    }
  } catch (error: any) {
    console.error('Nhanh check connection error:', error);
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Không thể kiểm tra kết nối';

    // Set as not connected on error
    yield put(setNhanhConnected(false));

    // Don't show error toast for check connection (silent check)
    // Only call the error callback if provided
    if (onError) {
      onError(errorMessage);
    }
  }
}

/**
 * Sync Product Categories Saga
 * Syncs product categories from Nhanh.vn
 */
function* nhanhSyncProductCategoriesSaga(action: PayloadAction<NhanhSyncProductCategoriesPayload>) {
  const { onSuccess, onError } = action.payload;
  try {
    yield put(setNhanhLoadingCategories(true));

    // Call API to sync product categories
    const response: NhanhSyncProductCategoriesResponse = yield call(
      nhanhRepository.syncProductCategories
    );

    console.log('Nhanh sync product categories response:', response);

    // Show success message
    const message = response.message;
    showSuccess(message);

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
    yield put(setNhanhLoadingCategories(false));
  } catch (error: any) {
    console.error('Nhanh sync product categories error:', error);
    yield put(setNhanhLoadingCategories(false));
    yield put(setNhanhError(''));
    showError(error);

    // Call error callback
    if (onError) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Đồng bộ danh mục thất bại';
      onError(errorMessage);
    }
  }
}

/**
 * Sync Products Saga
 * Syncs products from Nhanh.vn (full chain: list -> details -> embed)
 */
function* nhanhSyncProductsSaga(action: PayloadAction<NhanhSyncProductsPayload>) {
  const { onSuccess, onError } = action.payload;
  try {
    yield put(setNhanhLoadingProducts(true));

    const response: NhanhSyncProductsResponse = yield call(nhanhRepository.syncProducts);

    console.log('Nhanh sync products response:', response);

    const message = response.message;
    showSuccess(message);

    if (onSuccess) {
      onSuccess();
    }
    yield put(setNhanhLoadingProducts(false));
  } catch (error: any) {
    console.error('Nhanh sync products error:', error);
    yield put(setNhanhLoadingProducts(false));
    yield put(setNhanhError(''));
    showError(error);

    if (onError) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Đồng bộ sản phẩm thất bại';
      onError(errorMessage);
    }
  }
}

/**
 * Unsynced Order Count Saga
 * Fetches the number of orders not yet synced to Nhanh.vn
 */
function* nhanhUnsyncedCountSaga(action: PayloadAction<NhanhUnsyncedCountPayload | undefined>) {
  const onSuccess = action.payload?.onSuccess;
  const onError = action.payload?.onError;
  try {
    yield put(setNhanhUnsyncedCountLoading(true));

    const count: number = yield call(orderRepository.getNhanhUnsyncedCount);

    yield put(setNhanhUnsyncedCount(count));

    if (onSuccess) {
      onSuccess(count);
    }
  } catch (error: any) {
    yield put(setNhanhUnsyncedCountLoading(false));
    // Silent failure: this is a background poll, don't show toast
    if (onError) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Failed to fetch count';
      onError(errorMessage);
    }
  }
}

/**
 * Retry Order Sync Saga
 * Manually re-pushes a single order to Nhanh.vn
 */
function* nhanhRetryOrderSyncSaga(action: PayloadAction<NhanhRetryOrderSyncPayload>) {
  const { orderId, onSuccess, onError } = action.payload;
  try {
    yield put(addRetryingOrderId(orderId));

    const response: { success: boolean; error?: string | null } = yield call(
      orderRepository.retrySyncNhanh,
      orderId
    );

    if (response.success) {
      showSuccess(i18next.t('nhanhRetrySyncSuccess'));
      if (onSuccess) {
        onSuccess();
      }
    } else {
      const failedMessage = response.error
        ? `${i18next.t('nhanhRetrySyncFailed')}: ${response.error}`
        : i18next.t('nhanhRetrySyncFailed');
      showError(failedMessage);
      if (onError) {
        onError(failedMessage);
      }
    }

    yield put(removeRetryingOrderId(orderId));

    // Refresh count regardless of success — backend may have updated state
    yield put(nhanhUnsyncedCountRequest());
  } catch (error: any) {
    yield put(removeRetryingOrderId(orderId));
    showError(error);
    if (onError) {
      const errorMessage = error?.response?.data?.message || error?.message || 'Retry failed';
      onError(errorMessage);
    }
  }
}

/**
 * Root Nhanh Saga Watcher
 */
function* watchNhanh() {
  yield takeLatest(nhanhRedirectRequest.type, nhanhRedirectSaga);
  yield takeLatest(nhanhCallbackRequest.type, nhanhCallbackSaga);
  yield takeLatest(nhanhSyncAllRequest.type, nhanhSyncAllSaga);
  yield takeLatest(nhanhCheckConnectionRequest.type, nhanhCheckConnectionSaga);
  yield takeLatest(nhanhSyncProductCategoriesRequest.type, nhanhSyncProductCategoriesSaga);
  yield takeLatest(nhanhSyncProductsRequest.type, nhanhSyncProductsSaga);
  yield takeLatest(nhanhUnsyncedCountRequest.type, nhanhUnsyncedCountSaga);
  yield takeEvery(nhanhRetryOrderSyncRequest.type, nhanhRetryOrderSyncSaga);
}

/**
 * Root Nhanh Saga
 */
export function* nhanhSaga() {
  yield call(watchNhanh);
}
