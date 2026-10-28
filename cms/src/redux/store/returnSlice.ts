import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type {
  ReturnRequest,
  ReturnFilters,
  ReturnSort,
  ReturnTab,
  ReturnTabCounts,
  ReturnStatus,
} from 'src/types/returns';

/**
 * Return State
 */
export interface ReturnState {
  returns: ReturnRequest[];
  currentReturn: ReturnRequest | null;
  loading: boolean;
  currentReturnLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: ReturnFilters;
  sort?: ReturnSort;
  activeTab: ReturnTab;
  tabCounts: ReturnTabCounts;
}

const initialTabCounts: ReturnTabCounts = {
  all: 0,
  pending: 0,
  confirmed: 0,
  refunded: 0,
  rejected: 0,
};

const initialState: ReturnState = {
  returns: [],
  currentReturn: null,
  loading: false,
  currentReturnLoading: false,
  error: null,
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
export type GetReturnsPayload = {
  page?: number;
  limit?: number;
  filters?: ReturnFilters;
  sort?: ReturnSort;
  onSuccess?: () => void;
};

export type GetReturnByIdPayload = {
  id: string;
  onSuccess?: (returnRequest: ReturnRequest) => void;
};

export type UpdateReturnStatusPayload = {
  returnId: string;
  status: ReturnStatus;
  adminNote?: string;
  onSuccess?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const getReturnsRequest = createAction<GetReturnsPayload>('return/getReturnsRequest');
export const getReturnByIdRequest = createAction<GetReturnByIdPayload>(
  'return/getReturnByIdRequest'
);
export const updateReturnStatusRequest = createAction<UpdateReturnStatusPayload>(
  'return/updateReturnStatusRequest'
);
export type GetReturnTabCountsPayload = {
  type?: 'refund' | 'exchange';
};

export const getReturnTabCountsRequest = createAction<GetReturnTabCountsPayload>(
  'return/getReturnTabCountsRequest'
);

/**
 * Return Slice
 */
export const returnSlice = createSlice({
  name: 'return',
  initialState,
  reducers: {
    setReturnLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setReturnsSuccess: (
      state,
      action: PayloadAction<{
        returns: ReturnRequest[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          totalPages: number;
        };
      }>
    ) => {
      state.returns = action.payload.returns;
      state.pagination = action.payload.pagination;
      state.loading = false;
      state.error = null;
    },

    setReturnError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    setCurrentReturnLoading: (state, action: PayloadAction<boolean>) => {
      state.currentReturnLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setCurrentReturnSuccess: (state, action: PayloadAction<ReturnRequest>) => {
      state.currentReturn = action.payload;
      state.currentReturnLoading = false;
      state.error = null;
    },

    setCurrentReturnError: (state, action: PayloadAction<string>) => {
      state.currentReturnLoading = false;
      state.error = action.payload;
    },

    clearCurrentReturn: (state) => {
      state.currentReturn = null;
    },

    clearReturnError: (state) => {
      state.error = null;
    },

    setReturnFilters: (state, action: PayloadAction<ReturnFilters>) => {
      state.filters = action.payload;
    },

    setReturnSort: (state, action: PayloadAction<ReturnSort | undefined>) => {
      state.sort = action.payload;
    },

    setReturnActiveTab: (state, action: PayloadAction<ReturnTab>) => {
      state.activeTab = action.payload;
      // Reset pagination when tab changes
      state.pagination.page = 1;
    },

    setReturnTabCounts: (state, action: PayloadAction<ReturnTabCounts>) => {
      state.tabCounts = action.payload;
    },

    resetReturnState: (state) => {
      state.returns = [];
      state.loading = false;
      state.error = null;
      state.pagination = initialState.pagination;
      state.filters = {};
      state.sort = undefined;
      state.activeTab = 'all';
    },
  },
});

export const {
  setReturnLoading,
  setReturnsSuccess,
  setReturnError,
  setCurrentReturnLoading,
  setCurrentReturnSuccess,
  setCurrentReturnError,
  clearCurrentReturn,
  clearReturnError,
  setReturnFilters,
  setReturnSort,
  setReturnActiveTab,
  setReturnTabCounts,
  resetReturnState,
} = returnSlice.actions;

/**
 * Selectors
 */
export const selectReturns = (state: { return: ReturnState }) => state.return.returns;

export const selectCurrentReturn = (state: { return: ReturnState }) => state.return.currentReturn;

export const selectReturnLoading = (state: { return: ReturnState }) => state.return.loading;

export const selectCurrentReturnLoading = (state: { return: ReturnState }) =>
  state.return.currentReturnLoading;

export const selectReturnError = (state: { return: ReturnState }) => state.return.error;

export const selectReturnPagination = (state: { return: ReturnState }) => state.return.pagination;

export const selectReturnFilters = (state: { return: ReturnState }) => state.return.filters;

export const selectReturnSort = (state: { return: ReturnState }) => state.return.sort;

export const selectReturnActiveTab = (state: { return: ReturnState }) => state.return.activeTab;

export const selectReturnTabCounts = (state: { return: ReturnState }) => state.return.tabCounts;

export default returnSlice.reducer;
