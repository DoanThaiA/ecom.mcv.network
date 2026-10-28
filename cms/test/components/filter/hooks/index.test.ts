import { describe, it, expect } from 'vitest';
import * as HooksExports from 'src/components/filter/hooks/index';

describe('components/filter/hooks/index', () => {
  it('should export useFilterState hook', () => {
    expect(HooksExports.useFilterState).toBeDefined();
    expect(typeof HooksExports.useFilterState).toBe('function');
  });

  it('should have all expected exports', () => {
    expect(HooksExports).toBeDefined();
    expect(typeof HooksExports).toBe('object');
  });
});
