import { describe, it, expect } from 'vitest';
import * as exports from 'src/components/svg-color/index';

describe('components/svg-color/index', () => {
  it('exports svgColorClasses constant', () => {
    expect(exports).toHaveProperty('svgColorClasses');
    expect(typeof exports.svgColorClasses).toBe('object');
  });

  it('exports SvgColor component', () => {
    expect(exports).toHaveProperty('SvgColor');
    // SvgColor is a forwardRef component, which is an object
    expect(typeof exports.SvgColor).toBe('object');
  });

  it('svgColorClasses is not undefined', () => {
    expect(exports.svgColorClasses).toBeDefined();
  });

  it('SvgColor is not undefined', () => {
    expect(exports.SvgColor).toBeDefined();
  });

  it('has all expected exports', () => {
    const exportKeys = Object.keys(exports);
    expect(exportKeys).toContain('svgColorClasses');
    expect(exportKeys).toContain('SvgColor');
  });
});
