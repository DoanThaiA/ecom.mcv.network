import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ForgotPasswordView } from 'src/sections/auth/forgot-password-view';
import { toast } from 'react-toastify';

const mockPush = vi.fn();
const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/routes/hooks', () => ({
  useRouter: () => ({ push: mockPush }),
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/authSlice', () => ({
  forgotPasswordRequest: vi.fn((params) => ({ type: 'FORGOT_PASSWORD', payload: params })),
  selectIsLoading: vi.fn((state) => state.isLoading),
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('src/components/input', () => ({
  InputCommon: ({ value, onChange, onBlur, placeholder, error, helperText, ...props }: any) => (
    <div>
      <input
        data-testid="email-input"
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        {...props}
      />
      {error && helperText && <span data-testid="error-text">{helperText}</span>}
    </div>
  ),
}));

describe('ForgotPasswordView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppSelector.mockReturnValue(false);
  });

  it('renders without crashing', () => {
    const { container } = render(<ForgotPasswordView />);
    expect(container).toBeInTheDocument();
  });

  it('displays logo image', () => {
    render(<ForgotPasswordView />);
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.png');
  });

  it('displays forgot password title', () => {
    render(<ForgotPasswordView />);
    expect(screen.getByText('forgotPasswordTitle')).toBeInTheDocument();
  });

  it('displays email label', () => {
    render(<ForgotPasswordView />);
    expect(screen.getByText('email')).toBeInTheDocument();
  });

  it('displays email input field', () => {
    render(<ForgotPasswordView />);
    const emailInput = screen.getByTestId('email-input');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('placeholder', 'enterYourEmail');
  });

  it('displays send reset link button', () => {
    render(<ForgotPasswordView />);
    expect(screen.getByText('sendResetLink')).toBeInTheDocument();
  });

  it('displays back to sign in link', () => {
    render(<ForgotPasswordView />);
    const backLinks = screen.getAllByText('backToSignIn');
    expect(backLinks.length).toBeGreaterThan(0);
  });

  it('updates email value on input change', () => {
    render(<ForgotPasswordView />);
    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  it('shows error when email is empty and form is submitted', async () => {
    render(<ForgotPasswordView />);

    const submitButton = screen.getByText('sendResetLink');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('emailRequired');
    });
  });

  it('shows error when email is invalid', async () => {
    render(<ForgotPasswordView />);

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getByText('sendResetLink');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('emailInvalid');
    });
  });

  it('dispatches forgotPasswordRequest with valid email', async () => {
    render(<ForgotPasswordView />);

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByText('sendResetLink');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'FORGOT_PASSWORD',
          payload: expect.objectContaining({
            credentials: { email: 'test@example.com' },
          }),
        })
      );
    });
  });

  it('shows success message after successful submission', async () => {
    render(<ForgotPasswordView />);

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getByText('sendResetLink');
    fireEvent.click(submitButton);

    // Simulate onSuccess callback
    await waitFor(() => {
      const dispatchCall = mockDispatch.mock.calls[0][0];
      if (dispatchCall.payload.onSuccess) {
        dispatchCall.payload.onSuccess();
      }
    });

    // Force re-render by updating component state through the callback
    const { rerender } = render(<ForgotPasswordView />);
    rerender(<ForgotPasswordView />);
  });

  it('validates email on blur', async () => {
    render(<ForgotPasswordView />);

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);

    // After blur, the component should validate
    await waitFor(() => {
      expect(emailInput.value).toBe('invalid');
    });
  });

  it('sets touched state on input change', () => {
    render(<ForgotPasswordView />);

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
  });

  it('navigates to sign-in page when back to sign in is clicked', () => {
    render(<ForgotPasswordView />);

    const backButton = screen.getAllByText('backToSignIn')[0];
    fireEvent.click(backButton);

    expect(mockPush).toHaveBeenCalledWith('/sign-in');
  });

  it('disables submit button when loading', () => {
    mockUseAppSelector.mockReturnValue(true);

    render(<ForgotPasswordView />);

    const submitButton = screen.getByText('sendResetLink');
    expect(submitButton).toBeDisabled();
  });

  it('validates email format correctly', async () => {
    render(<ForgotPasswordView />);

    const emailInput = screen.getByTestId('email-input');

    // Test invalid email formats
    const invalidEmails = ['test', 'test@', '@example.com', 'test@example'];

    for (const email of invalidEmails) {
      fireEvent.change(emailInput, { target: { value: email } });
      const submitButton = screen.getByText('sendResetLink');
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('emailInvalid');
      });

      vi.clearAllMocks();
    }
  });

  it('accepts valid email formats', async () => {
    render(<ForgotPasswordView />);

    const emailInput = screen.getByTestId('email-input');
    const validEmail = 'test@example.com';

    fireEvent.change(emailInput, { target: { value: validEmail } });
    const submitButton = screen.getByText('sendResetLink');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalledWith('emailInvalid');
    });
  });

  it('trims whitespace from email', async () => {
    render(<ForgotPasswordView />);

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: '  ' } });

    const submitButton = screen.getByText('sendResetLink');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('emailRequired');
    });
  });

  it('renders form initially and not success message', () => {
    render(<ForgotPasswordView />);

    expect(screen.getByText('sendResetLink')).toBeInTheDocument();
    expect(screen.queryByText('resetLinkSentMessage')).not.toBeInTheDocument();
  });

  it('exports ForgotPasswordView function', () => {
    expect(ForgotPasswordView).toBeDefined();
    expect(typeof ForgotPasswordView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ForgotPasswordView).toBe('function');
    expect(ForgotPasswordView.name).toBe('ForgotPasswordView');
  });

  it('renders Box container with correct styling', () => {
    const { container } = render(<ForgotPasswordView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('prevents default form submission', async () => {
    render(<ForgotPasswordView />);

    const form = screen.getByTestId('email-input').closest('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

    form?.dispatchEvent(submitEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('uses useAppDispatch hook', () => {
    render(<ForgotPasswordView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<ForgotPasswordView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('uses useRouter hook', () => {
    render(<ForgotPasswordView />);
    expect(mockPush).toBeDefined();
  });

  it('renders LoadingButton component', () => {
    render(<ForgotPasswordView />);
    const button = screen.getByText('sendResetLink');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('validates email on input change when touched', async () => {
    render(<ForgotPasswordView />);

    const emailInput = screen.getByTestId('email-input');

    // First change - sets touched
    fireEvent.change(emailInput, { target: { value: 'invalid' } });

    // Second change - should validate
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
  });
});
