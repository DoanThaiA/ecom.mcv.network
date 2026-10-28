import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authRepository } from 'src/repositories/auth.repository';
import axiosInstance from 'src/utils/axios';
import appLocalStorage, { localStorageKeys } from 'src/services/localStorage';
import axios from 'axios';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
  },
}));

vi.mock('src/services/localStorage', () => ({
  default: {
    getItem: vi.fn(),
  },
  localStorageKeys: {
    REFRESH_TOKEN: 'refreshToken',
  },
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(),
  },
}));

describe('authRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports authRepository instance', () => {
    expect(authRepository).toBeDefined();
    expect(authRepository).toHaveProperty('emailLogin');
    expect(authRepository).toHaveProperty('logout');
    expect(authRepository).toHaveProperty('getCurrentUser');
    expect(authRepository).toHaveProperty('updateProfile');
    expect(authRepository).toHaveProperty('refreshToken');
    expect(authRepository).toHaveProperty('forgotPassword');
    expect(authRepository).toHaveProperty('resetPassword');
  });

  describe('emailLogin', () => {
    it('calls POST /auth/cms/login', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockResponse = {
        data: {
          token: 'jwt-token',
          user: { id: 'u1', email: 'test@example.com' },
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await authRepository.emailLogin(credentials);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/cms/login', credentials);
    });

    it('returns LoginResponse', async () => {
      const credentials = {
        email: 'test@example.com',
        password: 'password123',
      };
      const mockLoginResponse = {
        token: 'jwt-token',
        refreshToken: 'refresh-token',
        user: { id: 'u1', email: 'test@example.com' },
      };
      const mockResponse = { data: mockLoginResponse };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await authRepository.emailLogin(credentials);

      expect(result).toEqual(mockLoginResponse);
    });
  });

  describe('logout', () => {
    it('calls POST /auth/cms/logout', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({});

      await authRepository.logout();

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/cms/logout');
    });

    it('returns void', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValue({});

      const result = await authRepository.logout();

      expect(result).toBeUndefined();
    });
  });

  describe('getCurrentUser', () => {
    it('calls GET /auth/cms/me', async () => {
      const mockResponse = {
        data: {
          id: 'u1',
          email: 'test@example.com',
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await authRepository.getCurrentUser();

      expect(axiosInstance.get).toHaveBeenCalledWith('/auth/cms/me');
    });

    it('returns user data', async () => {
      const mockUser = {
        id: 'u1',
        email: 'test@example.com',
        name: 'Test User',
      };
      const mockResponse = { data: mockUser };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await authRepository.getCurrentUser();

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('calls PATCH /auth/me', async () => {
      const updateData = {
        firstName: 'John',
        lastName: 'Doe',
      };
      const mockResponse = {
        data: {
          id: 'u1',
          firstName: 'John',
          lastName: 'Doe',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await authRepository.updateProfile(updateData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/auth/me', updateData);
    });

    it('returns updated User', async () => {
      const updateData = {
        firstName: 'Jane',
      };
      const mockUser = {
        id: 'u1',
        email: 'test@example.com',
        firstName: 'Jane',
      };
      const mockResponse = { data: mockUser };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await authRepository.updateProfile(updateData);

      expect(result).toEqual(mockUser);
    });
  });

  describe('refreshToken', () => {
    it('gets refresh token from localStorage', async () => {
      const mockRefreshToken = 'stored-refresh-token';
      vi.mocked(appLocalStorage.getItem).mockReturnValue(mockRefreshToken);

      const mockAxiosInstance = {
        post: vi.fn().mockResolvedValue({
          data: {
            token: 'new-token',
            refreshToken: 'new-refresh-token',
            tokenExpires: 3600,
          },
        }),
      };
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      await authRepository.refreshToken();

      expect(appLocalStorage.getItem).toHaveBeenCalledWith(localStorageKeys.REFRESH_TOKEN);
    });

    it('creates new axios instance with correct config', async () => {
      const mockRefreshToken = 'stored-refresh-token';
      vi.mocked(appLocalStorage.getItem).mockReturnValue(mockRefreshToken);

      const mockAxiosInstance = {
        post: vi.fn().mockResolvedValue({
          data: {
            token: 'new-token',
            refreshToken: 'new-refresh-token',
            tokenExpires: 3600,
          },
        }),
      };
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      await authRepository.refreshToken();

      expect(axios.create).toHaveBeenCalledWith({
        baseURL:
          import.meta.env.VITE_API_URL || 'https://first-shepherd-legible.ngrok-free.app/api/v1',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('calls POST /auth/cms/refresh with refreshToken', async () => {
      const mockRefreshToken = 'stored-refresh-token';
      vi.mocked(appLocalStorage.getItem).mockReturnValue(mockRefreshToken);

      const mockAxiosInstance = {
        post: vi.fn().mockResolvedValue({
          data: {
            token: 'new-token',
            refreshToken: 'new-refresh-token',
            tokenExpires: 3600,
          },
        }),
      };
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      await authRepository.refreshToken();

      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/auth/cms/refresh',
        { refreshToken: mockRefreshToken },
        {
          headers: {
            Authorization: `Bearer ${mockRefreshToken}`,
          },
        }
      );
    });

    it('returns RefreshResponse', async () => {
      const mockRefreshToken = 'stored-refresh-token';
      vi.mocked(appLocalStorage.getItem).mockReturnValue(mockRefreshToken);

      const mockRefreshResponse = {
        token: 'new-jwt-token',
        refreshToken: 'new-refresh-token',
        tokenExpires: 7200,
      };
      const mockAxiosInstance = {
        post: vi.fn().mockResolvedValue({
          data: mockRefreshResponse,
        }),
      };
      vi.mocked(axios.create).mockReturnValue(mockAxiosInstance as any);

      const result = await authRepository.refreshToken();

      expect(result).toEqual(mockRefreshResponse);
    });
  });

  describe('forgotPassword', () => {
    it('calls POST /auth/forgot/password', async () => {
      const credentials = {
        email: 'test@example.com',
      };
      const mockResponse = {
        data: {
          message: 'Reset link sent',
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await authRepository.forgotPassword(credentials);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/forgot/password', credentials);
    });

    it('returns ForgotPasswordResponse', async () => {
      const credentials = {
        email: 'test@example.com',
      };
      const mockForgotResponse = {
        message: 'Password reset email sent successfully',
      };
      const mockResponse = { data: mockForgotResponse };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await authRepository.forgotPassword(credentials);

      expect(result).toEqual(mockForgotResponse);
    });
  });

  describe('resetPassword', () => {
    it('calls POST /auth/reset/password', async () => {
      const credentials = {
        password: 'newPassword123',
        hash: 'reset-hash-token',
      };
      const mockResponse = {
        data: {
          message: 'Password reset successful',
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await authRepository.resetPassword(credentials);

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/reset/password', credentials);
    });

    it('returns message response', async () => {
      const credentials = {
        password: 'newPassword123',
        hash: 'reset-hash-token',
      };
      const mockResetResponse = {
        message: 'Your password has been reset',
      };
      const mockResponse = { data: mockResetResponse };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await authRepository.resetPassword(credentials);

      expect(result).toEqual(mockResetResponse);
    });
  });
});
