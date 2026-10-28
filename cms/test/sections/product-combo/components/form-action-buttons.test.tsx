import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormActionButtons } from 'src/sections/product-combo/components/form-action-buttons';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe('FormActionButtons', () => {
  const mockOnCancel = vi.fn();
  const mockOnSaveAndHide = vi.fn();
  const mockOnSaveAndShow = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <FormActionButtons
          onCancel={mockOnCancel}
          onSaveAndHide={mockOnSaveAndHide}
          onSaveAndShow={mockOnSaveAndShow}
        />
      );
    }).not.toThrow();
  });

  it('renders all three buttons', () => {
    render(
      <FormActionButtons
        onCancel={mockOnCancel}
        onSaveAndHide={mockOnSaveAndHide}
        onSaveAndShow={mockOnSaveAndShow}
      />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('renders goBack button', () => {
    mockT.mockImplementation((key) => key);
    render(
      <FormActionButtons
        onCancel={mockOnCancel}
        onSaveAndHide={mockOnSaveAndHide}
        onSaveAndShow={mockOnSaveAndShow}
      />
    );

    expect(screen.getByText('goBack')).toBeInTheDocument();
  });

  it('renders saveAndHide button', () => {
    mockT.mockImplementation((key) => key);
    render(
      <FormActionButtons
        onCancel={mockOnCancel}
        onSaveAndHide={mockOnSaveAndHide}
        onSaveAndShow={mockOnSaveAndShow}
      />
    );

    expect(screen.getByText('saveAndHide')).toBeInTheDocument();
  });

  it('renders saveAndShow button', () => {
    mockT.mockImplementation((key) => key);
    render(
      <FormActionButtons
        onCancel={mockOnCancel}
        onSaveAndHide={mockOnSaveAndHide}
        onSaveAndShow={mockOnSaveAndShow}
      />
    );

    expect(screen.getByText('saveAndShow')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    mockT.mockImplementation((key) => key);
    render(
      <FormActionButtons
        onCancel={mockOnCancel}
        onSaveAndHide={mockOnSaveAndHide}
        onSaveAndShow={mockOnSaveAndShow}
      />
    );

    fireEvent.click(screen.getByText('goBack'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSaveAndHide when saveAndHide button is clicked', () => {
    mockT.mockImplementation((key) => key);
    render(
      <FormActionButtons
        onCancel={mockOnCancel}
        onSaveAndHide={mockOnSaveAndHide}
        onSaveAndShow={mockOnSaveAndShow}
      />
    );

    fireEvent.click(screen.getByText('saveAndHide'));
    expect(mockOnSaveAndHide).toHaveBeenCalledTimes(1);
  });

  it('calls onSaveAndShow when saveAndShow button is clicked', () => {
    mockT.mockImplementation((key) => key);
    render(
      <FormActionButtons
        onCancel={mockOnCancel}
        onSaveAndHide={mockOnSaveAndHide}
        onSaveAndShow={mockOnSaveAndShow}
      />
    );

    fireEvent.click(screen.getByText('saveAndShow'));
    expect(mockOnSaveAndShow).toHaveBeenCalledTimes(1);
  });

  it('disables all buttons when loading is true', () => {
    mockT.mockImplementation((key) => key);
    render(
      <FormActionButtons
        onCancel={mockOnCancel}
        onSaveAndHide={mockOnSaveAndHide}
        onSaveAndShow={mockOnSaveAndShow}
        loading
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('enables all buttons when loading is false', () => {
    mockT.mockImplementation((key) => key);
    render(
      <FormActionButtons
        onCancel={mockOnCancel}
        onSaveAndHide={mockOnSaveAndHide}
        onSaveAndShow={mockOnSaveAndShow}
        loading={false}
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).not.toBeDisabled();
    });
  });

  it('shows loading spinner on saveAndHide when loading', () => {
    render(
      <FormActionButtons
        onCancel={mockOnCancel}
        onSaveAndHide={mockOnSaveAndHide}
        onSaveAndShow={mockOnSaveAndShow}
        loading
      />
    );

    const spinners = screen.getAllByRole('progressbar');
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('does not show loading spinner when not loading', () => {
    render(
      <FormActionButtons
        onCancel={mockOnCancel}
        onSaveAndHide={mockOnSaveAndHide}
        onSaveAndShow={mockOnSaveAndShow}
        loading={false}
      />
    );

    const spinners = screen.queryAllByRole('progressbar');
    expect(spinners).toHaveLength(0);
  });

  it('uses translation hook', () => {
    render(
      <FormActionButtons
        onCancel={mockOnCancel}
        onSaveAndHide={mockOnSaveAndHide}
        onSaveAndShow={mockOnSaveAndShow}
      />
    );

    expect(mockT).toHaveBeenCalled();
  });

  it('exports FormActionButtons function', () => {
    expect(FormActionButtons).toBeDefined();
    expect(typeof FormActionButtons).toBe('function');
  });

  it('renders Stack component', () => {
    const { container } = render(
      <FormActionButtons
        onCancel={mockOnCancel}
        onSaveAndHide={mockOnSaveAndHide}
        onSaveAndShow={mockOnSaveAndShow}
      />
    );

    expect(container.querySelector('.MuiStack-root')).toBeInTheDocument();
  });

  it('is a functional component', () => {
    expect(typeof FormActionButtons).toBe('function');
    expect(FormActionButtons.name).toBe('FormActionButtons');
  });
});
