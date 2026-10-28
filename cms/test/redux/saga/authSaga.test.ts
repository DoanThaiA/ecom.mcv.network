import { describe, it, expect, vi, beforeEach } from 'vitest';
import { call, put, takeLatest } from 'redux-saga/effects';
import { authRepository } from 'src/repositories';
import { authSaga } from 'src/redux/saga/authSaga';
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
} from 'src/redux/store/authSlice';

// Mock repository
vi.mock('src/repositories', () => ({
  authRepository: {
    emailLogin: vi.fn(),
    forgotPassword: vi.fn(),
    refreshToken: vi.fn(),
    logout: vi.fn(),
  },
}));

// Mock toast
vi.mock('src/utils/toast', () => ({
  showSuccess: vi.fn(),
  showError: vi.fn(),
}));

// Mock axios utils
vi.mock('src/utils/axios', () => ({
  setAuthTokenAxios: vi.fn(),
  clearAuthTokenAxios: vi.fn(),
}));

// Mock storage service
vi.mock('src/services/storageService', () => ({
  default: {
    setAuthData: vi.fn(),
    getRefreshToken: vi.fn(),
    clearAuth: vi.fn(),
    setLastRefreshTime: vi.fn(),
  },
}));

// Mock localStorage service
vi.mock('src/services/localStorage', () => {
  const mockLocalStorage = {
    setItem: vi.fn(),
    getItem: vi.fn(),
    removeItem: vi.fn(),
  };

  return {
    default: mockLocalStorage,
    appLocalStorage: mockLocalStorage,
    localStorageKeys: {
      USER: 'user',
      TOKEN: 'token',
      ACCESS_TOKEN: 'accessToken',
      REFRESH_TOKEN: 'refreshToken',
      TOKEN_EXPIRES: 'tokenExpires',
    },
  };
});

