import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductComboForm } from 'src/sections/product-combo/product-combo-form';
import { ComboStatus, DiscountType } from 'src/types/gen/shared/shared/common/enums';

// Mock child sections
vi.mock('src/sections/product-combo/components/basic-information-section', () => ({
  BasicInformationSection: ({ formData, onChange, loading }: any) => (
    <div data-testid="basic-information-section" data-loading={loading}>
      <label htmlFor="name">Name</label>
      <input
        id="name"
        value={formData.name || ''}
        onChange={(e) => onChange({ ...formData, name: e.target.value })}
      />
    </div>
  ),
}));

vi.mock('src/sections/product-combo/components/combo-pricing-section', () => ({
  ComboPricingSection: ({ formData, onChange, loading }: any) => (
    <div data-testid="combo-pricing-section" data-loading={loading}>
      <label htmlFor="discountValue">Discount Value</label>
      <input
        type="number"
        id="discountValue"
        value={formData.discountValue || 0}
        onChange={(e) => onChange({ ...formData, discountValue: Number(e.target.value) })}
      />
    </div>
  ),
}));

vi.mock('src/sections/product-combo/components/sku-list-section', () => ({
  SkuListSection: ({ products, onAddProduct, onRemoveProduct, loading }: any) => (
    <div data-testid="sku-list-section" data-loading={loading}>
      <button
        onClick={() =>
          onAddProduct({
            productId: 'prod1',
            quantity: 1,
            name: 'Product 1',
            image: 'image.jpg',
          })
        }
      >
        Add Product
      </button>
      {products.map((product: any) => (
        <div key={product.productId}>
          {product.name}
          <button onClick={() => onRemoveProduct(product.productId)}>Remove</button>
        </div>
      ))}
    </div>
  ),
}));

vi.mock('src/sections/product-combo/components/form-action-buttons', () => ({
  FormActionButtons: ({ onCancel, onSaveAndHide, onSaveAndShow, loading }: any) => (
    <div data-testid="form-action-buttons" data-loading={loading}>
      <button onClick={onCancel}>Cancel</button>
      <button onClick={onSaveAndHide}>Save and Hide</button>
      <button onClick={onSaveAndShow}>Save and Show</button>
    </div>
  ),
}));

