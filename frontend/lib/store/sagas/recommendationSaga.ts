import { call, put, takeEvery, select } from 'redux-saga/effects';
import { productRepository } from '@/lib/repositories';
import {
  getRecommendationsRequest,
  setRecommendationsLoading,
  setRecommendationsSuccess,
  selectRecommendationsHasLoaded,
  getCrossSellRequest,
  setCrossSellLoading,
  setCrossSellSuccess,
  selectCrossSellProductIds,
  type GetCrossSellPayload,
  type GetRecommendationsPayload,
} from '../slices/recommendationSlice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types/gen/shared/shared/products/product';
import type { RootState } from '../index';

/**
 * Get Recommendations Saga
 */
function* getRecommendationsSaga(action: PayloadAction<GetRecommendationsPayload>) {
  const { limit = 8 } = action.payload;

  // Check if already loaded - prevent re-fetching
  const hasLoaded: boolean = yield select(
    (state: RootState) => selectRecommendationsHasLoaded(state)
  );

  if (hasLoaded) {
    return;
  }

  try {
    yield put(setRecommendationsLoading(true));

    const products: Product[] = yield call(
      [productRepository, productRepository.getPersonalizedRecommendations],
      limit
    );

    yield put(setRecommendationsSuccess(products));
  } catch {
    // Error handled silently - set loading false
    yield put(setRecommendationsLoading(false));
  }
}

/**
 * Get Cross-Sell Recommendations Saga
 */
function* getCrossSellSaga(action: PayloadAction<GetCrossSellPayload>) {
  const { productIds, limit = 8 } = action.payload;

  // Skip if no productIds provided
  if (!productIds || productIds.length === 0) {
    return;
  }

  // Create cache key from productIds
  const cacheKey = productIds.sort().join(',');

  // Check if already loaded with same productIds - prevent re-fetching
  const currentProductIds: string = yield select(
    (state: RootState) => selectCrossSellProductIds(state)
  );

  if (currentProductIds === cacheKey) {
    return;
  }

  try {
    yield put(setCrossSellLoading(true));

    const products: Product[] = yield call(
      [productRepository, productRepository.getCrossSellRecommendations],
      productIds,
      limit
    );

    yield put(setCrossSellSuccess({ products, productIds: cacheKey }));
  } catch {
    // Error handled silently - set loading false
    yield put(setCrossSellLoading(false));
  }
}

/**
 * Watch Recommendation Saga
 */
export function* recommendationSaga() {
  yield takeEvery(getRecommendationsRequest.type, getRecommendationsSaga);
  yield takeEvery(getCrossSellRequest.type, getCrossSellSaga);
}
