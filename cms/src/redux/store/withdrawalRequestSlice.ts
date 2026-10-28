import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type {
  WithdrawalRequest,
  WithdrawalRequestListItem,
  WithdrawalRequestFilters,
  WithdrawalRequestSort,
  WithdrawalRequestTab,
  WithdrawalRequestTabCounts,
} from 'src/types/withdrawal-request';

/**
 * Withdrawal Request State
 */
export interface WithdrawalRequestState {
  requests: WithdrawalRequestListItem[];
  currentRequest: WithdrawalRequest | null;
  loading: boolean;
  currentRequestLoading: boolean;
  actionLoading: boolean;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: WithdrawalRequestFilters;
  sort?: WithdrawalRequestSort;
  activeTab: WithdrawalRequestTab;
  tabCounts: WithdrawalRequestTabCounts;
}

const initialTabCounts: WithdrawalRequestTabCounts = {
  all: 0,
  pending: 0,
  approved: 0,
  paid: 0,
  rejected: 0,
};

const initialState: WithdrawalRequestState = {
  requests: [],
  currentRequest: null,
  loading: false,
  currentRequestLoading: false,
  actionLoading: false,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
  sort: undefined,
  activeTab: 'all',
  tabCounts: initialTabCounts,
};

/**
 * Saga Action Payload Types
 */
export type GetWithdrawalRequestsPayload = {
  page?: number;
  limit?: number;
  filters?: WithdrawalRequestFilters;
  sort?: WithdrawalRequestSort;
  onSuccess?: () => void;
};

export type GetWithdrawalRequestByIdPayload = {
  id: string;
  onSuccess?: (request: WithdrawalRequest) => void;
};

export type ApproveWithdrawalRequestPayload = {
  id: string;
  onSuccess?: () => void;
};

export type RejectWithdrawalRequestPayload = {
  id: string;
  reason: string;
  onSuccess?: () => void;
};

export type PayWithdrawalRequestPayload = {
  id: string;
  onSuccess?: () => void;
};

export type BulkApproveWithdrawalRequestPayload = {
  ids: string[];
  onSuccess?: () => void;
};

export type BulkRejectWithdrawalRequestPayload = {
  ids: string[];
  reason: string;
  onSuccess?: () => void;
};

