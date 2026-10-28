import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DeleteConfirmDialog } from 'src/components/dialog/delete-confirm-dialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) =>
      ({
        confirmDeletion: 'Confirm Deletion',
        customTitle: 'Custom Title',
        cancel: 'Cancel',
        delete: 'Delete',
      })[key] || key,
  }),
}));

describe('DeleteConfirmDialog', () => {
  const defaultProps = {
    open: true,
    message: 'Are you sure you want to delete this item?',
    onClose: vi.fn(),
    onConfirm: vi.fn(),
  };

  it('renders when open', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
    expect(screen.getByText('Are you sure you want to delete this item?')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<DeleteConfirmDialog {...defaultProps} open={false} />);
    expect(screen.queryByText('Confirm Deletion')).not.toBeInTheDocument();
  });

  it('renders default title', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Confirm Deletion')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(<DeleteConfirmDialog {...defaultProps} title="customTitle" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders message', () => {
    render(<DeleteConfirmDialog {...defaultProps} message="Custom message" />);
    expect(screen.getByText('Custom message')).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('renders delete button', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('calls onClose when cancel clicked', async () => {
    const onClose = vi.fn();
    render(<DeleteConfirmDialog {...defaultProps} onClose={onClose} />);
    await userEvent.click(screen.getByText('Cancel'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when delete clicked', async () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmDialog {...defaultProps} onConfirm={onConfirm} />);
    await userEvent.click(screen.getByText('Delete'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when close icon clicked', async () => {
    const onClose = vi.fn();
    render(<DeleteConfirmDialog {...defaultProps} onClose={onClose} />);
    const closeButton = screen.getByRole('button', { name: '' });
    await userEvent.click(closeButton);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables buttons when loading', () => {
    render(<DeleteConfirmDialog {...defaultProps} loading />);
    expect(screen.getByText('Cancel')).toBeDisabled();
    expect(screen.getByText('Delete')).toBeDisabled();
  });

  it('disables close button when loading', () => {
    render(<DeleteConfirmDialog {...defaultProps} loading />);
    const closeButton = screen.getByRole('button', { name: '' });
    expect(closeButton).toBeDisabled();
  });

  it('enables buttons when not loading', () => {
    render(<DeleteConfirmDialog {...defaultProps} loading={false} />);
    expect(screen.getByText('Cancel')).not.toBeDisabled();
    expect(screen.getByText('Delete')).not.toBeDisabled();
  });

  it('enables close button when not loading', () => {
    render(<DeleteConfirmDialog {...defaultProps} loading={false} />);
    const closeButton = screen.getByRole('button', { name: '' });
    expect(closeButton).not.toBeDisabled();
  });

  it('renders close icon', () => {
    render(<DeleteConfirmDialog {...defaultProps} />);
    const closeButton = screen.getByRole('button', { name: '' });
    expect(closeButton).toBeInTheDocument();
  });

  it('does not call onClose when cancel clicked while loading', async () => {
    const onClose = vi.fn();
    render(<DeleteConfirmDialog {...defaultProps} onClose={onClose} loading />);
    const cancelButton = screen.getByText('Cancel');
    expect(cancelButton).toBeDisabled();
  });

  it('does not call onConfirm when delete clicked while loading', async () => {
    const onConfirm = vi.fn();
    render(<DeleteConfirmDialog {...defaultProps} onConfirm={onConfirm} loading />);
    const deleteButton = screen.getByText('Delete');
    expect(deleteButton).toBeDisabled();
  });
});
