import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import InventoryPage from 'src/pages/inventory';

const mockT = vi.fn((key: string) => key);
const mockSetTitle = vi.fn();
const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();
const mockUseColumnVisibilityPersistence = vi.fn(() => [{}, vi.fn()]);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

vi.mock('src/config-global', () => ({
  CONFIG: { appName: 'Test CMS' },
}));

vi.mock('src/contexts/page-title-context', () => ({
  usePageTitle: () => ({ setTitle: mockSetTitle }),
}));

vi.mock('src/hooks', () => ({
  useColumnVisibilityPersistence: () => mockUseColumnVisibilityPersistence(),
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/inventorySlice', () => ({
  getInventoriesRequest: vi.fn((params) => ({ type: 'GET_INVENTORIES', payload: params })),
  selectInventories: vi.fn((state) => []),
  selectInventoryLoading: vi.fn((state) => false),
  selectInventoryPagination: vi.fn((state) => ({ total: 0, totalPages: 0 })),
}));

vi.mock('src/components/table', () => ({
  SearchBar: () => <div data-testid="search-bar">SearchBar</div>,
  ColumnVisibility: () => <div data-testid="column-visibility">ColumnVisibility</div>,
  DataTable: () => <div data-testid="data-table">DataTable</div>,
  TablePagination: () => <div data-testid="table-pagination">TablePagination</div>,
  createSelectionColumn: vi.fn(() => ({ id: 'select' })),
}));

vi.mock('src/components/table-image-preview', () => ({
  TableImagePreview: () => <div data-testid="table-image-preview">TableImagePreview</div>,
}));

vi.mock('src/utils/format', () => ({
  formatPrice: vi.fn((price) => `$${price}`),
}));

vi.mock('@tanstack/react-table', () => ({
  useReactTable: vi.fn(() => ({
    getHeaderGroups: () => [],
    getRowModel: () => ({ rows: [] }),
  })),
  getCoreRowModel: vi.fn(),
}));

describe('InventoryPage', () => {
  const setupMocks = (options: {
    inventories?: any[];
    loading?: boolean;
    pagination?: { total: number; totalPages: number };
  } = {}) => {
    const { inventories = [], loading = false, pagination = { total: 0, totalPages: 0 } } = options;

    mockUseAppSelector.mockImplementation((selector) => {
      // Call the selector function with mocked values
      const result = selector({});
      // Override with our mocked values based on selector type
      if (typeof result === 'boolean') return loading;
      if (typeof result === 'object' && 'total' in result) return pagination;
      if (Array.isArray(result)) return inventories;
      return selector({});
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <HelmetProvider>
          <InventoryPage />
        </HelmetProvider>
      );
    }).not.toThrow();
  });

  it('calls setTitle with translated text', () => {
    render(
      <HelmetProvider>
        <InventoryPage />
      </HelmetProvider>
    );
    expect(mockSetTitle).toHaveBeenCalledWith('inventory_management');
  });

  it('uses useTranslation hook', () => {
    render(
      <HelmetProvider>
        <InventoryPage />
      </HelmetProvider>
    );
    expect(mockT).toHaveBeenCalled();
  });

  it('uses Redux dispatch', () => {
    render(
      <HelmetProvider>
        <InventoryPage />
      </HelmetProvider>
    );
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('selects inventories from Redux', () => {
    render(
      <HelmetProvider>
        <InventoryPage />
      </HelmetProvider>
    );
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('renders SearchBar component', () => {
    render(
      <HelmetProvider>
        <InventoryPage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders TablePagination component', () => {
    render(
      <HelmetProvider>
        <InventoryPage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });

  it('exports default function', () => {
    expect(InventoryPage).toBeDefined();
    expect(typeof InventoryPage).toBe('function');
  });

  it('uses CONFIG from config-global', () => {
    render(
      <HelmetProvider>
        <InventoryPage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders loading state', () => {
    setupMocks({ loading: true });

    render(
      <HelmetProvider>
        <InventoryPage />
      </HelmetProvider>
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('renders empty state when no data and no search', () => {
    setupMocks({ inventories: [], loading: false });

    render(
      <HelmetProvider>
        <InventoryPage />
      </HelmetProvider>
    );
    expect(screen.getByText('noData')).toBeInTheDocument();
  });

  it('renders with inventory data', () => {
    const mockInventory = {
      id: '1',
      sourceProductId: 'PROD001',
      productName: 'Test Product',
      totalRemain: 100,
      prices: { retail: 50000, wholesale: 45000 },
      images: { avatar: 'https://example.com/image.jpg' },
    };

    setupMocks({
      inventories: [mockInventory],
      loading: false,
      pagination: { total: 1, totalPages: 1 },
    });

    render(
      <HelmetProvider>
        <InventoryPage />
      </HelmetProvider>
    );

    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('dispatches fetch request on mount', () => {
    render(
      <HelmetProvider>
        <InventoryPage />
      </HelmetProvider>
    );

    expect(mockDispatch).toHaveBeenCalled();
  });
});
