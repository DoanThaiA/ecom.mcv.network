import { describe, it, expect } from 'vitest';
import { logoClasses } from 'src/components/logo/classes';

describe('logoClasses', () => {
  it('exports logoClasses object', () => {
    expect(logoClasses).toBeDefined();
    expect(typeof logoClasses).toBe('object');
  });

  it('has root property', () => {
    expect(logoClasses).toHaveProperty('root');
  });

  it('root has correct className', () => {
    expect(logoClasses.root).toBe('mnl__logo__root');
  });

  it('root is a string', () => {
    expect(typeof logoClasses.root).toBe('string');
  });
});
