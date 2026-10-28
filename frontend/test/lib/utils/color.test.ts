import { describe, it, expect } from 'vitest';
import { colorNameToHex, getColorHex } from '@/lib/utils/color';

describe('colorNameToHex', () => {
  it('exports a record of Vietnamese color names to hex codes', () => {
    expect(colorNameToHex).toBeDefined();
    expect(typeof colorNameToHex).toBe('object');
  });

  it('contains correct hex codes for common colors', () => {
    expect(colorNameToHex['Đen']).toBe('#000000');
    expect(colorNameToHex['Trắng']).toBe('#FFFFFF');
    expect(colorNameToHex['Đỏ']).toBe('#FF0000');
    expect(colorNameToHex['Xanh']).toBe('#2563EB');
    expect(colorNameToHex['Xanh lá']).toBe('#00FF00');
    expect(colorNameToHex['Xám']).toBe('#808080');
    expect(colorNameToHex['Hồng']).toBe('#FFC0CB');
    expect(colorNameToHex['Vàng']).toBe('#FFFF00');
    expect(colorNameToHex['Nâu']).toBe('#8B4513');
    expect(colorNameToHex['Be']).toBe('#F5F5DC');
    expect(colorNameToHex['Cam']).toBe('#FFA500');
    expect(colorNameToHex['Tím']).toBe('#800080');
  });

  it('has 12 color mappings', () => {
    expect(Object.keys(colorNameToHex)).toHaveLength(12);
  });
});

describe('getColorHex', () => {
  it('returns correct hex code for known Vietnamese color names', () => {
    expect(getColorHex('Đen')).toBe('#000000');
    expect(getColorHex('Trắng')).toBe('#FFFFFF');
    expect(getColorHex('Đỏ')).toBe('#FF0000');
    expect(getColorHex('Xanh')).toBe('#2563EB');
  });

  it('returns default color #CCCCCC for unknown color names', () => {
    expect(getColorHex('Unknown')).toBe('#CCCCCC');
    expect(getColorHex('Invalid')).toBe('#CCCCCC');
    expect(getColorHex('')).toBe('#CCCCCC');
  });

  it('is case-sensitive', () => {
    expect(getColorHex('đen')).toBe('#CCCCCC'); // lowercase
    expect(getColorHex('Đen')).toBe('#000000'); // correct case
  });

  it('handles all mapped colors', () => {
    Object.keys(colorNameToHex).forEach((colorName) => {
      expect(getColorHex(colorName)).toBe(colorNameToHex[colorName]);
    });
  });
});
