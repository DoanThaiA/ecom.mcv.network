import { call, put, takeLatest } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import i18next from 'src/i18next';
import { showError, showSuccess } from 'src/utils/toast';
import { affiliateRepository } from 'src/repositories/affiliate.repository';
import type { QueryAffiliatesResponse } from 'src/types/gen/cms/cms/affiliates/affiliate';
import type { Affiliate } from 'src/types/gen/shared/shared/affiliates/affiliate';
import {
  queryAffiliatesRequest,
  createAffiliateRequest,
  updateAffiliateRequest,
  deleteAffiliateRequest,
  bulkDeleteAffiliatesRequest,
  getAffiliateRequest,
  setLoading,
  setQuerySuccess,
  setCurrentAffiliate,
  setCreateLoading,
  setUpdateLoading,
  setDeleteLoading,
} from '../store/affiliatesSlice';
import type {
  QueryAffiliatesPayload,
  CreateAffiliatePayload,
  UpdateAffiliatePayload,
  DeleteAffiliatePayload,
  BulkDeleteAffiliatesPayload,
  GetAffiliatePayload,
} from '../store/affiliatesSlice';

/**
 * Query affiliates saga
 * Fetches affiliates with pagination and filters
 */
function* queryAffiliatesSaga(action: PayloadAction<QueryAffiliatesPayload>) {
  try {
    yield put(setLoading(true));

    const response: QueryAffiliatesResponse = yield call(
      affiliateRepository.queryAffiliates,
      action.payload
    );

    yield put(setQuerySuccess(response));
  } catch (error) {
    yield put(setLoading(false));
    showError(error);
  }
}

/**
 * Get affiliate by ID saga
 */
function* getAffiliateSaga(action: PayloadAction<GetAffiliatePayload>) {
  const { affiliateId, onSuccess } = action.payload;

  try {
    yield put(setLoading(true));

    const affiliate: Affiliate = yield call(affiliateRepository.getAffiliate, affiliateId);

    yield put(setCurrentAffiliate(affiliate));
    yield put(setLoading(false));

    if (onSuccess) {
      onSuccess(affiliate);
    }
  } catch (error) {
    yield put(setLoading(false));
    showError(error);
  }
}

/**
 * Create affiliate saga
 */
function* createAffiliateSaga(action: PayloadAction<CreateAffiliatePayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setCreateLoading(true));

    const createdAffiliate: Affiliate = yield call(affiliateRepository.createAffiliate, data);

    yield put(setCreateLoading(false));
    showSuccess(i18next.t('createAffiliateSuccess'));

    if (onSuccess) {
      onSuccess(createdAffiliate);
    }
  } catch (error) {
    yield put(setCreateLoading(false));
    showError(error);
  }
}

/**
 * Update affiliate saga
 */
function* updateAffiliateSaga(action: PayloadAction<UpdateAffiliatePayload>) {
  const { data, onSuccess } = action.payload;

  try {
    yield put(setUpdateLoading(true));

    yield call(affiliateRepository.updateAffiliate, data);

    yield put(setUpdateLoading(false));
    showSuccess(i18next.t('updateAffiliateSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setUpdateLoading(false));
    showError(error);
  }
}

/**
 * Delete affiliate saga
 */
function* deleteAffiliateSaga(action: PayloadAction<DeleteAffiliatePayload>) {
  const { affiliateId, onSuccess } = action.payload;

  try {
    yield put(setDeleteLoading(true));

    yield call(affiliateRepository.deleteAffiliate, affiliateId);

    yield put(setDeleteLoading(false));
    showSuccess(i18next.t('deleteAffiliateSuccess'));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setDeleteLoading(false));
    showError(error);
  }
}

/**
 * Bulk delete affiliates saga
 */
function* bulkDeleteAffiliatesSaga(action: PayloadAction<BulkDeleteAffiliatesPayload>) {
  const { affiliateIds, onSuccess } = action.payload;

  try {
    yield put(setDeleteLoading(true));

    yield call(affiliateRepository.bulkDeleteAffiliates, affiliateIds);

    yield put(setDeleteLoading(false));
    showSuccess(i18next.t('bulkDeleteAffiliatesSuccess', { count: affiliateIds.length }));

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setDeleteLoading(false));
    showError(error);
  }
}

/**
 * Root affiliates saga watcher
 */
function* watchAffiliates() {
  yield takeLatest(queryAffiliatesRequest.type, queryAffiliatesSaga);
  yield takeLatest(getAffiliateRequest.type, getAffiliateSaga);
  yield takeLatest(createAffiliateRequest.type, createAffiliateSaga);
  yield takeLatest(updateAffiliateRequest.type, updateAffiliateSaga);
  yield takeLatest(deleteAffiliateRequest.type, deleteAffiliateSaga);
  yield takeLatest(bulkDeleteAffiliatesRequest.type, bulkDeleteAffiliatesSaga);
}

/**
 * Export affiliates saga
 */
export function* affiliatesSaga() {
  yield call(watchAffiliates);
}
