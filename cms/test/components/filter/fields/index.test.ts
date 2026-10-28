import { describe, it, expect } from 'vitest';
import * as FieldsExports from 'src/components/filter/fields/index';

describe('components/filter/fields/index', () => {
  it('should export FilterSelect component', () => {
    expect(FieldsExports.FilterSelect).toBeDefined();
  });

  it('should export FilterRangeInput component', () => {
    expect(FieldsExports.FilterRangeInput).toBeDefined();
  });

  it('should export FilterCheckbox component', () => {
    expect(FieldsExports.FilterCheckbox).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(FieldsExports).toBeDefined();
    expect(typeof FieldsExports).toBe('object');
  });
});
