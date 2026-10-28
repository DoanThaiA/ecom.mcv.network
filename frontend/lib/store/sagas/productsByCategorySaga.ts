import { call, put, takeLatest } from 'redux-saga/effects';
import { productRepository } from '@/lib/repositories/product.repository';
import {
  fetchProductsByCategoryRequest,
  setLoading,
  setSuccess,
  FetchProductsByCategoryPayload,
} from '../slices/productsByCategorySlice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GetProductsResponse } from '@/types/product';
import { showErrorToast } from '@/lib/helpers/toastHelper';

function* fetchProductsByCategorySaga(
  action: PayloadAction<FetchProductsByCategoryPayload>
) {
  try {
    yield put(setLoading(true));

    const { append = false, ...queryParams } = action.payload;

    const response: GetProductsResponse = yield call(
      [productRepository, productRepository.getShopProducts],
      queryParams
    );

    yield put(setSuccess({ response, append }));
  } catch (error: any) {
    yield put(setLoading(false));
    showErrorToast(error);
  }
}

export function* watchProductsByCategory() {
  yield takeLatest(fetchProductsByCategoryRequest.type, fetchProductsByCategorySaga);
}
