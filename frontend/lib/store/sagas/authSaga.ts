/* eslint-disable no-console */
import { clearAuthToken, setAuthToken } from "@/lib/axios";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toastHelper";
import { authRepository } from "@/lib/repositories/auth.repository";
import { storageService } from "@/lib/services/storage.service";
import type { OAuthRedirectResponse } from "@/types/auth";
import type { LoginResponse } from "@/types/gen/shop/shop/auth/auth";
import type { User } from "@/types/gen/shared/shared/users/user";
import { call, put, select, takeLatest } from "redux-saga/effects";
import { setUser } from "../slices/accountSlice";
import {
  loginRequest,
  logout,
  logoutRequest,
  oauthCallbackRequest,
  oauthLinkCallbackRequest,
  oauthLinkRedirectRequest,
  oauthRedirectRequest,
  refreshTokenRequest,
  setAuthAuthenticated,
  setAuthError,
  setAuthLoading,
  setCredentials,
  unlinkSocialRequest,
  verifyPhoneOtpRequest,
} from "../slices/authSlice";
import { mergeCartRequest } from "../slices/cartSlice";

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Process successful authentication response
 * Sets token in axios headers, updates Redux credentials,
 * then fetches fresh user data from /me API
 * @param response - Login response from API
 * @param options.mergeCart - Whether to merge guest cart after login
 * @returns Fresh user data from /me API
 */
function* processAuthSuccess(
  response: LoginResponse,
  options: { mergeCart?: boolean; skipClearSession?: boolean } = {}
) {
  setAuthToken(response.token);

  // Clear guest checkout session on login - cart will fetch new authenticated session
  // Skip for social OAuth login - backend handles session ownership transfer
  if (!options.skipClearSession) {
    storageService.clearCheckoutSession();
  }

  yield put(
    setCredentials({
      token: response.token,
      refreshToken: response.refreshToken,
      tokenExpires: response.tokenExpires,
      user: response.user,
    })
  );

  if (options.mergeCart) {
    yield put(mergeCartRequest());
  }

  // Fetch fresh user data from /me API to ensure we have the latest user info
  // This prevents stale user data from persisting after logout/login
  try {
    const freshUser: User = yield call(() => authRepository.getCurrentUser());
    return freshUser;
  } catch (error) {
    console.error("Failed to fetch fresh user from /me API:", error);
    // Fallback to response.user if /me API fails
    return response.user;
  }
}

/**
 * Set user to account slice if user exists
 */
function* setUserToAccount(user: LoginResponse["user"]) {
  if (user) {
    yield put(setUser(user));
  }
}

// ============================================================================
// Auth Sagas
// ============================================================================

/**
 * Login Saga
 * Handles email and phone password login
 */
function* loginSaga(action: ReturnType<typeof loginRequest>) {
  try {
    yield put(setAuthLoading());

    const { email, phoneNumber, password, onSuccess } = action.payload;

    let response: LoginResponse;

    if (email) {
      response = yield call(() =>
        authRepository.emailLogin({ email, password })
      );
    } else if (phoneNumber) {
      response = yield call(() =>
        authRepository.phonePasswordLogin({ phone: phoneNumber, password })
      );
    } else {
      throw new Error("Email or phone number is required");
    }

    const user: LoginResponse["user"] = yield call(
      processAuthSuccess,
      response,
      { mergeCart: true }
    );
    yield call(setUserToAccount, user);

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setAuthError());

    if (action.payload.onError) {
      action.payload.onError();
    }

    showErrorToast(error);
    console.error("Login failed:", error);
  }
}

/**
 * Logout Saga
 * Clears auth state and tokens
 */
function* logoutSaga() {
  // Call logout API
  try {
    yield call(() => authRepository.logout());
  } catch (_) {
    console.log(_);
  }

  // Clear token from axios headers
  clearAuthToken();

  // Clear Redux state
  yield put(logout());

  // Clear auth tokens using storageService
  storageService.clearAuth();
}

/**
 * OAuth Redirect Saga
 * Gets authorization URL from backend and redirects user to OAuth provider
 */
function* oauthRedirectSaga(action: ReturnType<typeof oauthRedirectRequest>) {
  try {
    yield put(setAuthLoading());

    const { provider } = action.payload;

    // Save current page path so user can be redirected back after login
    const returnUrl =
      window.location.pathname + window.location.search + window.location.hash;

    // Get authorization URL from backend, passing returnUrl to embed in state
    const response: OAuthRedirectResponse = yield call(() =>
      authRepository.getOAuthRedirectUrl(provider, returnUrl)
    );

    // Redirect to OAuth provider
    window.location.href = response.url;
  } catch (error) {
    yield put(setAuthError());
    showErrorToast(error);
  }
}

/**
 * OAuth Callback Saga
 * Exchanges authorization code for access token
 */
function* oauthCallbackSaga(action: ReturnType<typeof oauthCallbackRequest>) {
  try {
    yield put(setAuthLoading());

    const { provider, payload } = action.payload;

    const response: LoginResponse = yield call(() =>
      authRepository.loginBySocial(provider, payload)
    );

    const user: LoginResponse["user"] = yield call(
      processAuthSuccess,
      response,
      { mergeCart: true, skipClearSession: true }  // Backend handles session transfer
    );
    yield call(setUserToAccount, user);
  } catch (error) {
    yield put(setAuthError());
    showErrorToast(error);
  }
}

/**
 * Refresh Token Saga
 * Refreshes access token using refresh token
 * Note: This saga has different order (setCredentials before setAuthToken)
 * and doesn't merge cart, so we don't use processAuthSuccess helper
 */
