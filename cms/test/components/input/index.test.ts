import { describe, it, expect } from 'vitest';
import * as exports from 'src/components/input/index';

describe('components/input/index', () => {
  it('exports Input component', () => {
    expect(exports).toHaveProperty('Input');
    expect(typeof exports.Input).toBe('object');
  });

  it('exports InputCommon component', () => {
    expect(exports).toHaveProperty('InputCommon');
    expect(typeof exports.InputCommon).toBe('function');
  });

  it('Input is not undefined', () => {
    expect(exports.Input).toBeDefined();
  });

  it('InputCommon is not undefined', () => {
    expect(exports.InputCommon).toBeDefined();
  });

  it('has all expected exports', () => {
    const exportKeys = Object.keys(exports).sort();
    expect(exportKeys).toEqual(['Input', 'InputCommon']);
  });
});
