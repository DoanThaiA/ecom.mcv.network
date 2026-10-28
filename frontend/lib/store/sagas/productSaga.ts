import { call, put, takeEvery } from 'redux-saga/effects';
import { productRepository } from '@/lib/repositories/product.repository';
import {
  getProductsRequest,
  setFlashSaleLoading,
  setFlashSaleSuccess,
  setTopProductsLoading,
  setTopProductsSuccess,
  setComboProductsLoading,
  setComboProductsSuccess,
  setComboDealProductsLoading,
  setComboDealProductsSuccess,
  setNewProductsLoading,
  setNewProductsSuccess,
  type GetProductsPayload,
} from '../slices/productSlice';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { GetProductsResponse } from '@/types/product';
import type { ShopQueryProduct as QueryProduct } from '@/types/gen/shop/shop/products/product';
import { showErrorToast } from '@/lib/helpers/toastHelper';

/**
 * Get Products Saga
 * Fetches products with filters, sorting, and pagination
 * Routes to appropriate section based on payload.section
 */
function* getProductsSaga(action: PayloadAction<GetProductsPayload>) {
  const { page = 1, limit = 10, filters, sort, section } = action.payload;

  try {
    // Set loading state based on section
    switch (section) {
      case 'flashSale':
        yield put(setFlashSaleLoading(true));
        break;
      case 'topProducts':
        yield put(setTopProductsLoading(true));
        break;
      case 'comboProducts':
        yield put(setComboProductsLoading(true));
        break;
      case 'comboDeals':
        yield put(setComboDealProductsLoading(true));
        break;
      case 'newProducts':
        yield put(setNewProductsLoading(true));
        break;
      default:
        yield put(setFlashSaleLoading(true)); // Default to flashSale
    }
    const request: QueryProduct = {
      sort,
      filters,
      limit,
      page,
    };
    // Call API to get products
    const response: GetProductsResponse = yield call(
      productRepository.getProducts,
      request
    );

    // Update state based on section
    switch (section) {
      case 'flashSale':
        yield put(setFlashSaleSuccess(response.data));
        break;
      case 'topProducts':
        yield put(setTopProductsSuccess(response.data));
        break;
      case 'comboProducts':
        yield put(setComboProductsSuccess(response.data));
        break;
      case 'comboDeals':
        yield put(setComboDealProductsSuccess(response.data));
        break;
      case 'newProducts':
        yield put(setNewProductsSuccess(response.data));
        break;
      default:
        yield put(setFlashSaleSuccess(response.data)); // Default to flashSale
    }
  } catch (error: any) {
    // Set loading to false for all sections
    yield put(setFlashSaleLoading(false));
    yield put(setTopProductsLoading(false));
    yield put(setComboProductsLoading(false));
    yield put(setComboDealProductsLoading(false));
    yield put(setNewProductsLoading(false));

    // Show error notification
    showErrorToast(error);
  }
}

/**
 * Root Product Saga Watcher
 */
export function* watchProduct() {
  // Use takeEvery to allow multiple concurrent requests for different sections
  yield takeEvery(getProductsRequest.type, getProductsSaga);
}
