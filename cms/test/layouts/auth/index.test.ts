import { describe, it, expect } from 'vitest';
import * as exports from 'src/layouts/auth/index';

describe('layouts/auth/index', () => {
  it('exports AuthLayout component', () => {
    expect(exports).toHaveProperty('AuthLayout');
  });

  it('exports Main component', () => {
    expect(exports).toHaveProperty('Main');
  });

  it('all exports are defined', () => {
    expect(exports.AuthLayout).toBeDefined();
    expect(exports.Main).toBeDefined();
  });

  it('all exports are functions', () => {
    expect(typeof exports.AuthLayout).toBe('function');
    expect(typeof exports.Main).toBe('function');
  });
});
