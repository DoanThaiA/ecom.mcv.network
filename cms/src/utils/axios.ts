import axios, { type InternalAxiosRequestConfig, type AxiosError, AxiosResponse } from 'axios';
import i18next from 'src/i18next';
import { authRepository } from 'src/repositories';
import { appLocalStorage, localStorageKeys } from 'src/services/localStorage';
import storageService from 'src/services/storageService';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://first-shepherd-legible.ngrok-free.app/api/v1',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Refresh token queue management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - Add token and locale to all requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from appLocalStorage
    const token = appLocalStorage.getItem<string>(localStorageKeys.ACCESS_TOKEN);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add locale header for API language responses
    config.headers['x-custom-lang'] = i18next.language || 'vi';

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle token refresh on 401
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if the error is due to an expired access token and it's not a refresh request itself
    if (error.response?.status === 401 && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = appLocalStorage.getItem<string>(localStorageKeys.REFRESH_TOKEN);

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Request a new access token using the refresh token
        const response = await authRepository.refreshToken();

        storageService.setAuthData({
          accessToken: response.token,
          refreshToken: response.refreshToken,
          tokenExpires: response.tokenExpires,
        });

        // Process all queued requests with the new token
        processQueue(null, response.token);

        // Update the Authorization header for the original request and retry
        originalRequest.headers['Authorization'] = `Bearer ${response.token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Process all queued requests with error
        processQueue(refreshError, null);

        // Clear auth data and redirect to login
        storageService.clearAuth();
        if (typeof window !== 'undefined') {
          window.location.href = '/sign-in';
          window.dispatchEvent(new CustomEvent('USER_LOGOUT'));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Manually set token to axios headers
 * Called after successful login
 */
export const setAuthTokenAxios = (token: string) => {
  if (token) {
    axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common['Authorization'];
  }
};

/**
 * Clear auth token from axios headers
 * Called on logout
 */
export const clearAuthTokenAxios = () => {
  delete axiosInstance.defaults.headers.common['Authorization'];
};

export default axiosInstance;
