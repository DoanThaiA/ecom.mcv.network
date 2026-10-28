import {
  formatVietnamDateISO,
  VIETNAM_TIME_ZONE,
} from '../../src/utils/helpers/format-date';

describe('formatVietnamDateISO', () => {
  it('should expose the Vietnam IANA timezone (UTC+7)', () => {
    expect(VIETNAM_TIME_ZONE).toBe('Asia/Ho_Chi_Minh');
  });

  it('should use the Vietnam calendar day for an instant just before 07:00 local', () => {
    // 2026-06-17T23:59:00Z === 2026-06-18 06:59 in Vietnam (UTC+7).
    // This is the exact scenario where the old toISOString() logic produced
    // the previous day (2026-06-17) and mis-tagged the order code.
    const instant = new Date('2026-06-17T23:59:00Z');

    expect(formatVietnamDateISO(instant)).toBe('2026-06-18');
    // Guard rail: the old (buggy) UTC logic returned the previous day.
    expect(instant.toISOString().slice(0, 10)).toBe('2026-06-17');
  });

  it('should keep the same Vietnam day for an instant just after 07:00 local', () => {
    // 2026-06-18T00:03:00Z === 2026-06-18 07:03 in Vietnam.
    expect(formatVietnamDateISO(new Date('2026-06-18T00:03:00Z'))).toBe(
      '2026-06-18',
    );
  });

  it('should roll the day over at Vietnam midnight, not UTC midnight', () => {
    // 17:00Z is exactly 00:00 the next day in Vietnam.
    expect(formatVietnamDateISO(new Date('2026-06-18T16:59:59Z'))).toBe(
      '2026-06-18',
    );
    expect(formatVietnamDateISO(new Date('2026-06-18T17:00:00Z'))).toBe(
      '2026-06-19',
    );
  });

  it('should handle month and year boundaries in Vietnam time', () => {
    // 2025-12-31T17:30:00Z === 2026-01-01 00:30 in Vietnam.
    expect(formatVietnamDateISO(new Date('2025-12-31T17:30:00Z'))).toBe(
      '2026-01-01',
    );
  });

  it('should always return a zero-padded YYYY-MM-DD string', () => {
    // 2026-03-04T18:00:00Z === 2026-03-05 01:00 in Vietnam.
    expect(formatVietnamDateISO(new Date('2026-03-04T18:00:00Z'))).toMatch(
      /^\d{4}-\d{2}-\d{2}$/,
    );
  });
});
