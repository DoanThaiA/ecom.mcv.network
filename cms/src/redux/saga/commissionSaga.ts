import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import i18next from 'i18next';
import { showError, showSuccess } from 'src/utils/toast';
import { commissionRepository } from 'src/repositories/commission.repository';
import type { CommissionSettingsResponse } from 'src/types/gen/shared/shared/commission-settings/commission-settings';
import type { UpdateCommissionSettingsResponse } from 'src/types/gen/cms/cms/commission-settings/commission-settings';
import type { ProductCommissionsPage } from 'src/types/gen/shared/shared/product-commissions/product-commission';
import {
  getCommissionSettingsRequest,
  updateCommissionSettingsRequest,
  getProductCommissionsRequest,
  addProductCommissionsRequest,
  updateProductCommissionRequest,
  bulkUpdateProductCommissionsRequest,
  deleteProductCommissionRequest,
  setSettingsLoading,
  setSettingsSuccess,
  setSettingsError,
  setUpdateSettingsLoading,
  setUpdateSettingsSuccess,
  setUpdateSettingsError,
  setProductsLoading,
  setProductsSuccess,
  setProductsError,
  setAddProductsLoading,
  setAddProductsSuccess,
  setAddProductsError,
  setUpdateProductLoading,
  setUpdateProductSuccess,
  setUpdateProductError,
  setBulkUpdateLoading,
  setBulkUpdateSuccess,
  setBulkUpdateError,
  setDeleteProductLoading,
  setDeleteProductSuccess,
  setDeleteProductError,
  setRecalculationJobId,
  // Affiliate-specific actions
  getAffiliateProductCommissionsRequest,
  addAffiliateProductCommissionsRequest,
  updateAffiliateProductCommissionRequest,
  bulkUpdateAffiliateProductCommissionsRequest,
  deleteAffiliateProductCommissionRequest,
  bulkDeleteAffiliateProductCommissionsRequest,
  setAffiliateProductsLoading,
  setAffiliateProductsSuccess,
  setAffiliateProductsError,
  setAffiliateAddProductsLoading,
  setAffiliateAddProductsSuccess,
  setAffiliateAddProductsError,
  setAffiliateUpdateProductLoading,
  setAffiliateUpdateProductSuccess,
  setAffiliateUpdateProductError,
  setAffiliateBulkUpdateLoading,
  setAffiliateBulkUpdateSuccess,
  setAffiliateBulkUpdateError,
  setAffiliateDeleteProductLoading,
  setAffiliateDeleteProductSuccess,
  setAffiliateDeleteProductError,
  getAffiliateProductIdsRequest,
  setAffiliateAllProductIdsLoading,
  setAffiliateAllProductIdsSuccess,
  setAffiliateAllProductIdsError,
} from '../store/commissionSlice';
import type {
  GetCommissionSettingsPayload,
  UpdateCommissionSettingsPayload,
  GetProductCommissionsPayload,
  AddProductCommissionsPayload,
  UpdateProductCommissionPayload,
  BulkUpdateProductCommissionsPayload,
  DeleteProductCommissionPayload,
  // Affiliate-specific payload types
  GetAffiliateProductCommissionsPayload,
  AddAffiliateProductCommissionsPayload,
  UpdateAffiliateProductCommissionPayload,
  BulkUpdateAffiliateProductCommissionsPayload,
  DeleteAffiliateProductCommissionPayload,
  BulkDeleteAffiliateProductCommissionsPayload,
  GetAffiliateProductIdsPayload,
} from '../store/commissionSlice';

/**
 * Get commission settings saga
 */
function* getCommissionSettingsSaga(action: PayloadAction<GetCommissionSettingsPayload>) {
  const { onSuccess } = action.payload;

  try {
    yield put(setSettingsLoading(true));

    const response: CommissionSettingsResponse = yield call(
      commissionRepository.getCommissionSettings
    );

    yield put(setSettingsSuccess(response));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setSettingsError());
    showError(error);
  }
}

/**
 * Update commission settings saga
 */
function* updateCommissionSettingsSaga(action: PayloadAction<UpdateCommissionSettingsPayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setUpdateSettingsLoading(true));

    const response: UpdateCommissionSettingsResponse = yield call(
      commissionRepository.updateCommissionSettings,
      data
    );

    yield put(setUpdateSettingsSuccess(response.settings!));

    // Handle recalculation job
    if (response.jobId) {
      yield put(setRecalculationJobId(response.jobId));
    }

    // Always show success toast
    showSuccess(i18next.t('updateCommissionSettingsSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setUpdateSettingsError());
    showError(error);
  }
}

