import { describe, it, expect } from 'vitest';
import * as exports from 'src/theme/core/index';

describe('theme/core/index', () => {
  it('exports shadows module', () => {
    expect(exports).toHaveProperty('shadows');
  });

  it('exports palette components', () => {
    expect(exports).toHaveProperty('basePalette');
    expect(exports).toHaveProperty('lightPalette');
    expect(exports).toHaveProperty('darkPalette');
    expect(exports).toHaveProperty('colorSchemes');
  });

  it('exports typography module', () => {
    expect(exports).toHaveProperty('typography');
    expect(exports).toHaveProperty('primaryFont');
    expect(exports).toHaveProperty('secondaryFont');
  });

  it('exports components module', () => {
    expect(exports).toHaveProperty('components');
  });

  it('exports customShadows module', () => {
    expect(exports).toHaveProperty('customShadows');
  });

  it('all exports are defined', () => {
    expect(exports.shadows).toBeDefined();
    expect(exports.basePalette).toBeDefined();
    expect(exports.lightPalette).toBeDefined();
    expect(exports.darkPalette).toBeDefined();
    expect(exports.colorSchemes).toBeDefined();
    expect(exports.typography).toBeDefined();
    expect(exports.components).toBeDefined();
    expect(exports.customShadows).toBeDefined();
  });

  it('typography exports have correct types', () => {
    expect(typeof exports.typography).toBe('object');
    expect(typeof exports.primaryFont).toBe('string');
    expect(typeof exports.secondaryFont).toBe('string');
  });

  it('palette exports are objects', () => {
    expect(typeof exports.basePalette).toBe('object');
    expect(typeof exports.lightPalette).toBe('object');
    expect(typeof exports.darkPalette).toBe('object');
    expect(typeof exports.colorSchemes).toBe('object');
  });

  it('shadows export is a function', () => {
    expect(typeof exports.shadows).toBe('function');
  });

  it('components export is an object', () => {
    expect(typeof exports.components).toBe('object');
  });

  it('customShadows export is a function', () => {
    expect(typeof exports.customShadows).toBe('function');
  });
});
