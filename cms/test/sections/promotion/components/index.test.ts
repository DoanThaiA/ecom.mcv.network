import { describe, it, expect } from 'vitest';
import * as PromotionComponentsExports from 'src/sections/promotion/components/index';

describe('sections/promotion/components/index', () => {
  it('should export PromotionTypeCards', () => {
    expect(PromotionComponentsExports.PromotionTypeCards).toBeDefined();
  });

  it('should export PromotionListTable', () => {
    expect(PromotionComponentsExports.PromotionListTable).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(PromotionComponentsExports).toBeDefined();
    expect(typeof PromotionComponentsExports).toBe('object');
  });
});
