import { describe, it, expect } from 'vitest';
import { NAV_COLORS } from 'src/layouts/dashboard/nav/nav-colors';

describe('layouts/dashboard/nav/nav-colors', () => {
  it('exports NAV_COLORS object', () => {
    expect(NAV_COLORS).toBeDefined();
    expect(typeof NAV_COLORS).toBe('object');
  });

  it('has bg color', () => {
    expect(NAV_COLORS.bg).toBe('#243874');
  });

  it('has bgHover color', () => {
    expect(NAV_COLORS.bgHover).toBe('rgba(255, 255, 255, 0.05)');
  });

  it('has bgActive color', () => {
    expect(NAV_COLORS.bgActive).toBe('rgba(255, 255, 255, 0.1)');
  });

  it('has bgChildArea color', () => {
    expect(NAV_COLORS.bgChildArea).toBe('rgba(0, 0, 0, 0.1)');
  });

  it('has bgChildActive color', () => {
    expect(NAV_COLORS.bgChildActive).toBe('rgba(255, 255, 255, 0.08)');
  });

  it('has text color', () => {
    expect(NAV_COLORS.text).toBe('rgba(255, 255, 255, 0.7)');
  });

  it('has textHover color', () => {
    expect(NAV_COLORS.textHover).toBe('rgba(255, 255, 255, 0.9)');
  });

  it('has textActive color', () => {
    expect(NAV_COLORS.textActive).toBe('#FFFFFF');
  });

  it('has textChild color', () => {
    expect(NAV_COLORS.textChild).toBe('rgba(255, 255, 255, 0.6)');
  });

  it('has accent color', () => {
    expect(NAV_COLORS.accent).toBe('#40C4FF');
  });

  it('has border color', () => {
    expect(NAV_COLORS.border).toBe('rgba(255, 255, 255, 0.06)');
  });

  it('all color values are strings', () => {
    Object.values(NAV_COLORS).forEach((color) => {
      expect(typeof color).toBe('string');
    });
  });

  it('has exactly 11 color properties', () => {
    expect(Object.keys(NAV_COLORS)).toHaveLength(11);
  });
});
