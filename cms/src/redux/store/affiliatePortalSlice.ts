import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';
import type {
  AffiliateOverviewResponse,
  AffiliateCommissionAnalyticsItem,
  AffiliateTrackingAnalyticsItem,
} from 'src/types/gen/cms/cms/affiliate-analytics/affiliate-analytics';
import type {
  WithdrawalRequest,
  WithdrawalRequestListItem,
  AffiliateBalanceResponse,
} from 'src/types/withdrawal-request';
import type { Affiliate } from 'src/types/gen/shared/shared/affiliates/affiliate';
import type { CommissionProduct } from 'src/sections/affiliates/components/commission-product-table';

/**
 * Affiliate Portal State Interface
 */
interface AffiliatePortalState {
  // Analytics
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

  // Balance
  balance: AffiliateBalanceResponse | null;
  balanceLoading: boolean;

  // Withdrawal requests
  withdrawalRequests: WithdrawalRequestListItem[];
  withdrawalRequestsLoading: boolean;
  withdrawalRequestsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  } | null;
  createWithdrawalLoading: boolean;

  // Withdrawal request detail
  currentWithdrawalRequest: WithdrawalRequest | null;
  currentWithdrawalRequestLoading: boolean;

  // Profile
  myProfile: Affiliate | null;
  myProfileLoading: boolean;

  // Product commissions
  myProductCommissions: CommissionProduct[];
  myProductCommissionsLoading: boolean;
  myProductCommissionsPagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
  } | null;
}

interface GetMyOverviewRequestParams {
  dateFrom?: string;
  dateTo?: string;
}

interface GetMyCommissionAnalyticsRequestParams {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  categoryName?: string;
}

interface GetMyTrackingAnalyticsRequestParams {
  page?: number;
  limit?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  categoryName?: string;
}

interface GetMyWithdrawalRequestsParams {
  page?: number;
  limit?: number;
  status?: string;
}

