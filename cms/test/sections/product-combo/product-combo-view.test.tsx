import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductComboView } from 'src/sections/product-combo/product-combo-view';
import type { ComboResponse } from 'src/types/gen/shared/shared/combos/combo';
import { ComboStatus, DiscountType } from 'src/types/gen/shared/shared/common/enums';

const mockCombos: ComboResponse[] = [
  {
    id: 'combo1',
    name: 'Summer Combo',
    image: 'https://example.com/combo1.jpg',
    originalPrice: 100000,
    discountType: DiscountType.DISCOUNT_TYPE_PERCENTAGE,
    discountValue: 10,
    discountAmount: 10000,
    finalPrice: 90000,
    items: [{ productId: 'prod1', quantity: 1 }],
    validFrom: new Date('2024-01-01'),
    validTo: new Date('2024-12-31'),
    status: ComboStatus.COMBO_STATUS_ACTIVE,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  } as ComboResponse,
];

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();

let callCount = 0;
const mockPagination = {
  total: 100,
  page: 1,
  limit: 10,
  totalPages: 10,
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn((selector) => {
    callCount++;
    if (callCount % 3 === 1) return mockCombos; // selectCombos
    if (callCount % 3 === 2) return false; // selectComboLoading
    return mockPagination; // selectComboPagination
  }),
}));

vi.mock('src/redux/store/comboSlice', () => ({
  getCombosRequest: vi.fn((params) => ({ type: 'GET_COMBOS', payload: params })),
  deleteComboRequest: vi.fn((params) => ({ type: 'DELETE_COMBO', payload: params })),
  selectCombos: vi.fn((state) => state.combos),
  selectComboLoading: vi.fn((state) => state.loading),
  selectComboPagination: vi.fn((state) => state.pagination),
}));

vi.mock('src/hooks', () => ({
  useColumnVisibilityPersistence: vi.fn(() => [{}, vi.fn()]),
  useDialog: vi.fn(() => ({
    isOpen: false,
    data: null,
    open: vi.fn(),
    close: vi.fn(),
  })),
}));

vi.mock('@tanstack/react-table', () => ({
  useReactTable: () => ({
    getHeaderGroups: () => [],
    getRowModel: () => ({ rows: [] }),
    getAllColumns: () => [],
  }),
  getCoreRowModel: vi.fn(),
  flexRender: (component: any) => component,
}));

vi.mock('src/components/table', () => ({
  SearchBar: ({ value, onChange, placeholder, renderActions, renderFarRightActions }: any) => (
    <div data-testid="search-bar">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
      />
      {renderActions && renderActions()}
      {renderFarRightActions && renderFarRightActions()}
    </div>
  ),
  ColumnVisibility: ({ table }: any) => <div data-testid="column-visibility">Columns</div>,
  DataTable: ({ table }: any) => <div data-testid="data-table">Table</div>,
  TablePagination: ({ table, totalItems, pageSize, onPageSizeChange }: any) => (
    <div data-testid="table-pagination">
      <button onClick={() => onPageSizeChange?.(20)}>Change Size</button>
    </div>
  ),
  createSelectionColumn: vi.fn(() => ({ id: 'select' })),
}));

vi.mock('src/components/dialog', () => ({
  DeleteConfirmDialog: ({ open, onClose, onConfirm }: any) =>
    open ? (
      <div data-testid="delete-dialog">
        <button onClick={onClose}>cancel</button>
        <button onClick={onConfirm}>confirm</button>
      </div>
    ) : null,
}));

vi.mock('src/components/filter', () => ({
  FilterButton: ({ children, count, onClick }: any) => (
    <button data-testid="filter-button" onClick={onClick}>
      {children} {count > 0 && `(${count})`}
    </button>
  ),
}));

vi.mock('src/components/table-image-preview', () => ({
  TableImagePreview: ({ src, alt }: any) => (
    <img data-testid="table-image-preview" src={src} alt={alt} />
  ),
}));

vi.mock('src/utils/format', () => ({
  formatPrice: (value: number) => `${value.toLocaleString()}đ`,
  formatNumber: (value: number) => value.toLocaleString(),
  formatDate: (date: string, format: string) => new Date(date).toLocaleDateString(),
}));

describe('ProductComboView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callCount = 0;
  });

  it('renders without crashing', () => {
    const { container } = render(<ProductComboView />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches getCombosRequest on mount', () => {
    render(<ProductComboView />);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('renders search bar', () => {
    render(<ProductComboView />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders column visibility control', () => {
    render(<ProductComboView />);
    expect(screen.getByTestId('column-visibility')).toBeInTheDocument();
  });

  it('renders add new button', () => {
    render(<ProductComboView />);
    expect(screen.getByText('addNew')).toBeInTheDocument();
  });

  it('renders data table', () => {
    render(<ProductComboView />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders table pagination', () => {
    render(<ProductComboView />);
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });

  it('handles search input change', () => {
    render(<ProductComboView />);
    const searchInput = screen.getByPlaceholderText('searchByNameOrCode');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput).toHaveValue('test search');
  });

  it('navigates to create page when add new button clicked', () => {
    render(<ProductComboView />);
    const addButton = screen.getByText('addNew');
    fireEvent.click(addButton);
    expect(mockNavigate).toHaveBeenCalledWith('/product-combo/create');
  });

  it('handles page size change', () => {
    render(<ProductComboView />);
    const changeSizeButton = screen.getByText('Change Size');
    fireEvent.click(changeSizeButton);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('exports ProductComboView function', () => {
    expect(ProductComboView).toBeDefined();
    expect(typeof ProductComboView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ProductComboView).toBe('function');
    expect(ProductComboView.name).toBe('ProductComboView');
  });

  it('renders Box components', () => {
    const { container } = render(<ProductComboView />);
    const boxes = container.querySelectorAll('.MuiBox-root');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('renders Card components', () => {
    const { container } = render(<ProductComboView />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('renders Button components', () => {
    render(<ProductComboView />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});
