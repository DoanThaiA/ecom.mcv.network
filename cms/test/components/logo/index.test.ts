import { describe, it, expect } from 'vitest';
import * as exports from 'src/components/logo/index';

describe('components/logo/index', () => {
  it('exports Logo component', () => {
    expect(exports).toHaveProperty('Logo');
    // Logo is a forwardRef component, which is an object
    expect(typeof exports.Logo).toBe('object');
  });

  it('exports logoClasses constant', () => {
    expect(exports).toHaveProperty('logoClasses');
    expect(typeof exports.logoClasses).toBe('object');
  });

  it('Logo is not undefined', () => {
    expect(exports.Logo).toBeDefined();
  });

  it('logoClasses is not undefined', () => {
    expect(exports.logoClasses).toBeDefined();
  });

  it('has all expected exports', () => {
    const exportKeys = Object.keys(exports);
    expect(exportKeys).toContain('Logo');
    expect(exportKeys).toContain('logoClasses');
  });
});
