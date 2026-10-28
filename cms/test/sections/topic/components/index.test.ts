import { describe, it, expect } from 'vitest';
import * as TopicComponentsExports from 'src/sections/topic/components/index';

describe('sections/topic/components/index', () => {
  it('should export TopicGeneralTab', () => {
    expect(TopicComponentsExports.TopicGeneralTab).toBeDefined();
  });

  it('should export TopicProductsTab', () => {
    expect(TopicComponentsExports.TopicProductsTab).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(TopicComponentsExports).toBeDefined();
    expect(typeof TopicComponentsExports).toBe('object');
  });
});
