import { describe, it, expect } from 'vitest';
import * as TopicExports from 'src/sections/topic/index';

describe('sections/topic/index', () => {
  it('should export TopicView', () => {
    expect(TopicExports.TopicView).toBeDefined();
  });

  it('should export TopicForm', () => {
    expect(TopicExports.TopicForm).toBeDefined();
  });

  it('should export TopicCreateView', () => {
    expect(TopicExports.TopicCreateView).toBeDefined();
  });

  it('should export TopicEditView', () => {
    expect(TopicExports.TopicEditView).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(TopicExports).toBeDefined();
    expect(typeof TopicExports).toBe('object');
  });
});
