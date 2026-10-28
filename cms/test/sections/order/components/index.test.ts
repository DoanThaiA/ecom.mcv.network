import { describe, it, expect, vi } from 'vitest';

// Mock all components
vi.mock('src/sections/order/components/order-filter', () => ({
  OrderFilter: () => null,
}));

vi.mock('src/sections/order/components/order-status-chip', () => ({
  OrderStatusChip: () => null,
}));

vi.mock('src/sections/order/components/order-tabs', () => ({
  OrderTabs: () => null,
}));

vi.mock('src/sections/order/components/payment-status-chip', () => ({
  PaymentStatusChip: () => null,
}));

describe('sections/order/components/index', () => {
  it('should export OrderFilter', async () => {
    const module = await import('src/sections/order/components/index');
    expect(module.OrderFilter).toBeDefined();
  });

  it('should export OrderStatusChip', async () => {
    const module = await import('src/sections/order/components/index');
    expect(module.OrderStatusChip).toBeDefined();
  });

  it('should export OrderTabs', async () => {
    const module = await import('src/sections/order/components/index');
    expect(module.OrderTabs).toBeDefined();
  });

  it('should export PaymentStatusChip', async () => {
    const module = await import('src/sections/order/components/index');
    expect(module.PaymentStatusChip).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const module = await import('src/sections/order/components/index');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });
});