/**
 * Get product commissions saga
 */
function* getProductCommissionsSaga(action: PayloadAction<GetProductCommissionsPayload>) {
  const { page = 1, limit = 10, search, categoryNames } = action.payload;

  try {
    yield put(setProductsLoading(true));

    const response: ProductCommissionsPage = yield call(
      commissionRepository.getProductCommissions,
      { page, limit, search, categoryNames }
    );

    yield put(
      setProductsSuccess({
        products: response.data || [],
        pagination: {
          page: response.page || 1,
          limit: response.limit || 10,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
          hasNextPage: response.hasNextPage || false,
        },
      })
    );
  } catch (error) {
    yield put(setProductsError());
    showError(error);
  }
}

/**
 * Add product commissions saga
 */
function* addProductCommissionsSaga(action: PayloadAction<AddProductCommissionsPayload>) {
  const { products, onSuccess } = action.payload;

  try {
    yield put(setAddProductsLoading(true));

    yield call(commissionRepository.addProductCommissions, products);

    yield put(setAddProductsSuccess());
    showSuccess(i18next.t('addProductSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setAddProductsError());
    showError(error);
  }
}

/**
 * Update product commission saga
 */
function* updateProductCommissionSaga(action: PayloadAction<UpdateProductCommissionPayload>) {
  const { productId, rate, onSuccess } = action.payload;

  try {
    yield put(setUpdateProductLoading(true));

    yield call(commissionRepository.updateProductCommission, productId, rate);

    yield put(setUpdateProductSuccess());
    showSuccess(i18next.t('updateCommissionRateSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setUpdateProductError());
    showError(error);
  }
}

/**
 * Bulk update product commissions saga
 */
function* bulkUpdateProductCommissionsSaga(
  action: PayloadAction<BulkUpdateProductCommissionsPayload>
) {
  const { productIds, rate, onSuccess } = action.payload;

  try {
    yield put(setBulkUpdateLoading(true));

    yield call(commissionRepository.bulkUpdateProductCommissions, productIds, rate);

    yield put(setBulkUpdateSuccess());
    showSuccess(i18next.t('bulkUpdateSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setBulkUpdateError());
    showError(error);
  }
}

/**
 * Delete product commission saga
 */
function* deleteProductCommissionSaga(action: PayloadAction<DeleteProductCommissionPayload>) {
  const { productId } = action.payload;

  try {
    yield put(setDeleteProductLoading(true));

    yield call(commissionRepository.deleteProductCommission, productId);

    yield put(setDeleteProductSuccess());
    showSuccess(i18next.t('deleteProductSuccess'));
  } catch (error) {
    yield put(setDeleteProductError());
    showError(error);
  }
}

// ----------------------------------------------------------------------
// Affiliate-specific sagas
// ----------------------------------------------------------------------

/**
 * Get affiliate product commissions saga
 */
function* getAffiliateProductCommissionsSaga(
  action: PayloadAction<GetAffiliateProductCommissionsPayload>
) {
  const { affiliateId, page = 1, limit = 10, search } = action.payload;

  try {
    yield put(setAffiliateProductsLoading(true));

    const response: ProductCommissionsPage = yield call(
      commissionRepository.getAffiliateProductCommissions,
      affiliateId,
      { page, limit, search }
    );

    yield put(
      setAffiliateProductsSuccess({
        products: response.data || [],
        pagination: {
          page: response.page || 1,
          limit: response.limit || 10,
          total: response.total || 0,
          totalPages: response.totalPages || 0,
          hasNextPage: response.hasNextPage || false,
        },
      })
    );
  } catch (error) {
    yield put(setAffiliateProductsError());
    showError(error);
  }
}

/**
 * Add affiliate product commissions saga
 */
function* addAffiliateProductCommissionsSaga(
  action: PayloadAction<AddAffiliateProductCommissionsPayload>
) {
  const { affiliateId, products, onSuccess } = action.payload;

  try {
    yield put(setAffiliateAddProductsLoading(true));

    yield call(commissionRepository.addAffiliateProductCommissions, affiliateId, products);

    yield put(setAffiliateAddProductsSuccess());
    showSuccess(i18next.t('addProductSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setAffiliateAddProductsError());
    showError(error);
  }
}

/**
 * Update affiliate product commission saga
 */
function* updateAffiliateProductCommissionSaga(
  action: PayloadAction<UpdateAffiliateProductCommissionPayload>
) {
  const { affiliateId, productId, rate, onSuccess } = action.payload;

  try {
    yield put(setAffiliateUpdateProductLoading(true));

    yield call(commissionRepository.updateAffiliateProductCommission, affiliateId, productId, rate);

    yield put(setAffiliateUpdateProductSuccess());
    showSuccess(i18next.t('updateCommissionRateSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setAffiliateUpdateProductError());
    showError(error);
  }
}

/**
 * Bulk update affiliate product commissions saga
 */
function* bulkUpdateAffiliateProductCommissionsSaga(
  action: PayloadAction<BulkUpdateAffiliateProductCommissionsPayload>
) {
  const { affiliateId, productIds, rate, onSuccess } = action.payload;

  try {
    yield put(setAffiliateBulkUpdateLoading(true));

    yield call(
      commissionRepository.bulkUpdateAffiliateProductCommissions,
      affiliateId,
      productIds,
      rate
    );

    yield put(setAffiliateBulkUpdateSuccess());
    showSuccess(i18next.t('bulkUpdateSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setAffiliateBulkUpdateError());
    showError(error);
  }
}

/**
 * Delete affiliate product commission saga
 */
function* deleteAffiliateProductCommissionSaga(
  action: PayloadAction<DeleteAffiliateProductCommissionPayload>
) {
  const { affiliateId, productId, onSuccess } = action.payload;

  try {
    yield put(setAffiliateDeleteProductLoading(true));

    yield call(commissionRepository.deleteAffiliateProductCommission, affiliateId, productId);

    yield put(setAffiliateDeleteProductSuccess());
    showSuccess(i18next.t('deleteProductSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setAffiliateDeleteProductError());
    showError(error);
  }
}

/**
 * Bulk delete affiliate product commissions saga
 */
function* bulkDeleteAffiliateProductCommissionsSaga(
  action: PayloadAction<BulkDeleteAffiliateProductCommissionsPayload>
) {
  const { affiliateId, productIds, onSuccess } = action.payload;

  try {
    yield put(setAffiliateDeleteProductLoading(true));

    yield call(commissionRepository.bulkDeleteAffiliateProductCommissions, affiliateId, productIds);

    yield put(setAffiliateDeleteProductSuccess());
    showSuccess(i18next.t('bulkDeleteSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setAffiliateDeleteProductError());
    showError(error);
  }
}

/**
 * Get all affiliate product IDs saga (for dialog pre-selection)
 */
function* getAffiliateProductIdsSaga(action: PayloadAction<GetAffiliateProductIdsPayload>) {
  const { affiliateId, onSuccess } = action.payload;

  try {
    yield put(setAffiliateAllProductIdsLoading(true));

    const productIds: string[] = yield call(
      commissionRepository.getAffiliateProductIds,
      affiliateId
    );

    yield put(setAffiliateAllProductIdsSuccess(productIds));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setAffiliateAllProductIdsError());
    showError(error);
  }
}

/**
 * Root commission saga watcher
 */
function* watchCommission() {
  // Global commission watchers
  yield takeLatest(getCommissionSettingsRequest.type, getCommissionSettingsSaga);
  yield takeLatest(updateCommissionSettingsRequest.type, updateCommissionSettingsSaga);
  yield takeLatest(getProductCommissionsRequest.type, getProductCommissionsSaga);
  yield takeLatest(addProductCommissionsRequest.type, addProductCommissionsSaga);
  yield takeLatest(updateProductCommissionRequest.type, updateProductCommissionSaga);
  yield takeLatest(bulkUpdateProductCommissionsRequest.type, bulkUpdateProductCommissionsSaga);
  yield takeLatest(deleteProductCommissionRequest.type, deleteProductCommissionSaga);

  // Affiliate-specific watchers
  yield takeLatest(getAffiliateProductCommissionsRequest.type, getAffiliateProductCommissionsSaga);
  yield takeLatest(addAffiliateProductCommissionsRequest.type, addAffiliateProductCommissionsSaga);
  yield takeLatest(
    updateAffiliateProductCommissionRequest.type,
    updateAffiliateProductCommissionSaga
  );
  yield takeLatest(
    bulkUpdateAffiliateProductCommissionsRequest.type,
    bulkUpdateAffiliateProductCommissionsSaga
  );
  yield takeLatest(
    deleteAffiliateProductCommissionRequest.type,
    deleteAffiliateProductCommissionSaga
  );
  yield takeLatest(
    bulkDeleteAffiliateProductCommissionsRequest.type,
    bulkDeleteAffiliateProductCommissionsSaga
  );
  yield takeLatest(getAffiliateProductIdsRequest.type, getAffiliateProductIdsSaga);
}

/**
 * Export commission saga
 */
export function* commissionSaga() {
  yield call(watchCommission);
}
