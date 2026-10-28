import { call, put, takeLatest } from 'redux-saga/effects';
import { showError } from 'src/utils/toast';
import { inventoryRepository } from 'src/repositories';
import type { GetInventoriesResponse, ProductInventory } from 'src/types';
import {
  getInventoriesRequest,
  getInventoryByIdRequest,
  setInventoryLoading,
  setInventoriesSuccess,
  setInventoryError,
  setCurrentInventoryLoading,
  setCurrentInventorySuccess,
  setCurrentInventoryError,
  type GetInventoriesPayload,
  type GetInventoryByIdPayload,
} from '../store/inventorySlice';
import type { PayloadAction } from '@reduxjs/toolkit';

/**
 * Get Inventories Saga
 * Fetches inventories with filters, sorting, and pagination
 */
function* getInventoriesSaga(action: PayloadAction<GetInventoriesPayload>) {
  const { page = 1, limit = 10, filters, sort, onSuccess, onError } = action.payload;

  try {
    yield put(setInventoryLoading(true));

    // Call API to get inventories
    const response: GetInventoriesResponse = yield call(inventoryRepository.getInventories, {
      page,
      limit,
      filters,
      sort,
    });

    console.log('Inventories response:', response);

    // Update state with inventories and pagination
    yield put(
      setInventoriesSuccess({
        inventories: response.data,
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
  } catch (error: any) {
    console.error('Get inventories error:', error);
    yield put(setInventoryError(''));
    showError(error);

    // Call error callback
    if (onError) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Không thể tải danh sách tồn kho';
      onError(errorMessage);
    }
  }
}

/**
 * Get Inventory By ID Saga
 * Fetches a single inventory by ID
 */
function* getInventoryByIdSaga(action: PayloadAction<GetInventoryByIdPayload>) {
  const { id, onSuccess, onError } = action.payload;

  try {
    yield put(setCurrentInventoryLoading(true));

    // Call API to get inventory by ID
    const inventory: ProductInventory = yield call(inventoryRepository.getInventoryById, id);

    console.log('Inventory detail response:', inventory);

    // Update state with inventory
    yield put(setCurrentInventorySuccess(inventory));

    // Call success callback
    if (onSuccess) {
      onSuccess(inventory);
    }
  } catch (error: any) {
    console.error('Get inventory by ID error:', error);
    yield put(setCurrentInventoryError(''));
    showError(error);

    // Call error callback
    if (onError) {
      const errorMessage =
        error?.response?.data?.message || error?.message || 'Không thể tải thông tin tồn kho';
      onError(errorMessage);
    }
  }
}

/**
 * Root Inventory Saga Watcher
 */
function* watchInventory() {
  yield takeLatest(getInventoriesRequest.type, getInventoriesSaga);
  yield takeLatest(getInventoryByIdRequest.type, getInventoryByIdSaga);
}

/**
 * Root Inventory Saga
 */
export function* inventorySaga() {
  yield call(watchInventory);
}
