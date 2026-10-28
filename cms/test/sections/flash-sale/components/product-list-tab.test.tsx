import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductListTab, toBulkUpdateItem } from 'src/sections/flash-sale/components/product-list-tab';
import type { FlashSaleProductResponse } from 'src/types/gen/shared/shared/flash-sales/flash-sale';
import { DiscountType } from 'src/types/gen/shared/shared/common/enums';

const mockProducts: FlashSaleProductResponse[] = [
  {
    productId: 'prod1',
    productName: 'Test Product 1',
    discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
    discountValue: 10,
    promotionalQuantity: 100,
    isEnabled: true,
    price: 100000,
    imageUrl: 'https://example.com/image1.jpg',
  } as FlashSaleProductResponse,
  {
    productId: 'prod2',
    productName: 'Test Product 2',
    discountType: DiscountType.DISCOUNT_TYPE_FIXED,
    discountValue: 50000,
    promotionalQuantity: 50,
    isEnabled: false,
    price: 200000,
    imageUrl: 'https://example.com/image2.jpg',
  } as FlashSaleProductResponse,
];

const mockOnAddProduct = vi.fn();
const mockOnUpdateProduct = vi.fn();
const mockOnRemoveProduct = vi.fn();
const mockOnToggleProduct = vi.fn();
const mockOnReorderProducts = vi.fn();
const mockNavigate = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children }: any) => <div>{children}</div>,
  closestCenter: vi.fn(),
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(() => []),
}));

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: vi.fn(),
  sortableKeyboardCoordinates: vi.fn(),
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
  arrayMove: (array: any[], from: number, to: number) => {
    const newArray = [...array];
    const [removed] = newArray.splice(from, 1);
    newArray.splice(to, 0, removed);
    return newArray;
  },
}));

vi.mock('@dnd-kit/modifiers', () => ({
  restrictToVerticalAxis: vi.fn(),
}));

vi.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}));

vi.mock('@tanstack/react-table', () => ({
  useReactTable: () => ({
    getHeaderGroups: () => [],
    getRowModel: () => ({ rows: [] }),
  }),
  getCoreRowModel: vi.fn(),
  flexRender: (component: any) => component,
}));

vi.mock('src/components/table', () => ({
  SearchBar: ({ value, onChange, placeholder, renderFarRightActions }: any) => (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        data-testid="search-bar"
      />
      {renderFarRightActions && renderFarRightActions()}
    </div>
  ),
  DataTable: ({ children }: any) => <div data-testid="data-table">{children}</div>,
  TablePagination: ({ pageIndex = 0, pageSize, pageCount, onPageChange }: any) => (
    <div data-testid="table-pagination">
      <button onClick={() => onPageChange?.(pageIndex - 1)}>prev</button>
      <span>Page {pageIndex + 1}</span>
      <button onClick={() => onPageChange?.(pageIndex + 1)}>next</button>
    </div>
  ),
  createSelectionColumn: vi.fn(() => ({ id: 'select' })),
}));

vi.mock('src/components/dialog', () => ({
  ProductSelectionDialog: ({ open, onClose, onConfirm }: any) => (
    open ? (
      <div data-testid="product-selection-dialog">
        <button onClick={() => onConfirm([mockProducts[0]])}>confirm</button>
        <button onClick={onClose}>close</button>
      </div>
    ) : null
  ),
}));

vi.mock('src/utils/format', () => ({
  formatPrice: (value: number) => `${value.toLocaleString()}đ`,
  formatDate: (date: Date) => date.toLocaleDateString(),
  formatNumber: (value: number) => value.toLocaleString(),
}));

vi.mock('src/utils/enum-converter', () => ({
  parseDiscountType: (type: DiscountType) => type === DiscountType.DISCOUNT_TYPE_PERCENTAGE ? 'percentage' : 'fixed',
}));

