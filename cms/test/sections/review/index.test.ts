import { describe, it, expect } from 'vitest';
import * as ReviewExports from 'src/sections/review/index';

describe('sections/review/index', () => {
  it('should export ReviewView', () => {
    expect(ReviewExports.ReviewView).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(ReviewExports).toBeDefined();
    expect(typeof ReviewExports).toBe('object');
  });
});
