import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FormActionButtons } from 'src/sections/shock-deal/components/form-action-buttons';
import { PromotionStatus } from 'src/types/promotion';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe('FormActionButtons', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnPause = vi.fn();
  const mockOnResume = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <FormActionButtons
          mode="create"
          onSubmit={mockOnSubmit}
          onCancel={mockOnCancel}
        />
      );
    }).not.toThrow();
  });

  it('renders goBack button', () => {
    render(
      <FormActionButtons
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('goBack')).toBeInTheDocument();
  });

  it('renders submit button with addNew text in create mode', () => {
    render(
      <FormActionButtons
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('addNew')).toBeInTheDocument();
  });

  it('renders submit button with update text in edit mode', () => {
    render(
      <FormActionButtons
        mode="edit"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('update')).toBeInTheDocument();
  });

  it('calls onCancel when goBack button is clicked', () => {
    render(
      <FormActionButtons
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('goBack'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when submit button is clicked', () => {
    render(
      <FormActionButtons
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('addNew'));
    expect(mockOnSubmit).toHaveBeenCalledTimes(1);
  });

  it('renders pause button for active promotion in edit mode', () => {
    render(
      <FormActionButtons
        mode="edit"
        status={PromotionStatus.PROMOTION_STATUS_ACTIVE}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onPause={mockOnPause}
      />
    );
    expect(screen.getByText('pause')).toBeInTheDocument();
  });

  it('does not render pause button for paused promotion', () => {
    render(
      <FormActionButtons
        mode="edit"
        status={PromotionStatus.PROMOTION_STATUS_PAUSED}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onPause={mockOnPause}
      />
    );
    expect(screen.queryByText('pause')).not.toBeInTheDocument();
  });

  it('renders resume button for paused promotion in edit mode', () => {
    render(
      <FormActionButtons
        mode="edit"
        status={PromotionStatus.PROMOTION_STATUS_PAUSED}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onResume={mockOnResume}
      />
    );
    expect(screen.getByText('resume')).toBeInTheDocument();
  });

  it('does not render resume button for active promotion', () => {
    render(
      <FormActionButtons
        mode="edit"
        status={PromotionStatus.PROMOTION_STATUS_ACTIVE}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onResume={mockOnResume}
      />
    );
    expect(screen.queryByText('resume')).not.toBeInTheDocument();
  });

  it('calls onPause when pause button is clicked', () => {
    render(
      <FormActionButtons
        mode="edit"
        status={PromotionStatus.PROMOTION_STATUS_ACTIVE}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onPause={mockOnPause}
      />
    );

    fireEvent.click(screen.getByText('pause'));
    expect(mockOnPause).toHaveBeenCalledTimes(1);
  });

  it('calls onResume when resume button is clicked', () => {
    render(
      <FormActionButtons
        mode="edit"
        status={PromotionStatus.PROMOTION_STATUS_PAUSED}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onResume={mockOnResume}
      />
    );

    fireEvent.click(screen.getByText('resume'));
    expect(mockOnResume).toHaveBeenCalledTimes(1);
  });

  it('disables all buttons when loading', () => {
    render(
      <FormActionButtons
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('disables all buttons when pauseLoading', () => {
    render(
      <FormActionButtons
        mode="edit"
        status={PromotionStatus.PROMOTION_STATUS_ACTIVE}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onPause={mockOnPause}
        pauseLoading
      />
    );

    const buttons = screen.getAllByRole('button');
    buttons.forEach((button) => {
      expect(button).toBeDisabled();
    });
  });

  it('disables submit button when isValid is false', () => {
    render(
      <FormActionButtons
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isValid={false}
      />
    );

    expect(screen.getByText('addNew')).toBeDisabled();
  });

  it('enables submit button when isValid is true', () => {
    render(
      <FormActionButtons
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isValid
      />
    );

    expect(screen.getByText('addNew')).not.toBeDisabled();
  });

  it('does not render pause button in create mode', () => {
    render(
      <FormActionButtons
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onPause={mockOnPause}
      />
    );
    expect(screen.queryByText('pause')).not.toBeInTheDocument();
  });

  it('does not render resume button in create mode', () => {
    render(
      <FormActionButtons
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onResume={mockOnResume}
      />
    );
    expect(screen.queryByText('resume')).not.toBeInTheDocument();
  });

  it('uses translation hook', () => {
    render(
      <FormActionButtons
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(mockT).toHaveBeenCalled();
  });

  it('exports FormActionButtons function', () => {
    expect(FormActionButtons).toBeDefined();
    expect(typeof FormActionButtons).toBe('function');
  });

  it('renders Box component', () => {
    const { container } = render(
      <FormActionButtons
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('is a functional component', () => {
    expect(typeof FormActionButtons).toBe('function');
    expect(FormActionButtons.name).toBe('FormActionButtons');
  });
});
