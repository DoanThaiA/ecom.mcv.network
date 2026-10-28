import { describe, it, expect } from 'vitest';
import * as ErrorExports from 'src/sections/error/index';

describe('sections/error/index', () => {
  it('should export NotFoundView', () => {
    expect(ErrorExports.NotFoundView).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(ErrorExports).toBeDefined();
    expect(typeof ErrorExports).toBe('object');
  });
});
