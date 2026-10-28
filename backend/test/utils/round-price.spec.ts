import {
  roundToNearestHundred,
  roundToNearestThousand,
  calculateDiscountAmount,
  calculateRoundedDiscountAmount,
  distributeDiscount,
  calculateCommissionAmount,
} from '../../src/utils/helpers/round-price';
import { DiscountType } from '../../src/combos/domain/discount-type.enum';

describe('round-price helpers', () => {
  describe('roundToNearestHundred', () => {
    it('should round down when remainder < 50', () => {
      expect(roundToNearestHundred(12349)).toBe(12300);
    });

    it('should round up when remainder >= 50', () => {
      expect(roundToNearestHundred(12350)).toBe(12400);
    });

    it('should return same value when already a multiple of 100', () => {
      expect(roundToNearestHundred(12300)).toBe(12300);
    });

    it('should handle zero', () => {
      expect(roundToNearestHundred(0)).toBe(0);
    });

    it('should handle small values', () => {
      expect(roundToNearestHundred(49)).toBe(0);
      expect(roundToNearestHundred(50)).toBe(100);
    });

    it('should handle large values', () => {
      expect(roundToNearestHundred(999950)).toBe(1000000);
    });

    it('should handle decimal inputs', () => {
      expect(roundToNearestHundred(12345.6)).toBe(12300);
      expect(roundToNearestHundred(12375.9)).toBe(12400);
    });
  });

  describe('roundToNearestThousand', () => {
    it('should round down when remainder < 500', () => {
      expect(roundToNearestThousand(23400)).toBe(23000);
    });

    it('should round up when remainder >= 500', () => {
      expect(roundToNearestThousand(23600)).toBe(24000);
    });

    it('should return same value when already a multiple of 1000', () => {
      expect(roundToNearestThousand(23000)).toBe(23000);
    });

    it('should handle zero', () => {
      expect(roundToNearestThousand(0)).toBe(0);
    });
  });

  describe('calculateDiscountAmount', () => {
    it('should return fixed amount capped at original price', () => {
      expect(calculateDiscountAmount(100000, DiscountType.FIXED, 20000)).toBe(
        20000,
      );
    });

    it('should cap fixed discount at original price', () => {
      expect(calculateDiscountAmount(100000, DiscountType.FIXED, 150000)).toBe(
        100000,
      );
    });

    it('should calculate percentage discount', () => {
      expect(calculateDiscountAmount(100000, DiscountType.PERCENTAGE, 20)).toBe(
        20000,
      );
    });

    it('should round percentage discount to nearest integer', () => {
      expect(calculateDiscountAmount(33333, DiscountType.PERCENTAGE, 10)).toBe(
        3333,
      );
    });
  });

  describe('calculateRoundedDiscountAmount', () => {
    it('should round percentage discount to nearest thousand', () => {
      // 100000 * 15% = 15000 -> 15000 (already multiple of 1000)
      expect(
        calculateRoundedDiscountAmount(100000, DiscountType.PERCENTAGE, 15),
      ).toBe(15000);
    });

    it('should round to nearest thousand', () => {
      // 123456 * 10% = 12346 -> roundToNearestThousand -> 12000
      expect(
        calculateRoundedDiscountAmount(123456, DiscountType.PERCENTAGE, 10),
      ).toBe(12000);
    });
  });

  describe('distributeDiscount', () => {
    it('should distribute discount proportionally based on item share', () => {
      // Item is 100k out of 200k total, discount is 50k -> item gets 25k
      expect(distributeDiscount(100000, 200000, 50000)).toBe(25000);
    });

    it('should assign full discount when item is entire order', () => {
      expect(distributeDiscount(100000, 100000, 30000)).toBe(30000);
    });

    it('should return 0 when orderSubtotal is 0', () => {
      expect(distributeDiscount(100000, 0, 50000)).toBe(0);
    });

    it('should return 0 when totalDiscount is 0', () => {
      expect(distributeDiscount(100000, 200000, 0)).toBe(0);
    });

    it('should return 0 when both are 0', () => {
      expect(distributeDiscount(100000, 0, 0)).toBe(0);
    });

    it('should round to nearest integer', () => {
      // 100k out of 300k total, discount 50k -> 16666.67 -> rounds to 16667
      expect(distributeDiscount(100000, 300000, 50000)).toBe(16667);
    });
  });

  describe('calculateCommissionAmount', () => {
    it('should calculate commission as percentage of effective subtotal', () => {
      // 100k * 10% = 10k
      expect(calculateCommissionAmount(100000, 10)).toBe(10000);
    });

    it('should return 0 when rate is 0', () => {
      expect(calculateCommissionAmount(100000, 0)).toBe(0);
    });

    it('should return 0 when subtotal is 0', () => {
      expect(calculateCommissionAmount(0, 10)).toBe(0);
    });

    it('should round to nearest integer', () => {
      // 33333 * 10% = 3333.3 -> rounds to 3333
      expect(calculateCommissionAmount(33333, 10)).toBe(3333);
    });

    it('should handle full rate', () => {
      expect(calculateCommissionAmount(100000, 100)).toBe(100000);
    });
  });
});
