/**
 * SignInDialog Simple Integration Tests
 * Basic smoke tests to verify component renders and basic interactions work
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SignInDialog } from '@/components/auth/signin/SignInDialog';
import { renderWithProviders } from '@/test/utils/testUtils';
import { storageService } from '@/lib/services/storage.service';
import { AuthStatus } from '@/lib/store/slices/authSlice';

describe('SignInDialog - Simple Tests', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnSignUpClick = vi.fn();
  const mockOnForgotPasswordClick = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    locale: 'vi' as const,
    onSignUpClick: mockOnSignUpClick,
    onForgotPasswordClick: mockOnForgotPasswordClick,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    storageService.resetLoginFailedAttempts();
    storageService.clearLoginLockout();
    storageService.clearCaptchaCountdown();
  });

  it('should render sign in dialog', () => {
    renderWithProviders(<SignInDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('should have sign in button', () => {
    renderWithProviders(<SignInDialog {...defaultProps} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('should call onSignUpClick when provided', async () => {
    const user = userEvent.setup();
    renderWithProviders(<SignInDialog {...defaultProps} />);

    // Find any text that contains sign up / đăng ký
    const signUpText = screen.getByText(/sign.*up|đăng.*ký/i);
    await user.click(signUpText);

    expect(mockOnSignUpClick).toHaveBeenCalledTimes(1);
  });

  it('should show loading state when auth status is loading', () => {
    renderWithProviders(<SignInDialog {...defaultProps} />, {
      preloadedState: {
        auth: {
          status: AuthStatus.LOADING,
          user: null,
          error: null,
          isAuthenticated: false,
        },
      },
    });

    const buttons = screen.getAllByRole('button');
    const signInButton = buttons.find(
      (btn) => btn.hasAttribute('disabled') && btn.textContent
    );
    expect(signInButton).toBeDefined();
  });
});
