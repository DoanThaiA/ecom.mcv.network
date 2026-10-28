import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';

import type { ZaloOAInfo } from 'src/types/zalo';

// Zalo state for Redux
export interface ZaloState {
  loading: boolean;
  oaInfo: ZaloOAInfo | null;
}

const initialState: ZaloState = {
  loading: false,
  oaInfo: null,
};

/**
 * Saga Action Payload Types
 */
export type ZaloRedirectPayload = {};

export type ZaloCallbackPayload = {
  code: string;
};

export type ZaloCheckConnectionPayload = {};

/**
 * Saga Actions (Side Effect Triggers)
 * All actions use type parameter pattern for consistency
 */

// Action to get redirect URL for Zalo OA authentication
export const zaloRedirectRequest = createAction<ZaloRedirectPayload>('zalo/redirectRequest');

// Action to handle callback from Zalo OA with authorization code
export const zaloCallbackRequest = createAction<ZaloCallbackPayload>('zalo/callbackRequest');

// Action to check Zalo OA connection status
export const zaloCheckConnectionRequest = createAction<ZaloCheckConnectionPayload>(
  'zalo/checkConnectionRequest'
);

/**
 * Zalo Slice
 */
export const zaloSlice = createSlice({
  name: 'zalo',
  initialState,
  reducers: {
    setZaloLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    setZaloOAInfo: (state, action: PayloadAction<ZaloOAInfo | null>) => {
      state.oaInfo = action.payload;
      state.loading = false;
    },
  },
});

// Export actions
export const { setZaloLoading, setZaloOAInfo } = zaloSlice.actions;

// Export selectors
// isConnected is derived from oaInfo presence
export const selectZaloIsConnected = (state: { zalo: ZaloState }) => state.zalo.oaInfo !== null;
export const selectZaloLoading = (state: { zalo: ZaloState }) => state.zalo.loading;
export const selectZaloOAInfo = (state: { zalo: ZaloState }) => state.zalo.oaInfo;

// Export reducer
export default zaloSlice.reducer;
