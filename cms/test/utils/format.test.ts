import { describe, it, expect, vi } from 'vitest';
import { formatPrice, formatNumber, formatDate, formatDateTime, toISOString } from 'src/utils/format';

describe('format utils', () => {
  describe('formatPrice', () => {
    it('formats number with Vietnamese locale', () => expect(formatPrice(1000000)).toBe('1.000.000đ'));
    it('formats zero', () => expect(formatPrice(0)).toBe('0đ'));
    it('formats decimal', () => expect(formatPrice(1500.5)).toBe('1.500,5đ'));
    it('returns -- for null', () => expect(formatPrice(null)).toBe('--'));
    it('returns -- for undefined', () => expect(formatPrice(undefined)).toBe('--'));
  });

  describe('formatNumber', () => {
    it('formats number with thousand separators', () => expect(formatNumber(1000000)).toBe('1.000.000'));
    it('formats zero', () => expect(formatNumber(0)).toBe('0'));
    it('formats decimal', () => expect(formatNumber(1500.5)).toBe('1.500,5'));
    it('returns -- for null', () => expect(formatNumber(null)).toBe('--'));
    it('returns -- for undefined', () => expect(formatNumber(undefined)).toBe('--'));
  });

  describe('formatDate', () => {
    it('formats date with default format', () => expect(formatDate('2024-12-25T14:30:00Z')).toMatch(/25\/12\/2024/));
    it('formats date with custom format', () => expect(formatDate('2024-12-25', 'DD/MM/YYYY')).toBe('25/12/2024'));
    it('formats with time format', () => expect(formatDate('2024-12-25T14:30:00Z', 'HH:mm')).toMatch(/\d{2}:\d{2}/));
  });

  describe('formatDateTime', () => {
    it('formats datetime in Vietnamese locale', () => {
      const result = formatDateTime('2024-12-25T14:30:00Z');
      expect(result).toMatch(/\d{2}:\d{2}/);
      expect(result).toMatch(/25\/12\/2024/);
    });
  });

  describe('toISOString', () => {
    it('returns null for undefined', () => expect(toISOString(undefined)).toBeNull());
    it('returns ISO string for Date object', () => {
      const date = new Date('2024-12-25T14:30:00Z');
      expect(toISOString(date)).toBe('2024-12-25T14:30:00.000Z');
    });
    it('returns same string for ISO string input', () => {
      const isoStr = '2024-12-25T14:30:00Z';
      expect(toISOString(isoStr)).toBe(isoStr);
    });
    it('returns string for any string value', () => {
      expect(toISOString('2024-01-01')).toBe('2024-01-01');
    });
  });
});
