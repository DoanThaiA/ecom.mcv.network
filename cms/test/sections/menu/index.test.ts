import { describe, it, expect } from 'vitest';
import * as MenuExports from 'src/sections/menu/index';

describe('sections/menu/index', () => {
  it('should export MenuView', () => {
    expect(MenuExports.MenuView).toBeDefined();
  });

  it('should have all expected exports', () => {
    expect(MenuExports).toBeDefined();
    expect(typeof MenuExports).toBe('object');
  });
});
