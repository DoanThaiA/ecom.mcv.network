import { describe, it, expect, vi } from 'vitest';

// Mock all components to avoid DatePicker dependencies
vi.mock('src/sections/flash-sale/components/flash-sale-tabs', () => ({
  FlashSaleTabs: () => null,
}));

vi.mock('src/sections/flash-sale/components/general-info-tab', () => ({
  GeneralInfoTab: () => null,
}));

vi.mock('src/sections/flash-sale/components/product-list-tab', () => ({
  ProductListTab: () => null,
  toBulkUpdateItem: vi.fn(),
}));

describe('sections/flash-sale/components/index', () => {
  it('should export FlashSaleTabs', async () => {
    const module = await import('src/sections/flash-sale/components/index');
    expect(module.FlashSaleTabs).toBeDefined();
  });

  it('should export GeneralInfoTab', async () => {
    const module = await import('src/sections/flash-sale/components/index');
    expect(module.GeneralInfoTab).toBeDefined();
  });

  it('should export ProductListTab', async () => {
    const module = await import('src/sections/flash-sale/components/index');
    expect(module.ProductListTab).toBeDefined();
  });

  it('should export toBulkUpdateItem', async () => {
    const module = await import('src/sections/flash-sale/components/index');
    expect(module.toBulkUpdateItem).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const module = await import('src/sections/flash-sale/components/index');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });
});
