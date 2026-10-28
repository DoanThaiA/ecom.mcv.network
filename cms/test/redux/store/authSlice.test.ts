import { describe, it, expect, vi, beforeEach } from 'vitest';

import authReducer, {
  AuthStatus,
  setAuthLoading,
  setCredentials,
  setAuthError,
  clearAuthError,
  logout,
  changeAuthState,
  loginRequest,
  forgotPasswordRequest,
  refreshTokenRequest,
  logoutRequest,
  selectIsAuthenticated,
  selectAuthStatus,
  selectCurrentUser,
  selectAuthError,
  selectIsLoading,
  type AuthState,
} from 'src/redux/store/authSlice';
import type { CmsUser } from 'src/types/gen/cms/cms/cms-users/cms-user';

// Mock localStorage service
vi.mock('src/services/localStorage', () => ({
  appLocalStorage: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
  localStorageKeys: {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
    TOKEN_EXPIRES: 'tokenExpires',
    USER: 'user',
  },
}));

describe('authSlice', () => {
  const initialState: AuthState = {
    user: null,
    token: null,
    tokenExpires: null,
    status: AuthStatus.IDLE,
    error: null,
  };

  const mockUser: CmsUser = {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('reducers', () => {
    describe('setAuthLoading', () => {
      it('sets status to LOADING and clears error', () => {
        const stateWithError: AuthState = {
          ...initialState,
          error: 'Previous error',
        };

        const state = authReducer(stateWithError, setAuthLoading());

        expect(state.status).toBe(AuthStatus.LOADING);
        expect(state.error).toBe(null);
      });

      it('does not affect user or token', () => {
        const authenticatedState: AuthState = {
          user: mockUser,
          token: 'access-token',
          tokenExpires: Date.now() + 3600000,
          status: AuthStatus.AUTHENTICATED,
          error: null,
        };

        const state = authReducer(authenticatedState, setAuthLoading());

        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe('access-token');
      });
    });

    describe('setCredentials', () => {
      it('sets credentials and user', () => {
        const tokenExpires = Date.now() + 3600000;
        const payload = {
          user: mockUser,
          token: 'access-token',
          refreshToken: 'refresh-token',
          tokenExpires,
        };

        const state = authReducer(initialState, setCredentials(payload));

        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe('access-token');
        expect(state.tokenExpires).toBe(tokenExpires);
        expect(state.status).toBe(AuthStatus.AUTHENTICATED);
        expect(state.error).toBe(null);
      });

      it('sets credentials without user', () => {
        const tokenExpires = Date.now() + 3600000;
        const payload = {
          token: 'access-token',
          refreshToken: 'refresh-token',
          tokenExpires,
        };

        const state = authReducer(initialState, setCredentials(payload));

        expect(state.user).toBe(null);
        expect(state.token).toBe('access-token');
        expect(state.status).toBe(AuthStatus.AUTHENTICATED);
      });

      it('updates existing credentials', () => {
        const oldState: AuthState = {
          user: mockUser,
          token: 'old-token',
          tokenExpires: Date.now(),
          status: AuthStatus.AUTHENTICATED,
          error: null,
        };

        const newUser: CmsUser = {
          ...mockUser,
          id: 'user-2',
          email: 'new@example.com',
        };

        const newTokenExpires = Date.now() + 7200000;
        const payload = {
          user: newUser,
          token: 'new-token',
          refreshToken: 'new-refresh-token',
          tokenExpires: newTokenExpires,
        };

        const state = authReducer(oldState, setCredentials(payload));

        expect(state.user).toEqual(newUser);
        expect(state.token).toBe('new-token');
        expect(state.tokenExpires).toBe(newTokenExpires);
      });

      it('preserves existing user if not provided', () => {
        const authenticatedState: AuthState = {
          user: mockUser,
          token: 'old-token',
          tokenExpires: Date.now(),
          status: AuthStatus.AUTHENTICATED,
          error: null,
        };

        const payload = {
          token: 'new-token',
          refreshToken: 'new-refresh-token',
          tokenExpires: Date.now() + 3600000,
        };

        const state = authReducer(authenticatedState, setCredentials(payload));

        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe('new-token');
      });
    });

    describe('setAuthError', () => {
      it('sets error with message and ERROR status', () => {
        const loadingState: AuthState = {
          ...initialState,
          status: AuthStatus.LOADING,
        };

        const state = authReducer(loadingState, setAuthError('Invalid credentials'));

        expect(state.status).toBe(AuthStatus.ERROR);
        expect(state.error).toBe('Invalid credentials');
      });

      it('sets default error message when undefined', () => {
        const state = authReducer(initialState, setAuthError(undefined));

        expect(state.status).toBe(AuthStatus.ERROR);
        expect(state.error).toBe('An error occurred');
      });

      it('does not affect user or token', () => {
        const authenticatedState: AuthState = {
          user: mockUser,
          token: 'access-token',
          tokenExpires: Date.now() + 3600000,
          status: AuthStatus.AUTHENTICATED,
          error: null,
        };

        const state = authReducer(authenticatedState, setAuthError('Some error'));

        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe('access-token');
      });
    });

    describe('clearAuthError', () => {
      it('clears error and sets status to IDLE', () => {
        const errorState: AuthState = {
          ...initialState,
          status: AuthStatus.ERROR,
          error: 'Error message',
        };

        const state = authReducer(errorState, clearAuthError());

        expect(state.status).toBe(AuthStatus.IDLE);
        expect(state.error).toBe(null);
      });

      it('does not affect user or token', () => {
        const authenticatedWithError: AuthState = {
          user: mockUser,
          token: 'access-token',
          tokenExpires: Date.now() + 3600000,
          status: AuthStatus.ERROR,
          error: 'Error message',
        };

        const state = authReducer(authenticatedWithError, clearAuthError());

        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe('access-token');
      });
    });

    describe('logout', () => {
      it('clears all auth data and sets status to IDLE', () => {
        const authenticatedState: AuthState = {
          user: mockUser,
          token: 'access-token',
          tokenExpires: Date.now() + 3600000,
          status: AuthStatus.AUTHENTICATED,
          error: null,
        };

        const state = authReducer(authenticatedState, logout());

        expect(state.user).toBe(null);
        expect(state.token).toBe(null);
        expect(state.tokenExpires).toBe(null);
        expect(state.status).toBe(AuthStatus.IDLE);
        expect(state.error).toBe(null);
      });

      it('works on already logged out state', () => {
        const state = authReducer(initialState, logout());

        expect(state).toEqual(initialState);
      });

      it('clears errors on logout', () => {
        const stateWithError: AuthState = {
          user: mockUser,
          token: 'access-token',
          tokenExpires: Date.now() + 3600000,
          status: AuthStatus.ERROR,
          error: 'Session expired',
        };

        const state = authReducer(stateWithError, logout());

        expect(state.error).toBe(null);
        expect(state.status).toBe(AuthStatus.IDLE);
      });
    });

    describe('changeAuthState', () => {
      it('sets status to LOADING when isLoading is true', () => {
        const state = authReducer(initialState, changeAuthState({ isLoading: true }));

        expect(state.status).toBe(AuthStatus.LOADING);
      });

      it('sets status to IDLE when isLoading is false', () => {
        const loadingState: AuthState = {
          ...initialState,
          status: AuthStatus.LOADING,
        };

        const state = authReducer(loadingState, changeAuthState({ isLoading: false }));

        expect(state.status).toBe(AuthStatus.IDLE);
      });

      it('does not affect other state properties', () => {
        const authenticatedState: AuthState = {
          user: mockUser,
          token: 'access-token',
          tokenExpires: Date.now() + 3600000,
          status: AuthStatus.AUTHENTICATED,
          error: null,
        };

        const state = authReducer(authenticatedState, changeAuthState({ isLoading: true }));

        expect(state.user).toEqual(mockUser);
        expect(state.token).toBe('access-token');
        expect(state.error).toBe(null);
      });
    });
  });

  describe('saga actions', () => {
    describe('loginRequest', () => {
      it('creates correct action type', () => {
        const action = loginRequest({
          credentials: {
            email: 'test@example.com',
            password: 'password123',
          },
        });

        expect(action.type).toBe('auth/loginRequest');
      });

      it('includes credentials in payload', () => {
        const credentials = {
          email: 'test@example.com',
          password: 'password123',
        };

        const action = loginRequest({ credentials });

        expect(action.payload.credentials).toEqual(credentials);
      });

      it('includes onSuccess callback', () => {
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
    });

    describe('forgotPasswordRequest', () => {
      it('creates correct action type', () => {
        const action = forgotPasswordRequest({
          credentials: {
            email: 'test@example.com',
          },
        });

        expect(action.type).toBe('auth/forgotPasswordRequest');
      });

      it('includes credentials in payload', () => {
        const credentials = {
          email: 'test@example.com',
        };

        const action = forgotPasswordRequest({ credentials });

        expect(action.payload.credentials).toEqual(credentials);
      });

      it('includes onSuccess callback', () => {
        const onSuccess = vi.fn();
        const action = forgotPasswordRequest({
          credentials: {
            email: 'test@example.com',
          },
          onSuccess,
        });

        expect(action.payload.onSuccess).toBe(onSuccess);
      });
    });

    describe('refreshTokenRequest', () => {
      it('creates correct action type', () => {
        const action = refreshTokenRequest();

        expect(action.type).toBe('auth/refreshTokenRequest');
      });

      it('has no payload', () => {
        const action = refreshTokenRequest();

        expect(action.payload).toBeUndefined();
      });
    });

    describe('logoutRequest', () => {
      it('creates correct action type', () => {
        const action = logoutRequest();

        expect(action.type).toBe('auth/logoutRequest');
      });

      it('includes onSuccess callback', () => {
        const onSuccess = vi.fn();
        const action = logoutRequest({ onSuccess });

        expect(action.payload?.onSuccess).toBe(onSuccess);
      });

      it('handles undefined payload', () => {
        const action = logoutRequest();

        expect(action.payload).toBeUndefined();
      });
    });
  });

  describe('selectors', () => {
    describe('selectIsAuthenticated', () => {
      it('returns false for initial state', () => {
        const state = { auth: initialState };

        const isAuthenticated = selectIsAuthenticated(state);

        expect(isAuthenticated).toBe(false);
      });

      it('returns true when AUTHENTICATED', () => {
        const state = {
          auth: {
            ...initialState,
            status: AuthStatus.AUTHENTICATED,
          },
        };

        const isAuthenticated = selectIsAuthenticated(state);

        expect(isAuthenticated).toBe(true);
      });

      it('returns false when LOADING', () => {
        const state = {
          auth: {
            ...initialState,
            status: AuthStatus.LOADING,
          },
        };

        const isAuthenticated = selectIsAuthenticated(state);

        expect(isAuthenticated).toBe(false);
      });

      it('returns false when ERROR', () => {
        const state = {
          auth: {
            ...initialState,
            status: AuthStatus.ERROR,
          },
        };

        const isAuthenticated = selectIsAuthenticated(state);

        expect(isAuthenticated).toBe(false);
      });
    });

    describe('selectAuthStatus', () => {
      it('returns IDLE for initial state', () => {
        const state = { auth: initialState };

        const status = selectAuthStatus(state);

        expect(status).toBe(AuthStatus.IDLE);
      });

      it('returns current status', () => {
        const statuses = [AuthStatus.LOADING, AuthStatus.AUTHENTICATED, AuthStatus.ERROR];

        statuses.forEach((expectedStatus) => {
          const state = {
            auth: {
              ...initialState,
              status: expectedStatus,
            },
          };

          const status = selectAuthStatus(state);
          expect(status).toBe(expectedStatus);
        });
      });
    });

    describe('selectCurrentUser', () => {
      it('returns null for initial state', () => {
        const state = { auth: initialState };

        const user = selectCurrentUser(state);

        expect(user).toBe(null);
      });

      it('returns user when authenticated', () => {
        const state = {
          auth: {
            ...initialState,
            user: mockUser,
          },
        };

        const user = selectCurrentUser(state);

        expect(user).toEqual(mockUser);
      });

      it('returns null after logout', () => {
        const authenticatedState = {
          auth: {
            ...initialState,
            user: mockUser,
          },
        };

        const loggedOutState = {
          auth: authReducer(authenticatedState.auth, logout()),
        };

        const user = selectCurrentUser(loggedOutState);

        expect(user).toBe(null);
      });
    });

    describe('selectAuthError', () => {
      it('returns null for initial state', () => {
        const state = { auth: initialState };

        const error = selectAuthError(state);

        expect(error).toBe(null);
      });

      it('returns error message when present', () => {
        const state = {
          auth: {
            ...initialState,
            error: 'Invalid credentials',
          },
        };

        const error = selectAuthError(state);

        expect(error).toBe('Invalid credentials');
      });

      it('returns null after clearing error', () => {
        const errorState = {
          auth: {
            ...initialState,
            error: 'Some error',
          },
        };

        const clearedState = {
          auth: authReducer(errorState.auth, clearAuthError()),
        };

        const error = selectAuthError(clearedState);

        expect(error).toBe(null);
      });
    });

    describe('selectIsLoading', () => {
      it('returns false for initial state', () => {
        const state = { auth: initialState };

        const isLoading = selectIsLoading(state);

        expect(isLoading).toBe(false);
      });

      it('returns true when LOADING', () => {
        const state = {
          auth: {
            ...initialState,
            status: AuthStatus.LOADING,
          },
        };

        const isLoading = selectIsLoading(state);

        expect(isLoading).toBe(true);
      });

      it('returns false when AUTHENTICATED', () => {
        const state = {
          auth: {
            ...initialState,
            status: AuthStatus.AUTHENTICATED,
          },
        };

        const isLoading = selectIsLoading(state);

        expect(isLoading).toBe(false);
      });
    });
  });

  describe('integration tests', () => {
    it('handles complete login flow', () => {
      // Start: Initial state
      let state = initialState;
      expect(selectIsAuthenticated({ auth: state })).toBe(false);
      expect(selectIsLoading({ auth: state })).toBe(false);

      // Step 1: Start login
      state = authReducer(state, setAuthLoading());
      expect(selectIsLoading({ auth: state })).toBe(true);

      // Step 2: Login success
      const tokenExpires = Date.now() + 3600000;
      state = authReducer(
        state,
        setCredentials({
          user: mockUser,
          token: 'access-token',
          refreshToken: 'refresh-token',
          tokenExpires,
        })
      );
      expect(selectIsAuthenticated({ auth: state })).toBe(true);
      expect(selectCurrentUser({ auth: state })).toEqual(mockUser);
      expect(selectIsLoading({ auth: state })).toBe(false);
    });

    it('handles login error flow', () => {
      // Start login
      let state = authReducer(initialState, setAuthLoading());
      expect(selectIsLoading({ auth: state })).toBe(true);

      // Login failed
      state = authReducer(state, setAuthError('Invalid credentials'));
      expect(selectAuthStatus({ auth: state })).toBe(AuthStatus.ERROR);
      expect(selectAuthError({ auth: state })).toBe('Invalid credentials');
      expect(selectIsAuthenticated({ auth: state })).toBe(false);
    });

    it('handles token refresh flow', () => {
      // Start: Authenticated
      let state: AuthState = {
        user: mockUser,
        token: 'old-token',
        tokenExpires: Date.now(),
        status: AuthStatus.AUTHENTICATED,
        error: null,
      };

      // Refresh token
      const newTokenExpires = Date.now() + 3600000;
      state = authReducer(
        state,
        setCredentials({
          token: 'new-token',
          refreshToken: 'new-refresh-token',
          tokenExpires: newTokenExpires,
        })
      );

      expect(state.token).toBe('new-token');
      expect(state.tokenExpires).toBe(newTokenExpires);
      expect(selectCurrentUser({ auth: state })).toEqual(mockUser);
    });

    it('handles logout flow', () => {
      // Start: Authenticated
      let state: AuthState = {
        user: mockUser,
        token: 'access-token',
        tokenExpires: Date.now() + 3600000,
        status: AuthStatus.AUTHENTICATED,
        error: null,
      };

      expect(selectIsAuthenticated({ auth: state })).toBe(true);

      // Logout
      state = authReducer(state, logout());
      expect(selectIsAuthenticated({ auth: state })).toBe(false);
      expect(selectCurrentUser({ auth: state })).toBe(null);
      expect(state.token).toBe(null);
    });

    it('handles error recovery flow', () => {
      // Login failed
      let state = authReducer(initialState, setAuthLoading());
      state = authReducer(state, setAuthError('Network error'));
      expect(selectAuthError({ auth: state })).toBe('Network error');

      // Clear error and retry
      state = authReducer(state, clearAuthError());
      expect(selectAuthError({ auth: state })).toBe(null);
      expect(selectAuthStatus({ auth: state })).toBe(AuthStatus.IDLE);

      // Retry login
      state = authReducer(state, setAuthLoading());
      state = authReducer(
        state,
        setCredentials({
          user: mockUser,
          token: 'access-token',
          refreshToken: 'refresh-token',
          tokenExpires: Date.now() + 3600000,
        })
      );
      expect(selectIsAuthenticated({ auth: state })).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('handles undefined action', () => {
      const state = authReducer(initialState, { type: 'unknown' } as any);

      expect(state).toEqual(initialState);
    });

    it('handles multiple consecutive loading states', () => {
      let state = authReducer(initialState, setAuthLoading());
      expect(state.status).toBe(AuthStatus.LOADING);

      state = authReducer(state, setAuthLoading());
      expect(state.status).toBe(AuthStatus.LOADING);
    });

    it('handles multiple consecutive errors', () => {
      let state = authReducer(initialState, setAuthError('Error 1'));
      expect(state.error).toBe('Error 1');

      state = authReducer(state, setAuthError('Error 2'));
      expect(state.error).toBe('Error 2');
    });

    it('clears error when setting credentials', () => {
      let state = authReducer(initialState, setAuthError('Previous error'));
      expect(state.error).toBe('Previous error');

      state = authReducer(
        state,
        setCredentials({
          token: 'token',
          refreshToken: 'refresh',
          tokenExpires: Date.now() + 3600000,
        })
      );
      expect(state.error).toBe(null);
    });

    it('clears error when starting new loading', () => {
      let state = authReducer(initialState, setAuthError('Previous error'));
      expect(state.error).toBe('Previous error');

      state = authReducer(state, setAuthLoading());
      expect(state.error).toBe(null);
    });
  });
});
