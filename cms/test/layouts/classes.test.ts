import { describe, it, expect } from 'vitest';
import { layoutClasses } from 'src/layouts/classes';

describe('layoutClasses', () => {
  it('should export layoutClasses object', () => {
    expect(layoutClasses).toBeDefined();
    expect(typeof layoutClasses).toBe('object');
  });

  it('should have root class', () => {
    expect(layoutClasses.root).toBe('layout__root');
  });

  it('should have main class', () => {
    expect(layoutClasses.main).toBe('layout__main');
  });

  it('should have header class', () => {
    expect(layoutClasses.header).toBe('layout__header');
  });

  it('should have content class', () => {
    expect(layoutClasses.content).toBe('layout__main__content');
  });

  it('should have hasSidebar class', () => {
    expect(layoutClasses.hasSidebar).toBe('layout__has__sidebar');
  });

  it('should have exactly 5 properties', () => {
    expect(Object.keys(layoutClasses)).toHaveLength(5);
  });

  it('should have all string values', () => {
    Object.values(layoutClasses).forEach((value) => {
      expect(typeof value).toBe('string');
    });
  });
});
