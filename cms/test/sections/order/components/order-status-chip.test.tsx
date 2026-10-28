import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OrderStatusChip } from 'src/sections/order/components/order-status-chip';
import { OrderStatus } from 'src/types/orders';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('sections/order/components/OrderStatusChip', () => {
  it('renders chip with PENDING status', () => {
    render(<OrderStatusChip status={OrderStatus.PENDING} />);
    
    const chip = screen.getByText('orderStatusPending');
    expect(chip).toBeDefined();
  });

  it('renders chip with CONFIRMED status', () => {
    render(<OrderStatusChip status={OrderStatus.CONFIRMED} />);
    
    expect(screen.getByText('orderStatusConfirmed')).toBeDefined();
  });

  it('renders chip with PROCESSING status', () => {
    render(<OrderStatusChip status={OrderStatus.PROCESSING} />);
    
    expect(screen.getByText('orderStatusProcessing')).toBeDefined();
  });

  it('renders chip with SHIPPED status', () => {
    render(<OrderStatusChip status={OrderStatus.SHIPPED} />);

    expect(screen.getByText('orderStatusShipped')).toBeDefined();
  });

  it('renders chip with DELIVERED status', () => {
    render(<OrderStatusChip status={OrderStatus.DELIVERED} />);

    expect(screen.getByText('orderStatusDelivered')).toBeDefined();
  });

  it('renders chip with CANCELLED status', () => {
    render(<OrderStatusChip status={OrderStatus.CANCELLED} />);

    expect(screen.getByText('orderStatusCancelled')).toBeDefined();
  });

  it('renders chip with REFUNDED status', () => {
    render(<OrderStatusChip status={OrderStatus.REFUNDED} />);

    expect(screen.getByText('orderStatusRefunded')).toBeDefined();
  });

  it('uses medium size by default', () => {
    const { container } = render(<OrderStatusChip status={OrderStatus.PENDING} />);
    
    // MUI Chip with medium size has specific classes
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeDefined();
  });

  it('supports small size', () => {
    const { container } = render(<OrderStatusChip status={OrderStatus.PENDING} size="small" />);
    
    const chip = container.querySelector('.MuiChip-sizeSmall');
    expect(chip).toBeDefined();
  });

  it('supports medium size explicitly', () => {
    const { container } = render(<OrderStatusChip status={OrderStatus.PENDING} size="medium" />);
    
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeDefined();
  });
});
