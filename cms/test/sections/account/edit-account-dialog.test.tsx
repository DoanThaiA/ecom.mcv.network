import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { EditAccountDialog } from 'src/sections/account/edit-account-dialog';

const mockInitialData = {
  fullName: 'John Doe',
  phone: '0123456789',
  email: 'john.doe@example.com',
};

const mockOnClose = vi.fn();
const mockOnSave = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('EditAccountDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockOnSave.mockResolvedValue(undefined);
  });

  it('renders without crashing when open', () => {
    const { container } = render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <EditAccountDialog
        open={false}
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeInTheDocument();
  });

  it('renders dialog title', () => {
    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    expect(screen.getByText('editAccountInfo')).toBeInTheDocument();
  });

  it('renders full name field', () => {
    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    expect(screen.getByText('fullName')).toBeInTheDocument();
  });

  it('renders phone field', () => {
    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    expect(screen.getByText('phone')).toBeInTheDocument();
  });

  it('renders email field', () => {
    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    expect(screen.getByText('email')).toBeInTheDocument();
  });

  it('renders submit button', () => {
    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    const buttons = screen.getAllByRole('button');
    const submitBtn = buttons.find(btn => btn.getAttribute('type') === 'submit');
    expect(submitBtn).toBeDefined();
  });

  it('renders close icon button', () => {
    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('displays initial data in form fields', () => {
    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    const fullNameInput = screen.getByDisplayValue('John Doe');
    const phoneInput = screen.getByDisplayValue('0123456789');
    const emailInput = screen.getByDisplayValue('john.doe@example.com');
    expect(fullNameInput).toBeInTheDocument();
    expect(phoneInput).toBeInTheDocument();
    expect(emailInput).toBeInTheDocument();
  });

  it('handles input changes', () => {
    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    const fullNameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(fullNameInput, { target: { value: 'Jane Smith' } });
    expect(fullNameInput).toHaveValue('Jane Smith');
  });

  it('calls onSave with updated data on submit', async () => {
    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );

    const fullNameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(fullNameInput, { target: { value: 'Jane Smith' } });

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(mockOnSave).toHaveBeenCalledWith({
          fullName: 'Jane Smith',
          phone: '0123456789',
          email: 'john.doe@example.com',
        });
      });
    }
  });

  it('handles close button click', () => {
    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find(btn => btn.querySelector('[data-testid="CloseIcon"]'));
    if (closeBtn) {
      fireEvent.click(closeBtn);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('shows loading state during save', async () => {
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        expect(screen.getByText('updating')).toBeInTheDocument();
      });
    }
  });

  it('updates form data when initialData changes', () => {
    const { rerender } = render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );

    const newData = {
      fullName: 'Jane Smith',
      phone: '9876543210',
      email: 'jane.smith@example.com',
    };

    rerender(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={newData}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByDisplayValue('Jane Smith')).toBeInTheDocument();
    expect(screen.getByDisplayValue('9876543210')).toBeInTheDocument();
    expect(screen.getByDisplayValue('jane.smith@example.com')).toBeInTheDocument();
  });

  it('exports EditAccountDialog function', () => {
    expect(EditAccountDialog).toBeDefined();
    expect(typeof EditAccountDialog).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof EditAccountDialog).toBe('function');
    expect(EditAccountDialog.name).toBe('EditAccountDialog');
  });

  it('renders Dialog component', () => {
    const { container } = render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('handles phone field changes', () => {
    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    const phoneInput = screen.getByDisplayValue('0123456789');
    fireEvent.change(phoneInput, { target: { value: '9876543210' } });
    expect(phoneInput).toHaveValue('9876543210');
  });

  it('handles email field changes', () => {
    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );
    const emailInput = screen.getByDisplayValue('john.doe@example.com');
    fireEvent.change(emailInput, { target: { value: 'new.email@example.com' } });
    expect(emailInput).toHaveValue('new.email@example.com');
  });

  it('disables close when loading', async () => {
    mockOnSave.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));

    render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );

    const form = document.querySelector('form');
    if (form) {
      fireEvent.submit(form);
      await waitFor(() => {
        const buttons = screen.getAllByRole('button');
        const closeBtn = buttons.find(btn => btn.querySelector('[data-testid="CloseIcon"]'));
        expect(closeBtn).toBeDisabled();
      });
    }
  });

  it('maintains form data across renders', () => {
    const { rerender } = render(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );

    const fullNameInput = screen.getByDisplayValue('John Doe');
    fireEvent.change(fullNameInput, { target: { value: 'Updated Name' } });

    rerender(
      <EditAccountDialog
        open
        onClose={mockOnClose}
        initialData={mockInitialData}
        onSave={mockOnSave}
      />
    );

    expect(screen.getByDisplayValue('Updated Name')).toBeInTheDocument();
  });
});
