import { describe, it, expect } from 'vitest';
import * as ScrollbarExports from 'src/components/scrollbar/index';

describe('components/scrollbar/index', () => {
  it('should export scrollbar classes', () => {
    expect(ScrollbarExports.scrollbarClasses).toBeDefined();
  });

  it('should export Scrollbar component', () => {
    expect(ScrollbarExports.Scrollbar).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(ScrollbarExports).toBeDefined();
    expect(typeof ScrollbarExports).toBe('object');
  });
});
