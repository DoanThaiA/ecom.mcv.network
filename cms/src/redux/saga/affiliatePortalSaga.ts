import { call, put, takeLatest, all } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import i18next from 'src/i18next';
import { affiliatePortalRepository } from 'src/repositories/affiliate-portal.repository';
import {
  getMyOverviewRequest,
  setMyOverviewSuccess,
  setMyOverviewLoading,
  getMyCommissionAnalyticsRequest,
  setMyCommissionAnalyticsSuccess,
  setMyCommissionAnalyticsLoading,
  getMyTrackingAnalyticsRequest,
  setMyTrackingAnalyticsSuccess,
  setMyTrackingAnalyticsLoading,
  getMyBalanceRequest,
  setMyBalanceSuccess,
  setMyBalanceLoading,
  getMyWithdrawalRequestsRequest,
  setMyWithdrawalRequestsSuccess,
  setMyWithdrawalRequestsLoading,
  createMyWithdrawalRequestRequest,
  setCreateMyWithdrawalLoading,
  getMyWithdrawalRequestByIdRequest,
  setMyWithdrawalRequestByIdSuccess,
  setMyWithdrawalRequestByIdLoading,
  getMyProfileRequest,
  setMyProfileSuccess,
  setMyProfileLoading,
  getMyProductCommissionsRequest,
  setMyProductCommissionsSuccess,
  setMyProductCommissionsLoading,
} from '../store/affiliatePortalSlice';
import { showError, showSuccess } from 'src/utils/toast';
import type {
  AffiliateOverviewResponse,
  QueryAffiliateCommissionAnalyticsResponse,
  QueryAffiliateTrackingAnalyticsResponse,
} from 'src/types/gen/cms/cms/affiliate-analytics/affiliate-analytics';
import type {
  WithdrawalRequest,
  QueryWithdrawalRequestsResponse,
  AffiliateBalanceResponse,
} from 'src/types/withdrawal-request';
import type { Affiliate } from 'src/types/gen/shared/shared/affiliates/affiliate';
import type { ProductCommissionsPage } from 'src/types/gen/shared/shared/product-commissions/product-commission';

/**
 * Get My Overview Saga
 */
function* getMyOverviewSaga(
  action: PayloadAction<{ dateFrom?: string; dateTo?: string }>
): Generator {
  try {
    const { dateFrom, dateTo } = action.payload;

    const response = (yield call(affiliatePortalRepository.getMyOverview, {
      dateFrom,
      dateTo,
    })) as AffiliateOverviewResponse;

    yield put(setMyOverviewSuccess(response));
  } catch (error) {
    yield put(setMyOverviewLoading(false));
    showError(error);
  }
}

/**
 * Get My Commission Analytics Saga
 */
function* getMyCommissionAnalyticsSaga(
  action: PayloadAction<{
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    categoryName?: string;
  }>
): Generator {
  try {
    const { page, limit, dateFrom, dateTo, search, categoryName } = action.payload;

    const response = (yield call(affiliatePortalRepository.getMyCommissionAnalytics, {
      page,
      limit,
      dateFrom,
      dateTo,
      search,
      categoryName,
    })) as QueryAffiliateCommissionAnalyticsResponse;

    yield put(
      setMyCommissionAnalyticsSuccess({
        data: response.data,
        hasNextPage: response.hasNextPage,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      })
    );
  } catch (error) {
    yield put(setMyCommissionAnalyticsLoading(false));
    showError(error);
  }
}

/**
 * Get My Tracking Analytics Saga
 */
function* getMyTrackingAnalyticsSaga(
  action: PayloadAction<{
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    categoryName?: string;
  }>
): Generator {
  try {
    const { page, limit, dateFrom, dateTo, search, categoryName } = action.payload;

    const response = (yield call(affiliatePortalRepository.getMyTrackingAnalytics, {
      page,
      limit,
      dateFrom,
      dateTo,
      search,
      categoryName,
    })) as QueryAffiliateTrackingAnalyticsResponse;

    yield put(
      setMyTrackingAnalyticsSuccess({
        data: response.data,
        hasNextPage: response.hasNextPage,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      })
    );
  } catch (error) {
    yield put(setMyTrackingAnalyticsLoading(false));
    showError(error);
  }
}

/**
 * Get My Balance Saga
 */
function* getMyBalanceSaga(): Generator {
  try {
    const response = (yield call(
      affiliatePortalRepository.getMyBalance
    )) as AffiliateBalanceResponse;
    yield put(setMyBalanceSuccess(response));
  } catch (error) {
    yield put(setMyBalanceLoading(false));
    showError(error);
  }
}

/**
 * Get My Withdrawal Requests Saga
 */
