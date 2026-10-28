import { describe, it, expect, beforeEach, vi } from 'vitest';
import { authRepository } from '@/lib/repositories/auth.repository';
import axiosInstance from '@/lib/axios';
import axios from 'axios';
import type { LoginResponse } from '@/types/gen/shop/shop/auth/auth';
import type { User } from '@/types/gen/shared/shared/users/user';
import type { MessageResponse } from '@/types/common';

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({
      post: vi.fn(),
    })),
  },
}));

describe('AuthRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('emailLogin', () => {
    it('logs in with email successfully', async () => {
      const mockResponse: LoginResponse = {
        token: 'token-123',
        user: { id: 'user-1' } as User,
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authRepository.emailLogin({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/email/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse);
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Invalid credentials')
      );

      await expect(
        authRepository.emailLogin({
          email: 'test@example.com',
          password: 'wrong',
        })
      ).rejects.toThrow('Invalid credentials');
    });
  });

  describe('emailRegister', () => {
    it('registers new user successfully', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: undefined });

      await authRepository.emailRegister({
        email: 'new@example.com',
        password: 'password123',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/email/register', {
        email: 'new@example.com',
        password: 'password123',
      });
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Email already exists')
      );

      await expect(
        authRepository.emailRegister({
          email: 'existing@example.com',
          password: 'password',
        })
      ).rejects.toThrow('Email already exists');
    });
  });

  describe('phonePasswordRegister', () => {
    it('registers with phone successfully', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: undefined });

      await authRepository.phonePasswordRegister({
        phone: '0123456789',
        password: 'password123',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/phone/register', {
        phone: '0123456789',
        password: 'password123',
      });
    });

    it('propagates API errors', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Phone already exists')
      );

      await expect(
        authRepository.phonePasswordRegister({
          phone: '0123456789',
          password: 'password',
        })
      ).rejects.toThrow('Phone already exists');
    });
  });

  describe('phonePasswordLogin', () => {
    it('logs in with phone successfully', async () => {
      const mockResponse: LoginResponse = {
        token: 'token-456',
        user: { id: 'user-2' } as User,
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authRepository.phonePasswordLogin({
        phone: '0123456789',
        password: 'password123',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/phone/login', {
        phone: '0123456789',
        password: 'password123',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('verifyPhoneOtp', () => {
    it('verifies OTP successfully', async () => {
      const mockResponse: LoginResponse = {
        token: 'token-789',
        user: { id: 'user-3' } as User,
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authRepository.verifyPhoneOtp({
        phone: '0123456789',
        otp: '123456',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/auth/phone/verify-otp',
        {
          phone: '0123456789',
          otp: '123456',
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('logout', () => {
    it('logs out successfully', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: undefined });

      await authRepository.logout();

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/logout');
    });
  });

  describe('getOAuthRedirectUrl', () => {
    it('gets OAuth redirect URL for google', async () => {
      const mockResponse = {
        redirectUrl: 'https://accounts.google.com/oauth',
      };

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authRepository.getOAuthRedirectUrl('google');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/auth/google/redirect',
        {
          headers: {
            'ngrok-skip-browser-warning': 'true',
          },
          maxRedirects: 0,
          validateStatus: null,
        }
      );
      expect(result).toEqual(mockResponse);
    });

    it('gets OAuth redirect URL for facebook', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { redirectUrl: 'https://facebook.com/oauth' },
      });

      await authRepository.getOAuthRedirectUrl('facebook');

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/auth/facebook/redirect',
        expect.any(Object)
      );
    });
  });

  describe('loginBySocial', () => {
    it('logs in with social provider', async () => {
      const mockResponse: LoginResponse = {
        token: 'social-token',
        user: { id: 'user-4' } as User,
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authRepository.loginBySocial('google', {
        code: 'auth-code-123',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/google/login', {
        code: 'auth-code-123',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('refreshToken', () => {
    it('refreshes access token successfully', async () => {
      const mockResponse: LoginResponse = {
        token: 'new-token',
        user: { id: 'user-5' } as User,
      };

      const mockPost = vi.fn().mockResolvedValueOnce({ data: mockResponse });
      vi.mocked(axios.create).mockReturnValueOnce({
        post: mockPost,
      } as any);

      const result = await authRepository.refreshToken('old-refresh-token');

      expect(axios.create).toHaveBeenCalled();
      expect(mockPost).toHaveBeenCalledWith(
        '/auth/refresh-token',
        { refreshToken: 'old-refresh-token' },
        {
          headers: {
            Authorization: 'Bearer old-refresh-token',
          },
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('getCurrentUser', () => {
    it('gets current user profile', async () => {
      const mockUser: User = {
        id: 'user-6',
        email: 'user@example.com',
      } as User;

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockUser,
      });

      const result = await authRepository.getCurrentUser();

      expect(axiosInstance.get).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('updates user profile', async () => {
      const mockUser: User = {
        id: 'user-7',
        name: 'Updated Name',
      } as User;

      vi.mocked(axiosInstance.patch).mockResolvedValueOnce({
        data: mockUser,
      });

      const result = await authRepository.updateProfile({
        name: 'Updated Name',
      });

      expect(axiosInstance.patch).toHaveBeenCalledWith('/auth/me', {
        name: 'Updated Name',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('resetPassword', () => {
    it('resets password for phone user', async () => {
      vi.mocked(axiosInstance.post).mockResolvedValueOnce({ data: undefined });

      await authRepository.resetPassword({
        phone: '0123456789',
        newPassword: 'newpass123',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/auth/phone/reset-password',
        {
          phone: '0123456789',
          newPassword: 'newpass123',
        }
      );
    });
  });

  describe('confirmEmail', () => {
    it('confirms email with hash', async () => {
      const mockResponse: MessageResponse = {
        message: 'Email confirmed',
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authRepository.confirmEmail({ hash: 'hash-123' });

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/email/confirm', {
        hash: 'hash-123',
      });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('confirmNewEmail', () => {
    it('confirms new email with hash', async () => {
      const mockResponse: MessageResponse = {
        message: 'New email confirmed',
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authRepository.confirmNewEmail({ hash: 'hash-456' });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/auth/email/confirm/new',
        {
          hash: 'hash-456',
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('forgotPassword', () => {
    it('sends forgot password email', async () => {
      const mockResponse: MessageResponse = {
        message: 'Email sent',
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authRepository.forgotPassword({
        email: 'forgot@example.com',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/auth/email/forgot/password',
        {
          email: 'forgot@example.com',
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('resetPasswordWithHash', () => {
    it('resets password with hash token', async () => {
      const mockResponse: MessageResponse = {
        message: 'Password reset',
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authRepository.resetPasswordWithHash({
        hash: 'hash-789',
        password: 'newpass123',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/auth/email/reset/password',
        {
          hash: 'hash-789',
          password: 'newpass123',
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('phoneForgotPasswordRequestOtp', () => {
    it('requests OTP for password reset', async () => {
      const mockResponse: MessageResponse = {
        message: 'OTP sent',
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authRepository.phoneForgotPasswordRequestOtp({
        phone: '0123456789',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/auth/phone/forgot/password/request-otp',
        {
          phone: '0123456789',
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('phoneForgotPasswordVerifyOtp', () => {
    it('verifies OTP for password reset', async () => {
      const mockResponse = {
        resetToken: 'reset-token-123',
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authRepository.phoneForgotPasswordVerifyOtp({
        phone: '0123456789',
        otp: '123456',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/auth/phone/forgot/password/verify-otp',
        {
          phone: '0123456789',
          otp: '123456',
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('phoneForgotPasswordComplete', () => {
    it('completes password reset', async () => {
      const mockResponse: MessageResponse = {
        message: 'Password updated',
      };

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authRepository.phoneForgotPasswordComplete({
        resetToken: 'reset-token-123',
        newPassword: 'newpass123',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith(
        '/auth/phone/forgot/password/complete',
        {
          resetToken: 'reset-token-123',
          newPassword: 'newpass123',
        }
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('deleteMyAccount', () => {
    it('deletes user account', async () => {
      const mockResponse: MessageResponse = {
        message: 'Account deleted',
      };

      vi.mocked(axiosInstance.delete).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await authRepository.deleteMyAccount();

      expect(axiosInstance.delete).toHaveBeenCalledWith('/auth/me');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('linkBySocial', () => {
    it('links social account to user', async () => {
      const mockUser: User = {
        id: 'user-8',
        googleId: 'google-123',
      } as User;

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockUser,
      });

      const result = await authRepository.linkBySocial('google', {
        code: 'auth-code',
      });

      expect(axiosInstance.post).toHaveBeenCalledWith('/auth/google/link', {
        code: 'auth-code',
      });
      expect(result).toEqual(mockUser);
    });
  });

  describe('unlinkSocial', () => {
    it('unlinks social account from user', async () => {
      const mockUser: User = {
        id: 'user-9',
        googleId: null,
      } as User;

      vi.mocked(axiosInstance.delete).mockResolvedValueOnce({
        data: mockUser,
      });

      const result = await authRepository.unlinkSocial('google');

      expect(axiosInstance.delete).toHaveBeenCalledWith('/auth/me/social', {
        data: { provider: 'google' },
      });
      expect(result).toEqual(mockUser);
    });
  });
});
