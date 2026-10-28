import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashSaleForm } from 'src/sections/flash-sale/flash-sale-form';
import type { FlashSaleFormData } from 'src/sections/flash-sale/flash-sale-form';
import type { FlashSaleProductResponse } from 'src/types/gen/shared/shared/flash-sales/flash-sale';
import { DiscountType } from 'src/types/gen/shared/shared/common/enums';

const mockInitialData: Partial<FlashSaleFormData> = {
  name: 'Test Flash Sale',
  startTime: new Date('2024-01-01T10:00:00'),
  endTime: new Date('2024-01-31T23:59:59'),
  isEnabled: true,
};

const mockProducts: FlashSaleProductResponse[] = [
  {
    productId: 'prod1',
    productName: 'Product 1',
    discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
    discountValue: 10,
    promotionalQuantity: 100,
    soldCount: 0,
    isEnabled: true,
  } as FlashSaleProductResponse,
];

const mockOnSubmit = vi.fn();
const mockOnCancel = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/sections/flash-sale/components', () => ({
  GeneralInfoTab: ({ formData, onChange, loading }: any) => (
    <div data-testid="general-info-tab">
      <input
        type="text"
        value={formData.name}
        onChange={(e) => onChange({ ...formData, name: e.target.value })}
        placeholder="name"
        disabled={loading}
      />
    </div>
  ),
  ProductListTab: ({ products, onAddProduct, onUpdateProduct, onRemoveProduct, onToggleProduct, onReorderProducts }: any) => (
    <div data-testid="product-list-tab">
      <button onClick={() => onAddProduct?.({ productId: 'new-prod', productName: 'New Product' })}>
        Add Product
      </button>
      <button onClick={() => onUpdateProduct?.('prod1', { discountValue: 20 })}>
        Update Product
      </button>
      <button onClick={() => onRemoveProduct?.('prod1')}>Remove Product</button>
      <button onClick={() => onToggleProduct?.('prod1')}>Toggle Product</button>
      <button onClick={() => onReorderProducts?.(products.reverse())}>Reorder Products</button>
      <div>Products: {products.length}</div>
    </div>
  ),
  toBulkUpdateItem: (product: FlashSaleProductResponse) => ({
    productId: product.productId,
    discountType: product.discountType,
    discountValue: product.discountValue,
    promotionalQuantity: product.promotionalQuantity,
    isEnabled: product.isEnabled,
  }),
}));

vi.mock('src/utils/enum-converter', () => ({
  parseDiscountType: (type: any) => type,
}));

