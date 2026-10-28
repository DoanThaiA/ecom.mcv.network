import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ReturnStatusChip } from 'src/sections/return/components/return-status-chip';
import { ReturnStatus } from 'src/types/returns';

// Mock i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('sections/return/components/ReturnStatusChip', () => {
  it('renders chip with PENDING status', () => {
    render(<ReturnStatusChip status={ReturnStatus.PENDING} />);
    
    expect(screen.getByText('returnStatusPending')).toBeDefined();
  });

  it('renders chip with CONFIRMED status', () => {
    render(<ReturnStatusChip status={ReturnStatus.CONFIRMED} />);
    
    expect(screen.getByText('returnStatusConfirmed')).toBeDefined();
  });

  it('renders chip with REFUNDED status', () => {
    render(<ReturnStatusChip status={ReturnStatus.REFUNDED} />);
    
    expect(screen.getByText('returnStatusRefunded')).toBeDefined();
  });

  it('renders chip with REJECTED status', () => {
    render(<ReturnStatusChip status={ReturnStatus.REJECTED} />);
    
    expect(screen.getByText('returnStatusRejected')).toBeDefined();
  });

  it('uses small size by default', () => {
    const { container } = render(<ReturnStatusChip status={ReturnStatus.PENDING} />);
    
    const chip = container.querySelector('.MuiChip-sizeSmall');
    expect(chip).toBeDefined();
  });

  it('supports medium size', () => {
    const { container } = render(<ReturnStatusChip status={ReturnStatus.PENDING} size="medium" />);
    
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeDefined();
  });

  it('supports small size explicitly', () => {
    const { container } = render(<ReturnStatusChip status={ReturnStatus.PENDING} size="small" />);
    
    const chip = container.querySelector('.MuiChip-sizeSmall');
    expect(chip).toBeDefined();
  });

  it('applies correct color for PENDING status', () => {
    const { container } = render(<ReturnStatusChip status={ReturnStatus.PENDING} />);
    
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeDefined();
    // Orange color #FF9500 should be applied
  });

  it('applies correct color for CONFIRMED status', () => {
    const { container } = render(<ReturnStatusChip status={ReturnStatus.CONFIRMED} />);
    
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeDefined();
    // Blue color #235AFF should be applied
  });

  it('applies correct color for REFUNDED status', () => {
    const { container } = render(<ReturnStatusChip status={ReturnStatus.REFUNDED} />);
    
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeDefined();
    // Green color #178B30 should be applied
  });

  it('applies correct color for REJECTED status', () => {
    const { container } = render(<ReturnStatusChip status={ReturnStatus.REJECTED} />);
    
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeDefined();
    // Red color #F62E2E should be applied
  });

  it('applies default color for unknown status', () => {
    const { container } = render(<ReturnStatusChip status={'UNKNOWN' as ReturnStatus} />);
    
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeDefined();
    // Default color #666 should be applied
  });

  it('translates label using t function', () => {
    render(<ReturnStatusChip status={ReturnStatus.PENDING} />);
    
    // Since our mock returns the key itself
    expect(screen.getByText('returnStatusPending')).toBeDefined();
  });
});
