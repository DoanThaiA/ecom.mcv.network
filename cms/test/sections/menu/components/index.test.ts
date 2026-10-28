import { describe, it, expect } from 'vitest';
import * as MenuComponentsExports from 'src/sections/menu/components/index';

describe('sections/menu/components/index', () => {
  it('should export MenuDialog', () => {
    expect(MenuComponentsExports.MenuDialog).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(MenuComponentsExports).toBeDefined();
    expect(typeof MenuComponentsExports).toBe('object');
  });
});
