import { describe, it, expect, vi } from 'vitest';

// Mock the view components to avoid complex dependencies
vi.mock('src/sections/order/order-view', () => ({
  OrderView: () => null,
}));

vi.mock('src/sections/order/order-detail-view', () => ({
  OrderDetailView: () => null,
}));

describe('sections/order/index', () => {
  it('should export OrderView', async () => {
    const module = await import('src/sections/order/index');
    expect(module.OrderView).toBeDefined();
  });

  it('should export OrderDetailView', async () => {
    const module = await import('src/sections/order/index');
    expect(module.OrderDetailView).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const module = await import('src/sections/order/index');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });
});
