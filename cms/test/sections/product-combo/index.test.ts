import { describe, it, expect, vi } from 'vitest';

// Mock all components
vi.mock('src/sections/product-combo/product-combo-view', () => ({
  ProductComboView: () => null,
}));

vi.mock('src/sections/product-combo/product-combo-create-view', () => ({
  ProductComboCreateView: () => null,
}));

vi.mock('src/sections/product-combo/product-combo-edit-view', () => ({
  ProductComboEditView: () => null,
}));

vi.mock('src/sections/product-combo/product-combo-form', () => ({
  ProductComboForm: () => null,
}));

describe('sections/product-combo/index', () => {
  it('should export ProductComboView', async () => {
    const module = await import('src/sections/product-combo/index');
    expect(module.ProductComboView).toBeDefined();
  });

  it('should export ProductComboCreateView', async () => {
    const module = await import('src/sections/product-combo/index');
    expect(module.ProductComboCreateView).toBeDefined();
  });

  it('should export ProductComboEditView', async () => {
    const module = await import('src/sections/product-combo/index');
    expect(module.ProductComboEditView).toBeDefined();
  });

  it('should export ProductComboForm', async () => {
    const module = await import('src/sections/product-combo/index');
    expect(module.ProductComboForm).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const module = await import('src/sections/product-combo/index');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });
});