function* getMyWithdrawalRequestsSaga(
  action: PayloadAction<{ page?: number; limit?: number; status?: string }>
): Generator {
  try {
    const { page, limit, status } = action.payload;

    const response = (yield call(affiliatePortalRepository.getMyWithdrawalRequests, {
      page: page ?? 1,
      limit: limit ?? 10,
      filters: status ? { status: status, tab: 'all' } : { tab: 'all' },
    })) as QueryWithdrawalRequestsResponse;

    yield put(
      setMyWithdrawalRequestsSuccess({
        data: response.data,
        hasNextPage: response.hasNextPage,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      })
    );
  } catch (error) {
    yield put(setMyWithdrawalRequestsLoading(false));
    showError(error);
  }
}

/**
 * Create My Withdrawal Request Saga
 */
function* createMyWithdrawalRequestSaga(
  action: PayloadAction<{
    amount: number;
    recipientName: string;
    bankAccountNumber: string;
    bankName: string;
    note?: string;
    onSuccess?: () => void;
  }>
): Generator {
  try {
    const { onSuccess, ...data } = action.payload;

    yield call(affiliatePortalRepository.createWithdrawalRequest, data);

    yield put(setCreateMyWithdrawalLoading(false));
    showSuccess(i18next.t('createWithdrawalSuccess'));

    if (onSuccess) onSuccess();
  } catch (error) {
    yield put(setCreateMyWithdrawalLoading(false));
    showError(error);
  }
}

/**
 * Get My Withdrawal Request By ID Saga
 */
function* getMyWithdrawalRequestByIdSaga(action: PayloadAction<{ id: string }>): Generator {
  try {
    const response = (yield call(
      affiliatePortalRepository.getMyWithdrawalRequestById,
      action.payload.id
    )) as WithdrawalRequest;
    yield put(setMyWithdrawalRequestByIdSuccess(response));
  } catch (error) {
    yield put(setMyWithdrawalRequestByIdLoading(false));
    showError(error);
  }
}

/**
 * Get My Profile Saga
 */
function* getMyProfileSaga(): Generator {
  try {
    const response = (yield call(affiliatePortalRepository.getMyProfile)) as Affiliate;
    yield put(setMyProfileSuccess(response));
  } catch (error) {
    yield put(setMyProfileLoading(false));
    showError(error);
  }
}

/**
 * Get My Product Commissions Saga
 */
function* getMyProductCommissionsSaga(
  action: PayloadAction<{ page?: number; limit?: number; search?: string; categoryName?: string }>
): Generator {
  try {
    const response = (yield call(
      affiliatePortalRepository.getMyProductCommissions,
      action.payload
    )) as ProductCommissionsPage;
    const paginateResult = response as any;
    const docs = paginateResult.docs ?? paginateResult.data ?? [];
    yield put(
      setMyProductCommissionsSuccess({
        data: docs.map((item: any) => ({
          id: item.id ?? item._id,
          productId: item.productId,
          productCode: item.code,
          productName: item.name,
          productImage: item.images?.avatar ?? '',
          costPrice: item.costPrice,
          stock: item.stock,
          commissionRate: item.commissionRate,
          estimatedCommission: item.estimatedCommission,
        })),
        hasNextPage: paginateResult.hasNextPage ?? false,
        total: paginateResult.totalDocs ?? paginateResult.total ?? 0,
        page: paginateResult.page ?? 1,
        limit: paginateResult.limit ?? 10,
        totalPages: paginateResult.pages ?? paginateResult.totalPages ?? 1,
      })
    );
  } catch (error) {
    yield put(setMyProductCommissionsLoading(false));
    showError(error);
  }
}

/**
 * Affiliate Portal Saga
 */
export function* affiliatePortalSaga() {
  yield all([
    takeLatest(getMyOverviewRequest.type, getMyOverviewSaga),
    takeLatest(getMyCommissionAnalyticsRequest.type, getMyCommissionAnalyticsSaga),
    takeLatest(getMyTrackingAnalyticsRequest.type, getMyTrackingAnalyticsSaga),
    takeLatest(getMyBalanceRequest.type, getMyBalanceSaga),
    takeLatest(getMyWithdrawalRequestsRequest.type, getMyWithdrawalRequestsSaga),
    takeLatest(createMyWithdrawalRequestRequest.type, createMyWithdrawalRequestSaga),
    takeLatest(getMyWithdrawalRequestByIdRequest.type, getMyWithdrawalRequestByIdSaga),
    takeLatest(getMyProfileRequest.type, getMyProfileSaga),
    takeLatest(getMyProductCommissionsRequest.type, getMyProductCommissionsSaga),
  ]);
}
