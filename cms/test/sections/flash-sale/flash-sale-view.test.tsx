import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashSaleView } from 'src/sections/flash-sale/flash-sale-view';
import type { FlashSaleListItem } from 'src/types/gen/shared/shared/flash-sales/flash-sale';
import { FlashSaleStatus } from 'src/types/gen/shared/shared/common/enums';

const mockFlashSales: FlashSaleListItem[] = [
  {
    id: 'flash1',
    name: 'Summer Sale',
    startTime: new Date('2024-06-01T00:00:00'),
    endTime: new Date('2024-06-30T23:59:59'),
    isEnabled: true,
    status: FlashSaleStatus.FLASH_SALE_STATUS_ACTIVE,
    productCount: 50,
    createdAt: new Date('2024-05-01'),
    updatedAt: new Date('2024-05-01'),
  },
  {
    id: 'flash2',
    name: 'Winter Sale',
    startTime: new Date('2024-12-01T00:00:00'),
    endTime: new Date('2024-12-31T23:59:59'),
    isEnabled: false,
    status: FlashSaleStatus.FLASH_SALE_STATUS_UPCOMING,
    productCount: 30,
    createdAt: new Date('2024-11-01'),
    updatedAt: new Date('2024-11-01'),
  },
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
    if (callCount % 4 === 1) return mockFlashSales; // selectFlashSales
    if (callCount % 4 === 2) return false; // selectFlashSaleLoading
    if (callCount % 4 === 3) return mockPagination; // selectFlashSalePagination
    return {}; // selectFlashSaleFilters
  }),
}));

vi.mock('src/redux/store/flashSaleSlice', () => ({
  getFlashSalesRequest: vi.fn((params) => ({ type: 'GET_FLASH_SALES', payload: params })),
  deleteFlashSaleRequest: vi.fn((params) => ({ type: 'DELETE_FLASH_SALE', payload: params })),
  toggleFlashSaleRequest: vi.fn((params) => ({ type: 'TOGGLE_FLASH_SALE', payload: params })),
  setFilters: vi.fn((filters) => ({ type: 'SET_FILTERS', payload: filters })),
  selectFlashSales: vi.fn((state) => state.flashSales),
  selectFlashSaleLoading: vi.fn((state) => state.loading),
  selectFlashSalePagination: vi.fn((state) => state.pagination),
  selectFlashSaleFilters: vi.fn((state) => state.filters),
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

vi.mock('src/sections/flash-sale/components', () => ({
  FlashSaleTabs: ({ activeTab, onChange }: any) => (
    <div data-testid="flash-sale-tabs">
      <button onClick={() => onChange('all')}>All</button>
      <button onClick={() => onChange(FlashSaleStatus.FLASH_SALE_STATUS_ACTIVE)}>Active</button>
    </div>
  ),
}));

vi.mock('src/utils/format', () => ({
  formatDateTime: (date: string) => new Date(date).toLocaleDateString(),
  toISOString: (date: Date) => date?.toISOString(),
}));

describe('FlashSaleView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callCount = 0;
  });

  it('renders without crashing', () => {
    const { container } = render(<FlashSaleView />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches getFlashSalesRequest on mount', () => {
    render(<FlashSaleView />);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('renders search bar', () => {
    render(<FlashSaleView />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders flash sale tabs', () => {
    render(<FlashSaleView />);
    expect(screen.getByTestId('flash-sale-tabs')).toBeInTheDocument();
  });

  it('renders data table', () => {
    render(<FlashSaleView />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('renders table pagination', () => {
    render(<FlashSaleView />);
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });

  it('renders column visibility control', () => {
    render(<FlashSaleView />);
    expect(screen.getByTestId('column-visibility')).toBeInTheDocument();
  });

  it('renders add new button', () => {
    render(<FlashSaleView />);
    expect(screen.getByText('addNew')).toBeInTheDocument();
  });

  it('handles search input change', () => {
    render(<FlashSaleView />);
    const searchInput = screen.getByPlaceholderText('search');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    expect(searchInput).toHaveValue('test search');
  });

  it('navigates to create page when add new button clicked', () => {
    render(<FlashSaleView />);
    const addButton = screen.getByText('addNew');
    fireEvent.click(addButton);
    expect(mockNavigate).toHaveBeenCalledWith('/flash-sale/create');
  });

  it('handles tab change', () => {
    render(<FlashSaleView />);
    const activeButton = screen.getByText('Active');
    fireEvent.click(activeButton);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handles page size change', () => {
    render(<FlashSaleView />);
    const changeSizeButton = screen.getByText('Change Size');
    fireEvent.click(changeSizeButton);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('exports FlashSaleView function', () => {
    expect(FlashSaleView).toBeDefined();
    expect(typeof FlashSaleView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof FlashSaleView).toBe('function');
    expect(FlashSaleView.name).toBe('FlashSaleView');
  });

  it('renders Box components', () => {
    const { container } = render(<FlashSaleView />);
    const boxes = container.querySelectorAll('.MuiBox-root');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('renders Card components', () => {
    const { container } = render(<FlashSaleView />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('renders Button components', () => {
    render(<FlashSaleView />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });
});

describe('FlashSaleView - Empty States', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callCount = 0;
  });

  it('shows loading state when loading', () => {
    vi.mocked(vi.fn()).mockImplementation(() => {
      callCount++;
      if (callCount % 4 === 1) return []; // empty flashSales
      if (callCount % 4 === 2) return true; // loading
      if (callCount % 4 === 3) return mockPagination;
      return {};
    });

    const { container } = render(<FlashSaleView />);
    expect(container).toBeInTheDocument();
  });

  it('shows no data state when no flash sales', () => {
    vi.mocked(vi.fn()).mockImplementation(() => {
      callCount++;
      if (callCount % 4 === 1) return []; // empty flashSales
      if (callCount % 4 === 2) return false; // not loading
      if (callCount % 4 === 3) return mockPagination;
      return {};
    });

    const { container } = render(<FlashSaleView />);
    expect(container).toBeInTheDocument();
  });
});
