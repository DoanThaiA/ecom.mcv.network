import { describe, it, expect } from 'vitest';
import * as exports from 'src/components/dialog/index';

describe('components/dialog/index', () => {
  it('exports DeleteConfirmDialog component', () => {
    expect(exports).toHaveProperty('DeleteConfirmDialog');
    expect(typeof exports.DeleteConfirmDialog).toBe('function');
  });

  it('exports ProductSelectionDialog component', () => {
    expect(exports).toHaveProperty('ProductSelectionDialog');
    expect(typeof exports.ProductSelectionDialog).toBe('function');
  });

  it('has all expected component exports', () => {
    const exportKeys = Object.keys(exports).sort();
    expect(exportKeys).toContain('DeleteConfirmDialog');
    expect(exportKeys).toContain('ProductSelectionDialog');
    expect(exportKeys.length).toBe(2);
  });

  it('DeleteConfirmDialog is not undefined', () => {
    expect(exports.DeleteConfirmDialog).toBeDefined();
  });

  it('ProductSelectionDialog is not undefined', () => {
    expect(exports.ProductSelectionDialog).toBeDefined();
  });
});
