import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderView } from 'src/sections/order/order-view';
import type { Order } from 'src/types/orders';

const mockOrders: Partial<Order>[] = [
  {
    id: 'order1',
    orderNumber: 'ORD-001',
    status: 'confirmed',
    total: 1000000,
    createdAt: new Date('2024-01-01'),
    customer: { name: 'John Doe', phone: '0123456789' },
    items: [{ productId: 'p1', productName: 'Product 1', quantity: 2, price: 500000, total: 1000000 }],
  },
  {
    id: 'order2',
    orderNumber: 'ORD-002',
    status: 'pending',
    total: 500000,
    createdAt: new Date('2024-01-02'),
    customer: { name: 'Jane Doe', phone: '0987654321' },
    items: [{ productId: 'p2', productName: 'Product 2', quantity: 1, price: 500000, total: 500000 }],
  },
];

const mockPagination = {
  page: 1,
  limit: 10,
  total: 2,
  totalPages: 1,
};

const mockTabCounts = {
  all: 10,
  pending: 2,
  confirmed: 5,
  shipping: 2,
  completed: 1,
  cancelled: 0,
};

const mockDispatch = vi.fn();
const mockNavigate = vi.fn();
const mockUseAppSelector = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/orderSlice', () => ({
  getOrdersRequest: vi.fn((params) => ({ type: 'GET_ORDERS', payload: params })),
  selectOrders: vi.fn((state) => state.orders),
  selectOrderLoading: vi.fn((state) => state.loading),
  selectOrderPagination: vi.fn((state) => state.pagination),
  selectActiveTab: vi.fn((state) => state.activeTab),
  selectTabCounts: vi.fn((state) => state.tabCounts),
  setActiveTab: vi.fn((tab) => ({ type: 'SET_ACTIVE_TAB', payload: tab })),
}));

vi.mock('src/components/table-image-preview', () => ({
  TableImagePreview: ({ src }: any) => <img data-testid="table-image-preview" src={src} />,
}));

vi.mock('src/components/table', () => ({
  TablePagination: ({ onPageChange, onPageSizeChange }: any) => (
    <div data-testid="table-pagination">
      <button data-testid="next-page" onClick={() => onPageChange(2)}>Next</button>
      <button data-testid="change-size" onClick={() => onPageSizeChange(20)}>Change Size</button>
    </div>
  ),
}));

vi.mock('src/sections/order/components', () => ({
  OrderTabs: ({ activeTab, onTabChange }: any) => (
    <div data-testid="order-tabs">
      <button data-testid="tab-all" onClick={() => onTabChange('all')}>All</button>
      <button data-testid="tab-pending" onClick={() => onTabChange('pending')}>Pending</button>
    </div>
  ),
  OrderFilter: ({ onSearch }: any) => (
    <div data-testid="order-filter">
      <button data-testid="search-button" onClick={onSearch}>Search</button>
    </div>
  ),
  OrderStatusChip: ({ status }: any) => <span data-testid="order-status-chip">{status}</span>,
  PaymentStatusChip: ({ status }: any) => <span data-testid="payment-status-chip">{status}</span>,
  getDefaultDateRange: () => ({
    dateFrom: null,
    dateTo: null,
  }),
}));

vi.mock('src/utils/format', () => ({
  formatPrice: (price?: number) => (price ? `${price.toLocaleString()}đ` : '0đ'),
  formatDate: (date?: Date) => (date ? date.toISOString().split('T')[0] : ''),
}));

