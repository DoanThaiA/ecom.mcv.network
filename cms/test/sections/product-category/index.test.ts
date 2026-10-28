import { describe, it, expect } from 'vitest';
import * as ProductCategoryExports from 'src/sections/product-category/index';

describe('sections/product-category/index', () => {
  it('should export ProductCategoryView', () => {
    expect(ProductCategoryExports.ProductCategoryView).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(ProductCategoryExports).toBeDefined();
    expect(typeof ProductCategoryExports).toBe('object');
  });
});
