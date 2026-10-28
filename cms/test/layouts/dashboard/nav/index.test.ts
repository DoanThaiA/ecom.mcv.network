import { describe, it, expect } from 'vitest';
import * as exports from 'src/layouts/dashboard/nav/index';

describe('layouts/dashboard/nav/index', () => {
  it('exports NAV_COLORS constant', () => {
    expect(exports).toHaveProperty('NAV_COLORS');
  });

  it('exports NavContent component', () => {
    expect(exports).toHaveProperty('NavContent');
  });

  it('exports NavContentItem component', () => {
    expect(exports).toHaveProperty('NavContentItem');
  });

  it('exports NavDesktop component', () => {
    expect(exports).toHaveProperty('NavDesktop');
  });

  it('exports NavMobile component', () => {
    expect(exports).toHaveProperty('NavMobile');
  });

  it('all exports are defined', () => {
    expect(exports.NAV_COLORS).toBeDefined();
    expect(exports.NavContent).toBeDefined();
    expect(exports.NavContentItem).toBeDefined();
    expect(exports.NavDesktop).toBeDefined();
    expect(exports.NavMobile).toBeDefined();
  });

  it('NAV_COLORS is an object', () => {
    expect(typeof exports.NAV_COLORS).toBe('object');
  });

  it('component exports are functions', () => {
    expect(typeof exports.NavContent).toBe('function');
    expect(typeof exports.NavContentItem).toBe('function');
    expect(typeof exports.NavDesktop).toBe('function');
    expect(typeof exports.NavMobile).toBe('function');
  });
});
