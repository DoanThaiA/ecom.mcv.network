import axiosInstance from 'src/utils/axios';
import type {
  AuthCmsLogin,
  CmsLoginResponse,
  AuthCmsUpdate,
} from 'src/types/gen/cms/cms/auth/auth';
import type { User } from 'src/types/gen/shared/shared/users/user';
import appLocalStorage, { localStorageKeys } from 'src/services/localStorage';
import axios from 'axios';

// Type aliases for compatibility
type AuthEmailLogin = AuthCmsLogin;
type LoginResponse = CmsLoginResponse;
type AuthUpdate = AuthCmsUpdate;

// Types not in proto - defined locally
export interface AuthForgotPassword {
  email: string;
}

export interface AuthResetPassword {
  password: string;
  hash: string;
}

export interface RefreshResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
}

type ForgotPasswordCredentials = AuthForgotPassword;
type ResetPasswordCredentials = AuthResetPassword;

// Custom types not in proto
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

/**
 * Auth Repository
 * Handles all authentication-related API calls for CMS
 */

class AuthRepository {
  /**
   * Login with email and password
   */
  emailLogin = async (credentials: AuthEmailLogin): Promise<LoginResponse> => {
    const response = await axiosInstance.post<LoginResponse>('/auth/cms/login', credentials);
    return response.data;
  };

  /**
   * Logout user
   */
  logout = async (): Promise<void> => {
    await axiosInstance.post('/auth/cms/logout');
  };

  /**
   * Get current user profile
   */
  getCurrentUser = async (): Promise<any> => {
    const response = await axiosInstance.get('/auth/cms/me');
    return response.data;
  };

  /**
   * Update current user profile
   */
  updateProfile = async (data: AuthUpdate): Promise<User> => {
    const response = await axiosInstance.patch<User>('/auth/cms/me', data);
    return response.data;
  };

  /**
   * Refresh access token
   */
  refreshToken = async (): Promise<RefreshResponse> => {
    const refreshToken = appLocalStorage.getItem<string>(localStorageKeys.REFRESH_TOKEN);

    const newAxiosIntance = axios.create({
      baseURL:
        import.meta.env.VITE_API_URL || 'https://first-shepherd-legible.ngrok-free.app/api/v1',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const response = await newAxiosIntance.post<RefreshResponse>(
      '/auth/cms/refresh',
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
   * Forgot password - Send reset link via email
   */
  forgotPassword = async (
    credentials: ForgotPasswordCredentials
  ): Promise<ForgotPasswordResponse> => {
    const response = await axiosInstance.post<ForgotPasswordResponse>(
      '/auth/forgot/password',
      credentials
    );
    return response.data;
  };

  /**
   * Reset password with hash
   */
  resetPassword = async (credentials: ResetPasswordCredentials): Promise<{ message: string }> => {
    const response = await axiosInstance.post<{ message: string }>(
      '/auth/reset/password',
      credentials
    );
    return response.data;
  };
}

// Export singleton instance
export const authRepository = new AuthRepository();
