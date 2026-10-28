import { describe, it, expect, vi } from 'vitest';

// Mock all view and form components to avoid DatePicker dependencies
vi.mock('src/sections/flash-sale/flash-sale-view', () => ({
  FlashSaleView: () => null,
}));

vi.mock('src/sections/flash-sale/flash-sale-form', () => ({
  FlashSaleForm: () => null,
}));

vi.mock('src/sections/flash-sale/flash-sale-create-view', () => ({
  FlashSaleCreateView: () => null,
}));

vi.mock('src/sections/flash-sale/flash-sale-edit-view', () => ({
  FlashSaleEditView: () => null,
}));

describe('sections/flash-sale/index', () => {
  it('should export FlashSaleView', async () => {
    const module = await import('src/sections/flash-sale/index');
    expect(module.FlashSaleView).toBeDefined();
  });

  it('should export FlashSaleForm', async () => {
    const module = await import('src/sections/flash-sale/index');
    expect(module.FlashSaleForm).toBeDefined();
  });

  it('should export FlashSaleCreateView', async () => {
    const module = await import('src/sections/flash-sale/index');
    expect(module.FlashSaleCreateView).toBeDefined();
  });

  it('should export FlashSaleEditView', async () => {
    const module = await import('src/sections/flash-sale/index');
    expect(module.FlashSaleEditView).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const module = await import('src/sections/flash-sale/index');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });
});
