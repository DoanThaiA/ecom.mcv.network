import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { productBannerRepository } from 'src/repositories/product-banner.repository';
import type { ProductBanner } from 'src/types/gen/shared/shared/product-banners/product-banner';
import type { QueryProductBannersResponse } from 'src/types/gen/cms/cms/product-banners/product-banner';
import { showError, showSuccess } from 'src/utils/toast';
import {
  createProductBannerRequest,
  deleteProductBannerRequest,
  getProductBannerByIdRequest,
  getProductBannersRequest,
  setProductBannerError,
  setProductBannerLoading,
  setProductBannersSuccess,
  setCreateProductBannerError,
  setCreateProductBannerLoading,
  setCreateProductBannerSuccess,
  setCurrentProductBannerError,
  setCurrentProductBannerLoading,
  setCurrentProductBannerSuccess,
  setDeleteProductBannerError,
  setDeleteProductBannerLoading,
  setDeleteProductBannerSuccess,
  setUpdateProductBannerError,
  setUpdateProductBannerLoading,
  setUpdateProductBannerSuccess,
  updateProductBannerRequest,
  type CreateProductBannerPayload,
  type DeleteProductBannerPayload,
  type GetProductBannerByIdPayload,
  type GetProductBannersPayload,
  type UpdateProductBannerPayload,
} from '../store/productBannerSlice';

/**
 * Get Product Banners Saga
 * Fetches product banners with filters, sorting, and pagination
 */
function* getProductBannersSaga(action: PayloadAction<GetProductBannersPayload>) {
  const { page = 1, limit = 10, filters, sort, onSuccess } = action.payload;

  try {
    yield put(setProductBannerLoading(true));

    // Call API to get product banners
    const response: QueryProductBannersResponse = yield call(
      productBannerRepository.getProductBanners,
      {
        page,
        limit,
        filters,
        sort,
      }
    );
    // Transform ProductBanner[] to ProductBannerListItem[]
    // Calculate productCount from products array length
    const transformedData = response.data.map((banner) => ({
      id: banner.id,
      name: banner.name,
      image: banner.image,
      position: banner.position,
      ratio: banner.ratio,
      isActive: banner.isActive,
      productCount: banner.productCount,
      createdAt: banner.createdAt,
      updatedAt: banner.updatedAt,
    }));

    // Update state with product banners and pagination
    yield put(
      setProductBannersSuccess({
        banners: transformedData,
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
  } catch (error) {
    console.error('Get product banners error:', error);
    yield put(setProductBannerError());
    showError(error);
  }
}

/**
 * Get Product Banner By ID Saga
 * Fetches a single product banner by ID
 */
function* getProductBannerByIdSaga(action: PayloadAction<GetProductBannerByIdPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setCurrentProductBannerLoading(true));

    // Call API to get product banner by ID
    const banner: ProductBanner = yield call(productBannerRepository.getProductBannerById, id);

    // Update state with product banner
    yield put(setCurrentProductBannerSuccess(banner));

    // Call success callback
    if (onSuccess) {
      onSuccess(banner);
    }
  } catch (error) {
    console.error('Get product banner by ID error:', error);
    yield put(setCurrentProductBannerError());
    showError(error);
  }
}

/**
 * Create Product Banner Saga
 * Creates a new product banner
 */
function* createProductBannerSaga(action: PayloadAction<CreateProductBannerPayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setCreateProductBannerLoading(true));

    // Call API to create product banner
    const banner: ProductBanner = yield call(productBannerRepository.createProductBanner, data);

    console.log('Create product banner response:', banner);

    // Update state with new product banner
    yield put(setCreateProductBannerSuccess(banner));
    showSuccess(i18next.t('createProductBannerSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess(banner);
    }
  } catch (error) {
    console.error('Create product banner error:', error);
    yield put(setCreateProductBannerError());
    showError(error);
  }
}

/**
 * Update Product Banner Saga
 * Updates an existing product banner
 */
function* updateProductBannerSaga(action: PayloadAction<UpdateProductBannerPayload>) {
  const { id, data, onSuccess } = action.payload;

  try {
    yield put(setUpdateProductBannerLoading(true));

    // Call API to update product banner
    const banner: ProductBanner = yield call(productBannerRepository.updateProductBanner, id, data);

    // Update state with updated product banner
    yield put(setUpdateProductBannerSuccess(banner));
    showSuccess(i18next.t('updateProductBannerSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess(banner);
    }
  } catch (error) {
    console.error('Update product banner error:', error);
    yield put(setUpdateProductBannerError());
    showError(error);
  }
}

/**
 * Delete Product Banner Saga
 * Deletes a product banner
 */
function* deleteProductBannerSaga(action: PayloadAction<DeleteProductBannerPayload>) {
  const { id, onSuccess } = action.payload;

  try {
    yield put(setDeleteProductBannerLoading(true));

    // Call API to delete product banner
    yield call(productBannerRepository.deleteProductBanner, id);

    console.log('Delete product banner success:', id);

    // Update state - remove deleted product banner
    yield put(setDeleteProductBannerSuccess(id));
    showSuccess(i18next.t('deleteProductBannerSuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    console.error('Delete product banner error:', error);
    yield put(setDeleteProductBannerError());
    showError(error);
  }
}

/**
 * Root Product Banner Saga Watcher
 */
function* watchProductBanner() {
  yield takeLatest(getProductBannersRequest.type, getProductBannersSaga);
  yield takeLatest(getProductBannerByIdRequest.type, getProductBannerByIdSaga);
  yield takeLatest(createProductBannerRequest.type, createProductBannerSaga);
  yield takeLatest(updateProductBannerRequest.type, updateProductBannerSaga);
  yield takeLatest(deleteProductBannerRequest.type, deleteProductBannerSaga);
}

/**
 * Root Product Banner Saga
 */
export function* productBannerSaga() {
  yield call(watchProductBanner);
}
