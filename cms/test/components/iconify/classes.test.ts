import { describe, it, expect } from 'vitest';
import { iconifyClasses } from 'src/components/iconify/classes';

describe('iconifyClasses', () => {
  it('exports iconifyClasses object', () => {
    expect(iconifyClasses).toBeDefined();
    expect(typeof iconifyClasses).toBe('object');
  });

  it('has root property', () => {
    expect(iconifyClasses).toHaveProperty('root');
  });

  it('has flag property', () => {
    expect(iconifyClasses).toHaveProperty('flag');
  });

  it('root property is a string', () => {
    expect(typeof iconifyClasses.root).toBe('string');
  });

  it('flag property is a string', () => {
    expect(typeof iconifyClasses.flag).toBe('string');
  });

  it('root property has correct value', () => {
    expect(iconifyClasses.root).toBe('mnl__icon__root');
  });

  it('flag property has correct value', () => {
    expect(iconifyClasses.flag).toBe('mnl__icon__flag');
  });

  it('root property is not empty', () => {
    expect(iconifyClasses.root).not.toBe('');
  });

  it('flag property is not empty', () => {
    expect(iconifyClasses.flag).not.toBe('');
  });

  it('has exactly 2 properties', () => {
    expect(Object.keys(iconifyClasses)).toHaveLength(2);
  });

  it('has correct property keys', () => {
    expect(Object.keys(iconifyClasses)).toEqual(['root', 'flag']);
  });

  it('root value follows naming convention', () => {
    expect(iconifyClasses.root).toMatch(/^mnl__[a-z]+__[a-z]+$/);
  });

  it('flag value follows naming convention', () => {
    expect(iconifyClasses.flag).toMatch(/^mnl__[a-z]+__[a-z]+$/);
  });

  it('can be used as CSS class names', () => {
    expect(iconifyClasses.root).not.toContain(' ');
    expect(iconifyClasses.flag).not.toContain(' ');
    expect(iconifyClasses.root).not.toContain('\n');
    expect(iconifyClasses.flag).not.toContain('\n');
  });
});
