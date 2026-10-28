import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  ProductSelectionDialog,
  type ProductSelectionVariant,
} from 'src/components/dialog/product-selection-dialog';
import { ProductStatus } from 'src/types/gen/shared/shared/common/enums';

const mockOnClose = vi.fn();
const mockOnConfirm = vi.fn();

const mockProduct1 = {
  id: 'prod1',
  code: 'P001',
  name: 'Product 1',
  barcode: 'BAR001',
  images: { avatar: 'img1.jpg' },
  prices: { retail: 100000 },
  inventory: { available: 50, remain: 100 },
  status: ProductStatus.PRODUCT_STATUS_ACTIVE,
};

const mockProduct2 = {
  id: 'prod2',
  code: 'P002',
  name: 'Product 2',
  barcode: 'BAR002',
  images: { avatar: 'img2.jpg' },
  prices: { retail: 200000 },
  inventory: { available: 30, remain: 80 },
  status: ProductStatus.PRODUCT_STATUS_INACTIVE,
};

const mockProducts = [mockProduct1, mockProduct2];

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/repositories/product.repository', () => ({
  productRepository: {
    getProducts: vi.fn(() =>
      Promise.resolve({
        data: mockProducts,
        total: 2,
      })
    ),
  },
}));

vi.mock('src/components/table', () => ({
  SearchBar: ({ value, onChange, placeholder, showSearchButton, onSearch }: any) => (
    <div data-testid="search-bar">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        data-testid="search-input"
      />
      {showSearchButton && (
        <button onClick={onSearch} data-testid="search-button">
          Search
        </button>
      )}
    </div>
  ),
  DataTable: ({ table, enableRowSelection, compact }: any) => (
    <div data-testid="data-table" data-row-selection={enableRowSelection} data-compact={compact}>
      Table
    </div>
  ),
  TablePagination: ({ table, totalItems, pageSize, onPageSizeChange }: any) => (
    <div data-testid="table-pagination">
      <div>Total: {totalItems}</div>
      <select
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        data-testid="page-size-select"
      >
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
    </div>
  ),
  createSelectionColumn: () => ({
    id: 'selection',
    header: 'Select',
    cell: () => <input type="checkbox" />,
  }),
}));

vi.mock('src/utils/format', () => ({
  formatNumber: (num: number) => num.toLocaleString(),
}));

describe('ProductSelectionDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders dialog when open is true', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not render dialog when open is false', () => {
    render(
      <ProductSelectionDialog
        open={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('renders default title', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByText('productList')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
        title="customTitle"
      />
    );
    expect(screen.getByText('customTitle')).toBeInTheDocument();
  });

  it('renders close icon button', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toBeInTheDocument();
  });

  it('calls onClose when close icon clicked', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    const closeButton = screen.getAllByRole('button')[0];
    fireEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('renders search bar', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders search input with placeholder', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByPlaceholderText('searchProduct')).toBeInTheDocument();
  });

  it('handles search input change', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput).toHaveValue('test');
  });

  it('renders data table', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders table with row selection enabled', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    const table = screen.getByTestId('data-table');
    expect(table).toHaveAttribute('data-row-selection', 'true');
  });

  it('renders table with compact mode', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    const table = screen.getByTestId('data-table');
    expect(table).toHaveAttribute('data-compact', 'true');
  });

  it('renders table pagination', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });

  it('renders cancel button', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByText('close')).toBeInTheDocument();
  });

  it('renders confirm button with default label', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByText(/addProduct/)).toBeInTheDocument();
  });

  it('renders confirm button with custom label', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
        confirmLabel="customConfirm"
      />
    );
    expect(screen.getByText(/customConfirm/)).toBeInTheDocument();
  });

  it('calls onClose when cancel button clicked', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    const cancelButton = screen.getByText('close');
    fireEvent.click(cancelButton);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('disables confirm button when no products selected', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    const confirmButton = screen.getByText(/addProduct/).closest('button');
    expect(confirmButton).toBeDisabled();
  });

  it('renders with simple variant', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
        variant="simple"
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders with detailed variant', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
        variant="detailed"
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('handles page size change', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    const pageSizeSelect = screen.getByTestId('page-size-select');
    fireEvent.change(pageSizeSelect, { target: { value: '20' } });
    expect(pageSizeSelect).toHaveValue('20');
  });

  it('exports ProductSelectionDialog function', () => {
    expect(ProductSelectionDialog).toBeDefined();
    expect(typeof ProductSelectionDialog).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ProductSelectionDialog).toBe('function');
    expect(ProductSelectionDialog.name).toBe('ProductSelectionDialog');
  });

  it('renders with preSelectExisting true', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={['prod1']}
        preSelectExisting={true}
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders with preSelectExisting false', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={['prod1']}
        preSelectExisting={false}
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders with filterOutExisting true', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={['prod1']}
        filterOutExisting={true}
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders with filterOutExisting false', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={['prod1']}
        filterOutExisting={false}
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders with singleSelect true', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
        singleSelect={true}
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders with singleSelect false', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
        singleSelect={false}
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders MUI Dialog component', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders dialog title with typography', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByText('productList')).toBeInTheDocument();
  });

  it('renders dialog content with search', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders dialog actions with buttons', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByText('close')).toBeInTheDocument();
  });

  it('renders search button', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByTestId('search-button')).toBeInTheDocument();
  });

  it('exports ProductSelectionVariant type', () => {
    const variant: ProductSelectionVariant = 'simple';
    expect(variant).toBe('simple');
  });

  it('handles empty existingProductIds', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('handles multiple existingProductIds', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={['prod1', 'prod2', 'prod3']}
      />
    );
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders close icon button in header', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders main container elements', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('renders title typography', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByText('productList')).toBeInTheDocument();
  });

  it('renders action buttons in footer', () => {
    render(
      <ProductSelectionDialog
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        existingProductIds={[]}
      />
    );
    expect(screen.getByText('close')).toBeInTheDocument();
    expect(screen.getByText(/addProduct/)).toBeInTheDocument();
  });
});
