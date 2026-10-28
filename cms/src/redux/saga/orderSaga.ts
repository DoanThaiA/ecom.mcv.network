import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { orderRepository } from 'src/repositories';
import type { GetOrdersResponse, Order } from 'src/types/orders';
import { showError, showSuccess } from 'src/utils/toast';
import {
  getOrderByIdRequest,
  getOrdersRequest,
  updateOrderStatusRequest,
  setCurrentOrderError,
  setCurrentOrderLoading,
  setCurrentOrderSuccess,
  setOrderError,
  setOrderLoading,
  setOrdersSuccess,
  setTabCounts,
  type GetOrderByIdPayload,
  type GetOrdersPayload,
  type UpdateOrderStatusPayload,
} from '../store/orderSlice';

/**
 * Get Orders Saga
 * Fetches orders with filters, sorting, and pagination
 */
function* getOrdersSaga(action: PayloadAction<GetOrdersPayload>) {
  const { page = 1, limit = 10, filters, sort, onSuccess } = action.payload;

  try {
    yield put(setOrderLoading(true));

    // Call API to get orders
    const response: GetOrdersResponse = yield call(orderRepository.getOrders, {
      page,
      limit,
      filters,
      sort,
    });

    // Update state with orders and pagination
    yield put(
      setOrdersSuccess({
        orders: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages,
        },
      })
    );

    // Update tab counts
    yield put(
      setTabCounts({
        all: response.total,
        pending: 0,
        confirmed: 0,
        processing: 0,
        shipped: 0,
        delivered: 0,
        cancelled: 0,
      })
    );

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setOrderError(''));
    showError(error);
  }
}

/**
 * Get Order By ID Saga
 * Fetches a single order by ID
 */
function* getOrderByIdSaga(action: PayloadAction<GetOrderByIdPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setCurrentOrderLoading(true));

    // Call API to get order by ID
    const order: Order = yield call(orderRepository.getOrderById, id);

    // Update state with order
    yield put(setCurrentOrderSuccess(order));

    // Call success callback
    if (onSuccess) {
      onSuccess(order);
    }
  } catch (error) {
    yield put(setCurrentOrderError(''));
    showError(error);
  }
}

/**
 * Update Order Status Saga
 * Updates order status
 */
function* updateOrderStatusSaga(action: PayloadAction<UpdateOrderStatusPayload>) {
  const { orderId, status, reason, onSuccess } = action.payload;

  try {
    yield put(setCurrentOrderLoading(true));

    // Call API to update order status
    const order: Order = yield call(orderRepository.updateOrderStatus, orderId, status, reason);

    // Update state with updated order
    yield put(setCurrentOrderSuccess(order));

    showSuccess(i18next.t('updateOrderStatusSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setCurrentOrderError(''));
    showError(error);
  }
}

/**
 * Root Order Saga Watcher
 */
function* watchOrder() {
  yield takeLatest(getOrdersRequest.type, getOrdersSaga);
  yield takeLatest(getOrderByIdRequest.type, getOrderByIdSaga);
  yield takeLatest(updateOrderStatusRequest.type, updateOrderStatusSaga);
}

/**
 * Root Order Saga
 */
export function* orderSaga() {
  yield call(watchOrder);
}
