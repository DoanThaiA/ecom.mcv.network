import { describe, it, expect } from 'vitest';
import * as exports from 'src/routes/hooks/index';

describe('routes/hooks/index', () => {
  it('exports useRouter hook', () => {
    expect(exports).toHaveProperty('useRouter');
  });

  it('exports usePathname hook', () => {
    expect(exports).toHaveProperty('usePathname');
  });

  it('all exports are defined', () => {
    expect(exports.useRouter).toBeDefined();
    expect(exports.usePathname).toBeDefined();
  });

  it('all exports are functions', () => {
    expect(typeof exports.useRouter).toBe('function');
    expect(typeof exports.usePathname).toBe('function');
  });
});
