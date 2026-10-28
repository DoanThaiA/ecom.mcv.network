import { describe, it, expect } from 'vitest';
import * as exports from 'src/theme/styles/index';

describe('theme/styles/index', () => {
  it('exports utils module', () => {
    expect(exports).toHaveProperty('varAlpha');
    expect(exports).toHaveProperty('createPaletteChannel');
    expect(exports).toHaveProperty('stylesMode');
  });

  it('exports mixins module', () => {
    expect(exports).toHaveProperty('hideScrollX');
    expect(exports).toHaveProperty('hideScrollY');
    expect(exports).toHaveProperty('textGradient');
    expect(exports).toHaveProperty('bgGradient');
    expect(exports).toHaveProperty('bgBlur');
  });

  it('all utils exports are defined', () => {
    expect(exports.varAlpha).toBeDefined();
    expect(exports.createPaletteChannel).toBeDefined();
    expect(exports.stylesMode).toBeDefined();
  });

  it('all mixins exports are defined', () => {
    expect(exports.hideScrollX).toBeDefined();
    expect(exports.hideScrollY).toBeDefined();
    expect(exports.textGradient).toBeDefined();
    expect(exports.bgGradient).toBeDefined();
    expect(exports.bgBlur).toBeDefined();
  });

  it('utils exports have correct types', () => {
    expect(typeof exports.varAlpha).toBe('function');
    expect(typeof exports.createPaletteChannel).toBe('function');
    expect(typeof exports.stylesMode).toBe('object');
  });

  it('mixins hideScroll exports are objects', () => {
    expect(typeof exports.hideScrollX).toBe('object');
    expect(typeof exports.hideScrollY).toBe('object');
  });

  it('mixins function exports are functions', () => {
    expect(typeof exports.textGradient).toBe('function');
    expect(typeof exports.bgGradient).toBe('function');
    expect(typeof exports.bgBlur).toBe('function');
  });
});
