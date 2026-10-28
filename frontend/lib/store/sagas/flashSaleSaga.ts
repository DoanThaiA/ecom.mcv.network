import { call, put, takeLatest } from 'redux-saga/effects';
import { shopRepository } from '@/lib/repositories/shop.repository';
import {
  getFlashSaleDataRequest,
  getFlashSaleDataSuccess,
  getFlashSaleDataFailure,
  GetFlashSaleDataPayload,
} from '../slices/flashSaleSlice';
import { PayloadAction } from '@reduxjs/toolkit';
import type { ShopFlashSaleProductsResponse } from '@/types/gen/shop/shop/shop/shop';

function* handleGetFlashSaleData(
  action: PayloadAction<GetFlashSaleDataPayload>
) {
  try {
    const {
      page,
      limit,
      topicId,
      categoryId,
      categoryIds,
      minPrice,
      maxPrice,
      append,
    } = action.payload;

    // Determine categoryIds: use categoryIds if provided, otherwise fallback to categoryId
    const finalCategoryIds = categoryIds || (categoryId ? [categoryId] : []);

    // Build filters object with only API-supported filters
    const filters: {
      topicId?: string;
      categoryIds: string[];
      minPrice?: number;
      maxPrice?: number;
    } = {
      categoryIds: finalCategoryIds,
    };

    if (topicId) {
      filters.topicId = topicId;
    }

    if (minPrice !== undefined) {
      filters.minPrice = minPrice;
    }

    if (maxPrice !== undefined) {
      filters.maxPrice = maxPrice;
    }

    // Fetch flash sale products with filters & pagination
    const productsResponse: ShopFlashSaleProductsResponse = yield call(
      [shopRepository, shopRepository.getFlashSaleProducts],
      {
        page,
        limit,
        filters,
      }
    );

    yield put(
      getFlashSaleDataSuccess({
        products: (productsResponse.data || []) as any,
        total: productsResponse.total || 0,
        page: productsResponse.page || 1,
        limit: productsResponse.limit || 0,
        totalPages: productsResponse.totalPages || 0,
        hasNextPage: productsResponse.hasNextPage || false,
        append: append || false,
      })
    );
  } catch (error: any) {
    yield put(
      getFlashSaleDataFailure(
        error.message || 'Failed to fetch flash sale data'
      )
    );
  }
}

export function* flashSaleSaga() {
  yield takeLatest(getFlashSaleDataRequest.type, handleGetFlashSaleData);
}