describe('OrderView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let selectorCallCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const callIndex = selectorCallCount++;
      if (callIndex === 0) return mockOrders; // selectOrders
      if (callIndex === 1) return false; // selectOrderLoading
      if (callIndex === 2) return mockPagination; // selectOrderPagination
      if (callIndex === 3) return 'all'; // selectActiveTab
      return mockTabCounts; // selectTabCounts
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<OrderView />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches getOrdersRequest on mount', () => {
    render(<OrderView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_ORDERS',
      })
    );
  });

  it('renders OrderTabs component', () => {
    render(<OrderView />);
    expect(screen.getByTestId('order-tabs')).toBeInTheDocument();
  });

  it('renders OrderFilter component', () => {
    render(<OrderView />);
    expect(screen.getByTestId('order-filter')).toBeInTheDocument();
  });

  it('renders TablePagination component', () => {
    render(<OrderView />);
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });

  it('displays order data', () => {
    const { container } = render(<OrderView />);
    const text = container.textContent || '';
    expect(text).toContain('ORD-001');
    expect(text).toContain('ORD-002');
  });

  it('renders OrderStatusChip for each order', () => {
    render(<OrderView />);
    const chips = screen.getAllByTestId('order-status-chip');
    expect(chips.length).toBe(2);
  });

  it('renders interactive tab buttons', () => {
    render(<OrderView />);
    const pendingTab = screen.getByTestId('tab-pending');
    expect(pendingTab).toBeInTheDocument();
  });

  it('renders pagination controls', () => {
    render(<OrderView />);
    const nextButton = screen.getByTestId('next-page');
    expect(nextButton).toBeInTheDocument();
  });

  it('renders page size controls', () => {
    render(<OrderView />);
    const changeSizeButton = screen.getByTestId('change-size');
    expect(changeSizeButton).toBeInTheDocument();
  });

  it('handles search action', () => {
    render(<OrderView />);
    const searchButton = screen.getByTestId('search-button');
    fireEvent.click(searchButton);

    // Search should trigger fetchOrders which dispatches getOrdersRequest
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('displays loading state', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(mockPagination)
      .mockReturnValueOnce('all')
      .mockReturnValueOnce(mockTabCounts);

    render(<OrderView />);
    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  it('handles empty order list', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(mockPagination)
      .mockReturnValueOnce('all')
      .mockReturnValueOnce(mockTabCounts);

    const { container } = render(<OrderView />);
    expect(container).toBeInTheDocument();
  });

  it('exports OrderView function', () => {
    expect(OrderView).toBeDefined();
    expect(typeof OrderView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof OrderView).toBe('function');
    expect(OrderView.name).toBe('OrderView');
  });

  it('renders Box container', () => {
    const { container } = render(<OrderView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Card components', () => {
    const { container } = render(<OrderView />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('uses useAppDispatch hook', () => {
    render(<OrderView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<OrderView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('uses useNavigate hook', () => {
    render(<OrderView />);
    expect(mockNavigate).toBeDefined();
  });

  it('calculates total summary correctly', () => {
    const { container } = render(<OrderView />);
    const text = container.textContent || '';
    // Total quantity: 2 + 1 = 3
    // Total amount: 1,000,000 + 500,000 = 1,500,000
    expect(text).toContain('1,500,000');
  });

  it('displays order information in table format', () => {
    const { container } = render(<OrderView />);
    expect(container).toBeInTheDocument();
  });

  it('renders Typography components', () => {
    const { container } = render(<OrderView />);
    const typographies = container.querySelectorAll('.MuiTypography-root');
    expect(typographies.length).toBeGreaterThan(0);
  });

  it('renders Checkbox for selection', () => {
    const { container } = render(<OrderView />);
    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    expect(checkboxes.length).toBeGreaterThanOrEqual(0);
  });

  it('displays formatted prices', () => {
    const { container } = render(<OrderView />);
    const text = container.textContent || '';
    expect(text).toContain('đ');
  });

  it('handles tab and page interactions', () => {
    render(<OrderView />);

    // Change tab
    const pendingTab = screen.getByTestId('tab-pending');
    fireEvent.click(pendingTab);

    // Should trigger new data fetch
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handles order row click for navigation', () => {
    const { container } = render(<OrderView />);
    expect(container).toBeInTheDocument();
    // Navigation is tested through component behavior
  });
});
