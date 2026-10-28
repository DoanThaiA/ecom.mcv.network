import axiosInstance from '@/lib/axios';
import { API_BASE_URL } from '@/lib/config/api';
import type {
  AuthPhonePasswordLogin,
  AuthPhonePasswordRegister,
  OAuthProvider,
  OAuthRedirectResponse,
  PhoneForgotPasswordComplete,
  PhoneForgotPasswordRequestOtp,
  PhoneForgotPasswordVerifyOtp,
  PhoneForgotPasswordVerifyOtpResponse,
  PhoneResetPasswordCredentials,
} from '@/types/auth';
import type { MessageResponse } from '@/types/common';
import type {
  AuthEmailLogin,
  AuthForgotPassword,
  AuthPhoneVerifyOtp,
  AuthRegisterLogin,
  AuthResetPassword,
  LoginResponse,
} from '@/types/gen/shop/shop/auth/auth';
import type { User } from '@/types/gen/shared/shared/users/user';
import axios from 'axios';

/**
 * Auth Repository
 * Handles all authentication-related API calls
 */

class AuthRepository {
  /**
   * Login with email and password
   */
  emailLogin = async (credentials: AuthEmailLogin): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      '/auth/email/login',
      credentials
    );
    return response.data;
  };

  /**
   * Register new user with email
   */
  emailRegister = async (credentials: AuthRegisterLogin): Promise<void> => {
    await axiosInstance.post('/auth/email/register', credentials);
  };

  /**
   * Register new user with phone and password
   */
  phonePasswordRegister = async (
    credentials: AuthPhonePasswordRegister
  ): Promise<void> => {
    await axiosInstance.post('/auth/phone/register', credentials);
  };

  /**
   * Login with phone and password
   */
  phonePasswordLogin = async (
    credentials: AuthPhonePasswordLogin
  ): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      '/auth/phone/login',
      credentials
    );
    return response.data;
  };

  /**
   * Verify OTP and complete phone login
   */
  verifyPhoneOtp = async (
    credentials: AuthPhoneVerifyOtp
  ): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>(
      '/auth/phone/verify-otp',
      credentials
    );
    return response.data;
  };

  /**
   * Logout user
   */
  logout = async (): Promise<void> => {
    await axiosInstance.post('/auth/logout');
  };

  /**
   * Get OAuth redirect URL
   */
  getOAuthRedirectUrl = async (
    provider: OAuthProvider,
    returnUrl?: string
  ): Promise<OAuthRedirectResponse> => {
    const response = await axiosInstance.get<OAuthRedirectResponse>(
      `/auth/${provider}/redirect`,
      {
        headers: {
          'ngrok-skip-browser-warning': 'true',
        },
        params: returnUrl ? { returnUrl } : undefined,
        maxRedirects: 0,
        validateStatus: null,
      }
    );
    return response.data;
  };

  /**
   * Handle OAuth callback and exchange code for tokens
   */
  loginBySocial = async (
    provider: OAuthProvider,
    payload: any
  ): Promise<LoginResponse> => {
    // Google uses a different endpoint
    const endpoint = `/auth/${provider}/login`;

    const response = await axiosInstance.post<LoginResponse>(endpoint, payload);
    return response.data;
  };

  /**
   * Refresh access token
   */
  refreshToken = async (refreshToken: string): Promise<LoginResponse> => {
    const newAxiosIntance = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const response = await newAxiosIntance.post<LoginResponse>(
      '/auth/refresh-token',
      { refreshToken },
      {
        headers: {
          Authorization: `Bearer ${refreshToken}`,
        },
      }
    );
    return response.data;
  };

  /**
   * Get current user profile
   */
  getCurrentUser = async (): Promise<User> => {
    const response = await axiosInstance.get<User>('/auth/me');
    return response.data;
  };

  /**
   * Update user profile
   */
  updateProfile = async (updates: Partial<any>): Promise<User> => {
    const response = await axiosInstance.patch<User>('/auth/me', updates);
    return response.data;
  };

  /**
   * Reset password for phone user
   */
  resetPassword = async (
    credentials: PhoneResetPasswordCredentials
  ): Promise<void> => {
    await axiosInstance.post('/auth/phone/reset-password', credentials);
  };

  /**
   * Confirm email with hash token
   */
  confirmEmail = async (payload: {
    hash: string;
  }): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      '/auth/email/confirm',
      payload
    );
    return response.data;
  };

  /**
   * Confirm new email with hash token (for email change verification)
   */
  confirmNewEmail = async (payload: {
    hash: string;
  }): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      '/auth/email/confirm/new',
      payload
    );
    return response.data;
  };

  /**
   * Forgot password - send reset password link to email
   */
  forgotPassword = async (
    credentials: AuthForgotPassword
  ): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      '/auth/email/forgot/password',
      credentials
    );
    return response.data;
  };

  /**
   * Reset password with hash token (from email link)
   */
  resetPasswordWithHash = async (
    credentials: AuthResetPassword
  ): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      '/auth/email/reset/password',
      credentials
    );
    return response.data;
  };

  /**
   * Phone Forgot Password - Step 1: Request OTP
   * Send OTP to phone number for password reset
   */
  phoneForgotPasswordRequestOtp = async (
    credentials: PhoneForgotPasswordRequestOtp
  ): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      '/auth/phone/forgot/password/request-otp',
      credentials
    );
    return response.data;
  };

  /**
   * Phone Forgot Password - Step 2: Verify OTP
   * Verify OTP code for password reset
   */
  phoneForgotPasswordVerifyOtp = async (
    credentials: PhoneForgotPasswordVerifyOtp
  ): Promise<PhoneForgotPasswordVerifyOtpResponse> => {
    const response =
      await axiosInstance.post<PhoneForgotPasswordVerifyOtpResponse>(
        '/auth/phone/forgot/password/verify-otp',
        credentials
      );
    return response.data;
  };

  /**
   * Phone Forgot Password - Step 3: Complete password reset
   * Set new password after OTP verification
   */
  phoneForgotPasswordComplete = async (
    credentials: PhoneForgotPasswordComplete
  ): Promise<MessageResponse> => {
    const response = await axiosInstance.post<MessageResponse>(
      '/auth/phone/forgot/password/complete',
      credentials
    );
    return response.data;
  };

  /**
   * Delete current user account permanently
   * For Facebook Login compliance
   */
  deleteMyAccount = async (): Promise<MessageResponse> => {
    const response = await axiosInstance.delete<MessageResponse>('/auth/me');
    return response.data;
  };

  /**
   * Link social account to current user
   * Similar to loginBySocial but links to existing account
   */
  linkBySocial = async (
    provider: OAuthProvider,
    payload: any
  ): Promise<User> => {
    const endpoint = `/auth/${provider}/link`;
    const response = await axiosInstance.post<User>(endpoint, payload);
    return response.data;
  };

  /**
   * Unlink social account from current user
   */
  unlinkSocial = async (provider: OAuthProvider): Promise<User> => {
    const response = await axiosInstance.delete<User>('/auth/me/social', {
      data: { provider },
    });
    return response.data;
  };
}

// Export singleton instance
export const authRepository = new AuthRepository();
