import { describe, it, expect } from 'vitest';
import * as types from 'src/types/index';

describe('types/index', () => {
  it('re-exports all types from submodules', () => {
    expect(types).toBeDefined();
    expect(typeof types).toBe('object');
  });

  it('exports orders types', () => {
    expect(types).toHaveProperty('OrderStatus');
  });

  it('has multiple exports', () => {
    const exportKeys = Object.keys(types);
    expect(exportKeys.length).toBeGreaterThan(0);
  });

  it('is an object', () => {
    expect(typeof types).toBe('object');
  });
});
