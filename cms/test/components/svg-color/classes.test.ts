import { describe, it, expect } from 'vitest';
import { svgColorClasses } from 'src/components/svg-color/classes';

describe('svgColorClasses', () => {
  it('exports svgColorClasses object', () => {
    expect(svgColorClasses).toBeDefined();
    expect(typeof svgColorClasses).toBe('object');
  });

  it('has root property', () => {
    expect(svgColorClasses).toHaveProperty('root');
  });

  it('root property is a string', () => {
    expect(typeof svgColorClasses.root).toBe('string');
  });

  it('root property has correct value', () => {
    expect(svgColorClasses.root).toBe('mnl__svg__color__root');
  });

  it('root property is not empty', () => {
    expect(svgColorClasses.root).not.toBe('');
  });

  it('is immutable object structure', () => {
    expect(Object.keys(svgColorClasses)).toEqual(['root']);
  });

  it('root value follows naming convention', () => {
    expect(svgColorClasses.root).toMatch(/^mnl__[a-z_]+$/);
  });

  it('can be used as CSS class name', () => {
    expect(svgColorClasses.root).not.toContain(' ');
    expect(svgColorClasses.root).not.toContain('\n');
    expect(svgColorClasses.root).not.toContain('\t');
  });
});
