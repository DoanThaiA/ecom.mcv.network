import { call, put, takeLatest } from 'redux-saga/effects';
import { showSuccess, showError } from 'src/utils/toast';
import { authRepository } from 'src/repositories';
import {
  loginRequest,
  forgotPasswordRequest,
  refreshTokenRequest,
  logoutRequest,
  setAuthLoading,
  setCredentials,
  setAuthError,
  clearAuthError,
  logout,
} from '../store/authSlice';
import { setAuthTokenAxios, clearAuthTokenAxios } from 'src/utils/axios';
import type { ForgotPasswordResponse } from 'src/repositories/auth.repository';
import type { CmsLoginResponse as LoginResponse } from 'src/types/gen/cms/cms/auth/auth';
import type { RefreshResponse } from 'src/repositories/auth.repository';
import storageService from 'src/services/storageService';
import appLocalStorage, { localStorageKeys } from 'src/services/localStorage';

/**
 * Login Saga
 */
function* loginSaga(action: ReturnType<typeof loginRequest>) {
  try {
    yield put(setAuthLoading());

    const { credentials, onSuccess } = action.payload;

    // Call API - returns LoginResponse from proto
    const response: LoginResponse = yield call(authRepository.emailLogin, credentials);

    console.log('Login response:', response);

    // Set token to axios headers
    setAuthTokenAxios(response.token);

    // Save to localStorage
    storageService.setAuthData({
      accessToken: response.token,
      refreshToken: response.refreshToken,
      tokenExpires: response.tokenExpires,
      user: response.user,
    });

    // Set initial refresh time on login
    storageService.setLastRefreshTime();

    // Update Redux state
    yield put(
      setCredentials({
        user: response.user,
        token: response.token,
        refreshToken: response.refreshToken,
        tokenExpires: response.tokenExpires,
      })
    );

    // Show success message
    showSuccess('Login successful');

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }

    // NOTE: Navigation is handled by useEffect in sign-in-view.tsx
    // watching authStatus === AuthStatus.AUTHENTICATED
    // Do not navigate here to avoid race conditions
  } catch (error: any) {
    console.error('Login error:', error);
    yield put(
      setAuthError(error?.response?.data?.message || error?.message || 'Đăng nhập thất bại')
    );
    showError(error);
  }
}

/**
 * Forgot Password Saga
 */
function* forgotPasswordSaga(action: ReturnType<typeof forgotPasswordRequest>) {
  try {
    yield put(setAuthLoading());

    const { credentials, onSuccess } = action.payload;

    // Call API to send reset link
    const response: ForgotPasswordResponse = yield call(authRepository.forgotPassword, credentials);

    // Reset loading state
    yield put(clearAuthError());

    // Show success message
    showSuccess(response.message || 'Link đặt lại mật khẩu đã được gửi đến email của bạn');

    // Call success callback
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    yield put(
      setAuthError(
        error?.response?.data?.message || error?.message || 'Không thể gửi email đặt lại mật khẩu'
      )
    );
    showError(error);
  }
}

/**
 * Refresh Token Saga
 */
function* refreshTokenSaga() {
  try {
    const refreshToken = storageService.getRefreshToken();

    if (!refreshToken) {
      throw 'No refresh token available, logging out for security';
    }

    console.log('Refreshing access token... - AUTHSAGA');

    // Call API to refresh token - returns LoginResponse from proto
    const response: RefreshResponse = yield call(authRepository.refreshToken);

    console.log('Refresh token response - AUTHSAGA:', response);

    storageService.setAuthData({
      accessToken: response.token,
      refreshToken: response.refreshToken,
      tokenExpires: response.tokenExpires,
    });

    // Update last refresh time
    storageService.setLastRefreshTime();

    // Update Redux state
    yield put(
      setCredentials({
        token: response.token,
        refreshToken: response.refreshToken,
        tokenExpires: response.tokenExpires,
      })
    );

    // Update axios header with new token
    setAuthTokenAxios(response.token);

    console.log('Token refreshed successfully - AUTHSAGA');
  } catch (error: any) {
    console.info('Token refresh failed - AUTHSAGA:', error);

    storageService.clearAuth();

    // Clear axios token
    clearAuthTokenAxios();

    // Clear Redux state
    yield put(logout());
  }
}

/**
 * Logout Saga
 */
function* logoutSaga(action: ReturnType<typeof logoutRequest>) {
  try {
    const { onSuccess } = action.payload || {};

    // Call logout API (optional - backend may invalidate token)
    try {
      yield call(authRepository.logout);
    } catch (error) {
      // Ignore logout API errors
      console.error('Logout API error:', error);
    }

    // Clear auth token from axios headers
    clearAuthTokenAxios();

    // Clear localStorage
    storageService.clearAuth();

    // Update Redux state
    yield put(logout());

    // Call success callback (navigate to login)
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    console.error('Logout error:', error);
  }
}

/**
 * Root Auth Saga Watcher
 */
function* watchAuth() {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(forgotPasswordRequest.type, forgotPasswordSaga);
  yield takeLatest(refreshTokenRequest.type, refreshTokenSaga);
  yield takeLatest(logoutRequest.type, logoutSaga);
}

/**
 * Root Auth Saga
 * Starts all auth watchers
 */
export function* authSaga() {
  yield call(watchAuth);
}
