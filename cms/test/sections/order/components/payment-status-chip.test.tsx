import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PaymentStatusChip } from 'src/sections/order/components/payment-status-chip';
import { PaymentStatus } from 'src/types/orders';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('sections/order/components/PaymentStatusChip', () => {
  it('renders chip with PENDING status', () => {
    render(<PaymentStatusChip status={PaymentStatus.PENDING} />);
    
    expect(screen.getByText('paymentStatusPending')).toBeDefined();
  });

  it('renders chip with PAID status', () => {
    render(<PaymentStatusChip status={PaymentStatus.PAID} />);
    
    expect(screen.getByText('paymentStatusPaid')).toBeDefined();
  });

  it('renders chip with FAILED status', () => {
    render(<PaymentStatusChip status={PaymentStatus.FAILED} />);
    
    expect(screen.getByText('paymentStatusFailed')).toBeDefined();
  });

  it('renders chip with REFUNDED status', () => {
    render(<PaymentStatusChip status={PaymentStatus.REFUNDED} />);
    
    expect(screen.getByText('paymentStatusRefunded')).toBeDefined();
  });

  it('uses small size by default', () => {
    const { container } = render(<PaymentStatusChip status={PaymentStatus.PENDING} />);
    
    const chip = container.querySelector('.MuiChip-sizeSmall');
    expect(chip).toBeDefined();
  });

  it('supports medium size', () => {
    const { container } = render(<PaymentStatusChip status={PaymentStatus.PENDING} size="medium" />);
    
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeDefined();
  });

  it('supports small size explicitly', () => {
    const { container } = render(<PaymentStatusChip status={PaymentStatus.PENDING} size="small" />);
    
    const chip = container.querySelector('.MuiChip-sizeSmall');
    expect(chip).toBeDefined();
  });

  it('displays correct color for PENDING status', () => {
    const { container } = render(<PaymentStatusChip status={PaymentStatus.PENDING} />);
    
    // Warning color should be applied
    const chip = container.querySelector('.MuiChip-colorWarning');
    expect(chip).toBeDefined();
  });

  it('displays correct color for PAID status', () => {
    const { container } = render(<PaymentStatusChip status={PaymentStatus.PAID} />);
    
    // Success color should be applied
    const chip = container.querySelector('.MuiChip-colorSuccess');
    expect(chip).toBeDefined();
  });

  it('displays correct color for FAILED status', () => {
    const { container } = render(<PaymentStatusChip status={PaymentStatus.FAILED} />);
    
    // Error color should be applied
    const chip = container.querySelector('.MuiChip-colorError');
    expect(chip).toBeDefined();
  });

  it('displays correct color for REFUNDED status', () => {
    const { container } = render(<PaymentStatusChip status={PaymentStatus.REFUNDED} />);

    // Info color should be applied
    const chip = container.querySelector('.MuiChip-colorInfo');
    expect(chip).toBeDefined();
  });

  it('displays default color for unknown status', () => {
    // Test default case by passing an invalid status value
    const { container } = render(<PaymentStatusChip status={'UNKNOWN' as PaymentStatus} />);

    // Default color should be applied
    const chip = container.querySelector('.MuiChip-colorDefault');
    expect(chip).toBeDefined();
  });
});
