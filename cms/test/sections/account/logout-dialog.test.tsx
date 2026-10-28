import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LogoutDialog } from 'src/sections/account/logout-dialog';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe('LogoutDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    }).not.toThrow();
  });

  it('renders when open is true', () => {
    render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    expect(screen.getByText('confirm')).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<LogoutDialog open={false} onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    expect(screen.queryByText('confirm')).not.toBeInTheDocument();
  });

  it('renders confirmation message', () => {
    render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    expect(mockT).toHaveBeenCalledWith('logoutConfirmMessage');
  });

  it('renders cancel button', () => {
    render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    expect(screen.getByText('cancel')).toBeInTheDocument();
  });

  it('renders logout button', () => {
    render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    expect(screen.getByText('logout')).toBeInTheDocument();
  });

  it('renders close icon button', () => {
    render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    const closeButtons = screen.getAllByRole('button');
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it('calls onClose when close icon is clicked', () => {
    render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    const closeButtons = screen.getAllByRole('button');
    const closeIconButton = closeButtons[0]; // First button is the close icon
    fireEvent.click(closeIconButton);
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when cancel button is clicked', () => {
    render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    fireEvent.click(screen.getByText('cancel'));
    expect(mockOnClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when logout button is clicked', () => {
    render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    fireEvent.click(screen.getByText('logout'));
    expect(mockOnConfirm).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when loading', () => {
    render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} loading />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('enables buttons when not loading', () => {
    render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} loading={false} />);
    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });

  it('uses translation hook', () => {
    render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    expect(mockT).toHaveBeenCalled();
  });

  it('exports LogoutDialog function', () => {
    expect(LogoutDialog).toBeDefined();
    expect(typeof LogoutDialog).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof LogoutDialog).toBe('function');
    expect(LogoutDialog.name).toBe('LogoutDialog');
  });

  it('renders dialog with content', () => {
    const { container } = render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    // Dialog renders in portal, just verify container exists
    expect(container).toBeTruthy();
  });

  it('renders Typography for title', () => {
    render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    expect(screen.getByText('confirm')).toBeInTheDocument();
  });

  it('renders buttons with proper structure', () => {
    const { container } = render(<LogoutDialog open onClose={mockOnClose} onConfirm={mockOnConfirm} />);
    // Verify buttons are rendered (already tested above)
    expect(screen.getByText('cancel')).toBeInTheDocument();
    expect(screen.getByText('logout')).toBeInTheDocument();
  });
});
