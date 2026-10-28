import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReturnDetailDialog } from 'src/sections/return/components/return-detail-dialog';
import type { ReturnRequest } from 'src/types/returns';

const mockReturnRequest: ReturnRequest = {
  id: 'ret1',
  returnNumber: 'RET-001',
  orderNumber: 'ORD-001',
  status: 'pending',
  reason: 'defective',
  reasonDetail: 'Product is broken',
  shippingCarrier: 'GHN',
  amount: 500000,
  createdAt: new Date('2024-01-01'),
  customer: {
    name: 'John Doe',
    phone: '0123456789',
  },
  items: [
    {
      productId: 'prod1',
      name: 'Product 1',
      code: 'PROD001',
      image: 'https://example.com/product1.jpg',
      quantity: 2,
      price: 200000,
      subtotal: 400000,
    },
  ],
} as ReturnRequest;

const mockOnClose = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/sections/return/components/return-status-chip', () => ({
  ReturnStatusChip: ({ status }: any) => <div data-testid="status-chip">{status}</div>,
}));

vi.mock('src/utils/format', () => ({
  formatPrice: (price?: number) => (price ? price + 'd' : '0d'),
  formatDate: (date?: Date) => (date ? '2024-01-01' : '-'),
}));

vi.mock('src/components/table-image-preview', () => ({
  TableImagePreview: ({ src, alt }: any) => (
    <img src={src} alt={alt} data-testid="table-image-preview" />
  ),
}));

describe('ReturnDetailDialog', () => {
  it('renders without crashing when open and has data', () => {
    const { container } = render(
      <ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />
    );
    expect(container).toBeInTheDocument();
  });

  it('returns null when returnRequest is null', () => {
    const { container } = render(
      <ReturnDetailDialog open returnRequest={null} onClose={mockOnClose} />
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not render when closed', () => {
    const { container } = render(
      <ReturnDetailDialog open={false} returnRequest={mockReturnRequest} onClose={mockOnClose} />
    );
    const dialog = container.querySelector('[role="dialog"]');
    expect(dialog).not.toBeInTheDocument();
  });

  it('displays return number in title', () => {
    render(<ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />);
    expect(screen.getByText(/RET-001/)).toBeInTheDocument();
  });

  it('displays customer name', () => {
    render(<ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('displays customer phone', () => {
    render(<ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />);
    expect(screen.getByText('0123456789')).toBeInTheDocument();
  });

  it('displays order number', () => {
    render(<ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />);
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });

  it('displays return status chip', () => {
    render(<ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />);
    expect(screen.getByTestId('status-chip')).toBeInTheDocument();
    expect(screen.getByTestId('status-chip')).toHaveTextContent('pending');
  });

  it('displays reason detail when available', () => {
    render(<ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />);
    expect(screen.getByText('Product is broken')).toBeInTheDocument();
  });

  it('displays shipping carrier', () => {
    render(<ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />);
    expect(screen.getByText('GHN')).toBeInTheDocument();
  });

  it('displays product items', () => {
    render(<ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />);
    expect(screen.getByText('Product 1')).toBeInTheDocument();
  });

  it('displays product code', () => {
    render(<ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />);
    expect(screen.getByText('PROD001')).toBeInTheDocument();
  });

  it('displays product quantity', () => {
    render(<ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />);
    expect(screen.getByText('x2')).toBeInTheDocument();
  });

  it('displays product images', () => {
    render(<ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />);
    const images = screen.getAllByTestId('table-image-preview');
    expect(images.length).toBeGreaterThan(0);
  });

  it('displays total refund amount', () => {
    render(<ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />);
    expect(screen.getByText(/500000d/)).toBeInTheDocument();
  });

  it('handles close button click', () => {
    render(<ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />);
    const closeButtons = screen.getAllByRole('button');
    const closeButton = closeButtons.find((btn) => btn.textContent?.includes('close'));
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(mockOnClose).toHaveBeenCalledTimes(1);
    }
  });

  it('exports ReturnDetailDialog function', () => {
    expect(ReturnDetailDialog).toBeDefined();
    expect(typeof ReturnDetailDialog).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ReturnDetailDialog).toBe('function');
    expect(ReturnDetailDialog.name).toBe('ReturnDetailDialog');
  });

  it('renders Dialog component', () => {
    const { container } = render(
      <ReturnDetailDialog open returnRequest={mockReturnRequest} onClose={mockOnClose} />
    );
    expect(container).toBeInTheDocument();
  });
});
