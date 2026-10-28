import { call, put, takeEvery, select } from 'redux-saga/effects';
import { topicRepository } from '@/lib/repositories';
import {
  getTopicProductsRequest,
  setTopicProductsLoading,
  setTopicProductsSuccess,
  selectTopicProductsCache,
  getTopicCategoriesRequest,
  setTopicCategoriesLoading,
  setTopicCategoriesSuccess,
  getTopicBannersRequest,
  setTopicBannersLoading,
  setTopicBannersSuccess,
  type GetTopicProductsPayload,
  type GetTopicCategoriesPayload,
  type GetTopicBannersPayload,
} from '../slices/topicSlice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { Product } from '@/types/gen/shared/shared/products/product';
import type { ShopTopicCategory, ShopTopicResponse } from '@/types/gen/shared/shared/topics/topic';
import type { RootState } from '../index';
import type { ShopTopicProductsResponse } from '@/types/gen/shop/shop/products/product';

/**
 * Get Topic Products Saga
 */
function* getTopicProductsSaga(action: PayloadAction<GetTopicProductsPayload>) {
  const { slug, page = 1, limit = 6, append = false } = action.payload;

  // Check if already cached and not loading more
  if (!append) {
    const cache: ReturnType<typeof selectTopicProductsCache> = yield select(
      (state: RootState) => selectTopicProductsCache(state, slug)
    );

    // Skip if already loaded
    if (cache && cache.products.length > 0 && !cache.loading) {
      return;
    }
  }

  try {
    yield put(setTopicProductsLoading({ slug, loading: true }));

    const response: ShopTopicProductsResponse = yield call(
      [topicRepository, topicRepository.getTopicProducts],
      {
        slug,
        page,
        limit,
      }
    );

    const products: Product[] = response.data as any;

    yield put(
      setTopicProductsSuccess({
        slug,
        products,
        hasNextPage: response.hasNextPage,
        page: response.page,
        append,
      })
    );
  } catch {
    // Error handled silently - set loading false
    yield put(setTopicProductsLoading({ slug, loading: false }));
  }
}

/**
 * Get Topic Categories Saga
 */
function* getTopicCategoriesSaga(action: PayloadAction<GetTopicCategoriesPayload>) {
  const { slug } = action.payload;

  try {
    yield put(setTopicCategoriesLoading({ slug, loading: true }));

    const response: ShopTopicResponse = yield call(
      [topicRepository, topicRepository.getTopicBySlug],
      slug
    );

    const categories: ShopTopicCategory[] = response.categories || [];

    yield put(
      setTopicCategoriesSuccess({
        slug,
        categories,
      })
    );
  } catch {
    // Error handled silently - set loading false
    yield put(setTopicCategoriesLoading({ slug, loading: false }));
  }
}

/**
 * Get Topic Banners Saga
 */
function* getTopicBannersSaga(action: PayloadAction<GetTopicBannersPayload>) {
  const { slug } = action.payload;

  try {
    yield put(setTopicBannersLoading({ slug, loading: true }));

    const response: ShopTopicResponse = yield call(
      [topicRepository, topicRepository.getTopicBySlug],
      slug
    );

    const banners = ((response as any).banners || []).map((b: any) => ({
      id: b.id,
      mediaType: b.mediaType,
      media: {
        mobile: b.media?.mobile,
        tablet: b.media?.tablet,
        desktop: b.media?.desktop,
      },
      link: b.link,
      order: b.order,
    }));

    yield put(
      setTopicBannersSuccess({
        slug,
        banners,
      })
    );
  } catch {
    yield put(setTopicBannersLoading({ slug, loading: false }));
  }
}

/**
 * Watch Topic Saga
 */
export function* topicSaga() {
  yield takeEvery(getTopicProductsRequest.type, getTopicProductsSaga);
  yield takeEvery(getTopicCategoriesRequest.type, getTopicCategoriesSaga);
  yield takeEvery(getTopicBannersRequest.type, getTopicBannersSaga);
}