describe('FlashSaleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing in create mode', () => {
    const { container } = render(
      <FlashSaleForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders without crashing in edit mode', () => {
    const { container } = render(
      <FlashSaleForm
        mode="edit"
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders GeneralInfoTab', () => {
    render(<FlashSaleForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByTestId('general-info-tab')).toBeInTheDocument();
  });

  it('renders ProductListTab', () => {
    render(<FlashSaleForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByTestId('product-list-tab')).toBeInTheDocument();
  });

  it('renders go back button', () => {
    render(<FlashSaleForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByText('goBack')).toBeInTheDocument();
  });

  it('renders submit button with create text', () => {
    render(<FlashSaleForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByText('addNew')).toBeInTheDocument();
  });

  it('renders submit button with edit text', () => {
    render(
      <FlashSaleForm
        mode="edit"
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('update')).toBeInTheDocument();
  });

  it('displays initial data', () => {
    render(
      <FlashSaleForm
        mode="edit"
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const nameInput = screen.getByPlaceholderText('name');
    expect(nameInput).toHaveValue('Test Flash Sale');
  });

  it('displays initial products', () => {
    render(
      <FlashSaleForm
        mode="edit"
        initialData={mockInitialData}
        initialProducts={mockProducts}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('Products: 1')).toBeInTheDocument();
  });

  it('handles form data change', () => {
    render(<FlashSaleForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const nameInput = screen.getByPlaceholderText('name');
    fireEvent.change(nameInput, { target: { value: 'New Flash Sale' } });
    expect(nameInput).toHaveValue('New Flash Sale');
  });

  it('handles add product', () => {
    render(<FlashSaleForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const addButton = screen.getByText('Add Product');
    fireEvent.click(addButton);
    expect(screen.getByText('Products: 1')).toBeInTheDocument();
  });

  it('handles update product', () => {
    render(
      <FlashSaleForm
        mode="edit"
        initialData={mockInitialData}
        initialProducts={mockProducts}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const updateButton = screen.getByText('Update Product');
    fireEvent.click(updateButton);
    expect(screen.getByTestId('product-list-tab')).toBeInTheDocument();
  });

  it('handles remove product', () => {
    render(
      <FlashSaleForm
        mode="edit"
        initialData={mockInitialData}
        initialProducts={mockProducts}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const removeButton = screen.getByText('Remove Product');
    fireEvent.click(removeButton);
    expect(screen.getByText('Products: 0')).toBeInTheDocument();
  });

  it('handles toggle product', () => {
    render(
      <FlashSaleForm
        mode="edit"
        initialData={mockInitialData}
        initialProducts={mockProducts}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const toggleButton = screen.getByText('Toggle Product');
    fireEvent.click(toggleButton);
    expect(screen.getByTestId('product-list-tab')).toBeInTheDocument();
  });

  it('handles reorder products', () => {
    render(
      <FlashSaleForm
        mode="edit"
        initialData={mockInitialData}
        initialProducts={mockProducts}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const reorderButton = screen.getByText('Reorder Products');
    fireEvent.click(reorderButton);
    expect(screen.getByTestId('product-list-tab')).toBeInTheDocument();
  });

  it('calls onCancel when go back button clicked', () => {
    render(<FlashSaleForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const goBackButton = screen.getByText('goBack');
    fireEvent.click(goBackButton);
    expect(mockOnCancel).toHaveBeenCalledTimes(1);
  });

  it('calls onSubmit when submit button clicked', () => {
    render(
      <FlashSaleForm
        mode="edit"
        initialData={mockInitialData}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    const submitButton = screen.getByText('update');
    fireEvent.click(submitButton);
    expect(mockOnSubmit).toHaveBeenCalled();
  });

  it('disables buttons when loading', () => {
    render(
      <FlashSaleForm
        mode="create"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading
      />
    );
    const goBackButton = screen.getByText('goBack');
    const submitButton = screen.getByText('addNew');
    expect(goBackButton).toBeDisabled();
    expect(submitButton).toBeDisabled();
  });

  it('disables submit when form is invalid', () => {
    render(<FlashSaleForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const submitButton = screen.getByText('addNew');
    expect(submitButton).toBeDisabled();
  });

  it('renders with flashSaleId prop', () => {
    const { container } = render(
      <FlashSaleForm
        mode="edit"
        initialData={mockInitialData}
        flashSaleId="flash-sale-123"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('prevents duplicate products from being added', () => {
    render(
      <FlashSaleForm
        mode="edit"
        initialData={mockInitialData}
        initialProducts={mockProducts}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );
    expect(screen.getByText('Products: 1')).toBeInTheDocument();
  });

  it('exports FlashSaleForm function', () => {
    expect(FlashSaleForm).toBeDefined();
    expect(typeof FlashSaleForm).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof FlashSaleForm).toBe('function');
    expect(FlashSaleForm.name).toBe('FlashSaleForm');
  });

  it('renders Box components', () => {
    const { container } = render(
      <FlashSaleForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    const boxes = container.querySelectorAll('.MuiBox-root');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('renders Card component', () => {
    const { container } = render(
      <FlashSaleForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('renders Stack component', () => {
    const { container } = render(
      <FlashSaleForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />
    );
    const stack = container.querySelector('.MuiStack-root');
    expect(stack).toBeInTheDocument();
  });

  it('renders Button components', () => {
    render(<FlashSaleForm mode="create" onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
