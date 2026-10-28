import { describe, it, expect } from 'vitest';
import {
  formatPrice,
  formatNumber,
  formatPercentage,
  formatTime,
  formatCountdown,
  formatDate,
  formatPriceRange,
  calculateFlashSalePrice,
  calculateFlashSaleDiscount,
} from '@/lib/utils/format';
import { DiscountType } from '@/types/gen/shared/shared/common/enums';

describe('formatPrice', () => {
  it('formats valid price with VND currency', () => {
    expect(formatPrice(299000)).toBe('299.000đ');
    expect(formatPrice(1000)).toBe('1.000đ');
    expect(formatPrice(0)).toBe('0đ');
  });

  it('handles invalid inputs', () => {
    expect(formatPrice(NaN)).toBe('0đ');
    expect(formatPrice(Number('invalid') as number)).toBe('0đ');
  });

  it('formats large numbers correctly', () => {
    expect(formatPrice(1234567)).toBe('1.234.567đ');
  });

  it('formats decimal numbers', () => {
    expect(formatPrice(299000.5)).toBe('299.000,5đ');
  });
});

describe('formatNumber', () => {
  it('formats number without decimals by default', () => {
    expect(formatNumber(1234567)).toBe('1.234.567');
    expect(formatNumber(0)).toBe('0');
  });

  it('formats number with specified decimals', () => {
    expect(formatNumber(1234.5678, 2)).toBe('1.234,57');
    expect(formatNumber(1000, 2)).toBe('1.000,00');
  });

  it('handles invalid inputs', () => {
    expect(formatNumber(NaN)).toBe('0');
    expect(formatNumber(Number('invalid') as number)).toBe('0');
  });

  it('handles zero decimals explicitly', () => {
    expect(formatNumber(1234.56, 0)).toBe('1.235');
  });
});

describe('formatPercentage', () => {
  it('formats percentage without decimals by default', () => {
    expect(formatPercentage(25)).toBe('25%');
    expect(formatPercentage(0)).toBe('0%');
    expect(formatPercentage(100)).toBe('100%');
  });

  it('formats percentage with decimals', () => {
    expect(formatPercentage(25.5, 1)).toBe('25.5%');
    expect(formatPercentage(33.333, 2)).toBe('33.33%');
  });

  it('handles invalid inputs', () => {
    expect(formatPercentage(NaN)).toBe('0%');
    expect(formatPercentage(Number('invalid') as number)).toBe('0%');
  });
});

describe('formatTime', () => {
  it('formats time in MM:SS format', () => {
    expect(formatTime(330)).toBe('05:30');
    expect(formatTime(60)).toBe('01:00');
    expect(formatTime(0)).toBe('00:00');
  });

  it('handles single digit seconds and minutes', () => {
    expect(formatTime(5)).toBe('00:05');
    expect(formatTime(65)).toBe('01:05');
  });

  it('handles large numbers', () => {
    expect(formatTime(3600)).toBe('60:00');
    expect(formatTime(7265)).toBe('121:05');
  });

  it('handles invalid inputs', () => {
    expect(formatTime(-1)).toBe('00:00');
    expect(formatTime(NaN)).toBe('00:00');
    expect(formatTime(Number('invalid') as number)).toBe('00:00');
  });
});

describe('formatCountdown', () => {
  it('formats countdown in HH:MM:SS format', () => {
    expect(formatCountdown(3665)).toEqual({
      hours: '01',
      minutes: '01',
      seconds: '05',
    });
  });

  it('handles zero time', () => {
    expect(formatCountdown(0)).toEqual({
      hours: '00',
      minutes: '00',
      seconds: '00',
    });
  });

  it('handles large numbers', () => {
    expect(formatCountdown(7265)).toEqual({
      hours: '02',
      minutes: '01',
      seconds: '05',
    });
  });

  it('formats single digit values with padding', () => {
    expect(formatCountdown(3665)).toEqual({
      hours: '01',
      minutes: '01',
      seconds: '05',
    });
  });

  it('handles invalid inputs', () => {
    expect(formatCountdown(-1)).toEqual({
      hours: '00',
      minutes: '00',
      seconds: '00',
    });
    expect(formatCountdown(NaN)).toEqual({
      hours: '00',
      minutes: '00',
      seconds: '00',
    });
  });

  it('handles hours greater than 24', () => {
    expect(formatCountdown(90000)).toEqual({
      hours: '25',
      minutes: '00',
      seconds: '00',
    });
  });
});

describe('formatDate', () => {
  it('formats date in short format (dd/mm/yyyy)', () => {
    const date = new Date('2024-12-31');
    const result = formatDate(date, 'short');
    expect(result).toMatch(/31\/12\/2024/);
  });

  it('formats date in long format (dd/mm/yyyy HH:mm)', () => {
    const date = new Date('2024-12-31T15:30:00');
    const result = formatDate(date, 'long');
    expect(result).toMatch(/31\/12\/2024/);
    expect(result).toMatch(/15:30/);
  });

  it('formats string date input', () => {
    const result = formatDate('2024-12-31', 'short');
    expect(result).toMatch(/31\/12\/2024/);
  });

  it('handles invalid date inputs', () => {
    expect(formatDate('invalid')).toBe('');
    expect(formatDate(new Date('invalid'))).toBe('');
  });

  it('uses short format by default', () => {
    const date = new Date('2024-12-31');
    const shortResult = formatDate(date);
    const explicitShort = formatDate(date, 'short');
    expect(shortResult).toBe(explicitShort);
  });
});

