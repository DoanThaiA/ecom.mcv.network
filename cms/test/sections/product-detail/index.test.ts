import { describe, it, expect, vi } from 'vitest';

// Mock all components
vi.mock('src/sections/product-detail/product-detail-view', () => ({
  ProductDetailView: () => null,
}));

vi.mock('src/sections/product-detail/product-info-tab', () => ({
  ProductInfoTab: () => null,
}));

vi.mock('src/sections/product-detail/product-inventory-tab', () => ({
  ProductInventoryTab: () => null,
}));

vi.mock('src/sections/product-detail/product-website-settings-tab', () => ({
  ProductWebsiteSettingsTab: () => null,
}));

describe('sections/product-detail/index', () => {
  it('should export ProductDetailView', async () => {
    const module = await import('src/sections/product-detail/index');
    expect(module.ProductDetailView).toBeDefined();
  });

  it('should export ProductInfoTab', async () => {
    const module = await import('src/sections/product-detail/index');
    expect(module.ProductInfoTab).toBeDefined();
  });

  it('should export ProductInventoryTab', async () => {
    const module = await import('src/sections/product-detail/index');
    expect(module.ProductInventoryTab).toBeDefined();
  });

  it('should export ProductWebsiteSettingsTab', async () => {
    const module = await import('src/sections/product-detail/index');
    expect(module.ProductWebsiteSettingsTab).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const module = await import('src/sections/product-detail/index');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });
});
