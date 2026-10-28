import {
  FlashSaleStatus,
  computeFlashSaleStatus,
} from '../../../src/flash-sales/domain/flash-sale-status.enum';

describe('computeFlashSaleStatus', () => {
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

      const result = computeFlashSaleStatus(startTime, endTime, false);

      expect(result).toBe(FlashSaleStatus.DISABLED);
    });

    it('should return DISABLED even when within time range but disabled', () => {
      const startTime = new Date('2025-06-10T00:00:00Z');
      const endTime = new Date('2025-06-20T23:59:59Z');

      const result = computeFlashSaleStatus(startTime, endTime, false);

      expect(result).toBe(FlashSaleStatus.DISABLED);
    });
  });

  describe('UPCOMING status', () => {
    it('should return UPCOMING when current time is before start time', () => {
      const startTime = new Date('2025-06-20T00:00:00Z'); // Future
      const endTime = new Date('2025-06-30T23:59:59Z');

      const result = computeFlashSaleStatus(startTime, endTime, true);

      expect(result).toBe(FlashSaleStatus.UPCOMING);
    });

    it('should return UPCOMING even if enabled', () => {
      const startTime = new Date('2025-07-01T00:00:00Z'); // Future
      const endTime = new Date('2025-07-31T23:59:59Z');

      const result = computeFlashSaleStatus(startTime, endTime, true);

      expect(result).toBe(FlashSaleStatus.UPCOMING);
    });
  });

  describe('ENDED status', () => {
    it('should return ENDED when current time is after end time', () => {
      const startTime = new Date('2025-05-01T00:00:00Z'); // Past
      const endTime = new Date('2025-06-01T23:59:59Z'); // Past

      const result = computeFlashSaleStatus(startTime, endTime, true);

      expect(result).toBe(FlashSaleStatus.ENDED);
    });

    it('should return ENDED even if enabled', () => {
      const startTime = new Date('2025-01-01T00:00:00Z');
      const endTime = new Date('2025-01-31T23:59:59Z');

      const result = computeFlashSaleStatus(startTime, endTime, true);

      expect(result).toBe(FlashSaleStatus.ENDED);
    });
  });

  describe('ACTIVE status', () => {
    it('should return ACTIVE when enabled and within time range', () => {
      const startTime = new Date('2025-06-01T00:00:00Z');
      const endTime = new Date('2025-06-30T23:59:59Z');

      const result = computeFlashSaleStatus(startTime, endTime, true);

      expect(result).toBe(FlashSaleStatus.ACTIVE);
    });

    it('should return ACTIVE at exact start time', () => {
      const startTime = new Date('2025-06-15T12:00:00Z'); // Current time
      const endTime = new Date('2025-06-30T23:59:59Z');

      const result = computeFlashSaleStatus(startTime, endTime, true);

      expect(result).toBe(FlashSaleStatus.ACTIVE);
    });

    it('should return ACTIVE at exact end time', () => {
      const startTime = new Date('2025-06-01T00:00:00Z');
      const endTime = new Date('2025-06-15T12:00:00Z'); // Current time

      const result = computeFlashSaleStatus(startTime, endTime, true);

      expect(result).toBe(FlashSaleStatus.ACTIVE);
    });
  });

  describe('edge cases', () => {
    it('should handle same start and end time', () => {
      const time = new Date('2025-06-15T12:00:00Z');

      const result = computeFlashSaleStatus(time, time, true);

      expect(result).toBe(FlashSaleStatus.ACTIVE);
    });

    it('should prioritize DISABLED over time checks', () => {
      // Even if time range is valid, DISABLED takes precedence
      const startTime = new Date('2025-06-01T00:00:00Z');
      const endTime = new Date('2025-06-30T23:59:59Z');

      const result = computeFlashSaleStatus(startTime, endTime, false);

      expect(result).toBe(FlashSaleStatus.DISABLED);
    });
  });
});
