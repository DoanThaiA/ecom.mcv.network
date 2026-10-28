/* eslint-disable no-console */
import { call, put, select, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import { orderRepository } from '@/lib/repositories/order.repository';
import { getErrorMessage, showErrorToast, showSuccessToast } from '@/lib/helpers/toastHelper';
import type { Order } from '@/types/gen/shop/shared/orders/order';
import {
  createOrderRequest,
  createOrderSuccess,
  createOrderFailure,
  CreateOrderRequestPayload,
  FetchOrdersRequestPayload,
  fetchOrdersRequest,
  fetchOrdersSuccess,
  fetchOrdersFailure,
  fetchOrderDetailRequest,
  fetchOrderByNumberRequest,
  fetchOrderDetailSuccess,
  fetchOrderDetailFailure,
} from '../slices/orderSlice';
import type { GetOrdersResponse } from '@/types/gen/shop/shop/shop/shop';
import { clearCartSuccess } from '../slices/cartSlice';
import type { RootState } from '../index';

// Create order saga
function* createOrderSaga(action: PayloadAction<CreateOrderRequestPayload>) {
  try {
    const { onSuccess, ...orderData } = action.payload;

    // Get cart items from state
    const cartState: RootState['cart'] = yield select((state: RootState) => state.cart);

    // Build selectedItems array for from-cart endpoint
    const selectedItems = map(cartState.cart.items, (item) => ({
      productId: item.productId,
      variantId: item.variantId || undefined,
    }));

    if (isEmpty(selectedItems)) {
      showErrorToast('Giỏ hàng trống');
      yield put(createOrderFailure('Cart is empty'));
      if (action.payload.onError) {
        action.payload.onError('Cart is empty');
      }
      return;
    }

    // Convert PaymentMethod enum to string
    const paymentMethodString = orderData.paymentMethod === 1 ? 'cod' : 'other';

    const order: Order = yield call(() =>
      orderRepository.createOrderFromCart({
        customer: orderData.customer,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: paymentMethodString,
        note: orderData.note,
        selectedItems,
      })
    );

    yield put(createOrderSuccess(order));

    // Clear cart after successful order
    yield put(clearCartSuccess());

    showSuccessToast('Đặt hàng thành công!');

    // Call success callback
    if (onSuccess) {
      onSuccess(order);
    }
  } catch (error) {
    console.error('Create order error:', error);
    showErrorToast(error);
    yield put(createOrderFailure('Failed to create order'));

    // Call error callback
    if (action.payload.onError) {
      action.payload.onError('Failed to create order');
    }
  }
}

// Fetch orders saga (order history)
function* fetchOrdersSaga(action: PayloadAction<FetchOrdersRequestPayload | undefined>) {
  try {
    const { page = 1, limit = 10 } = action.payload || {};
    const response: GetOrdersResponse = yield call(() =>
      orderRepository.getOrders({ page, limit })
    );
    yield put(fetchOrdersSuccess(response));
  } catch (error) {
    console.error('Fetch orders error:', error);
    showErrorToast(error);
    yield put(fetchOrdersFailure('Failed to fetch orders'));
  }
}

// Fetch order detail saga
function* fetchOrderDetailSaga(action: PayloadAction<string>) {
  try {
    const orderId = action.payload;
    const order: Order = yield call(() =>
      orderRepository.getOrderById(orderId)
    );
    yield put(fetchOrderDetailSuccess(order));
  } catch (error) {
    console.error('Fetch order detail error:', error);
    showErrorToast(error);
    yield put(fetchOrderDetailFailure('Failed to fetch order detail'));
  }
}

// Fetch order by order number saga (for payment success page)
function* fetchOrderByNumberSaga(action: PayloadAction<string>) {
  try {
    const orderNumber = action.payload;
    const order: Order = yield call(() =>
      orderRepository.getOrderByNumber(orderNumber)
    );
    yield put(fetchOrderDetailSuccess(order));
  } catch (error) {
    console.error('Fetch order by number error:', error);
    const errorMessage = getErrorMessage(error) || 'Failed to fetch order';
    yield put(fetchOrderDetailFailure(errorMessage));
  }
}

// Root order saga
export function* watchOrder() {
  yield takeLatest(createOrderRequest.type, createOrderSaga);
  yield takeLatest(fetchOrdersRequest.type, fetchOrdersSaga);
  yield takeLatest(fetchOrderDetailRequest.type, fetchOrderDetailSaga);
  yield takeLatest(fetchOrderByNumberRequest.type, fetchOrderByNumberSaga);
}
