import { describe, it, expect } from 'vitest';
import { safeLength } from '@/lib/helpers/arrayHelper';

describe('safeLength', () => {
  it('returns length for valid array', () => {
    expect(safeLength([1, 2, 3])).toBe(3);
    expect(safeLength(['a', 'b'])).toBe(2);
  });

  it('returns 0 for empty array', () => {
    expect(safeLength([])).toBe(0);
  });

  it('returns 0 for undefined', () => {
    expect(safeLength(undefined)).toBe(0);
  });

  it('returns 0 for null', () => {
    expect(safeLength(null)).toBe(0);
  });

  it('works with readonly arrays', () => {
    const readonlyArr: readonly number[] = [1, 2, 3, 4];
    expect(safeLength(readonlyArr)).toBe(4);
  });

  it('works with different types', () => {
    expect(safeLength([true, false, true])).toBe(3);
    expect(safeLength([{ id: 1 }, { id: 2 }])).toBe(2);
  });

  it('handles single element array', () => {
    expect(safeLength([1])).toBe(1);
  });
});
