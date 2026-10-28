/* eslint-disable no-unused-vars */
import { createAction, createSlice } from '@reduxjs/toolkit';

// ============================================
// Registration Status
// ============================================

export enum RegistrationStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

interface RegistrationState {
  status: RegistrationStatus;
}

const initialState: RegistrationState = {
  status: RegistrationStatus.IDLE,
};

// ============================================
// Saga Actions (for triggering side effects)
// ============================================

/**
 * Register Payload
 */
export type RegisterPayload = {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  otpMethod?: string;
  onSuccess?: () => void;
  onError?: () => void;
};

/**
 * Register action for saga
 */
export const registerRequest = createAction<RegisterPayload>('registration/registerRequest');

/**
 * Resend Code Payload
 */
export type ResendCodePayload = {
  firstName: string;
  lastName: string;
  email?: string;
  phoneNumber?: string;
  password?: string;
  otpMethod?: string;
  onSuccess?: () => void;
};

/**
 * Resend code action for saga
 */
export const resendCodeRequest = createAction<ResendCodePayload>('registration/resendCodeRequest');

/**
 * Confirm Email Payload
 */
export type ConfirmEmailPayload = {
  hash: string;
  onSuccess?: () => void;
  onError?: (_error: unknown) => void;
};

/**
 * Confirm email action for saga
 */
export const confirmEmailRequest = createAction<ConfirmEmailPayload>('registration/confirmEmailRequest');

/**
 * Confirm New Email Payload (for email change verification)
 */
export type ConfirmNewEmailPayload = {
  hash: string;
  onSuccess?: () => void;
  onError?: (_error: unknown) => void;
};

/**
 * Confirm new email action for saga
 */
export const confirmNewEmailRequest = createAction<ConfirmNewEmailPayload>('registration/confirmNewEmailRequest');

// ============================================
// Slice
// ============================================

const registrationSlice = createSlice({
  name: 'registration',
  initialState,
  reducers: {
    setRegistrationLoading: (state) => {
      state.status = RegistrationStatus.LOADING;
    },
    setRegistrationSuccess: (state) => {
      state.status = RegistrationStatus.SUCCESS;
    },
    setRegistrationError: (state) => {
      state.status = RegistrationStatus.ERROR;
    },
    resetRegistration: (state) => {
      state.status = RegistrationStatus.IDLE;
    },
  },
});

export const {
  setRegistrationLoading,
  setRegistrationSuccess,
  setRegistrationError,
  resetRegistration,
} = registrationSlice.actions;

// ============================================
// Selectors
// ============================================

export const selectRegistrationStatus = (state: { registration: RegistrationState }) =>
  state.registration.status;

export const selectIsRegistrationLoading = (state: { registration: RegistrationState }) =>
  state.registration.status === RegistrationStatus.LOADING;

export default registrationSlice.reducer;
