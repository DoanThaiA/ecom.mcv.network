import { describe, it, expect } from 'vitest';
import {
  safeLength,
  safeFirst,
  safeLast,
  isEmpty,
  isNotEmpty,
  safeMap,
  safeFilter,
  safeFind,
} from 'src/utils/array';

describe('array utils', () => {
  describe('safeLength', () => {
    it('returns 0 for null', () => expect(safeLength(null)).toBe(0));
    it('returns 0 for undefined', () => expect(safeLength(undefined)).toBe(0));
    it('returns 0 for empty array', () => expect(safeLength([])).toBe(0));
    it('returns correct length for array', () => expect(safeLength([1, 2, 3])).toBe(3));
  });

  describe('safeFirst', () => {
    it('returns undefined for null', () => expect(safeFirst(null)).toBeUndefined());
    it('returns undefined for undefined', () => expect(safeFirst(undefined)).toBeUndefined());
    it('returns undefined for empty array', () => expect(safeFirst([])).toBeUndefined());
    it('returns first element', () => expect(safeFirst([1, 2, 3])).toBe(1));
  });

  describe('safeLast', () => {
    it('returns undefined for null', () => expect(safeLast(null)).toBeUndefined());
    it('returns undefined for undefined', () => expect(safeLast(undefined)).toBeUndefined());
    it('returns undefined for empty array', () => expect(safeLast([])).toBeUndefined());
    it('returns last element', () => expect(safeLast([1, 2, 3])).toBe(3));
  });

  describe('isEmpty', () => {
    it('returns true for null', () => expect(isEmpty(null)).toBe(true));
    it('returns true for undefined', () => expect(isEmpty(undefined)).toBe(true));
    it('returns true for empty array', () => expect(isEmpty([])).toBe(true));
    it('returns false for non-empty array', () => expect(isEmpty([1])).toBe(false));
  });

  describe('isNotEmpty', () => {
    it('returns false for null', () => expect(isNotEmpty(null)).toBe(false));
    it('returns false for undefined', () => expect(isNotEmpty(undefined)).toBe(false));
    it('returns false for empty array', () => expect(isNotEmpty([])).toBe(false));
    it('returns true for non-empty array', () => expect(isNotEmpty([1])).toBe(true));
  });

  describe('safeMap', () => {
    it('returns empty array for null', () => expect(safeMap(null, (x) => x * 2)).toEqual([]));
    it('returns empty array for undefined', () => expect(safeMap(undefined, (x) => x * 2)).toEqual([]));
    it('returns empty array for empty array', () => expect(safeMap([], (x) => x * 2)).toEqual([]));
    it('maps elements correctly', () => expect(safeMap([1, 2, 3], (x) => x * 2)).toEqual([2, 4, 6]));
    it('provides index to callback', () => expect(safeMap([10, 20], (_, i) => i)).toEqual([0, 1]));
  });

  describe('safeFilter', () => {
    it('returns empty array for null', () => expect(safeFilter(null, (x) => x > 0)).toEqual([]));
    it('returns empty array for undefined', () => expect(safeFilter(undefined, (x) => x > 0)).toEqual([]));
    it('returns empty array for empty array', () => expect(safeFilter([], (x) => x > 0)).toEqual([]));
    it('filters elements correctly', () => expect(safeFilter([1, 2, 3], (x) => x > 1)).toEqual([2, 3]));
    it('provides index to callback', () => expect(safeFilter([1, 2, 3], (_, i) => i > 0)).toEqual([2, 3]));
  });

  describe('safeFind', () => {
    it('returns undefined for null', () => expect(safeFind(null, (x) => x === 2)).toBeUndefined());
    it('returns undefined for undefined', () => expect(safeFind(undefined, (x) => x === 2)).toBeUndefined());
    it('returns undefined for empty array', () => expect(safeFind([], (x) => x === 2)).toBeUndefined());
    it('returns undefined when not found', () => expect(safeFind([1, 3], (x) => x === 2)).toBeUndefined());
    it('returns found element', () => expect(safeFind([1, 2, 3], (x) => x === 2)).toBe(2));
    it('provides index to callback', () => expect(safeFind([10, 20, 30], (_, i) => i === 1)).toBe(20));
  });
});
