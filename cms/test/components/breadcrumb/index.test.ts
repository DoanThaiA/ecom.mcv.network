import { describe, it, expect } from 'vitest';
import * as exports from 'src/components/breadcrumb/index';

describe('components/breadcrumb/index', () => {
  it('exports Breadcrumb component', () => {
    expect(exports).toHaveProperty('Breadcrumb');
    expect(typeof exports.Breadcrumb).toBe('function');
  });

  it('has only the expected exports', () => {
    const exportKeys = Object.keys(exports);
    expect(exportKeys).toEqual(['Breadcrumb']);
  });

  it('Breadcrumb export is not undefined', () => {
    expect(exports.Breadcrumb).toBeDefined();
  });
});