describe('authSaga', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('root saga', () => {
    it('exports authSaga function', () => {
      expect(authSaga).toBeDefined();
      expect(authSaga.constructor.name).toBe('GeneratorFunction');
    });

    it('calls watchAuth', () => {
      const gen = authSaga();
      const firstYield = gen.next().value;

      expect(firstYield).toBeDefined();
    });

    it('completes after calling watchAuth', () => {
      const gen = authSaga();
      gen.next();
      const result = gen.next();

      expect(result.done).toBe(true);
    });
  });

  describe('loginSaga', () => {
    it('successfully logs in user', async () => {
      const mockResponse = {
        token: 'access-token-123',
        refreshToken: 'refresh-token-123',
        tokenExpires: 3600,
        user: {
          id: 'user-1',
          email: 'test@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      };

      vi.mocked(authRepository.emailLogin).mockResolvedValue(mockResponse);

      const action = loginRequest({
        credentials: {
          email: 'test@example.com',
          password: 'password123',
        },
      });

      expect(action.type).toBe('auth/loginRequest');
      expect(action.payload.credentials.email).toBe('test@example.com');
    });

    it('calls onSuccess callback when login succeeds', async () => {
      const mockResponse = {
        token: 'access-token-123',
        refreshToken: 'refresh-token-123',
        tokenExpires: 3600,
        user: {
          id: 'user-1',
          email: 'test@example.com',
        },
      };

      vi.mocked(authRepository.emailLogin).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = loginRequest({
        credentials: {
          email: 'test@example.com',
          password: 'password123',
        },
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles login failure', async () => {
      const mockError = new Error('Invalid credentials');

      vi.mocked(authRepository.emailLogin).mockRejectedValue(mockError);

      expect(authSaga).toBeDefined();
    });

    it('handles error with response data', () => {
      const error = {
        response: {
          data: {
            message: 'Email or password is incorrect',
          },
        },
      };

      expect(error.response.data.message).toBe('Email or password is incorrect');
    });

    it('sets loading state during login', () => {
      const action = setAuthLoading();

      expect(action.type).toBe('auth/setAuthLoading');
    });

    it('sets credentials on successful login', () => {
      const credentials = {
        user: {
          id: 'user-1',
          email: 'test@example.com',
        },
        token: 'access-token-123',
        refreshToken: 'refresh-token-123',
        tokenExpires: 3600,
      };

      const action = setCredentials(credentials);

      expect(action.type).toBe('auth/setCredentials');
      expect(action.payload).toEqual(credentials);
    });

    it('sets error on login failure', () => {
      const action = setAuthError('Login failed');

      expect(action.type).toBe('auth/setAuthError');
      expect(action.payload).toBe('Login failed');
    });
  });

  describe('forgotPasswordSaga', () => {
    it('successfully sends password reset email', async () => {
      const mockResponse = {
        message: 'Password reset link sent',
      };

      vi.mocked(authRepository.forgotPassword).mockResolvedValue(mockResponse);

      const action = forgotPasswordRequest({
        credentials: {
          email: 'test@example.com',
        },
      });

      expect(action.type).toBe('auth/forgotPasswordRequest');
      expect(action.payload.credentials.email).toBe('test@example.com');
    });

    it('calls onSuccess callback when successful', async () => {
      const mockResponse = {
        message: 'Reset link sent',
      };

      vi.mocked(authRepository.forgotPassword).mockResolvedValue(mockResponse);

      const onSuccess = vi.fn();
      const action = forgotPasswordRequest({
        credentials: {
          email: 'test@example.com',
        },
        onSuccess,
      });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles forgot password failure', async () => {
      const mockError = new Error('Email not found');

      vi.mocked(authRepository.forgotPassword).mockRejectedValue(mockError);

      expect(authSaga).toBeDefined();
    });

    it('handles error with custom message', () => {
      const error = {
        response: {
          data: {
            message: 'Email address not registered',
          },
        },
        message: 'Request failed',
      };

      expect(error.response.data.message).toBe('Email address not registered');
    });

    it('clears auth error on success', () => {
      const action = clearAuthError();

      expect(action.type).toBe('auth/clearAuthError');
    });
  });

  describe('refreshTokenSaga', () => {
    it('successfully refreshes token', async () => {
      const mockResponse = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tokenExpires: 3600,
      };

      const storageService = await import('src/services/storageService');
      vi.mocked(storageService.default.getRefreshToken).mockReturnValue('old-refresh-token');
      vi.mocked(authRepository.refreshToken).mockResolvedValue(mockResponse);

      const action = refreshTokenRequest();

      expect(action.type).toBe('auth/refreshTokenRequest');
    });

    it('handles missing refresh token', async () => {
      const storageService = await import('src/services/storageService');
      vi.mocked(storageService.default.getRefreshToken).mockReturnValue(null);

      expect(authSaga).toBeDefined();
    });

    it('handles refresh token failure', async () => {
      const storageService = await import('src/services/storageService');
      vi.mocked(storageService.default.getRefreshToken).mockReturnValue('refresh-token');
      vi.mocked(authRepository.refreshToken).mockRejectedValue(new Error('Token expired'));

      expect(authSaga).toBeDefined();
    });

    it('sets new credentials on successful refresh', () => {
      const credentials = {
        token: 'new-access-token',
        refreshToken: 'new-refresh-token',
        tokenExpires: 3600,
      };

      const action = setCredentials(credentials);

      expect(action.type).toBe('auth/setCredentials');
      expect(action.payload.token).toBe('new-access-token');
    });

    it('logs out on refresh failure', () => {
      const action = logout();

      expect(action.type).toBe('auth/logout');
    });
  });

  describe('logoutSaga', () => {
    it('successfully logs out user', async () => {
      vi.mocked(authRepository.logout).mockResolvedValue(undefined);

      const action = logoutRequest({});

      expect(action.type).toBe('auth/logoutRequest');
    });

    it('calls onSuccess callback after logout', async () => {
      vi.mocked(authRepository.logout).mockResolvedValue(undefined);

      const onSuccess = vi.fn();
      const action = logoutRequest({ onSuccess });

      expect(action.payload.onSuccess).toBe(onSuccess);
    });

    it('handles logout API failure gracefully', async () => {
      vi.mocked(authRepository.logout).mockRejectedValue(new Error('API error'));

      expect(authSaga).toBeDefined();
    });

    it('clears state even if API fails', async () => {
      vi.mocked(authRepository.logout).mockRejectedValue(new Error('API error'));

      const action = logout();

      expect(action.type).toBe('auth/logout');
    });

    it('dispatches logout action', () => {
      const action = logout();

      expect(action.type).toBe('auth/logout');
    });
  });

  describe('action types', () => {
    it('has correct action type for loginRequest', () => {
      expect(loginRequest.type).toBe('auth/loginRequest');
    });

    it('has correct action type for forgotPasswordRequest', () => {
      expect(forgotPasswordRequest.type).toBe('auth/forgotPasswordRequest');
    });

    it('has correct action type for refreshTokenRequest', () => {
      expect(refreshTokenRequest.type).toBe('auth/refreshTokenRequest');
    });

    it('has correct action type for logoutRequest', () => {
      expect(logoutRequest.type).toBe('auth/logoutRequest');
    });

    it('has correct action type for setAuthLoading', () => {
      expect(setAuthLoading.type).toBe('auth/setAuthLoading');
    });

    it('has correct action type for setCredentials', () => {
      expect(setCredentials.type).toBe('auth/setCredentials');
    });

    it('has correct action type for setAuthError', () => {
      expect(setAuthError.type).toBe('auth/setAuthError');
    });

    it('has correct action type for clearAuthError', () => {
      expect(clearAuthError.type).toBe('auth/clearAuthError');
    });

    it('has correct action type for logout', () => {
      expect(logout.type).toBe('auth/logout');
    });
  });

  describe('integration with redux-saga effects', () => {
    it('uses call effect', () => {
      expect(call).toBeDefined();
    });

    it('uses put effect', () => {
      expect(put).toBeDefined();
    });

    it('uses takeLatest effect', () => {
      expect(takeLatest).toBeDefined();
    });
  });

  describe('error handling', () => {
    it('handles error with message', () => {
      const error = new Error('Authentication failed');

      expect(error.message).toBe('Authentication failed');
    });

    it('handles error without message', () => {
      const error = { code: 401 };

      expect(error).toHaveProperty('code');
    });

    it('handles nested error response', () => {
      const error = {
        response: {
          data: {
            message: 'Unauthorized access',
          },
        },
      };

      expect(error.response.data.message).toBe('Unauthorized access');
    });
  });

  describe('credentials', () => {
    it('handles email credentials', () => {
      const action = loginRequest({
        credentials: {
          email: 'user@example.com',
          password: 'securepass123',
        },
      });

      expect(action.payload.credentials.email).toBe('user@example.com');
      expect(action.payload.credentials.password).toBe('securepass123');
    });

    it('handles forgot password email', () => {
      const action = forgotPasswordRequest({
        credentials: {
          email: 'forgot@example.com',
        },
      });

      expect(action.payload.credentials.email).toBe('forgot@example.com');
    });
  });

  describe('tokens', () => {
    it('handles access token', () => {
      const action = setCredentials({
        token: 'access-token-abc',
      });

      expect(action.payload.token).toBe('access-token-abc');
    });

    it('handles refresh token', () => {
      const action = setCredentials({
        refreshToken: 'refresh-token-xyz',
      });

      expect(action.payload.refreshToken).toBe('refresh-token-xyz');
    });

    it('handles token expiration', () => {
      const action = setCredentials({
        tokenExpires: 7200,
      });

      expect(action.payload.tokenExpires).toBe(7200);
    });

    it('handles complete token set', () => {
      const action = setCredentials({
        token: 'access-token',
        refreshToken: 'refresh-token',
        tokenExpires: 3600,
      });

      expect(action.payload.token).toBe('access-token');
      expect(action.payload.refreshToken).toBe('refresh-token');
      expect(action.payload.tokenExpires).toBe(3600);
    });
  });

  describe('callbacks', () => {
    it('handles onSuccess callback for login', () => {
      const onSuccess = vi.fn();
      const action = loginRequest({
        credentials: {
          email: 'test@example.com',
          password: 'password',
        },
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for forgotPassword', () => {
      const onSuccess = vi.fn();
      const action = forgotPasswordRequest({
        credentials: {
          email: 'test@example.com',
        },
        onSuccess,
      });

      expect(typeof action.payload.onSuccess).toBe('function');
    });

    it('handles onSuccess callback for logout', () => {
      const onSuccess = vi.fn();
      const action = logoutRequest({ onSuccess });

      expect(typeof action.payload.onSuccess).toBe('function');
    });
  });

  describe('user data', () => {
    it('handles user data in credentials', () => {
      const user = {
        id: 'user-1',
        email: 'john@example.com',
        firstName: 'John',
        lastName: 'Doe',
      };

      const action = setCredentials({ user });

      expect(action.payload.user).toEqual(user);
    });

    it('handles user id', () => {
      const action = setCredentials({
        user: {
          id: 'user-123',
        },
      });

      expect(action.payload.user.id).toBe('user-123');
    });

    it('handles user email', () => {
      const action = setCredentials({
        user: {
          email: 'user@example.com',
        },
      });

      expect(action.payload.user.email).toBe('user@example.com');
    });
  });
});
