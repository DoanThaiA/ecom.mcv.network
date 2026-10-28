import {
  ShippingPromotionStatus,
  computeShippingPromotionStatus,
} from '../../../src/shipping-promotions/domain/shipping-promotion-status.enum';

describe('computeShippingPromotionStatus', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-06-15T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('DISABLED status', () => {
    it('should return DISABLED when isEnabled is false regardless of time', () => {
      const startTime = new Date('2025-06-01T00:00:00Z');
      const endTime = new Date('2025-06-30T23:59:59Z');

      const result = computeShippingPromotionStatus(startTime, endTime, false);

      expect(result).toBe(ShippingPromotionStatus.DISABLED);
    });

    it('should return DISABLED even when within time range but disabled', () => {
      const startTime = new Date('2025-06-10T00:00:00Z');
      const endTime = new Date('2025-06-20T23:59:59Z');

      const result = computeShippingPromotionStatus(startTime, endTime, false);

      expect(result).toBe(ShippingPromotionStatus.DISABLED);
    });
  });

  describe('UPCOMING status', () => {
    it('should return UPCOMING when current time is before start time', () => {
      const startTime = new Date('2025-06-20T00:00:00Z');
      const endTime = new Date('2025-06-30T23:59:59Z');

      const result = computeShippingPromotionStatus(startTime, endTime, true);

      expect(result).toBe(ShippingPromotionStatus.UPCOMING);
    });
  });

  describe('ENDED status', () => {
    it('should return ENDED when current time is after end time', () => {
      const startTime = new Date('2025-05-01T00:00:00Z');
      const endTime = new Date('2025-06-01T23:59:59Z');

      const result = computeShippingPromotionStatus(startTime, endTime, true);

      expect(result).toBe(ShippingPromotionStatus.ENDED);
    });
  });

  describe('ACTIVE status', () => {
    it('should return ACTIVE when enabled and within time range', () => {
      const startTime = new Date('2025-06-01T00:00:00Z');
      const endTime = new Date('2025-06-30T23:59:59Z');

      const result = computeShippingPromotionStatus(startTime, endTime, true);

      expect(result).toBe(ShippingPromotionStatus.ACTIVE);
    });

    it('should return ACTIVE at exact start time', () => {
      const startTime = new Date('2025-06-15T12:00:00Z');
      const endTime = new Date('2025-06-30T23:59:59Z');

      const result = computeShippingPromotionStatus(startTime, endTime, true);

      expect(result).toBe(ShippingPromotionStatus.ACTIVE);
    });

    it('should return ACTIVE at exact end time', () => {
      const startTime = new Date('2025-06-01T00:00:00Z');
      const endTime = new Date('2025-06-15T12:00:00Z');

      const result = computeShippingPromotionStatus(startTime, endTime, true);

      expect(result).toBe(ShippingPromotionStatus.ACTIVE);
    });
  });

  describe('edge cases', () => {
    it('should handle same start and end time at current time', () => {
      const time = new Date('2025-06-15T12:00:00Z');

      const result = computeShippingPromotionStatus(time, time, true);

      expect(result).toBe(ShippingPromotionStatus.ACTIVE);
    });

    it('should prioritize DISABLED over time checks', () => {
      const startTime = new Date('2025-06-01T00:00:00Z');
      const endTime = new Date('2025-06-30T23:59:59Z');

      const result = computeShippingPromotionStatus(startTime, endTime, false);

      expect(result).toBe(ShippingPromotionStatus.DISABLED);
    });
  });
});
