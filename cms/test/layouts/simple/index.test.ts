import { describe, it, expect } from 'vitest';
import * as exports from 'src/layouts/simple/index';

describe('layouts/simple/index', () => {
  it('exports SimpleLayout component', () => {
    expect(exports).toHaveProperty('SimpleLayout');
  });

  it('SimpleLayout export is defined', () => {
    expect(exports.SimpleLayout).toBeDefined();
  });

  it('SimpleLayout export is a function', () => {
    expect(typeof exports.SimpleLayout).toBe('function');
  });
});
