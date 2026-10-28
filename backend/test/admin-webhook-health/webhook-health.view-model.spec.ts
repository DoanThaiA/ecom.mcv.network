import {
  buildRows,
  countLastDays,
  levelFor,
  NHANH_EVENTS,
  overallVerdict,
  thresholdFor,
  timeAgo,
} from '../../src/admin-webhook-health/webhook-health.view-model';

const NOW = new Date('2026-08-12T12:00:00.000Z');
const hoursAgo = (h: number) => new Date(NOW.getTime() - h * 3_600_000);
const daysAgo = (d: number) => new Date(NOW.getTime() - d * 86_400_000);

describe('webhook health view model', () => {
  describe('levelFor', () => {
    it('should report never when the event has no recorded receipt', () => {
      expect(levelFor('nhanh:productUpdate', null, NOW)).toBe('never');
      expect(levelFor('nhanh:productUpdate', undefined, NOW)).toBe('never');
    });

    it('should report ok while the event is arriving within its window', () => {
      expect(levelFor('nhanh:productUpdate', hoursAgo(1), NOW)).toBe('ok');
      expect(levelFor('nhanh:productUpdate', hoursAgo(11), NOW)).toBe('ok');
    });

    it('should escalate to warn then stale as silence grows', () => {
      expect(levelFor('nhanh:productUpdate', hoursAgo(12), NOW)).toBe('warn');
      expect(levelFor('nhanh:productUpdate', hoursAgo(23), NOW)).toBe('warn');
      expect(levelFor('nhanh:productUpdate', hoursAgo(24), NOW)).toBe('stale');
      expect(levelFor('nhanh:productUpdate', hoursAgo(500), NOW)).toBe('stale');
    });

    it('should give rare events a longer rope than continuous ones', () => {
      // productDelete is rare by nature; a day of silence means nothing.
      expect(levelFor('nhanh:productDelete', hoursAgo(24), NOW)).toBe('ok');
      // inventoryChange arrives constantly; a day of silence does not.
      expect(levelFor('nhanh:inventoryChange', hoursAgo(24), NOW)).toBe(
        'stale',
      );
    });

    it('should never flag webhooksEnabled, which only fires on config save', () => {
      expect(levelFor('nhanh:webhooksEnabled', daysAgo(365), NOW)).toBe('ok');
    });

    it('should fall back to a default window for unknown events', () => {
      expect(thresholdFor('nhanh:somethingNew')).toEqual({
        warn: 24,
        stale: 48,
      });
      expect(levelFor('nhanh:somethingNew', hoursAgo(50), NOW)).toBe('stale');
    });
  });

  describe('timeAgo', () => {
    it.each([
      [null, 'chưa từng nhận'],
      [hoursAgo(0), '0 giây trước'],
      [new Date(NOW.getTime() - 45_000), '45 giây trước'],
      [new Date(NOW.getTime() - 5 * 60_000), '5 phút trước'],
      [hoursAgo(3), '3 giờ trước'],
      [daysAgo(9), '9 ngày trước'],
    ])('should render %s as %s', (at, expected) => {
      expect(timeAgo(at as Date | null, NOW)).toBe(expected);
    });

    it('should not render negative durations when clocks disagree', () => {
      expect(timeAgo(new Date(NOW.getTime() + 5000), NOW)).toBe('vừa xong');
    });
  });

  describe('countLastDays', () => {
    const daily = {
      '2026-08-12': 10,
      '2026-08-11': 20,
      '2026-08-06': 5,
      '2026-07-01': 999,
    };

    it('should count only today for a one-day window', () => {
      expect(countLastDays(daily, 1, NOW)).toBe(10);
    });

    it('should count the trailing window and ignore anything older', () => {
      expect(countLastDays(daily, 7, NOW)).toBe(35);
    });

    it('should return zero rather than throw when nothing was recorded', () => {
      expect(countLastDays(undefined, 7, NOW)).toBe(0);
      expect(countLastDays({}, 7, NOW)).toBe(0);
    });
  });

  describe('buildRows', () => {
    it('should emit a row for every expected event even with no data at all', () => {
      const rows = buildRows([], NOW);
      expect(rows).toHaveLength(NHANH_EVENTS.length);
      expect(rows.every((r) => r.level === 'never' || r.level === 'ok')).toBe(
        true,
      );
      expect(rows.map((r) => r.event)).toEqual([...NHANH_EVENTS]);
    });

    it('should keep unrecognised events instead of hiding them', () => {
      const rows = buildRows(
        [
          {
            event: 'nhanh:customerAdd',
            lastSeenAt: hoursAgo(1),
            totalCount: 3,
          },
        ],
        NOW,
      );
      const extra = rows.find((r) => r.event === 'nhanh:customerAdd');
      expect(extra).toBeDefined();
      expect(extra?.totalCount).toBe(3);
    });

    it('should carry counters and validation failures through', () => {
      const rows = buildRows(
        [
          {
            event: 'nhanh:productUpdate',
            lastSeenAt: hoursAgo(2),
            lastBusinessId: '57499',
            totalCount: 412,
            invalidCount: 2,
            lastInvalidAt: hoursAgo(3),
            lastInvalidReason: 'event must be a valid enum value',
            daily: { '2026-08-12': 40, '2026-08-11': 60 },
          },
        ],
        NOW,
      );

      const row = rows.find((r) => r.event === 'nhanh:productUpdate')!;
      expect(row.level).toBe('ok');
      expect(row.totalCount).toBe(412);
      expect(row.invalidCount).toBe(2);
      expect(row.lastInvalidReason).toBe('event must be a valid enum value');
      expect(row.last24h).toBe(40);
      expect(row.last7d).toBe(100);
      expect(row.lastBusinessId).toBe('57499');
    });
  });

  describe('overallVerdict', () => {
    const recent = (event: string) => ({
      event,
      lastSeenAt: hoursAgo(1),
      totalCount: 1,
    });

    it('should shout when nothing has ever arrived', () => {
      const verdict = overallVerdict(buildRows([], NOW));
      expect(verdict.level).toBe('never');
      expect(verdict.message).toContain('CHƯA NHẬN ĐƯỢC WEBHOOK NÀO');
    });

    it('should report ok when every meaningful event is current', () => {
      const rows = buildRows(NHANH_EVENTS.map(recent), NOW);
      expect(overallVerdict(rows).level).toBe('ok');
    });

    it('should reproduce the July 2026 outage: orders in, nothing coming back', () => {
      // Nhanh kept accepting our order pushes but stopped sending events.
      const rows = buildRows(
        [
          { event: 'nhanh:productUpdate', lastSeenAt: daysAgo(29) },
          { event: 'nhanh:inventoryChange', lastSeenAt: daysAgo(29) },
          { event: 'nhanh:orderUpdate', lastSeenAt: daysAgo(29) },
        ],
        NOW,
      );
      const verdict = overallVerdict(rows);
      expect(verdict.level).toBe('stale');
      expect(verdict.message).toContain('nhanh:productUpdate');
      expect(verdict.message).toContain('open.nhanh.vn/apps');
    });

    it('should ignore webhooksEnabled silence, which is normal', () => {
      const rows = buildRows(
        NHANH_EVENTS.filter((e) => e !== 'nhanh:webhooksEnabled').map(recent),
        NOW,
      );
      expect(overallVerdict(rows).level).toBe('ok');
    });

    it('should prefer stale over warn when both are present', () => {
      const rows = buildRows(
        [
          { event: 'nhanh:productUpdate', lastSeenAt: hoursAgo(13) }, // warn
          { event: 'nhanh:inventoryChange', lastSeenAt: hoursAgo(40) }, // stale
          ...NHANH_EVENTS.filter(
            (e) => e !== 'nhanh:productUpdate' && e !== 'nhanh:inventoryChange',
          ).map(recent),
        ],
        NOW,
      );
      expect(overallVerdict(rows).level).toBe('stale');
    });
  });
});
