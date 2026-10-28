import { describe, it, expect } from 'vitest';
import { getSortFromValue } from '@/lib/utils/sort';

describe('getSortFromValue', () => {
  describe('valid sort values', () => {
    it('parses price-asc correctly', () => {
      expect(getSortFromValue('price-asc')).toEqual({
        orderBy: 'price',
        order: 'asc',
      });
    });

    it('parses price-desc correctly', () => {
      expect(getSortFromValue('price-desc')).toEqual({
        orderBy: 'price',
        order: 'desc',
      });
    });

    it('parses name-asc correctly', () => {
      expect(getSortFromValue('name-asc')).toEqual({
        orderBy: 'name',
        order: 'asc',
      });
    });

    it('parses name-desc correctly', () => {
      expect(getSortFromValue('name-desc')).toEqual({
        orderBy: 'name',
        order: 'desc',
      });
    });

    it('parses createdAt-asc correctly', () => {
      expect(getSortFromValue('createdAt-asc')).toEqual({
        orderBy: 'createdAt',
        order: 'asc',
      });
    });

    it('parses createdAt-desc correctly', () => {
      expect(getSortFromValue('createdAt-desc')).toEqual({
        orderBy: 'createdAt',
        order: 'desc',
      });
    });

    it('parses discount-asc correctly', () => {
      expect(getSortFromValue('discount-asc')).toEqual({
        orderBy: 'discount',
        order: 'asc',
      });
    });

    it('parses discount-desc correctly', () => {
      expect(getSortFromValue('discount-desc')).toEqual({
        orderBy: 'discount',
        order: 'desc',
      });
    });

    it('parses discountPercent-asc correctly', () => {
      expect(getSortFromValue('discountPercent-asc')).toEqual({
        orderBy: 'discountPercent',
        order: 'asc',
      });
    });

    it('parses discountPercent-desc correctly', () => {
      expect(getSortFromValue('discountPercent-desc')).toEqual({
        orderBy: 'discountPercent',
        order: 'desc',
      });
    });
  });

  describe('default value', () => {
    it('returns undefined for "default"', () => {
      expect(getSortFromValue('default')).toBeUndefined();
    });
  });

  describe('invalid values', () => {
    it('returns undefined for value without dash', () => {
      expect(getSortFromValue('price')).toBeUndefined();
      expect(getSortFromValue('name')).toBeUndefined();
    });

    it('returns undefined for invalid orderBy', () => {
      expect(getSortFromValue('invalid-asc')).toBeUndefined();
      expect(getSortFromValue('category-desc')).toBeUndefined();
    });

    it('returns undefined for invalid order', () => {
      expect(getSortFromValue('price-invalid')).toBeUndefined();
      expect(getSortFromValue('name-up')).toBeUndefined();
    });

    it('returns undefined for both invalid orderBy and order', () => {
      expect(getSortFromValue('invalid-invalid')).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      expect(getSortFromValue('')).toBeUndefined();
    });

    it('returns undefined for malformed values', () => {
      expect(getSortFromValue('-')).toBeUndefined();
      expect(getSortFromValue('--')).toBeUndefined();
      expect(getSortFromValue('price-')).toBeUndefined();
      expect(getSortFromValue('-asc')).toBeUndefined();
    });
  });

  describe('edge cases', () => {
    it('handles value with multiple dashes (uses last dash)', () => {
      expect(getSortFromValue('discount-percent-asc')).toBeUndefined();
    });

    it('is case-sensitive for orderBy', () => {
      expect(getSortFromValue('Price-asc')).toBeUndefined();
      expect(getSortFromValue('PRICE-asc')).toBeUndefined();
    });

    it('is case-sensitive for order', () => {
      expect(getSortFromValue('price-ASC')).toBeUndefined();
      expect(getSortFromValue('price-Asc')).toBeUndefined();
    });
  });

  describe('all valid combinations', () => {
    const validOrderBy = ['name', 'price', 'createdAt', 'discount', 'discountPercent'];
    const validOrder = ['asc', 'desc'];

    it('validates all valid orderBy and order combinations', () => {
      validOrderBy.forEach((orderBy) => {
        validOrder.forEach((order) => {
          const value = `${orderBy}-${order}`;
          expect(getSortFromValue(value)).toEqual({ orderBy, order });
        });
      });
    });
  });
});
