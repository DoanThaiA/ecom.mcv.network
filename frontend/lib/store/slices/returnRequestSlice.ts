import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import type { ReturnRequestPayload } from '@/types/returnRequest';

/**
 * Return Request State
 */
export interface ReturnRequestState {
  loading: boolean;
  success: boolean;
  error: string | null;
}

const initialState: ReturnRequestState = {
  loading: false,
  success: false,
  error: null,
};

/**
 * Saga Action Payload Types
 */
export type SubmitReturnRequestPayload = {
  data: ReturnRequestPayload;
  onSuccess?: () => void;
  onError?: () => void;
};

/**
 * Saga Actions (Side Effect Triggers)
 */
export const submitReturnRequestAction = createAction<SubmitReturnRequestPayload>(
  'returnRequest/submitRequest'
);

/**
 * Return Request Slice
 */
export const returnRequestSlice = createSlice({
  name: 'returnRequest',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSuccess: (state, action: PayloadAction<boolean>) => {
      state.success = action.payload;
      state.loading = false;
      state.error = null;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
      state.success = false;
    },
    resetState: (state) => {
      state.loading = false;
      state.success = false;
      state.error = null;
    },
  },
});

export const { setLoading, setSuccess, setError, resetState } =
  returnRequestSlice.actions;

/**
 * Selectors
 */
export const selectReturnRequestLoading = (state: {
  returnRequest: ReturnRequestState;
}) => state.returnRequest.loading;

export const selectReturnRequestSuccess = (state: {
  returnRequest: ReturnRequestState;
}) => state.returnRequest.success;

export const selectReturnRequestError = (state: {
  returnRequest: ReturnRequestState;
}) => state.returnRequest.error;

export default returnRequestSlice.reducer;
