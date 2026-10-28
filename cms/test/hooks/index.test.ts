import { describe, it, expect } from 'vitest';
import * as exports from 'src/hooks/index';

describe('hooks/index', () => {
  it('exports useBreadcrumbSync hook', () => {
    expect(exports).toHaveProperty('useBreadcrumbSync');
  });

  it('exports useColumnVisibilityPersistence hook', () => {
    expect(exports).toHaveProperty('useColumnVisibilityPersistence');
  });

  it('exports useDialog hook', () => {
    expect(exports).toHaveProperty('useDialog');
  });

  it('all exports are defined', () => {
    expect(exports.useBreadcrumbSync).toBeDefined();
    expect(exports.useColumnVisibilityPersistence).toBeDefined();
    expect(exports.useDialog).toBeDefined();
  });

  it('all exports are functions', () => {
    expect(typeof exports.useBreadcrumbSync).toBe('function');
    expect(typeof exports.useColumnVisibilityPersistence).toBe('function');
    expect(typeof exports.useDialog).toBe('function');
  });
});
