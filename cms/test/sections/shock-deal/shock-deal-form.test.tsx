import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShockDealForm, type ShockDealFormData } from 'src/sections/shock-deal/shock-deal-form';
import { BundleDealSubType, PromotionStatus } from 'src/types/promotion';

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();
const mockOnPause = vi.fn();
const mockOnResume = vi.fn();

const mockInitialData: Partial<ShockDealFormData> = {
  name: 'Test Shock Deal',
  subType: BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT,
  startTime: new Date('2024-01-01'),
  endTime: new Date('2024-12-31'),
  tiers: [
    {
      id: 'tier1',
      minOrderValue: 100000,
      giftProducts: [{ productId: 'prod1', name: 'Gift 1', image: 'gift1.jpg' }],
    },
  ],
};

vi.mock('src/sections/shock-deal/components', () => ({
  ClassificationSection: ({ value, onChange, disabled }: any) => (
    <div data-testid="classification-section">
      <select value={value} onChange={(e) => onChange(Number(e.target.value))} disabled={disabled}>
        <option value={1}>Type 1</option>
        <option value={2}>Type 2</option>
      </select>
    </div>
  ),
  BasicInfoSection: ({ name, onNameChange, disabled }: any) => (
    <div data-testid="basic-info-section">
      <input
        type="text"
        value={name}
        onChange={(e) => onNameChange(e.target.value)}
        disabled={disabled}
        data-testid="name-input"
      />
    </div>
  ),
  BenefitTiersSection: ({ tiers, onTiersChange, disabled }: any) => (
    <div data-testid="benefit-tiers-section">
      <div>Tiers: {tiers.length}</div>
      <button
        onClick={() =>
          onTiersChange([...tiers, { id: 'new-tier', minOrderValue: 0, giftProducts: [] }])
        }
        disabled={disabled}
      >
        Add Tier
      </button>
    </div>
  ),
  FormActionButtons: ({ mode, onSubmit, onCancel, onPause, onResume, isValid }: any) => (
    <div data-testid="form-action-buttons">
      <button onClick={onSubmit} disabled={!isValid}>
        Submit
      </button>
      <button onClick={onCancel}>Cancel</button>
      {onPause && <button onClick={onPause}>Pause</button>}
      {onResume && <button onClick={onResume}>Resume</button>}
    </div>
  ),
}));

describe('ShockDealForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders classification section', () => {
    render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByTestId('classification-section')).toBeInTheDocument();
  });

  it('renders basic info section', () => {
    render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByTestId('basic-info-section')).toBeInTheDocument();
  });

  it('renders benefit tiers section', () => {
    render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByTestId('benefit-tiers-section')).toBeInTheDocument();
  });

  it('renders form action buttons', () => {
    render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByTestId('form-action-buttons')).toBeInTheDocument();
  });

  it('displays initial name value', () => {
    render(
      <ShockDealForm
        mode="edit"
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const input = screen.getByTestId('name-input');
    expect(input).toHaveValue('Test Shock Deal');
  });

  it('handles name change', () => {
    render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const input = screen.getByTestId('name-input');
    fireEvent.change(input, { target: { value: 'New Name' } });
    expect(input).toHaveValue('New Name');
  });

  it('calls onSubmit when submit button clicked', () => {
    render(
      <ShockDealForm
        mode="create"
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const submitButton = screen.getByText('Submit');
    fireEvent.click(submitButton);
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button clicked', () => {
    render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onPause when pause button clicked', () => {
    render(
      <ShockDealForm
        mode="edit"
        initialData={mockInitialData}
        status={PromotionStatus.PROMOTION_STATUS_ACTIVE}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onPause={mockOnPause}
      />
    );
    const pauseButton = screen.getByText('Pause');
    fireEvent.click(pauseButton);
    expect(mockOnPause).toHaveBeenCalled();
  });

  it('calls onResume when resume button clicked', () => {
    render(
      <ShockDealForm
        mode="edit"
        initialData={mockInitialData}
        status={PromotionStatus.PROMOTION_STATUS_PAUSED}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        onResume={mockOnResume}
      />
    );
    const resumeButton = screen.getByText('Resume');
    fireEvent.click(resumeButton);
    expect(mockOnResume).toHaveBeenCalled();
  });

  it('renders in create mode', () => {
    render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByTestId('form-action-buttons')).toBeInTheDocument();
  });

  it('renders in edit mode', () => {
    render(
      <ShockDealForm
        mode="edit"
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByTestId('form-action-buttons')).toBeInTheDocument();
  });

  it('displays tier count', () => {
    render(
      <ShockDealForm
        mode="create"
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('Tiers: 1')).toBeInTheDocument();
  });

  it('exports ShockDealForm function', () => {
    expect(ShockDealForm).toBeDefined();
    expect(typeof ShockDealForm).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ShockDealForm).toBe('function');
    expect(ShockDealForm.name).toBe('ShockDealForm');
  });

  it('renders Box components', () => {
    const { container } = render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const boxes = container.querySelectorAll('.MuiBox-root');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('renders Card component', () => {
    const { container } = render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('handles empty initial data', () => {
    render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const input = screen.getByTestId('name-input');
    expect(input).toHaveValue('');
  });

  it('disables controls when loading', () => {
    render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading
      />
    );
    const input = screen.getByTestId('name-input');
    expect(input).toBeDisabled();
  });

  it('initializes with default tier in create mode', () => {
    render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('Tiers: 1')).toBeInTheDocument();
  });

  it('handles subtype change', () => {
    render(
      <ShockDealForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const select = screen.getByTestId('classification-section').querySelector('select');
    fireEvent.change(select!, { target: { value: '2' } });
    expect(select).toBeInTheDocument();
  });
});
