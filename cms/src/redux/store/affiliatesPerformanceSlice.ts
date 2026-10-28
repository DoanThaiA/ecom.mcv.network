import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type {
  AffiliateOverviewResponse,
  AffiliateCommissionAnalyticsItem,
  AffiliateTrackingAnalyticsItem,
} from 'src/types/gen/cms/cms/affiliate-analytics/affiliate-analytics';

/**
 * Affiliates Performance State Interface
 */
interface AffiliatesPerformanceState {
  overview: AffiliateOverviewResponse | null;
  overviewLoading: boolean;
  commissionAnalytics: AffiliateCommissionAnalyticsItem[];
  commissionAnalyticsLoading: boolean;
  commissionAnalyticsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  } | null;
  trackingAnalytics: AffiliateTrackingAnalyticsItem[];
  trackingAnalyticsLoading: boolean;
  trackingAnalyticsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  } | null;
}

interface GetOverviewRequestParams {
  affiliateId: string;
  dateFrom?: string;
  dateTo?: string;
}

interface GetCommissionAnalyticsRequestParams {
  affiliateId: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  categoryName?: string;
}

interface GetTrackingAnalyticsRequestParams {
  affiliateId: string;
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  categoryName?: string;
}

interface SetCommissionAnalyticsSuccessParams {
  data: AffiliateCommissionAnalyticsItem[];
  hasNextPage: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface SetTrackingAnalyticsSuccessParams {
  data: AffiliateTrackingAnalyticsItem[];
  hasNextPage: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Initial State
 */
const initialState: AffiliatesPerformanceState = {
  overview: null,
  overviewLoading: false,
  commissionAnalytics: [],
  commissionAnalyticsLoading: false,
  commissionAnalyticsPagination: null,
  trackingAnalytics: [],
  trackingAnalyticsLoading: false,
  trackingAnalyticsPagination: null,
};

/**
 * Affiliates Performance Slice
 */
const affiliatesPerformanceSlice = createSlice({
  name: 'affiliatesPerformance',
  initialState,
  reducers: {
    getOverviewRequest: (state, _action: PayloadAction<GetOverviewRequestParams>) => {
      state.overviewLoading = true;
    },

    setOverviewSuccess: (state, action: PayloadAction<AffiliateOverviewResponse>) => {
      state.overview = action.payload;
      state.overviewLoading = false;
    },

    setOverviewLoading: (state, action: PayloadAction<boolean>) => {
      state.overviewLoading = action.payload;
    },

    getCommissionAnalyticsRequest: (
      state,
      _action: PayloadAction<GetCommissionAnalyticsRequestParams>
    ) => {
      state.commissionAnalyticsLoading = true;
    },

    setCommissionAnalyticsSuccess: (
      state,
      action: PayloadAction<SetCommissionAnalyticsSuccessParams>
    ) => {
      const { data, hasNextPage, total, page, limit, totalPages } = action.payload;
      state.commissionAnalytics = data;
      state.commissionAnalyticsPagination = { hasNextPage, total, page, limit, totalPages };
      state.commissionAnalyticsLoading = false;
    },

    setCommissionAnalyticsLoading: (state, action: PayloadAction<boolean>) => {
      state.commissionAnalyticsLoading = action.payload;
    },

    getTrackingAnalyticsRequest: (
      state,
      _action: PayloadAction<GetTrackingAnalyticsRequestParams>
    ) => {
      state.trackingAnalyticsLoading = true;
    },

    setTrackingAnalyticsSuccess: (
      state,
      action: PayloadAction<SetTrackingAnalyticsSuccessParams>
    ) => {
      const { data, hasNextPage, total, page, limit, totalPages } = action.payload;
      state.trackingAnalytics = data;
      state.trackingAnalyticsPagination = { hasNextPage, total, page, limit, totalPages };
      state.trackingAnalyticsLoading = false;
    },

    setTrackingAnalyticsLoading: (state, action: PayloadAction<boolean>) => {
      state.trackingAnalyticsLoading = action.payload;
    },

    resetState: () => initialState,
  },
});

/**
 * Actions
 */
export const {
  getOverviewRequest,
  setOverviewSuccess,
  setOverviewLoading,
  getCommissionAnalyticsRequest,
  setCommissionAnalyticsSuccess,
  setCommissionAnalyticsLoading,
  getTrackingAnalyticsRequest,
  setTrackingAnalyticsSuccess,
  setTrackingAnalyticsLoading,
  resetState,
} = affiliatesPerformanceSlice.actions;

/**
 * Selectors
 */
export const selectOverview = (state: RootState) => state.affiliatesPerformance.overview;
export const selectOverviewLoading = (state: RootState) =>
  state.affiliatesPerformance.overviewLoading;
export const selectCommissionAnalytics = (state: RootState) =>
  state.affiliatesPerformance.commissionAnalytics;
export const selectCommissionAnalyticsLoading = (state: RootState) =>
  state.affiliatesPerformance.commissionAnalyticsLoading;
export const selectCommissionAnalyticsPagination = (state: RootState) =>
  state.affiliatesPerformance.commissionAnalyticsPagination;
export const selectTrackingAnalytics = (state: RootState) =>
  state.affiliatesPerformance.trackingAnalytics;
export const selectTrackingAnalyticsLoading = (state: RootState) =>
  state.affiliatesPerformance.trackingAnalyticsLoading;
export const selectTrackingAnalyticsPagination = (state: RootState) =>
  state.affiliatesPerformance.trackingAnalyticsPagination;

/**
 * Reducer
 */
export default affiliatesPerformanceSlice.reducer;
