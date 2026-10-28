import { describe, it, expect } from 'vitest';
import * as NewsExports from 'src/sections/news/index';

describe('sections/news/index', () => {
  it('should export NewsView', () => {
    expect(NewsExports.NewsView).toBeDefined();
  });

  it('should export NewsForm', () => {
    expect(NewsExports.NewsForm).toBeDefined();
  });

  it('should export NewsCreateView', () => {
    expect(NewsExports.NewsCreateView).toBeDefined();
  });

  it('should export NewsEditView', () => {
    expect(NewsExports.NewsEditView).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(NewsExports).toBeDefined();
    expect(typeof NewsExports).toBe('object');
  });
});
