import { describe, it, expect } from 'vitest';
import * as exports from 'src/layouts/dashboard/index';

describe('layouts/dashboard/index', () => {
  it('exports DashboardLayout component', () => {
    expect(exports).toHaveProperty('DashboardLayout');
  });

  it('exports Main component', () => {
    expect(exports).toHaveProperty('Main');
  });

  it('all exports are defined', () => {
    expect(exports.DashboardLayout).toBeDefined();
    expect(exports.Main).toBeDefined();
  });

  it('all exports are functions', () => {
    expect(typeof exports.DashboardLayout).toBe('function');
    expect(typeof exports.Main).toBe('function');
  });
});
