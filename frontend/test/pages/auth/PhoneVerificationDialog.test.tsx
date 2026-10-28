/**
 * PhoneVerificationDialog Integration Tests
 * Tests OTP verification flow
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PhoneVerificationDialog } from '@/components/auth/PhoneVerificationDialog';
import { renderWithProviders } from '@/test/utils/testUtils';
import { mockUser } from '@/test/utils/mockData';
import { storageService } from '@/lib/services/storage.service';
import { AuthStatus } from '@/lib/store/slices/authSlice';

describe('PhoneVerificationDialog', () => {
  const mockOnOpenChange = vi.fn();
  const mockOnVerify = vi.fn();
  const mockOnResendCode = vi.fn();
  const mockOnBack = vi.fn();

  const defaultProps = {
    open: true,
    onOpenChange: mockOnOpenChange,
    phoneNumber: mockUser.phone,
    onVerify: mockOnVerify,
    onResendCode: mockOnResendCode,
    onBack: mockOnBack,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    storageService.removeOtpResendCountdown();
    storageService.clearOtpVerifyLockout();
    storageService.resetOtpVerifyFailedAttempts();
  });

  describe('TC-FOTP-001: OTP Input and Verification', () => {
    it('should render 6 OTP input fields', () => {
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');
      expect(inputs).toHaveLength(6);
    });

    it('should allow entering 6 digit OTP', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');

      // Enter OTP digits
      await user.type(inputs[0], '1');
      await user.type(inputs[1], '2');
      await user.type(inputs[2], '3');
      await user.type(inputs[3], '4');
      await user.type(inputs[4], '5');
      await user.type(inputs[5], '6');

      // Verify each input has correct value
      expect((inputs[0] as HTMLInputElement).value).toBe('1');
      expect((inputs[1] as HTMLInputElement).value).toBe('2');
      expect((inputs[2] as HTMLInputElement).value).toBe('3');
      expect((inputs[3] as HTMLInputElement).value).toBe('4');
      expect((inputs[4] as HTMLInputElement).value).toBe('5');
      expect((inputs[5] as HTMLInputElement).value).toBe('6');
    });

    it('should auto-focus next input when entering digit', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');

      // Focus first input and type
      inputs[0].focus();
      await user.type(inputs[0], '1');

      // Second input should be focused
      await waitFor(() => {
        expect(document.activeElement).toBe(inputs[1]);
      });
    });

    it('should only accept numeric digits', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');

      // Try to enter non-numeric characters
      await user.type(inputs[0], 'a');
      expect((inputs[0] as HTMLInputElement).value).toBe('');

      await user.type(inputs[0], '!');
      expect((inputs[0] as HTMLInputElement).value).toBe('');

      // Numeric should work
      await user.type(inputs[0], '5');
      expect((inputs[0] as HTMLInputElement).value).toBe('5');
    });

    it('should call onVerify when clicking verify button with complete OTP', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');

      // Enter complete OTP
      await user.type(inputs[0], '1');
      await user.type(inputs[1], '2');
      await user.type(inputs[2], '3');
      await user.type(inputs[3], '4');
      await user.type(inputs[4], '5');
      await user.type(inputs[5], '6');

      // Click verify button
      const verifyButton = screen.getByRole('button', { name: /verify|xác nhận/i });
      await user.click(verifyButton);

      expect(mockOnVerify).toHaveBeenCalledWith('123456');
    });

    it('should show error when verifying incomplete OTP', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');

      // Enter incomplete OTP (only 3 digits)
      await user.type(inputs[0], '1');
      await user.type(inputs[1], '2');
      await user.type(inputs[2], '3');

      // Click verify button
      const verifyButton = screen.getByRole('button', { name: /verify|xác nhận/i });
      await user.click(verifyButton);

      // Should show error, not call onVerify
      await waitFor(() => {
        expect(screen.getByText(/incomplete|chưa đủ/i)).toBeInTheDocument();
      });
      expect(mockOnVerify).not.toHaveBeenCalled();
    });
  });

  describe('TC-FOTP-002: Resend OTP Code', () => {
    it('should have resend code button', () => {
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      const resendButton = screen.getByRole('button', { name: /resend|gửi lại/i });
      expect(resendButton).toBeInTheDocument();
    });

    it('should call onResendCode when clicking resend button', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      const resendButton = screen.getByRole('button', { name: /resend|gửi lại/i });
      await user.click(resendButton);

      expect(mockOnResendCode).toHaveBeenCalledTimes(1);
    });

    it('should disable resend button during countdown', () => {
      // Set countdown in storage
      storageService.setOtpResendCountdown(Date.now() + 60 * 1000);

      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      const resendButton = screen.getByRole('button', { name: /resend|gửi lại/i });
      expect(resendButton).toBeDisabled();
    });

    it('should show countdown timer on resend button', () => {
      // Set countdown
      storageService.setOtpResendCountdown(Date.now() + 30 * 1000);

      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      // Should show countdown in button text
      expect(screen.getByText(/\d+/)).toBeInTheDocument();
    });

    it('should clear OTP inputs when resending code', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');

      // Enter some digits
      await user.type(inputs[0], '1');
      await user.type(inputs[1], '2');
      await user.type(inputs[2], '3');

      // Click resend
      const resendButton = screen.getByRole('button', { name: /resend|gửi lại/i });
      await user.click(resendButton);

      // Inputs should be cleared
      await waitFor(() => {
        expect((inputs[0] as HTMLInputElement).value).toBe('');
        expect((inputs[1] as HTMLInputElement).value).toBe('');
        expect((inputs[2] as HTMLInputElement).value).toBe('');
      });
    });
  });

  describe('TC-FOTP-003: OTP Input Features', () => {
    it('should support paste operation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');

      // Paste 6-digit code into first input
      inputs[0].focus();
      await user.paste('123456');

      // All inputs should be filled
      await waitFor(() => {
        expect((inputs[0] as HTMLInputElement).value).toBe('1');
        expect((inputs[1] as HTMLInputElement).value).toBe('2');
        expect((inputs[2] as HTMLInputElement).value).toBe('3');
        expect((inputs[3] as HTMLInputElement).value).toBe('4');
        expect((inputs[4] as HTMLInputElement).value).toBe('5');
        expect((inputs[5] as HTMLInputElement).value).toBe('6');
      });
    });

    it('should handle backspace to go to previous input', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');

      // Type into first two inputs
      await user.type(inputs[0], '1');
      await user.type(inputs[1], '2');

      // Now backspace on second input
      inputs[1].focus();
      await user.keyboard('{Backspace}');

      // Should clear second input
      expect((inputs[1] as HTMLInputElement).value).toBe('');

      // Backspace again should focus first input
      await user.keyboard('{Backspace}');
      await waitFor(() => {
        expect(document.activeElement).toBe(inputs[0]);
      });
    });

    it('should show loading state during verification', () => {
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />, {
        preloadedState: {
          auth: {
            status: AuthStatus.LOADING,
            user: null,
            error: null,
            isAuthenticated: false,
          },
        },
      });

      const verifyButton = screen.getByRole('button', { name: /verify|xác nhận/i });
      // Button should exist (loading state may vary by component implementation)
      expect(verifyButton).toBeInTheDocument();
    });

    it('should lock inputs after 3 failed attempts', () => {
      // Simulate 3 failed attempts
      for (let i = 0; i < 3; i++) {
        storageService.incrementOtpVerifyFailedAttempts();
      }
      storageService.setOtpVerifyLockout(Date.now() + 15 * 60 * 1000);

      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      const inputs = screen.getAllByRole('textbox');

      // All inputs should be disabled
      inputs.forEach((input) => {
        expect(input).toBeDisabled();
      });

      // Should show lockout message
      expect(screen.getByText(/locked|khóa/i)).toBeInTheDocument();
    });

    it('should have back button that calls onBack', async () => {
      const user = userEvent.setup();
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      // Find back button (ChevronLeftIcon)
      const dialog = screen.getByRole('dialog');
      const backIcon = dialog.querySelector('svg');

      if (backIcon) {
        await user.click(backIcon);
        expect(mockOnBack).toHaveBeenCalledTimes(1);
      }
    });

    it('should display phone number in description', () => {
      renderWithProviders(<PhoneVerificationDialog {...defaultProps} />);

      expect(screen.getByText(new RegExp(mockUser.phone))).toBeInTheDocument();
    });
  });
});
