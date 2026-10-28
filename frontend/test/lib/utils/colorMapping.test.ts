import { describe, it, expect } from 'vitest';
import { getColorHex } from '@/lib/utils/colorVariantRenderer';

describe('getColorHex', () => {
  it('returns correct hex for basic colors', () => {
    expect(getColorHex('Đen')).toBe('#000000');
    expect(getColorHex('Trắng')).toBe('#FFFFFF');
    expect(getColorHex('Đỏ')).toBe('#FF0000');
  });

  it('is case-insensitive', () => {
    expect(getColorHex('ĐEN')).toBe('#000000');
    expect(getColorHex('TRẮNG')).toBe('#FFFFFF');
    expect(getColorHex('đen')).toBe('#000000');
    expect(getColorHex('Đen')).toBe('#000000');
  });

  it('trims whitespace', () => {
    expect(getColorHex('  đen  ')).toBe('#000000');
    expect(getColorHex('trắng ')).toBe('#FFFFFF');
    expect(getColorHex(' xám')).toBe('#808080');
  });

  it('handles multi-word color names', () => {
    expect(getColorHex('Xanh dương')).toBe('#0000FF');
    expect(getColorHex('Xanh da trời')).toBe('#87CEEB');
    expect(getColorHex('Xanh lá cây')).toBe('#228B22');
  });

  it('returns default color for unknown names', () => {
    expect(getColorHex('unknown')).toBe('#CCCCCC');
    expect(getColorHex('invalid color')).toBe('#CCCCCC');
    expect(getColorHex('')).toBe('#CCCCCC');
  });

  it('handles colors with different casing', () => {
    expect(getColorHex('XANH DƯƠNG')).toBe('#0000FF');
    expect(getColorHex('xanh dương')).toBe('#0000FF');
    expect(getColorHex('Xanh Dương')).toBe('#0000FF');
  });

  it('handles empty string', () => {
    expect(getColorHex('')).toBe('#CCCCCC');
  });

  it('handles whitespace only', () => {
    expect(getColorHex('   ')).toBe('#CCCCCC');
  });

  it('normalizes before lookup', () => {
    expect(getColorHex('  ĐEN  ')).toBe('#000000');
    expect(getColorHex('XANH LÁ')).toBe('#00FF00');
  });
});
