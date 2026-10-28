import { call, put, takeLatest, all } from 'redux-saga/effects';
import type { PayloadAction } from '@reduxjs/toolkit';
import { affiliateRepository } from 'src/repositories/affiliate.repository';
import {
  getOverviewRequest,
  setOverviewSuccess,
  setOverviewLoading,
  getCommissionAnalyticsRequest,
  setCommissionAnalyticsSuccess,
  setCommissionAnalyticsLoading,
  getTrackingAnalyticsRequest,
  setTrackingAnalyticsSuccess,
  setTrackingAnalyticsLoading,
} from '../store/affiliatesPerformanceSlice';
import { showError } from 'src/utils/toast';
import type {
  AffiliateOverviewResponse,
  QueryAffiliateCommissionAnalyticsResponse,
  QueryAffiliateTrackingAnalyticsResponse,
} from 'src/types/gen/cms/cms/affiliate-analytics/affiliate-analytics';

/**
 * Get Overview Saga
 */
function* getOverviewSaga(
  action: PayloadAction<{
    affiliateId: string;
    dateFrom?: string;
    dateTo?: string;
  }>
): Generator {
  try {
    const { affiliateId, dateFrom, dateTo } = action.payload;

    const response = (yield call(affiliateRepository.getAffiliateOverview, {
      affiliateId,
      dateFrom,
      dateTo,
    })) as AffiliateOverviewResponse;

    yield put(setOverviewSuccess(response));
  } catch (error) {
    yield put(setOverviewLoading(false));
    showError(error);
  }
}

/**
 * Get Commission Analytics Saga
 */
function* getCommissionAnalyticsSaga(
  action: PayloadAction<{
    affiliateId: string;
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    categoryName?: string;
  }>
): Generator {
  try {
    const { affiliateId, page, limit, dateFrom, dateTo, search, categoryName } = action.payload;

    const response = (yield call(affiliateRepository.getAffiliateCommissionAnalytics, {
      affiliateId,
      page,
      limit,
      dateFrom,
      dateTo,
      search,
      categoryName,
    })) as QueryAffiliateCommissionAnalyticsResponse;

    yield put(
      setCommissionAnalyticsSuccess({
        data: response.data,
        hasNextPage: response.hasNextPage,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      })
    );
  } catch (error) {
    yield put(setCommissionAnalyticsLoading(false));
    showError(error);
  }
}

/**
 * Get Tracking Analytics Saga
 */
function* getTrackingAnalyticsSaga(
  action: PayloadAction<{
    affiliateId: string;
    page?: number;
    limit?: number;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
    categoryName?: string;
  }>
): Generator {
  try {
    const { affiliateId, page, limit, dateFrom, dateTo, search, categoryName } = action.payload;

    const response = (yield call(affiliateRepository.getAffiliateTrackingAnalytics, {
      affiliateId,
      page,
      limit,
      dateFrom,
      dateTo,
      search,
      categoryName,
    })) as QueryAffiliateTrackingAnalyticsResponse;

    yield put(
      setTrackingAnalyticsSuccess({
        data: response.data,
        hasNextPage: response.hasNextPage,
        total: response.total,
        page: response.page,
        limit: response.limit,
        totalPages: response.totalPages,
      })
    );
  } catch (error) {
    yield put(setTrackingAnalyticsLoading(false));
    showError(error);
  }
}

/**
 * Affiliates Performance Saga
 */
export function* affiliatesPerformanceSaga() {
  yield all([
    takeLatest(getOverviewRequest.type, getOverviewSaga),
    takeLatest(getCommissionAnalyticsRequest.type, getCommissionAnalyticsSaga),
    takeLatest(getTrackingAnalyticsRequest.type, getTrackingAnalyticsSaga),
  ]);
}
