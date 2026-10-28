import { call, put, takeLatest } from 'redux-saga/effects';
import { productRepository } from '@/lib/repositories/product.repository';
import {
  getProductByIdRequest,
  setCurrentProductLoading,
  setCurrentProductSuccess,
  type GetProductByIdPayload,
} from '../slices/productDetailSlice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types/gen/shared/shared/products/product';
import { showErrorToast } from '@/lib/helpers/toastHelper';

/**
 * Get Product By ID Saga
 * Fetches a single product by ID
 */
function* getProductByIdSaga(action: PayloadAction<GetProductByIdPayload>) {
  const { id } = action.payload;

  try {
    yield put(setCurrentProductLoading(true));

    // Call API to get product by ID
    const product: Product = yield call(
      productRepository.getProductById.bind(productRepository),
      id
    );

    // Update state with product
    yield put(setCurrentProductSuccess(product));
  } catch (error: any) {
    // Set loading to false
    yield put(setCurrentProductLoading(false));

    // Redirect to home for 404 (not found / not saleable / no price)
    const status = error?.response?.status;
    if (status === 404) {
      window.location.href = '/';
      return;
    }

    // Show error notification for other errors
    showErrorToast(error);
  }
}

/**
 * Product Detail Saga Watcher
 */
export function* watchProductDetail() {
  yield takeLatest(getProductByIdRequest.type, getProductByIdSaga);
}
