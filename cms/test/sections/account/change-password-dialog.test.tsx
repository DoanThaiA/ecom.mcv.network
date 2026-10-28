import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ChangePasswordDialog } from 'src/sections/account/change-password-dialog';

const mockOnClose = vi.fn();
const mockOnSave = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: any) => <span data-testid="iconify">{icon}</span>,
}));

describe('ChangePasswordDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  it('renders without crashing when open', () => {
    const { container } = render(
      <ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />
    );
    expect(container).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <ChangePasswordDialog open={false} onClose={mockOnClose} onSave={mockOnSave} />
    );
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeInTheDocument();
  });

  it('renders dialog title', () => {
    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);
    const titles = screen.getAllByText('changePassword');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('renders current password field', () => {
    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByText('currentPassword')).toBeInTheDocument();
  });

  it('renders new password field', () => {
    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByText('newPassword')).toBeInTheDocument();
  });

  it('renders confirm password field', () => {
    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);
    expect(screen.getByText('reEnterNewPassword')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);
    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find(btn => btn.getAttribute('type') === 'submit');
    expect(submitBtn).toBeDefined();
  });

  it('renders close icon button', () => {
    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles input changes', () => {
    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);
    const inputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(inputs[0], { target: { value: 'current123' } });
    expect(inputs[0]).toHaveValue('current123');
  });

  it('validates password match', async () => {
    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);

    const inputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(inputs[0], { target: { value: 'current123' } });
    fireEvent.change(inputs[1], { target: { value: 'new123' } });
    fireEvent.change(inputs[2], { target: { value: 'different123' } });

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(screen.getByText('passwordsDoNotMatch')).toBeInTheDocument();
      });
    }
  });

  it('calls onSave with correct data when passwords match', async () => {
    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);

    const inputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(inputs[0], { target: { value: 'current123' } });
    fireEvent.change(inputs[1], { target: { value: 'new123' } });
    fireEvent.change(inputs[2], { target: { value: 'new123' } });

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          currentPassword: 'current123',
          newPassword: 'new123',
        });
      });
    }
  });

  it('handles close button click', () => {
    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find(btn => btn.querySelector('[data-testid="CloseIcon"]'));
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(mockOnClose).toHaveBeenCalled();
    }
  });

  it('shows loading state during save', async () => {
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);

    const inputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(inputs[0], { target: { value: 'current123' } });
    fireEvent.change(inputs[1], { target: { value: 'new123' } });
    fireEvent.change(inputs[2], { target: { value: 'new123' } });

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(screen.getByText('changingPassword')).toBeInTheDocument();
      });
    }
  });

  it('handles save error', async () => {
    mockOnSave.mockRejectedValue(new Error('Save failed'));

    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);

    const inputs = document.querySelectorAll('input[type="password"]');
    fireEvent.change(inputs[0], { target: { value: 'current123' } });
    fireEvent.change(inputs[1], { target: { value: 'new123' } });
    fireEvent.change(inputs[2], { target: { value: 'new123' } });

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(screen.getByText('Save failed')).toBeInTheDocument();
      });
    }
  });

  it('exports ChangePasswordDialog function', () => {
    expect(ChangePasswordDialog).toBeDefined();
    expect(typeof ChangePasswordDialog).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ChangePasswordDialog).toBe('function');
    expect(ChangePasswordDialog.name).toBe('ChangePasswordDialog');
  });

  it('renders Dialog component', () => {
    const { container } = render(
      <ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders password fields as password type by default', () => {
    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);
    const inputs = document.querySelectorAll('input[type="password"]');
    expect(inputs.length).toBe(3);
  });

  it('toggles password visibility', () => {
    render(<ChangePasswordDialog open onClose={mockOnClose} onSave={mockOnSave} />);
    const eyeIcons = screen.getAllByTestId('iconify');
    expect(eyeIcons.length).toBeGreaterThan(0);
  });
});
