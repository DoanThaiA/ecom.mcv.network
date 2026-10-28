import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { productRepository } from 'src/repositories';
import type { UpdateProductPayload } from 'src/types';
import { ProductInventory } from 'src/types/gen/shared/shared/product-inventories/product-inventory';
import type { Product } from 'src/types/gen/shared/shared/products/product';
import type { GetProductsResponse } from 'src/types/products';
import { showError, showSuccess } from 'src/utils/toast';
import {
  getProductByIdRequest,
  getProductInventoryRequest,
  getProductsRequest,
  setCurrentProductError,
  setCurrentProductLoading,
  setCurrentProductSuccess,
  setInventoryError,
  setInventoryLoading,
  setInventorySuccess,
  setProductError,
  setProductLoading,
  setProductsSuccess,
  setUpdateProductLoading,
  updateProductRequest,
  updateProductSuccess,
  toggleProductStatusRequest,
  updateProductsHiddenStatus,
  setToggleStatusLoading,
  type GetProductByIdPayload,
  type GetProductInventoryPayload,
  type GetProductsPayload,
  type ToggleProductStatusPayload,
} from '../store/productSlice';

/**
 * Get Products Saga
 * Fetches products with filters, sorting, and pagination
 */
function* getProductsSaga(action: PayloadAction<GetProductsPayload>) {
  const { page = 1, limit = 10, filters, sort, onSuccess, onError } = action.payload;

  try {
    yield put(setProductLoading(true));

    // Call API to get products
    const response: GetProductsResponse = yield call(productRepository.getProducts, {
      page,
      limit,
      filters,
      sort,
    });

    console.log('Products response:', response);

    // Update state with products and pagination
    yield put(
      setProductsSuccess({
        products: response.data,
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
    console.error('Get products error:', error);
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Không thể tải danh sách sản phẩm';

    yield put(setProductError(errorMessage));
    showError(errorMessage);

    // Call error callback
    if (onError) {
      onError(errorMessage);
    }
  }
}

/**
 * Get Product By ID Saga
 * Fetches a single product by ID
 */
function* getProductByIdSaga(action: PayloadAction<GetProductByIdPayload>) {
  const { id, onSuccess, onError } = action.payload;

  try {
    yield put(setCurrentProductLoading(true));

    // Call API to get product by ID
    const product: Product = yield call(productRepository.getProductById, id);

    console.log('Product detail response:', product);

    // Update state with product
    yield put(setCurrentProductSuccess(product));

    // Call success callback
    if (onSuccess) {
      onSuccess(product);
    }
  } catch (error: any) {
    console.error('Get product by ID error:', error);
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Không thể tải thông tin sản phẩm';

    yield put(setCurrentProductError(errorMessage));
    showError(errorMessage);

    // Call error callback
    if (onError) {
      onError(errorMessage);
    }
  }
}

/**
 * Get Product Inventory Saga
 * Fetches product inventory by product ID
 */
function* getProductInventorySaga(action: PayloadAction<GetProductInventoryPayload>) {
  const { id, onSuccess, onError } = action.payload;

  try {
    yield put(setInventoryLoading(true));

    // Call API to get product inventory
    const inventory: ProductInventory = yield call(productRepository.getProductInventoryById, id);

    console.log('Product inventory response:', inventory);

    // Wrap single inventory into GetInventoriesResponse format
    const inventoryResponse = {
      data: [inventory],
      hasNextPage: false,
      total: 1,
      page: 1,
      limit: 1,
      totalPages: 1,
    };

    // Update state with inventory
    yield put(setInventorySuccess(inventoryResponse));

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    console.error('Get product inventory error:', error);
    const errorMessage =
      error?.response?.data?.message || error?.message || 'Không thể tải thông tin tồn kho';

    yield put(setInventoryError(errorMessage));
    showError(errorMessage);

    // Call error callback
    if (onError) {
      onError(errorMessage);
    }
  }
}

/**
 * Update Product Saga
 * Updates product additional information
 */
function* updateProductSaga(action: PayloadAction<UpdateProductPayload>) {
  const { id, data, onSuccess } = action.payload;

  try {
    yield put(setUpdateProductLoading(true));

    // Call API to update product
    const product: Product = yield call(productRepository.updateProduct, id, data);

    console.log('Update product response:', product);

    // Update state with updated product
    yield put(updateProductSuccess(product));
    showSuccess(i18next.t('updateProductSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    console.error('Update product error:', error);
    yield put(setUpdateProductLoading(false));
    showError(error);
  }
}

/**
 * Toggle Product Status Saga
 * Bulk hide/show products
 */
function* toggleProductStatusSaga(action: PayloadAction<ToggleProductStatusPayload>) {
  const { items } = action.payload;
  const productIds = items.map((item) => item.productId);

  try {
    // Set loading for all products
    for (const id of productIds) {
      yield put(setToggleStatusLoading({ id, loading: true }));
    }

    // Call API
    yield call(productRepository.bulkHideProducts, { items });

    // Update local state (API doesn't return updated data)
    yield put(updateProductsHiddenStatus(items));
    showSuccess(i18next.t('updateProductSuccess'));
  } catch (error) {
    console.error('Toggle product status error:', error);
    showError(error);
  } finally {
    for (const id of productIds) {
      yield put(setToggleStatusLoading({ id, loading: false }));
    }
  }
}

/**
 * Root Product Saga Watcher
 */
function* watchProduct() {
  yield takeLatest(getProductsRequest.type, getProductsSaga);
  yield takeLatest(getProductByIdRequest.type, getProductByIdSaga);
  yield takeLatest(getProductInventoryRequest.type, getProductInventorySaga);
  yield takeLatest(updateProductRequest.type, updateProductSaga);
  yield takeLatest(toggleProductStatusRequest.type, toggleProductStatusSaga);
}

/**
 * Root Product Saga
 */
export function* productSaga() {
  yield call(watchProduct);
}