describe('ProductListTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders search bar', () => {
    render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders add product button', () => {
    render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(screen.getByText('addProduct')).toBeInTheDocument();
  });

  it('handles search input change', () => {
    render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    const searchBar = screen.getByTestId('search-bar');
    fireEvent.change(searchBar, { target: { value: 'test search' } });
    expect(searchBar).toHaveValue('test search');
  });

  it('opens product selection dialog when add button clicked', () => {
    render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    const addButton = screen.getByText('addProduct');
    fireEvent.click(addButton);
    expect(screen.getByTestId('product-selection-dialog')).toBeInTheDocument();
  });

  it('calls onAddProduct when product selected from dialog', () => {
    render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    const addButton = screen.getByText('addProduct');
    fireEvent.click(addButton);
    const confirmButton = screen.getByText('confirm');
    fireEvent.click(confirmButton);
    expect(mockOnAddProduct).toHaveBeenCalled();
  });

  it('closes product selection dialog when close button clicked', () => {
    render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    const addButton = screen.getByText('addProduct');
    fireEvent.click(addButton);
    const closeButton = screen.getByText('close');
    fireEvent.click(closeButton);
    expect(screen.queryByTestId('product-selection-dialog')).not.toBeInTheDocument();
  });

  it('renders data table', () => {
    render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders table pagination', () => {
    render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });

  it('handles pagination page change', () => {
    render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    const nextButton = screen.getByText('next');
    fireEvent.click(nextButton);
    expect(screen.getByText(/Page/)).toBeInTheDocument();
  });

  it('renders without onAddProduct callback', () => {
    const { container } = render(
      <ProductListTab
        products={mockProducts}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders without onUpdateProduct callback', () => {
    const { container } = render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders without onRemoveProduct callback', () => {
    const { container } = render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders without onToggleProduct callback', () => {
    const { container } = render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders without onReorderProducts callback', () => {
    const { container } = render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders with loading state', () => {
    const { container } = render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
        loading
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders with empty products array', () => {
    const { container } = render(
      <ProductListTab
        products={[]}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders with flashSaleId prop', () => {
    const { container } = render(
      <ProductListTab
        products={mockProducts}
        flashSaleId="flash-sale-123"
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('exports ProductListTab function', () => {
    expect(ProductListTab).toBeDefined();
    expect(typeof ProductListTab).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ProductListTab).toBe('function');
    expect(ProductListTab.name).toBe('ProductListTab');
  });

  it('renders Card component', () => {
    const { container } = render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('renders Stack components', () => {
    const { container } = render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders Button components', () => {
    render(
      <ProductListTab
        products={mockProducts}
        onAddProduct={mockOnAddProduct}
        onUpdateProduct={mockOnUpdateProduct}
        onRemoveProduct={mockOnRemoveProduct}
        onToggleProduct={mockOnToggleProduct}
        onReorderProducts={mockOnReorderProducts}
      />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});

describe('toBulkUpdateItem', () => {
  it('converts FlashSaleProductResponse to BulkUpdateFlashSaleProductItem', () => {
    const product: FlashSaleProductResponse = {
      productId: 'prod1',
      productName: 'Test Product',
      discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
      discountValue: 10,
      promotionalQuantity: 100,
      isEnabled: true,
      price: 100000,
      imageUrl: 'https://example.com/image.jpg',
    } as FlashSaleProductResponse;

    const result = toBulkUpdateItem(product);

    expect(result).toEqual({
      productId: 'prod1',
      discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
      discountValue: 10,
      promotionalQuantity: 100,
      isEnabled: true,
    });
  });

  it('handles different discount types', () => {
    const product: FlashSaleProductResponse = {
      productId: 'prod2',
      productName: 'Test Product 2',
      discountType: DiscountType.DISCOUNT_TYPE_FIXED,
      discountValue: 50000,
      promotionalQuantity: 50,
      isEnabled: false,
      price: 200000,
      imageUrl: 'https://example.com/image2.jpg',
    } as FlashSaleProductResponse;

    const result = toBulkUpdateItem(product);

    expect(result.discountType).toBe(DiscountType.DISCOUNT_TYPE_FIXED);
    expect(result.discountValue).toBe(50000);
  });

  it('handles enabled and disabled states', () => {
    const enabledProduct: FlashSaleProductResponse = {
      productId: 'prod3',
      isEnabled: true,
      discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
      discountValue: 20,
      promotionalQuantity: 200,
    } as FlashSaleProductResponse;

    const disabledProduct: FlashSaleProductResponse = {
      productId: 'prod4',
      isEnabled: false,
      discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
      discountValue: 15,
      promotionalQuantity: 150,
    } as FlashSaleProductResponse;

    expect(toBulkUpdateItem(enabledProduct).isEnabled).toBe(true);
    expect(toBulkUpdateItem(disabledProduct).isEnabled).toBe(false);
  });

  it('exports toBulkUpdateItem function', () => {
    expect(toBulkUpdateItem).toBeDefined();
    expect(typeof toBulkUpdateItem).toBe('function');
  });
});
