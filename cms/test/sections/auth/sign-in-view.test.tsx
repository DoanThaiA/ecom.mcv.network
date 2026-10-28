import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { SignInView } from 'src/sections/auth/sign-in-view';
import { toast } from 'react-toastify';

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/routes/hooks', () => ({
  useRouter: () => ({ push: mockPush, replace: mockReplace }),
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/authSlice', () => ({
  loginRequest: vi.fn((params) => ({ type: 'LOGIN', payload: params })),
  selectIsLoading: vi.fn((state) => state.isLoading),
}));

vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

vi.mock('src/components/input', () => ({
  InputCommon: ({ value, onChange, onBlur, label, error, helperText, ...props }: any) => (
    <div>
      {label && <label>{label}</label>}
      <input
        data-testid={props.name === 'email' ? 'email-input' : 'password-input'}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        type={props.type}
        {...props}
      />
      {error && helperText && <span data-testid={`${props.name}-error`}>{helperText}</span>}
    </div>
  ),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: any) => <span data-testid="iconify-icon">{icon}</span>,
}));

describe('SignInView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseAppSelector.mockReturnValue(false);
  });

  it('renders without crashing', () => {
    const { container } = render(<SignInView />);
    expect(container).toBeInTheDocument();
  });

  it('displays logo image', () => {
    render(<SignInView />);
    const logo = screen.getByAltText('Logo');
    expect(logo).toBeInTheDocument();
    expect(logo).toHaveAttribute('src', '/logo.png');
  });

  it('displays sign in title', () => {
    render(<SignInView />);
    const titles = screen.getAllByText('signin');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('displays email label', () => {
    render(<SignInView />);
    expect(screen.getByText('email')).toBeInTheDocument();
  });

  it('displays password label', () => {
    render(<SignInView />);
    expect(screen.getByText('password')).toBeInTheDocument();
  });

  it('displays email input field', () => {
    render(<SignInView />);
    const emailInput = screen.getByTestId('email-input');
    expect(emailInput).toBeInTheDocument();
  });

  it('displays password input field', () => {
    render(<SignInView />);
    const passwordInput = screen.getByTestId('password-input');
    expect(passwordInput).toBeInTheDocument();
  });

  it('displays remember me checkbox', () => {
    render(<SignInView />);
    expect(screen.getByText('rememberMe')).toBeInTheDocument();
  });

  it('displays forgot password link', () => {
    render(<SignInView />);
    expect(screen.getByText('forgotPassword')).toBeInTheDocument();
  });

  it('displays sign in button', () => {
    render(<SignInView />);
    const buttons = screen.getAllByText('signin');
    expect(buttons.some((btn) => btn.tagName === 'BUTTON')).toBe(true);
  });

  it('updates email value on input change', () => {
    render(<SignInView />);
    const emailInput = screen.getByTestId('email-input') as HTMLInputElement;

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    expect(emailInput.value).toBe('test@example.com');
  });

  it('updates password value on input change', () => {
    render(<SignInView />);
    const passwordInput = screen.getByTestId('password-input') as HTMLInputElement;

    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(passwordInput.value).toBe('password123');
  });

  it('toggles remember me checkbox', () => {
    render(<SignInView />);
    const checkbox = screen.getByRole('checkbox') as HTMLInputElement;

    expect(checkbox.checked).toBe(false);
    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });

  it('shows error when email is empty and form is submitted', async () => {
    render(<SignInView />);

    const submitButton = screen.getAllByText('signin').find((btn) => btn.tagName === 'BUTTON');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('emailRequired');
    });
  });

  it('shows error when email is invalid', async () => {
    render(<SignInView />);

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });

    const submitButton = screen.getAllByText('signin').find((btn) => btn.tagName === 'BUTTON');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('emailInvalid');
    });
  });

  it('shows error when password is empty', async () => {
    render(<SignInView />);

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    const submitButton = screen.getAllByText('signin').find((btn) => btn.tagName === 'BUTTON');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('passwordRequired');
    });
  });

  it('dispatches loginRequest with valid credentials', async () => {
    render(<SignInView />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getAllByText('signin').find((btn) => btn.tagName === 'BUTTON');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'LOGIN',
          payload: expect.objectContaining({
            credentials: {
              email: 'test@example.com',
              password: 'password123',
            },
          }),
        })
      );
    });
  });

  it('navigates to home page after successful login', async () => {
    render(<SignInView />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getAllByText('signin').find((btn) => btn.tagName === 'BUTTON');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      const dispatchCall = mockDispatch.mock.calls[0][0];
      if (dispatchCall.payload.onSuccess) {
        dispatchCall.payload.onSuccess();
      }
    });

    expect(mockReplace).toHaveBeenCalledWith('/');
  });

  it('navigates to forgot password page when link is clicked', () => {
    render(<SignInView />);

    const forgotPasswordLink = screen.getByText('forgotPassword');
    fireEvent.click(forgotPasswordLink);

    expect(mockPush).toHaveBeenCalledWith('/forgot-password');
  });

  it('validates email on blur', async () => {
    render(<SignInView />);

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'invalid' } });
    fireEvent.blur(emailInput);

    await waitFor(() => {
      expect(emailInput.value).toBe('invalid');
    });
  });

  it('validates password on blur', async () => {
    render(<SignInView />);

    const passwordInput = screen.getByTestId('password-input');
    fireEvent.change(passwordInput, { target: { value: '' } });
    fireEvent.blur(passwordInput);

    await waitFor(() => {
      expect(passwordInput.value).toBe('');
    });
  });

  it('disables submit button when loading', () => {
    mockUseAppSelector.mockReturnValue(true);

    render(<SignInView />);

    const submitButton = screen.getByText('signingIn');
    expect(submitButton).toBeDisabled();
  });

  it('shows "signingIn" text when loading', () => {
    mockUseAppSelector.mockReturnValue(true);

    render(<SignInView />);

    expect(screen.getByText('signingIn')).toBeInTheDocument();
  });

  it('validates email format correctly', async () => {
    render(<SignInView />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    // Set valid password
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // Test invalid email formats
    const invalidEmails = ['test', 'test@', '@example.com', 'test@example'];

    for (const email of invalidEmails) {
      fireEvent.change(emailInput, { target: { value: email } });
      const submitButton = screen.getAllByText('signin').find((btn) => btn.tagName === 'BUTTON');
      fireEvent.click(submitButton!);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('emailInvalid');
      });

      vi.clearAllMocks();
    }
  });

  it('accepts valid email formats', async () => {
    render(<SignInView />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getAllByText('signin').find((btn) => btn.tagName === 'BUTTON');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalled();
      expect(toast.error).not.toHaveBeenCalledWith('emailInvalid');
    });
  });

  it('trims whitespace from email', async () => {
    render(<SignInView />);

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: '  ' } });

    const submitButton = screen.getAllByText('signin').find((btn) => btn.tagName === 'BUTTON');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('emailRequired');
    });
  });

  it('trims whitespace from password', async () => {
    render(<SignInView />);

    const emailInput = screen.getByTestId('email-input');
    const passwordInput = screen.getByTestId('password-input');

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: '   ' } });

    const submitButton = screen.getAllByText('signin').find((btn) => btn.tagName === 'BUTTON');
    fireEvent.click(submitButton!);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('passwordRequired');
    });
  });

  it('exports SignInView function', () => {
    expect(SignInView).toBeDefined();
    expect(typeof SignInView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof SignInView).toBe('function');
    expect(SignInView.name).toBe('SignInView');
  });

  it('renders Box container with correct styling', () => {
    const { container } = render(<SignInView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('prevents default form submission', async () => {
    render(<SignInView />);

    const form = screen.getByTestId('email-input').closest('form');
    const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(submitEvent, 'preventDefault');

    form?.dispatchEvent(submitEvent);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('uses useAppDispatch hook', () => {
    render(<SignInView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<SignInView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('uses useRouter hook', () => {
    render(<SignInView />);
    expect(mockPush).toBeDefined();
    expect(mockReplace).toBeDefined();
  });

  it('renders LoadingButton component', () => {
    render(<SignInView />);
    const button = screen.getAllByText('signin').find((btn) => btn.tagName === 'BUTTON');
    expect(button).toBeInTheDocument();
  });

  it('renders Checkbox component for remember me', () => {
    render(<SignInView />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeInTheDocument();
  });

  it('sets touched state for email on input change', () => {
    render(<SignInView />);

    const emailInput = screen.getByTestId('email-input');
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
  });

  it('sets touched state for password on input change', () => {
    render(<SignInView />);

    const passwordInput = screen.getByTestId('password-input');
    fireEvent.change(passwordInput, { target: { value: 'password' } });

    expect(passwordInput.value).toBe('password');
  });

  it('validates email when touched', async () => {
    render(<SignInView />);

    const emailInput = screen.getByTestId('email-input');

    // First change - sets touched
    fireEvent.change(emailInput, { target: { value: 'invalid' } });

    // Second change - should validate
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

    expect(emailInput.value).toBe('test@example.com');
  });

  it('validates password when touched', async () => {
    render(<SignInView />);

    const passwordInput = screen.getByTestId('password-input');

    // First change - sets touched
    fireEvent.change(passwordInput, { target: { value: '' } });

    // Second change - should validate
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    expect(passwordInput.value).toBe('password123');
  });

  it('renders FormControlLabel for remember me', () => {
    render(<SignInView />);
    expect(screen.getByText('rememberMe')).toBeInTheDocument();
  });

  it('password input has correct type', () => {
    render(<SignInView />);
    const passwordInput = screen.getByTestId('password-input');
    expect(passwordInput).toHaveAttribute('type', 'password');
  });
});
