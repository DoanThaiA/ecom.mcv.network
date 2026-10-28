import { describe, it, expect } from 'vitest';
import * as exports from 'src/routes/components/index';

describe('routes/components/index', () => {
  it('exports RouterLink component', () => {
    expect(exports).toHaveProperty('RouterLink');
  });

  it('RouterLink export is defined', () => {
    expect(exports.RouterLink).toBeDefined();
  });

  it('RouterLink export is an object (forwardRef component)', () => {
    expect(typeof exports.RouterLink).toBe('object');
  });
});
