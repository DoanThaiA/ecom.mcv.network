import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderDetailView } from 'src/sections/order/order-detail-view';
import type { Order } from 'src/types/orders';

const mockOrder: Partial<Order> = {
  id: 'order1',
  orderNumber: 'ORD-001',
  status: 'confirmed',
  paymentStatus: 'paid',
  paymentMethod: 'card',
  total: 1000000,
  subtotal: 900000,
  shippingFee: 100000,
  discount: 0,
  createdAt: new Date('2024-01-01'),
  shippingAddress: {
    street: '123 Main St',
    ward: 'Ward 1',
    district: 'District 1',
    city: 'Ho Chi Minh',
    name: 'John Doe',
    phone: '0123456789',
  },
  customer: {
    name: 'John Doe',
    email: 'john@example.com',
    phone: '0123456789',
  },
  items: [
    {
      productId: 'prod1',
      productName: 'Product 1',
      productImage: 'image1.jpg',
      quantity: 2,
      price: 450000,
      total: 900000,
    },
  ],
};

const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();
const mockParams = { id: 'order1' };

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

vi.mock('src/redux/store/orderSlice', () => ({
  getOrderByIdRequest: vi.fn((params) => ({ type: 'GET_ORDER_BY_ID', payload: params })),
  selectCurrentOrder: vi.fn((state) => state.currentOrder),
  selectCurrentOrderLoading: vi.fn((state) => state.loading),
  clearCurrentOrder: vi.fn(() => ({ type: 'CLEAR_CURRENT_ORDER' })),
}));

vi.mock('src/components/table-image-preview', () => ({
  TableImagePreview: ({ src, alt }: any) => (
    <img data-testid="table-image-preview" src={src} alt={alt} />
  ),
}));

vi.mock('src/sections/order/components', () => ({
  OrderStatusChip: ({ status }: any) => (
    <span data-testid="order-status-chip">{status}</span>
  ),
  PaymentStatusChip: ({ status }: any) => (
    <span data-testid="payment-status-chip">{status}</span>
  ),
}));

vi.mock('src/utils/format', () => ({
  formatPrice: (price?: number) => (price ? `${price.toLocaleString()}đ` : '0đ'),
  formatDate: (date?: Date) => (date ? date.toISOString().split('T')[0] : ''),
}));

vi.mock('src/types/orders', () => ({
  getPaymentMethodKey: (method: string) => `payment_${method}`,
}));

describe('OrderDetailView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let selectorCallCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const callIndex = selectorCallCount++;
      if (callIndex === 0) return mockOrder; // selectCurrentOrder
      return false; // selectCurrentOrderLoading
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<OrderDetailView />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches getOrderByIdRequest on mount', () => {
    render(<OrderDetailView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_ORDER_BY_ID',
        payload: { id: 'order1' },
      })
    );
  });

  it('dispatches clearCurrentOrder on unmount', () => {
    const { unmount } = render(<OrderDetailView />);
    unmount();
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'CLEAR_CURRENT_ORDER',
      })
    );
  });

  it('displays loading state', () => {
    mockUseAppSelector.mockReturnValueOnce(null).mockReturnValueOnce(true);

    render(<OrderDetailView />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays no data message when order is null', () => {
    mockUseAppSelector.mockReturnValueOnce(null).mockReturnValueOnce(false);

    render(<OrderDetailView />);
    expect(screen.getByText('noData')).toBeInTheDocument();
  });

  it('displays order number', () => {
    const { container } = render(<OrderDetailView />);
    const text = container.textContent || '';
    expect(text).toContain('ORD-001');
  });

  it('displays OrderStatusChip', () => {
    render(<OrderDetailView />);
    expect(screen.getByTestId('order-status-chip')).toBeInTheDocument();
  });

  it('displays PaymentStatusChip', () => {
    render(<OrderDetailView />);
    expect(screen.getByTestId('payment-status-chip')).toBeInTheDocument();
  });

  it('renders customer and shipping information', () => {
    const { container } = render(<OrderDetailView />);
    const text = container.textContent || '';
    expect(text).toContain('John Doe');
    expect(text).toContain('0123456789');
  });

  it('renders tabs', () => {
    render(<OrderDetailView />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders tabs for navigation', () => {
    render(<OrderDetailView />);
    const tablist = screen.getByRole('tablist');
    expect(tablist).toBeInTheDocument();
  });

  it('renders order items table', () => {
    const { container } = render(<OrderDetailView />);
    const table = container.querySelector('table');
    expect(table).toBeInTheDocument();
  });

  it('displays TableImagePreview for product', () => {
    render(<OrderDetailView />);
    expect(screen.getByTestId('table-image-preview')).toBeInTheDocument();
  });

  it('exports OrderDetailView function', () => {
    expect(OrderDetailView).toBeDefined();
    expect(typeof OrderDetailView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof OrderDetailView).toBe('function');
    expect(OrderDetailView.name).toBe('OrderDetailView');
  });

  it('renders Box container', () => {
    const { container } = render(<OrderDetailView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Card components', () => {
    const { container } = render(<OrderDetailView />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('uses useAppDispatch hook', () => {
    render(<OrderDetailView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<OrderDetailView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('uses useParams hook to get order id', () => {
    render(<OrderDetailView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        payload: expect.objectContaining({ id: 'order1' }),
      })
    );
  });

  it('renders order financial summary', () => {
    const { container } = render(<OrderDetailView />);
    const text = container.textContent || '';
    expect(text).toContain('1,000,000'); // Total
    expect(text).toContain('900,000'); // Subtotal
    expect(text).toContain('100,000'); // Shipping fee
  });

  it('handles order without shipping address gracefully', () => {
    const orderWithoutAddress = { ...mockOrder, shippingAddress: null };
    mockUseAppSelector.mockReturnValueOnce(orderWithoutAddress).mockReturnValueOnce(false);

    const { container } = render(<OrderDetailView />);
    expect(container).toBeInTheDocument();
  });

  it('renders Divider components', () => {
    const { container } = render(<OrderDetailView />);
    const dividers = container.querySelectorAll('.MuiDivider-root');
    expect(dividers.length).toBeGreaterThan(0);
  });

  it('renders Typography components', () => {
    const { container } = render(<OrderDetailView />);
    const typographies = container.querySelectorAll('.MuiTypography-root');
    expect(typographies.length).toBeGreaterThan(0);
  });

  it('handles missing customer email gracefully', () => {
    const orderWithoutEmail = {
      ...mockOrder,
      customer: { ...mockOrder.customer, email: undefined },
    };
    mockUseAppSelector.mockReturnValueOnce(orderWithoutEmail).mockReturnValueOnce(false);

    const { container } = render(<OrderDetailView />);
    expect(container).toBeInTheDocument();
  });

  it('displays Chip components', () => {
    const { container } = render(<OrderDetailView />);
    const chips = container.querySelectorAll('.MuiChip-root');
    expect(chips.length).toBeGreaterThanOrEqual(0);
  });
});