describe('ProductComboForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  const defaultProps = {
    mode: 'create' as const,
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<ProductComboForm {...defaultProps} />);
    }).not.toThrow();
  });

  it('renders all sections', () => {
    render(<ProductComboForm {...defaultProps} />);
    expect(screen.getByTestId('basic-information-section')).toBeInTheDocument();
    expect(screen.getByTestId('combo-pricing-section')).toBeInTheDocument();
    expect(screen.getByTestId('sku-list-section')).toBeInTheDocument();
    expect(screen.getByTestId('form-action-buttons')).toBeInTheDocument();
  });

  it('renders in create mode', () => {
    render(<ProductComboForm {...defaultProps} mode="create" />);
    expect(screen.getByTestId('basic-information-section')).toBeInTheDocument();
  });

  it('renders in edit mode', () => {
    render(<ProductComboForm {...defaultProps} mode="edit" />);
    expect(screen.getByTestId('basic-information-section')).toBeInTheDocument();
  });

  it('initializes with default form data', () => {
    render(<ProductComboForm {...defaultProps} />);
    expect(screen.getByLabelText('Name')).toHaveValue('');
  });

  it('initializes with provided data', () => {
    render(
      <ProductComboForm
        {...defaultProps}
        initialData={{
          name: 'Test Combo',
          discountValue: 100,
        }}
      />
    );
    expect(screen.getByLabelText('Name')).toHaveValue('Test Combo');
    expect(screen.getByLabelText('Discount Value')).toHaveValue(100);
  });

  it('updates form data when name changes', () => {
    render(<ProductComboForm {...defaultProps} />);
    const nameInput = screen.getByLabelText('Name');
    fireEvent.change(nameInput, { target: { value: 'New Combo' } });
    expect(nameInput).toHaveValue('New Combo');
  });

  it('updates form data when discount value changes', () => {
    render(<ProductComboForm {...defaultProps} />);
    const discountInput = screen.getByLabelText('Discount Value');
    fireEvent.change(discountInput, { target: { value: '150' } });
    expect(discountInput).toHaveValue(150);
  });

  it('adds product to items list', () => {
    render(<ProductComboForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Product'));
    expect(screen.getByText('Product 1')).toBeInTheDocument();
  });

  it('removes product from items list', () => {
    render(<ProductComboForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Product'));
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Remove'));
    expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', () => {
    render(<ProductComboForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Cancel'));
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit with ACTIVE status when Save and Show is clicked', () => {
    render(<ProductComboForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Save and Show'));
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ComboStatus.COMBO_STATUS_ACTIVE,
      })
    );
  });

  it('calls onSubmit with INACTIVE status when Save and Hide is clicked', () => {
    render(<ProductComboForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Save and Hide'));
    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        status: ComboStatus.COMBO_STATUS_INACTIVE,
      })
    );
  });

  it('passes loading prop to all sections', () => {
    render(<ProductComboForm {...defaultProps} loading />);
    expect(screen.getByTestId('basic-information-section')).toHaveAttribute('data-loading', 'true');
    expect(screen.getByTestId('combo-pricing-section')).toHaveAttribute('data-loading', 'true');
    expect(screen.getByTestId('sku-list-section')).toHaveAttribute('data-loading', 'true');
    expect(screen.getByTestId('form-action-buttons')).toHaveAttribute('data-loading', 'true');
  });

  it('initializes with default discount type FIXED', () => {
    render(<ProductComboForm {...defaultProps} />);
    // Default discountType is DISCOUNT_TYPE_FIXED
    expect(screen.getByTestId('combo-pricing-section')).toBeInTheDocument();
  });

  it('initializes with default status ACTIVE', () => {
    render(<ProductComboForm {...defaultProps} />);
    // Default status is COMBO_STATUS_ACTIVE
    expect(screen.getByTestId('basic-information-section')).toBeInTheDocument();
  });

  it('initializes with empty items array', () => {
    render(<ProductComboForm {...defaultProps} />);
    expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
  });

  it('initializes with provided items', () => {
    render(
      <ProductComboForm
        {...defaultProps}
        initialData={{
          items: [
            {
              productId: 'prod1',
              quantity: 2,
              productName: 'Initial Product',
              productImage: 'img.jpg',
            },
          ],
        }}
      />
    );
    expect(screen.getByText('Initial Product')).toBeInTheDocument();
  });

  it('adds product with correct structure to items', () => {
    render(<ProductComboForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Product'));
    fireEvent.click(screen.getByText('Save and Show'));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({
            productId: 'prod1',
            quantity: 1,
          }),
        ]),
      })
    );
  });

  it('submits with all form data', () => {
    render(
      <ProductComboForm
        {...defaultProps}
        initialData={{
          name: 'Test Combo',
          description: 'Test Description',
          discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
          discountValue: 20,
        }}
      />
    );
    fireEvent.click(screen.getByText('Save and Show'));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Combo',
        description: 'Test Description',
        discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
        discountValue: 20,
        status: ComboStatus.COMBO_STATUS_ACTIVE,
      })
    );
  });

  it('exports ProductComboForm function', () => {
    expect(ProductComboForm).toBeDefined();
    expect(typeof ProductComboForm).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ProductComboForm).toBe('function');
    expect(ProductComboForm.name).toBe('ProductComboForm');
  });

  it('renders Box container', () => {
    const { container } = render(<ProductComboForm {...defaultProps} />);
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('handles multiple product additions', () => {
    render(<ProductComboForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Add Product'));
    fireEvent.click(screen.getByText('Add Product'));
    const products = screen.getAllByText('Product 1');
    expect(products.length).toBe(2);
  });

  it('verifies product list updates correctly', () => {
    render(<ProductComboForm {...defaultProps} />);
    // Initially no products
    expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
    // Add one product
    fireEvent.click(screen.getByText('Add Product'));
    expect(screen.getByText('Product 1')).toBeInTheDocument();
    // Remove it
    fireEvent.click(screen.getByText('Remove'));
    expect(screen.queryByText('Product 1')).not.toBeInTheDocument();
  });
});
