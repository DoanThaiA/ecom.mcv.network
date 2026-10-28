import type { PayloadAction } from '@reduxjs/toolkit';
import { call, put, takeLatest } from 'redux-saga/effects';
import i18next from 'src/i18next';
import { productCategoryRepository } from 'src/repositories';
import type { ProductCategory } from 'src/types/gen/shared/shared/product-categories/product-category';
import { showError, showSuccess } from 'src/utils/toast';
import {
  getProductCategoriesRequest,
  getProductCategoryByIdRequest,
  updateProductCategoryLocalizationRequest,
  setProductCategoryLoading,
  setProductCategoriesSuccess,
  setProductCategoryFailure,
  setCurrentProductCategoryLoading,
  setCurrentProductCategorySuccess,
  setCurrentProductCategoryFailure,
  setUpdateProductCategoryLoading,
  setUpdateProductCategorySuccess,
  setUpdateProductCategoryFailure,
  type GetProductCategoriesPayload,
  type GetProductCategoryByIdPayload,
  type UpdateProductCategoryLocalizationPayload,
} from '../store/productCategorySlice';

/**
 * Get Product Categories Saga
 * Fetches product categories with filters, sorting, and pagination
 */
function* getProductCategoriesSaga(action: PayloadAction<GetProductCategoriesPayload>) {
  const { page = 1, limit = 10, filters, sort } = action.payload;

  try {
    yield put(setProductCategoryLoading(true));

    const productCategories: ProductCategory[] = yield call(
      productCategoryRepository.getProductCategories,
      {
        page,
        limit,
        filters,
        sort,
      }
    );

    yield put(
      setProductCategoriesSuccess({
        productCategories,
      })
    );
  } catch (error) {
    yield put(setProductCategoryFailure());
    showError(error);
  }
}

/**
 * Get Product Category By ID Saga
 * Fetches a single product category by ID
 */
function* getProductCategoryByIdSaga(action: PayloadAction<GetProductCategoryByIdPayload>) {
  const { id } = action.payload;

  try {
    yield put(setCurrentProductCategoryLoading(true));

    const productCategory: ProductCategory = yield call(
      productCategoryRepository.getProductCategoryById,
      id
    );

    yield put(setCurrentProductCategorySuccess(productCategory));
  } catch (error) {
    yield put(setCurrentProductCategoryFailure());
    showError(error);
  }
}

/**
 * Update Product Category Localization Saga
 * Updates category localization (name)
 */
function* updateProductCategoryLocalizationSaga(
  action: PayloadAction<UpdateProductCategoryLocalizationPayload>
) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setUpdateProductCategoryLoading(true));

    // Call API to update category localization
    const category: ProductCategory = yield call(
      productCategoryRepository.updateProductCategoryLocalization,
      data
    );

    // Update state with updated category
    yield put(setUpdateProductCategorySuccess(category));
    showSuccess(i18next.t('updateCategorySuccess'));

    // Call success callback
    if (onSuccess) {
      onSuccess(category);
    }
  } catch (error) {
    yield put(setUpdateProductCategoryFailure());
    showError(error);
  }
}

/**
 * Root Product Category Saga Watcher
 */
function* watchProductCategory() {
  yield takeLatest(getProductCategoriesRequest.type, getProductCategoriesSaga);
  yield takeLatest(getProductCategoryByIdRequest.type, getProductCategoryByIdSaga);
  yield takeLatest(
    updateProductCategoryLocalizationRequest.type,
    updateProductCategoryLocalizationSaga
  );
}

/**
 * Root Product Category Saga
 */
export function* productCategorySaga() {
  yield call(watchProductCategory);
}
