/* eslint-disable no-unused-vars */
import { AppLocale } from '@/lib/locale';
import { storageService } from '@/lib/services/storage.service';
import type { OAuthProvider } from '@/types/auth';
import { User } from '@/types/gen/shared/shared/users/user';
import { createAction, createSlice, PayloadAction } from '@reduxjs/toolkit';

export enum AuthStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error',
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  tokenExpires: number | null;
  status: AuthStatus;
}

// Initial state without localStorage access (deferred to client-side hydration)
const initialState: AuthState = {
  token: null,
  refreshToken: null,
  tokenExpires: null,
  status: AuthStatus.IDLE,
};

// ============================================
// Saga Actions (for triggering side effects)
// ============================================

/**
 * Login Payload
 */
export type LoginPayload = {
  email?: string;
  phoneNumber?: string;
  password: string;
  locale?: AppLocale;
  onSuccess?: () => void;
  onError?: () => void;
};

/**
 * Login action for saga
 */
export const loginRequest = createAction<LoginPayload>('auth/loginRequest');

/**
 * Logout action for saga
 */
export const logoutRequest = createAction('auth/logoutRequest');

/**
 * OAuth Redirect Payload
 */
export type OAuthRedirectPayload = {
  provider: OAuthProvider;
};

/**
 * OAuth redirect action for saga
 */
export const oauthRedirectRequest = createAction<OAuthRedirectPayload>(
  'auth/oauthRedirectRequest'
);

/**
 * OAuth Callback Payload
 */
export type OAuthCallbackPayload = {
  provider: OAuthProvider;
  payload: unknown;
};

/**
 * OAuth callback action for saga
 */
export const oauthCallbackRequest = createAction<OAuthCallbackPayload>(
  'auth/oauthCallbackRequest'
);

/**
 * Refresh token action for saga
 * Automatically called before token expires
 */
export const refreshTokenRequest = createAction('auth/refreshTokenRequest');

/**
 * Verify Phone OTP Payload
 */
export type VerifyPhoneOtpPayload = {
  phone: string;
  otp: string;
  onSuccess?: () => void;
  onError?: () => void;
  locale: AppLocale;
};

/**
 * Verify phone OTP action for saga
 */
export const verifyPhoneOtpRequest = createAction<VerifyPhoneOtpPayload>(
  'auth/verifyPhoneOtpRequest'
);

/**
 * OAuth Link Redirect Payload
 * Same as OAuthRedirectPayload but for linking
 */
export type OAuthLinkRedirectPayload = {
  provider: OAuthProvider;
};

/**
 * OAuth link redirect action for saga
 * Initiates OAuth flow for linking social account
 */
export const oauthLinkRedirectRequest = createAction<OAuthLinkRedirectPayload>(
  'auth/oauthLinkRedirectRequest'
);

/**
 * OAuth Link Callback Payload
 */
export type OAuthLinkCallbackPayload = {
  provider: OAuthProvider;
  payload: unknown;
  onSuccess?: () => void;
  onError?: () => void;
};

/**
 * OAuth link callback action for saga
 * Handles callback after linking social account
 */
export const oauthLinkCallbackRequest = createAction<OAuthLinkCallbackPayload>(
  'auth/oauthLinkCallbackRequest'
);

/**
 * Unlink Social Account Payload
 */
export type UnlinkSocialPayload = {
  provider: OAuthProvider;
  onSuccess?: () => void;
  onError?: () => void;
};

/**
 * Unlink social account action for saga
 */
export const unlinkSocialRequest = createAction<UnlinkSocialPayload>(
  'auth/unlinkSocialRequest'
);

// ============================================
// Slice
// ============================================

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    hydrateFromStorage: (state) => {
      if (typeof window === 'undefined') return;
      const token = storageService.getToken();
      const refreshToken = storageService.getRefreshToken();
      const tokenExpires = storageService.getTokenExpires();
      if (token && refreshToken) {
        state.token = token;
        state.refreshToken = refreshToken;
        state.tokenExpires = tokenExpires;
        state.status = AuthStatus.AUTHENTICATED;
      }
    },
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string;
        refreshToken: string;
        tokenExpires: number;
        user: User | undefined;
      }>
    ) => {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
      state.tokenExpires = action.payload.tokenExpires;
      state.status = AuthStatus.AUTHENTICATED;

      // Save to storageService
      storageService.setAuthTokens(
        action.payload.token,
        action.payload.refreshToken,
        action.payload.tokenExpires,
        action.payload.user,
      );
    },
    logout: (state) => {
      state.token = null;
      state.refreshToken = null;
      state.tokenExpires = null;
      state.status = AuthStatus.IDLE;
    },
    setAuthLoading: (state) => {
      state.status = AuthStatus.LOADING;
    },
    setAuthError: (state) => {
      state.status = AuthStatus.ERROR;
    },
    clearAuthError: (state) => {
      state.status = AuthStatus.IDLE;
    },
    setAuthAuthenticated: (state) => {
      state.status = AuthStatus.AUTHENTICATED;
    },
  },
});

export const {
  hydrateFromStorage,
  setCredentials,
  logout,
  setAuthLoading,
  setAuthError,
  clearAuthError,
  setAuthAuthenticated,
} = authSlice.actions;

// ============================================
// Selectors
// ============================================

/**
 * Selector to check if user is authenticated
 * Replaces the old isAuthenticated field
 */
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.status === AuthStatus.AUTHENTICATED;

export default authSlice.reducer;
