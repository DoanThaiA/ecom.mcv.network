import { describe, it, expect } from 'vitest';
import { scrollbarClasses } from 'src/components/scrollbar/classes';

describe('scrollbarClasses', () => {
  it('exports scrollbarClasses object', () => {
    expect(scrollbarClasses).toBeDefined();
    expect(typeof scrollbarClasses).toBe('object');
  });

  it('has root property', () => {
    expect(scrollbarClasses).toHaveProperty('root');
  });

  it('root property is a string', () => {
    expect(typeof scrollbarClasses.root).toBe('string');
  });

  it('root property has correct value', () => {
    expect(scrollbarClasses.root).toBe('mnl__scrollbar__root');
  });

  it('root property is not empty', () => {
    expect(scrollbarClasses.root).not.toBe('');
  });

  it('is immutable object structure', () => {
    expect(Object.keys(scrollbarClasses)).toEqual(['root']);
  });

  it('root value follows naming convention', () => {
    expect(scrollbarClasses.root).toMatch(/^mnl__[a-z]+__[a-z]+$/);
  });

  it('can be used as CSS class name', () => {
    expect(scrollbarClasses.root).not.toContain(' ');
    expect(scrollbarClasses.root).not.toContain('\n');
    expect(scrollbarClasses.root).not.toContain('\t');
  });
});
