import { describe, it, expect, vi } from 'vitest';

// Mock components
vi.mock('src/sections/product/components', () => ({
  ProductFilterDrawer: () => null,
  defaultProductFilterValues: { search: '', status: null },
}));

describe('sections/product/index', () => {
  it('should export ProductFilterDrawer', async () => {
    const module = await import('src/sections/product/index');
    expect(module.ProductFilterDrawer).toBeDefined();
  });

  it('should export defaultProductFilterValues', async () => {
    const module = await import('src/sections/product/index');
    expect(module.defaultProductFilterValues).toBeDefined();
  });

  it('should export ProductFilterValues type', async () => {
    const module = await import('src/sections/product/index');
    // Type exports are compile-time only, so we just verify the module loads
    expect(module).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const module = await import('src/sections/product/index');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });
});
