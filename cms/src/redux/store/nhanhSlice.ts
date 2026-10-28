import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';

// Nhanh state for Redux
export interface NhanhState {
  isConnected: boolean;
  loading: boolean;
  loadingCategories: boolean;
  loadingProducts: boolean;
  error: string | null;
  lastSyncTime: number | null;
  /** Number of orders that have not yet been synced to Nhanh.vn */
  unsyncedOrderCount: number;
  loadingUnsyncedCount: boolean;
  /** IDs of orders currently being retried via the manual sync endpoint */
  retryingOrderIds: string[];
}

const initialState: NhanhState = {
  isConnected: false,
  loading: false,
  loadingCategories: false,
  loadingProducts: false,
  error: null,
  lastSyncTime: null,
  unsyncedOrderCount: 0,
  loadingUnsyncedCount: false,
  retryingOrderIds: [],
};

/**
 * Saga Action Payload Types
 */
export type NhanhRedirectPayload = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export type NhanhCallbackPayload = {
  accessCode: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export type NhanhSyncAllPayload = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export type NhanhCheckConnectionPayload = {
  onSuccess?: (isConnected: boolean) => void;
  onError?: (error: string) => void;
};

export type NhanhSyncProductCategoriesPayload = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export type NhanhSyncProductsPayload = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export type NhanhUnsyncedCountPayload = {
  onSuccess?: (count: number) => void;
  onError?: (error: string) => void;
};

export type NhanhRetryOrderSyncPayload = {
  orderId: string;
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 * All actions use type parameter pattern for consistency
 */

// Action to get redirect URL for Nhanh.vn authentication
export const nhanhRedirectRequest = createAction<NhanhRedirectPayload>('nhanh/redirectRequest');

// Action to handle callback from Nhanh.vn with access code
export const nhanhCallbackRequest = createAction<NhanhCallbackPayload>('nhanh/callbackRequest');

// Action to sync all data from Nhanh.vn
export const nhanhSyncAllRequest = createAction<NhanhSyncAllPayload>('nhanh/syncAllRequest');

// Action to check Nhanh.vn connection status
export const nhanhCheckConnectionRequest = createAction<NhanhCheckConnectionPayload>(
  'nhanh/checkConnectionRequest'
);

// Action to sync product categories from Nhanh.vn
export const nhanhSyncProductCategoriesRequest = createAction<NhanhSyncProductCategoriesPayload>(
  'nhanh/syncProductCategoriesRequest'
);

// Action to sync products from Nhanh.vn
export const nhanhSyncProductsRequest = createAction<NhanhSyncProductsPayload>(
  'nhanh/syncProductsRequest'
);

// Action to fetch the number of orders not synced to Nhanh.vn
export const nhanhUnsyncedCountRequest = createAction(
  'nhanh/unsyncedCountRequest',
  (payload?: NhanhUnsyncedCountPayload) => ({ payload })
);

// Action to manually retry syncing a single order to Nhanh.vn
export const nhanhRetryOrderSyncRequest = createAction<NhanhRetryOrderSyncPayload>(
  'nhanh/retryOrderSyncRequest'
);

/**
 * Nhanh Slice
 */
export const nhanhSlice = createSlice({
  name: 'nhanh',
  initialState,
  reducers: {
    setNhanhLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    setNhanhConnected: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
      state.loading = false;
      state.error = null;
    },

    setNhanhLoadingCategories: (state, action: PayloadAction<boolean>) => {
      state.loadingCategories = action.payload;
    },

    setNhanhLoadingProducts: (state, action: PayloadAction<boolean>) => {
      state.loadingProducts = action.payload;
    },

    setNhanhError: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.loadingCategories = false;
      state.loadingProducts = false;
      state.error = action.payload;
    },

    clearNhanhError: (state) => {
      state.error = null;
    },

    setNhanhUnsyncedCount: (state, action: PayloadAction<number>) => {
      state.unsyncedOrderCount = action.payload;
      state.loadingUnsyncedCount = false;
    },

    setNhanhUnsyncedCountLoading: (state, action: PayloadAction<boolean>) => {
      state.loadingUnsyncedCount = action.payload;
    },

    addRetryingOrderId: (state, action: PayloadAction<string>) => {
      if (!state.retryingOrderIds.includes(action.payload)) {
        state.retryingOrderIds.push(action.payload);
      }
    },

    removeRetryingOrderId: (state, action: PayloadAction<string>) => {
      state.retryingOrderIds = state.retryingOrderIds.filter((id) => id !== action.payload);
    },

    resetNhanhState: (state) => {
      state.isConnected = false;
      state.loading = false;
      state.loadingCategories = false;
      state.loadingProducts = false;
      state.error = null;
      state.lastSyncTime = null;
      state.unsyncedOrderCount = 0;
      state.loadingUnsyncedCount = false;
      state.retryingOrderIds = [];
    },
  },
});

export const {
  setNhanhLoading,
  setNhanhLoadingCategories,
  setNhanhLoadingProducts,
  setNhanhConnected,
  setNhanhError,
  clearNhanhError,
  setNhanhUnsyncedCount,
  setNhanhUnsyncedCountLoading,
  addRetryingOrderId,
  removeRetryingOrderId,
  resetNhanhState,
} = nhanhSlice.actions;

/**
 * Selectors
 */
export const selectNhanhIsConnected = (state: { nhanh: NhanhState }) => state.nhanh.isConnected;

export const selectNhanhLoading = (state: { nhanh: NhanhState }) => state.nhanh.loading;

export const selectNhanhLoadingCategories = (state: { nhanh: NhanhState }) =>
  state.nhanh.loadingCategories;

export const selectNhanhLoadingProducts = (state: { nhanh: NhanhState }) =>
  state.nhanh.loadingProducts;

export const selectNhanhError = (state: { nhanh: NhanhState }) => state.nhanh.error;

export const selectNhanhLastSyncTime = (state: { nhanh: NhanhState }) => state.nhanh.lastSyncTime;

export const selectNhanhUnsyncedOrderCount = (state: { nhanh: NhanhState }) =>
  state.nhanh.unsyncedOrderCount;

export const selectNhanhLoadingUnsyncedCount = (state: { nhanh: NhanhState }) =>
  state.nhanh.loadingUnsyncedCount;

export const selectNhanhRetryingOrderIds = (state: { nhanh: NhanhState }) =>
  state.nhanh.retryingOrderIds;

export const selectIsRetryingOrder = (orderId: string) => (state: { nhanh: NhanhState }) =>
  state.nhanh.retryingOrderIds.includes(orderId);

export default nhanhSlice.reducer;
