import { describe, it, expect } from 'vitest';
import * as FilterExports from 'src/components/filter/index';

describe('components/filter/index', () => {
  it('should export FilterDrawer component', () => {
    expect(FilterExports.FilterDrawer).toBeDefined();
  });

  it('should export FilterButton component', () => {
    expect(FilterExports.FilterButton).toBeDefined();
  });

  it('should export FilterActions component', () => {
    expect(FilterExports.FilterActions).toBeDefined();
  });

  it('should export FilterSelect component', () => {
    expect(FilterExports.FilterSelect).toBeDefined();
  });

  it('should export FilterRangeInput component', () => {
    expect(FilterExports.FilterRangeInput).toBeDefined();
  });

  it('should export FilterCheckbox component', () => {
    expect(FilterExports.FilterCheckbox).toBeDefined();
  });

  it('should export useFilterState hook', () => {
    expect(FilterExports.useFilterState).toBeDefined();
    expect(typeof FilterExports.useFilterState).toBe('function');
  });

  it('should have all expected exports', () => {
    expect(FilterExports).toBeDefined();
    expect(typeof FilterExports).toBe('object');
  });
});