interface CreateWithdrawalRequestParams {
  amount: number;
  recipientName: string;
  bankAccountNumber: string;
  bankName: string;
  note?: string;
  onSuccess?: () => void;
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

interface SetWithdrawalRequestsSuccessParams {
  data: WithdrawalRequestListItem[];
  hasNextPage: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface GetMyProductCommissionsParams {
  page?: number;
  limit?: number;
  search?: string;
  categoryName?: string;
}

interface SetMyProductCommissionsSuccessParams {
  data: CommissionProduct[];
  hasNextPage: boolean;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Initial State
 */
const initialState: AffiliatePortalState = {
  overview: null,
  overviewLoading: false,
  commissionAnalytics: [],
  commissionAnalyticsLoading: false,
  commissionAnalyticsPagination: null,
  trackingAnalytics: [],
  trackingAnalyticsLoading: false,
  trackingAnalyticsPagination: null,
  balance: null,
  balanceLoading: false,
  withdrawalRequests: [],
  withdrawalRequestsLoading: false,
  withdrawalRequestsPagination: null,
  createWithdrawalLoading: false,
  currentWithdrawalRequest: null,
  currentWithdrawalRequestLoading: false,
  myProfile: null,
  myProfileLoading: false,
  myProductCommissions: [],
  myProductCommissionsLoading: false,
  myProductCommissionsPagination: null,
};

/**
 * Affiliate Portal Slice
 */
const affiliatePortalSlice = createSlice({
  name: 'affiliatePortal',
  initialState,
  reducers: {
    // ---- Analytics ----
    getMyOverviewRequest: (state, _action: PayloadAction<GetMyOverviewRequestParams>) => {
      state.overviewLoading = true;
    },

    setMyOverviewSuccess: (state, action: PayloadAction<AffiliateOverviewResponse>) => {
      state.overview = action.payload;
      state.overviewLoading = false;
    },

    setMyOverviewLoading: (state, action: PayloadAction<boolean>) => {
      state.overviewLoading = action.payload;
    },

    getMyCommissionAnalyticsRequest: (
      state,
      _action: PayloadAction<GetMyCommissionAnalyticsRequestParams>
    ) => {
      state.commissionAnalyticsLoading = true;
    },

    setMyCommissionAnalyticsSuccess: (
      state,
      action: PayloadAction<SetCommissionAnalyticsSuccessParams>
    ) => {
      const { data, hasNextPage, total, page, limit, totalPages } = action.payload;
      state.commissionAnalytics = data;
      state.commissionAnalyticsPagination = { hasNextPage, total, page, limit, totalPages };
      state.commissionAnalyticsLoading = false;
    },

    setMyCommissionAnalyticsLoading: (state, action: PayloadAction<boolean>) => {
      state.commissionAnalyticsLoading = action.payload;
    },

    getMyTrackingAnalyticsRequest: (
      state,
      _action: PayloadAction<GetMyTrackingAnalyticsRequestParams>
    ) => {
      state.trackingAnalyticsLoading = true;
    },

    setMyTrackingAnalyticsSuccess: (
      state,
      action: PayloadAction<SetTrackingAnalyticsSuccessParams>
    ) => {
      const { data, hasNextPage, total, page, limit, totalPages } = action.payload;
      state.trackingAnalytics = data;
      state.trackingAnalyticsPagination = { hasNextPage, total, page, limit, totalPages };
      state.trackingAnalyticsLoading = false;
    },

    setMyTrackingAnalyticsLoading: (state, action: PayloadAction<boolean>) => {
      state.trackingAnalyticsLoading = action.payload;
    },

    // ---- Balance ----
    getMyBalanceRequest: (state) => {
      state.balanceLoading = true;
    },

    setMyBalanceSuccess: (state, action: PayloadAction<AffiliateBalanceResponse>) => {
      state.balance = action.payload;
      state.balanceLoading = false;
    },

    setMyBalanceLoading: (state, action: PayloadAction<boolean>) => {
      state.balanceLoading = action.payload;
    },

    // ---- Withdrawal Requests ----
    getMyWithdrawalRequestsRequest: (
      state,
      _action: PayloadAction<GetMyWithdrawalRequestsParams>
    ) => {
      state.withdrawalRequestsLoading = true;
    },

    setMyWithdrawalRequestsSuccess: (
      state,
      action: PayloadAction<SetWithdrawalRequestsSuccessParams>
    ) => {
      const { data, hasNextPage, total, page, limit, totalPages } = action.payload;
      state.withdrawalRequests = data;
      state.withdrawalRequestsPagination = { hasNextPage, total, page, limit, totalPages };
      state.withdrawalRequestsLoading = false;
    },

    setMyWithdrawalRequestsLoading: (state, action: PayloadAction<boolean>) => {
      state.withdrawalRequestsLoading = action.payload;
    },

    createMyWithdrawalRequestRequest: (
      state,
      _action: PayloadAction<CreateWithdrawalRequestParams>
    ) => {
      state.createWithdrawalLoading = true;
    },

    setCreateMyWithdrawalLoading: (state, action: PayloadAction<boolean>) => {
      state.createWithdrawalLoading = action.payload;
    },

    // ---- Withdrawal Request Detail ----
    getMyWithdrawalRequestByIdRequest: (state, _action: PayloadAction<{ id: string }>) => {
      state.currentWithdrawalRequestLoading = true;
    },

    setMyWithdrawalRequestByIdSuccess: (state, action: PayloadAction<WithdrawalRequest>) => {
      state.currentWithdrawalRequest = action.payload;
      state.currentWithdrawalRequestLoading = false;
    },

    setMyWithdrawalRequestByIdLoading: (state, action: PayloadAction<boolean>) => {
      state.currentWithdrawalRequestLoading = action.payload;
    },

    clearCurrentWithdrawalRequest: (state) => {
      state.currentWithdrawalRequest = null;
      state.currentWithdrawalRequestLoading = false;
    },

    // ---- Profile ----
    getMyProfileRequest: (state) => {
      state.myProfileLoading = true;
    },

    setMyProfileSuccess: (state, action: PayloadAction<Affiliate>) => {
      state.myProfile = action.payload;
      state.myProfileLoading = false;
    },

    setMyProfileLoading: (state, action: PayloadAction<boolean>) => {
      state.myProfileLoading = action.payload;
    },

    // ---- Product Commissions ----
    getMyProductCommissionsRequest: (
      state,
      _action: PayloadAction<GetMyProductCommissionsParams>
    ) => {
      state.myProductCommissionsLoading = true;
    },

    setMyProductCommissionsSuccess: (
      state,
      action: PayloadAction<SetMyProductCommissionsSuccessParams>
    ) => {
      const { data, hasNextPage, total, page, limit, totalPages } = action.payload;
      state.myProductCommissions = data;
      state.myProductCommissionsPagination = { hasNextPage, total, page, limit, totalPages };
      state.myProductCommissionsLoading = false;
    },

    setMyProductCommissionsLoading: (state, action: PayloadAction<boolean>) => {
      state.myProductCommissionsLoading = action.payload;
    },

    resetPortalState: () => initialState,
  },
});

/**
 * Actions
 */
export const {
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
  clearCurrentWithdrawalRequest,
  getMyProfileRequest,
  setMyProfileSuccess,
  setMyProfileLoading,
  getMyProductCommissionsRequest,
  setMyProductCommissionsSuccess,
  setMyProductCommissionsLoading,
  resetPortalState,
} = affiliatePortalSlice.actions;

/**
 * Selectors
 */
export const selectMyOverview = (state: RootState) => state.affiliatePortal.overview;
export const selectMyBalance = (state: RootState) => state.affiliatePortal.balance;
export const selectMyBalanceLoading = (state: RootState) => state.affiliatePortal.balanceLoading;
export const selectMyOverviewLoading = (state: RootState) => state.affiliatePortal.overviewLoading;
export const selectMyCommissionAnalytics = (state: RootState) =>
  state.affiliatePortal.commissionAnalytics;
export const selectMyCommissionAnalyticsLoading = (state: RootState) =>
  state.affiliatePortal.commissionAnalyticsLoading;
export const selectMyCommissionAnalyticsPagination = (state: RootState) =>
  state.affiliatePortal.commissionAnalyticsPagination;
export const selectMyTrackingAnalytics = (state: RootState) =>
  state.affiliatePortal.trackingAnalytics;
export const selectMyTrackingAnalyticsLoading = (state: RootState) =>
  state.affiliatePortal.trackingAnalyticsLoading;
export const selectMyTrackingAnalyticsPagination = (state: RootState) =>
  state.affiliatePortal.trackingAnalyticsPagination;
export const selectMyWithdrawalRequests = (state: RootState) =>
  state.affiliatePortal.withdrawalRequests;
export const selectMyWithdrawalRequestsLoading = (state: RootState) =>
  state.affiliatePortal.withdrawalRequestsLoading;
export const selectMyWithdrawalRequestsPagination = (state: RootState) =>
  state.affiliatePortal.withdrawalRequestsPagination;
export const selectCreateWithdrawalLoading = (state: RootState) =>
  state.affiliatePortal.createWithdrawalLoading;
export const selectCurrentWithdrawalRequest = (state: RootState) =>
  state.affiliatePortal.currentWithdrawalRequest;
export const selectCurrentWithdrawalRequestLoading = (state: RootState) =>
  state.affiliatePortal.currentWithdrawalRequestLoading;
export const selectMyProfile = (state: RootState) => state.affiliatePortal.myProfile;
export const selectMyProfileLoading = (state: RootState) => state.affiliatePortal.myProfileLoading;
export const selectMyProductCommissions = (state: RootState) =>
  state.affiliatePortal.myProductCommissions;
export const selectMyProductCommissionsLoading = (state: RootState) =>
  state.affiliatePortal.myProductCommissionsLoading;
export const selectMyProductCommissionsPagination = (state: RootState) =>
  state.affiliatePortal.myProductCommissionsPagination;
/**
 * Reducer
 */
export default affiliatePortalSlice.reducer;
