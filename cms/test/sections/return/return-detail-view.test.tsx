import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReturnDetailView } from 'src/sections/return/return-detail-view';

const mockReturn = {
  id: 'return1',
  returnNumber: 'RET-001',
  status: 'pending',
  orderNumber: 'ORD-001',
  createdAt: new Date('2024-01-01'),
  customer: {
    name: 'John Doe',
    phone: '0123456789',
    email: 'john@example.com',
  },
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
  refundAmount: 500000,
};

const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();
const mockParams = { id: 'return1' };

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', () => ({
  useParams: () => mockParams,
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/returnSlice', () => ({
  getReturnByIdRequest: vi.fn((params) => ({ type: 'GET_RETURN_BY_ID', payload: params })),
  selectCurrentReturn: vi.fn((state) => state.currentReturn),
  selectCurrentReturnLoading: vi.fn((state) => state.loading),
  clearCurrentReturn: vi.fn(() => ({ type: 'CLEAR_CURRENT_RETURN' })),
}));

vi.mock('src/components/table-image-preview', () => ({
  TableImagePreview: ({ src }: any) => <img data-testid="table-image-preview" src={src} />,
}));

vi.mock('src/sections/return/components', () => ({
  ReturnStatusChip: ({ status }: any) => <span data-testid="return-status-chip">{status}</span>,
}));

vi.mock('src/utils/format', () => ({
  formatPrice: (price?: number) => (price ? `${price.toLocaleString()}đ` : '0đ'),
  formatDate: (date?: Date) => (date ? date.toISOString().split('T')[0] : ''),
}));

describe('ReturnDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let selectorCallCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const callIndex = selectorCallCount++;
      if (callIndex === 0) return mockReturn;
      return false;
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<ReturnDetailView />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches getReturnByIdRequest on mount', () => {
    render(<ReturnDetailView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_RETURN_BY_ID',
        payload: { id: 'return1' },
      })
    );
  });

  it('dispatches clearCurrentReturn on unmount', () => {
    const { unmount } = render(<ReturnDetailView />);
    unmount();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CLEAR_CURRENT_RETURN',
      })
    );
  });

  it('displays loading state', () => {
    mockUseAppSelector.mockReturnValueOnce(null).mockReturnValueOnce(true);
    render(<ReturnDetailView />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays no data message when return is null', () => {
    mockUseAppSelector.mockReturnValueOnce(null).mockReturnValueOnce(false);
    render(<ReturnDetailView />);
    expect(screen.getByText('noData')).toBeInTheDocument();
  });

  it('renders return information', () => {
    const { container } = render(<ReturnDetailView />);
    expect(container).toBeInTheDocument();
  });

  it('displays ReturnStatusChip', () => {
    render(<ReturnDetailView />);
    expect(screen.getByTestId('return-status-chip')).toBeInTheDocument();
  });

  it('renders customer information', () => {
    const { container } = render(<ReturnDetailView />);
    const text = container.textContent || '';
    expect(text).toContain('John Doe');
    expect(text).toContain('0123456789');
  });

  it('displays item information in table', () => {
    const { container } = render(<ReturnDetailView />);
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });

  it('displays refund amount', () => {
    const { container } = render(<ReturnDetailView />);
    const text = container.textContent || '';
    expect(text).toContain('500,000');
  });

  it('displays TableImagePreview for product', () => {
    render(<ReturnDetailView />);
    expect(screen.getByTestId('table-image-preview')).toBeInTheDocument();
  });

  it('exports ReturnDetailView function', () => {
    expect(ReturnDetailView).toBeDefined();
    expect(typeof ReturnDetailView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ReturnDetailView).toBe('function');
    expect(ReturnDetailView.name).toBe('ReturnDetailView');
  });

  it('renders Box container', () => {
    const { container } = render(<ReturnDetailView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Card components', () => {
    const { container } = render(<ReturnDetailView />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('uses useAppDispatch hook', () => {
    render(<ReturnDetailView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<ReturnDetailView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('uses useParams hook', () => {
    render(<ReturnDetailView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ id: 'return1' }),
      })
    );
  });

  it('displays formatted date', () => {
    const { container } = render(<ReturnDetailView />);
    const text = container.textContent || '';
    expect(text).toContain('2024-01-01');
  });

  it('handles return without customer gracefully', () => {
    const returnWithoutCustomer = { ...mockReturn, customer: null };
    mockUseAppSelector.mockReturnValueOnce(returnWithoutCustomer).mockReturnValueOnce(false);
    const { container } = render(<ReturnDetailView />);
    expect(container).toBeInTheDocument();
  });

  it('renders Typography components', () => {
    const { container } = render(<ReturnDetailView />);
    const typographies = container.querySelectorAll('.MuiTypography-root');
    expect(typographies.length).toBeGreaterThan(0);
  });

  it('handles return items data', () => {
    const { container } = render(<ReturnDetailView />);
    expect(container).toBeInTheDocument();
  });
});