function* refreshTokenSaga() {
  try {
    const state: { auth: { refreshToken: string | null } } = yield select();
    const refreshToken = state.auth.refreshToken;

    if (!refreshToken) {
      console.error("No refresh token available, logging out for security");
      yield put(logout());
      clearAuthToken();
      return;
    }

    console.log("Refreshing access token...");

    const response: LoginResponse = yield call(() =>
      authRepository.refreshToken(refreshToken)
    );

    yield put(
      setCredentials({
        token: response.token,
        refreshToken: response.refreshToken,
        tokenExpires: response.tokenExpires,
        user: response.user,
      })
    );
    setAuthToken(response.token);

    // Fetch fresh user data from /me API
    try {
      const freshUser: User = yield call(() => authRepository.getCurrentUser());
      yield call(setUserToAccount, freshUser);
    } catch (error) {
      console.error("Failed to fetch fresh user from /me API:", error);
      // Fallback to response.user if /me API fails
      yield call(setUserToAccount, response.user);
    }

    console.log("Token refreshed successfully");
  } catch (error) {
    console.error("Token refresh failed:", error);
    yield put(logout());
    clearAuthToken();
  }
}

/**
 * Verify Phone OTP Saga
 * Verifies OTP code and completes phone login
 */
function* verifyPhoneOtpSaga(action: ReturnType<typeof verifyPhoneOtpRequest>) {
  try {
    yield put(setAuthLoading());

    const { phone, otp, onSuccess } = action.payload;

    const response: LoginResponse = yield call(() =>
      authRepository.verifyPhoneOtp({ phone, otp })
    );

    const user: LoginResponse["user"] = yield call(
      processAuthSuccess,
      response,
      { mergeCart: true }
    );

    // Note: Original code calls onSuccess before setUser
    if (onSuccess) {
      onSuccess();
    }

    yield call(setUserToAccount, user);
  } catch (error: any) {
    yield put(setAuthError());
    // Only call onError for 422 status (invalid OTP)
    if (action.payload.onError && error?.response?.status === 422) {
      action.payload.onError();
    }
    showErrorToast(error);
  }
}

// ============================================================================
// Social Account Link/Unlink Sagas
// ============================================================================

/**
 * OAuth Link Redirect Saga
 * Gets authorization URL from backend and redirects user to OAuth provider
 * Adds action=link parameter to callback URL
 */
function* oauthLinkRedirectSaga(
  action: ReturnType<typeof oauthLinkRedirectRequest>
) {
  try {
    yield put(setAuthLoading());

    const { provider } = action.payload;

    // Get authorization URL from backend
    const response: OAuthRedirectResponse = yield call(() =>
      authRepository.getOAuthRedirectUrl(provider)
    );

    // Add action=link to the URL to distinguish from login
    const url = new URL(response.url);
    // The redirect_uri in the OAuth URL will include the callback endpoint
    // We need to modify the state or add our own parameter
    // Since backend controls the OAuth URL, we'll pass action via state param
    const currentState = url.searchParams.get("state") || "";
    url.searchParams.set("state", `${currentState}|action=link`);

    // Redirect to OAuth provider
    window.location.href = url.toString();
  } catch (error) {
    yield put(setAuthError());
    showErrorToast(error);
  }
}

/**
 * OAuth Link Callback Saga
 * Links social account to current user
 */
function* oauthLinkCallbackSaga(
  action: ReturnType<typeof oauthLinkCallbackRequest>
) {
  try {
    yield put(setAuthLoading());

    const { provider, payload, onSuccess } = action.payload;

    const user: User = yield call(() =>
      authRepository.linkBySocial(provider, payload)
    );

    // Update user data in account store
    yield put(setUser(user));

    // Set status back to AUTHENTICATED so callback page shows success
    yield put(setAuthAuthenticated());

    showSuccessToast("linkedAccounts.linkSuccess");

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    yield put(setAuthError());

    if (action.payload.onError) {
      action.payload.onError();
    }

    showErrorToast(error);
  }
}

/**
 * Unlink Social Account Saga
 * Removes social account link from current user
 */
function* unlinkSocialSaga(action: ReturnType<typeof unlinkSocialRequest>) {
  try {
    const { provider, onSuccess } = action.payload;

    const user: User = yield call(() => authRepository.unlinkSocial(provider));

    // Update user data in account store
    yield put(setUser(user));

    showSuccessToast("linkedAccounts.unlinkSuccess");

    if (onSuccess) {
      onSuccess();
    }
  } catch (error) {
    if (action.payload.onError) {
      action.payload.onError();
    }

    showErrorToast(error);
  }
}

// Saga watchers
export function* watchAuth() {
  yield takeLatest(loginRequest.type, loginSaga);
  yield takeLatest(logoutRequest.type, logoutSaga);
  yield takeLatest(oauthRedirectRequest.type, oauthRedirectSaga);
  yield takeLatest(oauthCallbackRequest.type, oauthCallbackSaga);
  yield takeLatest(refreshTokenRequest.type, refreshTokenSaga);
  yield takeLatest(verifyPhoneOtpRequest.type, verifyPhoneOtpSaga);
  // Social account link/unlink
  yield takeLatest(oauthLinkRedirectRequest.type, oauthLinkRedirectSaga);
  yield takeLatest(oauthLinkCallbackRequest.type, oauthLinkCallbackSaga);
  yield takeLatest(unlinkSocialRequest.type, unlinkSocialSaga);
}

/**
 * Root Auth Saga
 * Starts all auth watchers
 */
export function* authSaga() {
  yield call(watchAuth);
}
