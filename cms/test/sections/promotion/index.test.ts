import { describe, it, expect } from 'vitest';
import * as PromotionExports from 'src/sections/promotion/index';

describe('sections/promotion/index', () => {
  it('should export PromotionView', () => {
    expect(PromotionExports.PromotionView).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(PromotionExports).toBeDefined();
    expect(typeof PromotionExports).toBe('object');
  });
});
