import type { PayloadAction } from '@reduxjs/toolkit';
import { createAction, createSlice } from '@reduxjs/toolkit';
import { appLocalStorage, localStorageKeys } from 'src/services/localStorage';

import type { AuthCmsLogin } from 'src/types/gen/cms/cms/auth/auth';
import type { AuthForgotPassword } from 'src/repositories/auth.repository';
import type { CmsUser } from 'src/types/gen/cms/cms/cms-users/cms-user';

// Type alias for backward compatibility
type User = CmsUser;

// Type alias for backward compatibility
type AuthEmailLogin = AuthCmsLogin;

// Auth state for Redux
export interface AuthState {
  user: User | null;
  token: string | null;
  tokenExpires: number | null;
  status: AuthStatus;
  error: string | null;
}

// Auth status enum
export enum AuthStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  AUTHENTICATED = 'authenticated',
  ERROR = 'error',
}

// Type aliases for backward compatibility
export type EmailLoginCredentials = AuthEmailLogin;
export type ForgotPasswordCredentials = AuthForgotPassword;

/**
 * Load initial auth state from appLocalStorage
 */
const loadInitialState = (): AuthState => {
  const token = appLocalStorage.getItem(localStorageKeys.ACCESS_TOKEN);
  const refreshToken = appLocalStorage.getItem(localStorageKeys.REFRESH_TOKEN);
  const tokenExpires = appLocalStorage.getItem<number>(localStorageKeys.TOKEN_EXPIRES);
  const user = appLocalStorage.getItem<User>(localStorageKeys.USER);

  if (token && refreshToken) {
    return {
      user,
      token,
      tokenExpires,
      status: AuthStatus.AUTHENTICATED,
      error: null,
    };
  }

  return {
    user: null,
    token: null,
    tokenExpires: null,
    status: AuthStatus.IDLE,
    error: null,
  };
};

const initialState: AuthState = loadInitialState();

/**
 * Saga Actions (Side Effect Triggers)
 */
export const loginRequest = createAction<{
  credentials: EmailLoginCredentials;
  onSuccess?: () => void;
}>('auth/loginRequest');

export const forgotPasswordRequest = createAction<{
  credentials: ForgotPasswordCredentials;
  onSuccess?: () => void;
}>('auth/forgotPasswordRequest');

export const refreshTokenRequest = createAction('auth/refreshTokenRequest');

export const logoutRequest = createAction(
  'auth/logoutRequest',
  (payload?: { onSuccess?: () => void }) => ({ payload })
);

/**
 * Auth Slice
 */
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthLoading: (state) => {
      state.status = AuthStatus.LOADING;
      state.error = null;
    },

    setCredentials: (
      state,
      action: PayloadAction<{
        user?: User;
        token: string;
        refreshToken: string;
        tokenExpires: number;
      }>
    ) => {
      if (action.payload.user) {
        state.user = action.payload.user;
      }
      state.token = action.payload.token;
      state.tokenExpires = action.payload.tokenExpires;
      state.status = AuthStatus.AUTHENTICATED;
      state.error = null;
    },

    setAuthError: (state, action: PayloadAction<string | undefined>) => {
      state.status = AuthStatus.ERROR;
      state.error = action.payload || 'An error occurred';
    },

    clearAuthError: (state) => {
      state.status = AuthStatus.IDLE;
      state.error = null;
    },

    logout: (state) => {
      state.user = null;
      state.token = null;
      state.tokenExpires = null;
      state.status = AuthStatus.IDLE;
      state.error = null;
    },

    // Legacy actions for backward compatibility
    changeAuthState: (
      state,
      action: PayloadAction<{
        isLoading: boolean;
      }>
    ) => {
      state.status = action.payload.isLoading ? AuthStatus.LOADING : AuthStatus.IDLE;
    },
  },
});

export const {
  setAuthLoading,
  setCredentials,
  setAuthError,
  clearAuthError,
  logout,
  changeAuthState,
} = authSlice.actions;

/**
 * Selectors
 */
export const selectIsAuthenticated = (state: { auth: AuthState }) =>
  state.auth.status === AuthStatus.AUTHENTICATED;

export const selectAuthStatus = (state: { auth: AuthState }) => state.auth.status;

export const selectCurrentUser = (state: { auth: AuthState }) => state.auth.user;

export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;

export const selectIsLoading = (state: { auth: AuthState }) =>
  state.auth.status === AuthStatus.LOADING;

export const selectCurrentUserPermissions = (state: { auth: AuthState }) =>
  state.auth.user?.permissions ?? [];

export default authSlice.reducer;
