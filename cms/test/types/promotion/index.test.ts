import { describe, it, expect } from 'vitest';
import * as types from 'src/types/promotion/index';

describe('types/promotion/index', () => {
  it('re-exports all promotion types', () => {
    expect(types).toBeDefined();
    expect(typeof types).toBe('object');
  });

  it('exports PromotionType enum', () => {
    expect(types).toHaveProperty('PromotionType');
  });

  it('exports PromotionStatus enum', () => {
    expect(types).toHaveProperty('PromotionStatus');
  });

  it('exports helper functions', () => {
    expect(types).toHaveProperty('promotionStatusToKey');
    expect(types).toHaveProperty('getPromotionStatusColor');
    expect(types).toHaveProperty('promotionTypeToKey');
  });

  it('has multiple exports', () => {
    const exportKeys = Object.keys(types);
    expect(exportKeys.length).toBeGreaterThan(10);
  });

  it('helper functions are functions', () => {
    expect(typeof types.promotionStatusToKey).toBe('function');
    expect(typeof types.getPromotionStatusColor).toBe('function');
    expect(typeof types.promotionTypeToKey).toBe('function');
  });
});
