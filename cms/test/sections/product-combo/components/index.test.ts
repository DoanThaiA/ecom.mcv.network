import { describe, it, expect, vi } from 'vitest';

// Mock all components
vi.mock('src/sections/product-combo/components/basic-information-section', () => ({
  BasicInformationSection: () => null,
}));

vi.mock('src/sections/product-combo/components/category-autocomplete', () => ({
  CategoryAutocomplete: () => null,
}));

vi.mock('src/sections/product-combo/components/combo-sku-information-section', () => ({
  ComboSkuInformationSection: () => null,
}));

vi.mock('src/sections/product-combo/components/form-action-buttons', () => ({
  FormActionButtons: () => null,
}));

vi.mock('src/sections/product-combo/components/product-images-upload', () => ({
  ProductImagesUpload: () => null,
}));

vi.mock('src/sections/product-combo/components/sku-list-section', () => ({
  SkuListSection: () => null,
}));

describe('sections/product-combo/components/index', () => {
  it('should export BasicInformationSection', async () => {
    const module = await import('src/sections/product-combo/components/index');
    expect(module.BasicInformationSection).toBeDefined();
  });

  it('should export CategoryAutocomplete', async () => {
    const module = await import('src/sections/product-combo/components/index');
    expect(module.CategoryAutocomplete).toBeDefined();
  });

  it('should export ComboSkuInformationSection', async () => {
    const module = await import('src/sections/product-combo/components/index');
    expect(module.ComboSkuInformationSection).toBeDefined();
  });

  it('should export FormActionButtons', async () => {
    const module = await import('src/sections/product-combo/components/index');
    expect(module.FormActionButtons).toBeDefined();
  });

  it('should export ProductImagesUpload', async () => {
    const module = await import('src/sections/product-combo/components/index');
    expect(module.ProductImagesUpload).toBeDefined();
  });

  it('should export SkuListSection', async () => {
    const module = await import('src/sections/product-combo/components/index');
    expect(module.SkuListSection).toBeDefined();
  });

  it('should have all expected exports', async () => {
    const module = await import('src/sections/product-combo/components/index');
    expect(module).toBeDefined();
    expect(typeof module).toBe('object');
  });
});
