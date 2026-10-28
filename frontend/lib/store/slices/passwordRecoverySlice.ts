/* eslint-disable no-unused-vars */
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

// ============================================
// Password Recovery Status
// ============================================

export enum PasswordRecoveryStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  OTP_SENT = 'otp_sent',
  OTP_VERIFIED = 'otp_verified',
  SUCCESS = 'success',
  ERROR = 'error',
}

interface PasswordRecoveryState {
  status: PasswordRecoveryStatus;
  resetToken: string | null;
}

const initialState: PasswordRecoveryState = {
  status: PasswordRecoveryStatus.IDLE,
  resetToken: null,
};

// ============================================
// Saga Actions (for triggering side effects)
// ============================================

/**
 * Forgot Password Payload (Email)
 */
export type ForgotPasswordPayload = {
  email: string;
  onSuccess?: () => void;
};

/**
 * Forgot password action for saga
 */
export const forgotPasswordRequest = createAction<ForgotPasswordPayload>(
  'passwordRecovery/forgotPasswordRequest'
);

/**
 * Phone Forgot Password - Step 1: Request OTP Payload
 */
export type PhoneForgotPasswordRequestOtpPayload = {
  phone: string;
  otpMethod?: string;
  onSuccess?: () => void;
  onError?: () => void;
};

/**
 * Phone Forgot Password - Step 1: Request OTP
 */
export const phoneForgotPasswordRequestOtpRequest = createAction<PhoneForgotPasswordRequestOtpPayload>(
  'passwordRecovery/phoneForgotPasswordRequestOtp'
);

/**
 * Phone Forgot Password - Step 2: Verify OTP Payload
 */
export type PhoneForgotPasswordVerifyOtpPayload = {
  phone: string;
  otp: string;
  onSuccess?: (_resetToken: string) => void;
  onError?: () => void;
};

/**
 * Phone Forgot Password - Step 2: Verify OTP
 */
export const phoneForgotPasswordVerifyOtpRequest = createAction<PhoneForgotPasswordVerifyOtpPayload>(
  'passwordRecovery/phoneForgotPasswordVerifyOtp'
);

/**
 * Phone Forgot Password - Step 3: Complete password reset Payload
 */
export type PhoneForgotPasswordCompletePayload = {
  phone: string;
  resetToken: string;
  password: string;
  onSuccess?: () => void;
  onError?: () => void;
};

/**
 * Phone Forgot Password - Step 3: Complete password reset
 */
export const phoneForgotPasswordCompleteRequest = createAction<PhoneForgotPasswordCompletePayload>(
  'passwordRecovery/phoneForgotPasswordComplete'
);

// ============================================
// Slice
// ============================================

const passwordRecoverySlice = createSlice({
  name: 'passwordRecovery',
  initialState,
  reducers: {
    setPasswordRecoveryLoading: (state) => {
      state.status = PasswordRecoveryStatus.LOADING;
    },
    setOtpSent: (state) => {
      state.status = PasswordRecoveryStatus.OTP_SENT;
    },
    setOtpVerified: (state, action: PayloadAction<string>) => {
      state.status = PasswordRecoveryStatus.OTP_VERIFIED;
      state.resetToken = action.payload;
    },
    setPasswordRecoverySuccess: (state) => {
      state.status = PasswordRecoveryStatus.SUCCESS;
      state.resetToken = null;
    },
    setPasswordRecoveryError: (state) => {
      state.status = PasswordRecoveryStatus.ERROR;
    },
    resetPasswordRecovery: (state) => {
      state.status = PasswordRecoveryStatus.IDLE;
      state.resetToken = null;
    },
  },
});

export const {
  setPasswordRecoveryLoading,
  setOtpSent,
  setOtpVerified,
  setPasswordRecoverySuccess,
  setPasswordRecoveryError,
  resetPasswordRecovery,
} = passwordRecoverySlice.actions;

// ============================================
// Selectors
// ============================================

export const selectPasswordRecoveryStatus = (state: { passwordRecovery: PasswordRecoveryState }) =>
  state.passwordRecovery.status;

export const selectPasswordRecoveryResetToken = (state: { passwordRecovery: PasswordRecoveryState }) =>
  state.passwordRecovery.resetToken;

export const selectIsPasswordRecoveryLoading = (state: { passwordRecovery: PasswordRecoveryState }) =>
  state.passwordRecovery.status === PasswordRecoveryStatus.LOADING;

export default passwordRecoverySlice.reducer;
