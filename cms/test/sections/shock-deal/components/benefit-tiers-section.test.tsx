import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BenefitTiersSection } from 'src/sections/shock-deal/components/benefit-tiers-section';
import type { FormTier } from 'src/sections/shock-deal/shock-deal-form';

const mockTiers: FormTier[] = [
  {
    id: 'tier1',
    minOrderValue: 100000,
    giftProducts: [
      {
        productId: 'prod1',
        name: 'Gift Product 1',
        image: 'https://example.com/gift1.jpg',
      },
    ],
  },
  {
    id: 'tier2',
    minOrderValue: 200000,
    giftProducts: [],
  },
];

const mockOnTiersChange = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/components/dialog/product-selection-dialog', () => ({
  ProductSelectionDialog: ({ open, onClose, onConfirm }: any) =>
    open ? (
      <div data-testid="product-selection-dialog">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onConfirm([{ id: 'new-prod', name: 'New Product', images: {} }])}>
          Confirm
        </button>
      </div>
    ) : null,
}));

vi.mock('src/components/table-image-preview', () => ({
  TableImagePreview: ({ src, alt }: any) => (
    <img data-testid="table-image-preview" src={src} alt={alt} />
  ),
}));

describe('BenefitTiersSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <BenefitTiersSection tiers={[]} onTiersChange={mockOnTiersChange} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders benefit condition title', () => {
    render(<BenefitTiersSection tiers={[]} onTiersChange={mockOnTiersChange} />);
    const titles = screen.getAllByText('benefitCondition');
    expect(titles.length).toBeGreaterThan(0);
  });

  it('renders add benefit tier button', () => {
    render(<BenefitTiersSection tiers={[]} onTiersChange={mockOnTiersChange} />);
    expect(screen.getByText('addBenefitTier', { exact: false })).toBeInTheDocument();
  });

  it('renders tiers when provided', () => {
    render(<BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />);
    expect(screen.getByDisplayValue('100000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('200000')).toBeInTheDocument();
  });

  it('renders gift product name', () => {
    render(<BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />);
    expect(screen.getByText('Gift Product 1')).toBeInTheDocument();
  });

  it('calls onTiersChange when add tier button clicked', () => {
    render(<BenefitTiersSection tiers={[]} onTiersChange={mockOnTiersChange} />);
    const addButton = screen.getByText('addBenefitTier', { exact: false });
    fireEvent.click(addButton);
    expect(mockOnTiersChange).toHaveBeenCalled();
  });

  it('calls onTiersChange when min order value changes', () => {
    render(<BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />);
    const input = screen.getByDisplayValue('100000');
    fireEvent.change(input, { target: { value: '150000' } });
    expect(mockOnTiersChange).toHaveBeenCalled();
  });

  it('renders delete buttons for multiple tiers', () => {
    const { container } = render(
      <BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />
    );
    const deleteIcons = container.querySelectorAll('[data-testid="DeleteIcon"]');
    expect(deleteIcons.length).toBeGreaterThan(0);
  });

  it('does not render delete button for single tier', () => {
    const { container } = render(
      <BenefitTiersSection tiers={[mockTiers[0]]} onTiersChange={mockOnTiersChange} />
    );
    const deleteIcons = container.querySelectorAll('[data-testid="DeleteIcon"]');
    expect(deleteIcons.length).toBe(0);
  });

  it('opens product selection dialog when add product clicked', () => {
    render(<BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />);
    const addProductButton = screen.getAllByText('addProduct')[0];
    fireEvent.click(addProductButton);
    expect(screen.getByTestId('product-selection-dialog')).toBeInTheDocument();
  });

  it('renders table image preview for gift products', () => {
    render(<BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />);
    const images = screen.getAllByTestId('table-image-preview');
    expect(images.length).toBeGreaterThan(0);
  });

  it('disables controls when disabled prop is true', () => {
    render(<BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} disabled />);
    const input = screen.getByDisplayValue('100000');
    expect(input).toBeDisabled();
  });

  it('exports BenefitTiersSection function', () => {
    expect(BenefitTiersSection).toBeDefined();
    expect(typeof BenefitTiersSection).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof BenefitTiersSection).toBe('function');
    expect(BenefitTiersSection.name).toBe('BenefitTiersSection');
  });

  it('renders Card component', () => {
    const { container } = render(
      <BenefitTiersSection tiers={[]} onTiersChange={mockOnTiersChange} />
    );
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('renders Table components', () => {
    const { container } = render(
      <BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />
    );
    const table = container.querySelector('.MuiTable-root');
    expect(table).toBeInTheDocument();
  });

  it('renders TextField for min order value', () => {
    const { container } = render(
      <BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />
    );
    const textFields = container.querySelectorAll('.MuiTextField-root');
    expect(textFields.length).toBeGreaterThan(0);
  });

  it('renders table headers', () => {
    render(<BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />);
    expect(screen.getByText('minOrderValue')).toBeInTheDocument();
    expect(screen.getByText('giftProduct')).toBeInTheDocument();
  });

  it('renders tier row numbers', () => {
    render(<BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('renders VND currency label', () => {
    render(<BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />);
    const vndLabels = screen.getAllByText('VND');
    expect(vndLabels.length).toBe(2);
  });

  it('renders AddIcon components', () => {
    const { container } = render(
      <BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />
    );
    const addIcons = container.querySelectorAll('[data-testid="AddIcon"]');
    expect(addIcons.length).toBeGreaterThan(0);
  });

  it('renders CloseIcon for removing gift products', () => {
    const { container } = render(
      <BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />
    );
    const closeIcons = container.querySelectorAll('[data-testid="CloseIcon"]');
    expect(closeIcons.length).toBeGreaterThan(0);
  });

  it('handles empty tiers array', () => {
    render(<BenefitTiersSection tiers={[]} onTiersChange={mockOnTiersChange} />);
    expect(screen.getByText('addBenefitTier', { exact: false })).toBeInTheDocument();
  });

  it('displays change product text when product exists', () => {
    render(<BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />);
    expect(screen.getByText('changeProduct')).toBeInTheDocument();
  });

  it('displays add product text when no product exists', () => {
    render(<BenefitTiersSection tiers={mockTiers} onTiersChange={mockOnTiersChange} />);
    expect(screen.getByText('addProduct')).toBeInTheDocument();
  });
});
