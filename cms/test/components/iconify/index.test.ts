import { describe, it, expect } from 'vitest';
import * as IconifyExports from 'src/components/iconify/index';

describe('components/iconify/index', () => {
  it('should export iconify classes', () => {
    expect(IconifyExports.iconifyClasses).toBeDefined();
  });

  it('should export Iconify component', () => {
    expect(IconifyExports.Iconify).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(IconifyExports).toBeDefined();
    expect(typeof IconifyExports).toBe('object');
  });
});
