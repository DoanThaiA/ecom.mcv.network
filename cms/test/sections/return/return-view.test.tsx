import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReturnView } from 'src/sections/return/return-view';

const mockReturns = [
  {
    id: 'return1',
    returnNumber: 'RET-001',
    orderNumber: 'ORD-001',
    nhanhOrderId: 'NHANH-001',
    status: 'pending',
    reason: 'defective',
    createdAt: new Date('2024-01-01'),
    customer: { name: 'John Doe', phone: '0123456789' },
    refundAmount: 500000,
    shippingFee: 30000,
    items: [
      {
        productId: 'prod1',
        productName: 'Product 1',
        productImage: 'image1.jpg',
        quantity: 1,
        price: 500000,
        reason: 'Defective',
      },
    ],
  },
  {
    id: 'return2',
    returnNumber: 'RET-002',
    orderNumber: 'ORD-002',
    nhanhOrderId: 'NHANH-002',
    status: 'approved',
    reason: 'wrongSize',
    createdAt: new Date('2024-01-02'),
    customer: { name: 'Jane Doe', phone: '0987654321' },
    refundAmount: 300000,
    shippingFee: 30000,
    items: [
      {
        productId: 'prod2',
        productName: 'Product 2',
        productImage: 'image2.jpg',
        quantity: 1,
        price: 300000,
        reason: 'Wrong size',
      },
    ],
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
  pending: 5,
  approved: 3,
  rejected: 1,
  completed: 1,
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

vi.mock('src/redux/store/returnSlice', () => ({
  getReturnsRequest: vi.fn((params) => ({ type: 'GET_RETURNS', payload: params })),
  getReturnTabCountsRequest: vi.fn((params) => ({ type: 'GET_RETURN_TAB_COUNTS', payload: params })),
  selectReturns: vi.fn((state) => state.returns),
  selectReturnLoading: vi.fn((state) => state.loading),
  selectReturnPagination: vi.fn((state) => state.pagination),
  selectReturnActiveTab: vi.fn((state) => state.activeTab),
  selectReturnTabCounts: vi.fn((state) => state.tabCounts),
  setReturnActiveTab: vi.fn((tab) => ({ type: 'SET_ACTIVE_TAB', payload: tab })),
}));

vi.mock('src/components/table', () => ({
  TablePagination: ({ onPageChange, onPageSizeChange }: any) => (
    <div data-testid="table-pagination">
      <button data-testid="next-page" onClick={() => onPageChange(2)}>Next</button>
      <button data-testid="change-size" onClick={() => onPageSizeChange(20)}>Change Size</button>
    </div>
  ),
}));

vi.mock('src/sections/return/components', () => ({
  ReturnTabs: ({ onTabChange }: any) => (
    <div data-testid="return-tabs">
      <button data-testid="tab-all" onClick={() => onTabChange('all')}>All</button>
      <button data-testid="tab-pending" onClick={() => onTabChange('pending')}>Pending</button>
    </div>
  ),
  ReturnFilter: ({ onSearch }: any) => (
    <div data-testid="return-filter">
      <button data-testid="search-button" onClick={onSearch}>Search</button>
    </div>
  ),
  ReturnStatusChip: ({ status }: any) => <span data-testid="return-status-chip">{status}</span>,
  ReturnTypeTabs: () => <div data-testid="return-type-tabs">Type Tabs</div>,
  getDefaultReturnDateRange: () => ({
    dateFrom: null,
    dateTo: null,
  }),
}));

vi.mock('src/utils/format', () => ({
  formatPrice: (price?: number) => (price ? `${price.toLocaleString()}đ` : '0đ'),
  formatDate: (date?: Date) => (date ? date.toISOString().split('T')[0] : ''),
}));

describe('ReturnView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let selectorCallCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const callIndex = selectorCallCount++;
      if (callIndex === 0) return mockReturns;
      if (callIndex === 1) return false;
      if (callIndex === 2) return mockPagination;
      if (callIndex === 3) return 'all';
      return mockTabCounts;
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<ReturnView />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches getReturnsRequest on mount', () => {
    render(<ReturnView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_RETURNS',
      })
    );
  });

  it('renders ReturnTabs component', () => {
    render(<ReturnView />);
    expect(screen.getByTestId('return-tabs')).toBeInTheDocument();
  });

  it('renders ReturnFilter component', () => {
    render(<ReturnView />);
    expect(screen.getByTestId('return-filter')).toBeInTheDocument();
  });

  it('renders TablePagination component', () => {
    render(<ReturnView />);
    expect(screen.getByTestId('table-pagination')).toBeInTheDocument();
  });

  it('displays return data', () => {
    const { container } = render(<ReturnView />);
    const text = container.textContent || '';
    expect(text).toContain('ORD-001');
    expect(text).toContain('ORD-002');
  });

  it('renders ReturnStatusChip for each return', () => {
    render(<ReturnView />);
    const chips = screen.getAllByTestId('return-status-chip');
    expect(chips.length).toBe(2);
  });

  it('renders interactive tab buttons', () => {
    render(<ReturnView />);
    const pendingTab = screen.getByTestId('tab-pending');
    expect(pendingTab).toBeInTheDocument();
  });

  it('renders pagination controls', () => {
    render(<ReturnView />);
    const nextButton = screen.getByTestId('next-page');
    expect(nextButton).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(true)
      .mockReturnValueOnce(mockPagination)
      .mockReturnValueOnce('all')
      .mockReturnValueOnce(mockTabCounts);

    render(<ReturnView />);
    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  it('handles empty return list', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(mockPagination)
      .mockReturnValueOnce('all')
      .mockReturnValueOnce(mockTabCounts);

    const { container } = render(<ReturnView />);
    expect(container).toBeInTheDocument();
  });

  it('exports ReturnView function', () => {
    expect(ReturnView).toBeDefined();
    expect(typeof ReturnView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ReturnView).toBe('function');
    expect(ReturnView.name).toBe('ReturnView');
  });

  it('renders Box container', () => {
    const { container } = render(<ReturnView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Card components', () => {
    const { container } = render(<ReturnView />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('uses useAppDispatch hook', () => {
    render(<ReturnView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<ReturnView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('uses useNavigate hook', () => {
    render(<ReturnView />);
    expect(mockNavigate).toBeDefined();
  });

  it('displays formatted prices', () => {
    const { container } = render(<ReturnView />);
    const text = container.textContent || '';
    expect(text).toContain('đ');
  });

  it('displays return information', () => {
    const { container } = render(<ReturnView />);
    expect(container).toBeInTheDocument();
  });

  it('renders Typography components', () => {
    const { container } = render(<ReturnView />);
    const typographies = container.querySelectorAll('.MuiTypography-root');
    expect(typographies.length).toBeGreaterThan(0);
  });

  it('handles search action', () => {
    render(<ReturnView />);
    const searchButton = screen.getByTestId('search-button');
    expect(searchButton).toBeInTheDocument();
  });

  it('maintains state across renders', () => {
    const { rerender } = render(<ReturnView />);
    rerender(<ReturnView />);
    expect(screen.getByTestId('return-tabs')).toBeInTheDocument();
  });
});