describe('formatPriceRange', () => {
  it('formats price range correctly', () => {
    expect(formatPriceRange(100000, 500000)).toBe('100.000đ — 500.000đ');
  });

  it('handles same min and max', () => {
    expect(formatPriceRange(100000, 100000)).toBe('100.000đ — 100.000đ');
  });

  it('handles zero values', () => {
    expect(formatPriceRange(0, 100000)).toBe('0đ — 100.000đ');
  });
});

describe('calculateFlashSalePrice', () => {
  it('calculates percentage discount correctly', () => {
    expect(
      calculateFlashSalePrice(100000, DiscountType.DISCOUNT_TYPE_PERCENTAGE, 20)
    ).toBe(80000);
    expect(
      calculateFlashSalePrice(100000, DiscountType.DISCOUNT_TYPE_PERCENTAGE, 50)
    ).toBe(50000);
  });

  it('calculates fixed discount correctly', () => {
    expect(
      calculateFlashSalePrice(100000, DiscountType.DISCOUNT_TYPE_FIXED, 20000)
    ).toBe(80000);
  });

  it('handles edge cases for percentage discount', () => {
    expect(
      calculateFlashSalePrice(100000, DiscountType.DISCOUNT_TYPE_PERCENTAGE, 100)
    ).toBe(0);
    expect(
      calculateFlashSalePrice(100000, DiscountType.DISCOUNT_TYPE_PERCENTAGE, 0)
    ).toBe(100000);
  });

  it('handles edge cases for fixed discount', () => {
    expect(
      calculateFlashSalePrice(100000, DiscountType.DISCOUNT_TYPE_FIXED, 150000)
    ).toBe(0);
    expect(
      calculateFlashSalePrice(100000, DiscountType.DISCOUNT_TYPE_FIXED, 0)
    ).toBe(100000);
  });

  it('handles invalid inputs', () => {
    expect(
      calculateFlashSalePrice(0, DiscountType.DISCOUNT_TYPE_PERCENTAGE, 20)
    ).toBe(0);
    expect(
      calculateFlashSalePrice(-100, DiscountType.DISCOUNT_TYPE_PERCENTAGE, 20)
    ).toBe(0);
  });

  it('rounds percentage discount results', () => {
    expect(
      calculateFlashSalePrice(99999, DiscountType.DISCOUNT_TYPE_PERCENTAGE, 33.33)
    ).toBe(66669);
  });

  it('handles negative discount for fixed type', () => {
    expect(
      calculateFlashSalePrice(100000, DiscountType.DISCOUNT_TYPE_FIXED, -20000)
    ).toBe(100000);
  });
});

describe('calculateFlashSaleDiscount', () => {
  it('returns percentage as-is for percentage discount type', () => {
    expect(
      calculateFlashSaleDiscount(100000, DiscountType.DISCOUNT_TYPE_PERCENTAGE, 25)
    ).toBe(25);
    expect(
      calculateFlashSaleDiscount(100000, DiscountType.DISCOUNT_TYPE_PERCENTAGE, 50)
    ).toBe(50);
  });

  it('calculates percentage from fixed amount', () => {
    expect(
      calculateFlashSaleDiscount(100000, DiscountType.DISCOUNT_TYPE_FIXED, 25000)
    ).toBe(25);
    expect(
      calculateFlashSaleDiscount(100000, DiscountType.DISCOUNT_TYPE_FIXED, 50000)
    ).toBe(50);
  });

  it('handles invalid inputs', () => {
    expect(
      calculateFlashSaleDiscount(0, DiscountType.DISCOUNT_TYPE_PERCENTAGE, 20)
    ).toBe(0);
    expect(
      calculateFlashSaleDiscount(-100, DiscountType.DISCOUNT_TYPE_PERCENTAGE, 20)
    ).toBe(0);
    expect(
      calculateFlashSaleDiscount(100000, DiscountType.DISCOUNT_TYPE_PERCENTAGE, 0)
    ).toBe(0);
    expect(
      calculateFlashSaleDiscount(100000, DiscountType.DISCOUNT_TYPE_PERCENTAGE, -20)
    ).toBe(0);
  });

  it('rounds the result', () => {
    expect(
      calculateFlashSaleDiscount(100000, DiscountType.DISCOUNT_TYPE_FIXED, 33333)
    ).toBe(33);
    expect(
      calculateFlashSaleDiscount(100000, DiscountType.DISCOUNT_TYPE_PERCENTAGE, 25.7)
    ).toBe(26);
  });

  it('handles discount greater than price for fixed type', () => {
    expect(
      calculateFlashSaleDiscount(100000, DiscountType.DISCOUNT_TYPE_FIXED, 150000)
    ).toBe(150);
  });
});
