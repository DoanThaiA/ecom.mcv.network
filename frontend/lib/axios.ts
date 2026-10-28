/* eslint-disable no-console */
import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from 'axios';
import { storageService } from '@/lib/services/storage.service';
import { DEFAULT_LOCALE, isValidLocale } from '@/lib/locale';
import { API_BASE_URL } from '@/lib/config/api';

// Create axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Refresh token queue management
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (_value?: unknown) => void;
  reject: (_reason?: unknown) => void;
}> = [];

const processQueue = (error: unknown = null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Get current locale from URL path and sync to localStorage
 * - If URL has valid locale → save to localStorage and return
 * - If URL has no locale → read from localStorage
 * - Fallback to default locale
 */
const getLocale = (): string => {
  if (typeof window === 'undefined') {
    return 'vi';
  }

  // Try to get locale from URL path
  const pathParts = window.location.pathname.split('/');
  const localeFromPath = pathParts[1];

  if (isValidLocale(localeFromPath)) {
    // Valid locale in URL → save to localStorage
    storageService.setLanguage(localeFromPath);
    return localeFromPath;
  }

  // No valid locale in URL → read from localStorage
  const storedLocale = storageService.getLanguage();
  if (storedLocale && isValidLocale(storedLocale)) {
    return storedLocale;
  }

  return DEFAULT_LOCALE;
};

// Request interceptor - Add token, session ID, and locale to all requests
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from storageService to determine authentication status
    const token = storageService.getToken();

    // Only add x-session-id header for guest users (no access token)
    // Authenticated users are identified via Authorization header
    if (!token) {
      const sessionId = storageService.getXSessionId();
      config.headers['x-session-id'] = sessionId;
    }

    // Add Authorization header if token exists
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add locale header (from URL path or localStorage)
    const locale = getLocale();
    config.headers['x-custom-lang'] = locale;
    // If data is FormData, remove Content-Type header to let axios set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

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

    // Handle 401 Unauthorized - Token expired
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
        // Try to refresh token
        const refreshToken = storageService.getRefreshToken();

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken },
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const {
          token: newAccessToken,
          refreshToken: newRefreshToken,
          tokenExpires,
        } = response.data;

        // Save new tokens using storageService
        storageService.setAuthTokens(
          newAccessToken,
          newRefreshToken,
          tokenExpires
        );

        // Process all queued requests with the new token
        processQueue(null, newAccessToken);

        // Retry original request with new token
        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Process all queued requests with error
        processQueue(refreshError, null);

        console.error('Token refresh failed:', refreshError);
        storageService.clearAuth();

        if (typeof window !== 'undefined') {
          console.log('Clear auth {USER_LOGOUT}');
          // Dispatch USER_LOGOUT event to notify components to show SignInDialog
          // Components will handle the redirect using Next.js router (no hard reload)
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
export const setAuthToken = (token: string) => {
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
export const clearAuthToken = () => {
  delete axiosInstance.defaults.headers.common['Authorization'];
};

export default axiosInstance;
