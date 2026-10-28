import { call, put, takeLatest } from 'redux-saga/effects';
import { productRepository } from '@/lib/repositories/product.repository';
import {
  fetchProductsByTopicRequest,
  setLoading,
  setSuccess,
  FetchProductsByTopicPayload,
} from '../slices/productsByTopicSlice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GetProductsResponse } from '@/types/product';
import { showErrorToast } from '@/lib/helpers/toastHelper';

function* fetchProductsByTopicSaga(
  action: PayloadAction<FetchProductsByTopicPayload>
) {
  try {
    yield put(setLoading(true));

    const { append = false, ...queryParams } = action.payload;

    const response: GetProductsResponse = yield call(
      [productRepository, productRepository.getShopProducts],
      queryParams
    );

    yield put(setSuccess({ response, append }));
  } catch (error: unknown) {
    yield put(setLoading(false));
    showErrorToast(error);
  }
}

export function* watchProductsByTopic() {
  yield takeLatest(fetchProductsByTopicRequest.type, fetchProductsByTopicSaga);
}