export type BulkPayWithdrawalRequestPayload = {
  ids: string[];
  onSuccess?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getWithdrawalRequestsRequest = createAction<GetWithdrawalRequestsPayload>(
  'withdrawalRequest/getWithdrawalRequestsRequest'
);
export const getWithdrawalRequestByIdRequest = createAction<GetWithdrawalRequestByIdPayload>(
  'withdrawalRequest/getWithdrawalRequestByIdRequest'
);
export const getWithdrawalRequestTabCountsRequest = createAction(
  'withdrawalRequest/getWithdrawalRequestTabCountsRequest'
);
export const approveWithdrawalRequest = createAction<ApproveWithdrawalRequestPayload>(
  'withdrawalRequest/approveWithdrawalRequest'
);
export const rejectWithdrawalRequest = createAction<RejectWithdrawalRequestPayload>(
  'withdrawalRequest/rejectWithdrawalRequest'
);
export const payWithdrawalRequest = createAction<PayWithdrawalRequestPayload>(
  'withdrawalRequest/payWithdrawalRequest'
);
export const bulkApproveWithdrawalRequests = createAction<BulkApproveWithdrawalRequestPayload>(
  'withdrawalRequest/bulkApproveWithdrawalRequests'
);
export const bulkRejectWithdrawalRequests = createAction<BulkRejectWithdrawalRequestPayload>(
  'withdrawalRequest/bulkRejectWithdrawalRequests'
);
export const bulkPayWithdrawalRequests = createAction<BulkPayWithdrawalRequestPayload>(
  'withdrawalRequest/bulkPayWithdrawalRequests'
);

/**
 * Withdrawal Request Slice
 */
export const withdrawalRequestSlice = createSlice({
  name: 'withdrawalRequest',
  initialState,
  reducers: {
    setWithdrawalRequestLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setWithdrawalRequestsSuccess: (
      state,
      action: PayloadAction<{
        requests: WithdrawalRequestListItem[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    ) => {
      state.requests = action.payload.requests;
      state.pagination = action.payload.pagination;
      state.loading = false;
    },

    setCurrentWithdrawalRequestLoading: (state, action: PayloadAction<boolean>) => {
      state.currentRequestLoading = action.payload;
    },

    setCurrentWithdrawalRequestSuccess: (state, action: PayloadAction<WithdrawalRequest>) => {
      state.currentRequest = action.payload;
      state.currentRequestLoading = false;
    },

    clearCurrentWithdrawalRequest: (state) => {
      state.currentRequest = null;
    },

    setActionLoading: (state, action: PayloadAction<boolean>) => {
      state.actionLoading = action.payload;
    },

    setWithdrawalRequestFilters: (state, action: PayloadAction<WithdrawalRequestFilters>) => {
      state.filters = action.payload;
    },

    setWithdrawalRequestSort: (state, action: PayloadAction<WithdrawalRequestSort | undefined>) => {
      state.sort = action.payload;
    },

    setWithdrawalRequestActiveTab: (state, action: PayloadAction<WithdrawalRequestTab>) => {
      state.activeTab = action.payload;
      // Reset pagination when tab changes
      state.pagination.page = 1;
    },

    setWithdrawalRequestTabCounts: (state, action: PayloadAction<WithdrawalRequestTabCounts>) => {
      state.tabCounts = action.payload;
    },

    resetWithdrawalRequestState: (state) => {
      state.requests = [];
      state.loading = false;
      state.pagination = initialState.pagination;
      state.filters = {};
      state.sort = undefined;
      state.activeTab = 'all';
    },
  },
});

export const {
  setWithdrawalRequestLoading,
  setWithdrawalRequestsSuccess,
  setCurrentWithdrawalRequestLoading,
  setCurrentWithdrawalRequestSuccess,
  clearCurrentWithdrawalRequest,
  setActionLoading,
  setWithdrawalRequestFilters,
  setWithdrawalRequestSort,
  setWithdrawalRequestActiveTab,
  setWithdrawalRequestTabCounts,
  resetWithdrawalRequestState,
} = withdrawalRequestSlice.actions;

/**
 * Selectors
 */
export const selectWithdrawalRequests = (state: { withdrawalRequest: WithdrawalRequestState }) =>
  state.withdrawalRequest.requests;

export const selectCurrentWithdrawalRequest = (state: {
  withdrawalRequest: WithdrawalRequestState;
}) => state.withdrawalRequest.currentRequest;

export const selectWithdrawalRequestLoading = (state: {
  withdrawalRequest: WithdrawalRequestState;
}) => state.withdrawalRequest.loading;

export const selectCurrentWithdrawalRequestLoading = (state: {
  withdrawalRequest: WithdrawalRequestState;
}) => state.withdrawalRequest.currentRequestLoading;

export const selectWithdrawalRequestActionLoading = (state: {
  withdrawalRequest: WithdrawalRequestState;
}) => state.withdrawalRequest.actionLoading;

export const selectWithdrawalRequestPagination = (state: {
  withdrawalRequest: WithdrawalRequestState;
}) => state.withdrawalRequest.pagination;

export const selectWithdrawalRequestFilters = (state: {
  withdrawalRequest: WithdrawalRequestState;
}) => state.withdrawalRequest.filters;

export const selectWithdrawalRequestSort = (state: { withdrawalRequest: WithdrawalRequestState }) =>
  state.withdrawalRequest.sort;

export const selectWithdrawalRequestActiveTab = (state: {
  withdrawalRequest: WithdrawalRequestState;
}) => state.withdrawalRequest.activeTab;

export const selectWithdrawalRequestTabCounts = (state: {
  withdrawalRequest: WithdrawalRequestState;
}) => state.withdrawalRequest.tabCounts;

export default withdrawalRequestSlice.reducer;
