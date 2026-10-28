/**
 * Pure presentation logic for the webhook health page.
 *
 * Kept free of Nest, Mongo and Express so the thresholds can be unit-tested
 * directly — the numbers here are the whole point of the page, and getting
 * them subtly wrong would make it lie in exactly the situation it exists for.
 */

/** Every Nhanh.vn event we subscribe to, in the order the page lists them. */
export const NHANH_EVENTS = [
  'nhanh:productAdd',
  'nhanh:productUpdate',
  'nhanh:productDelete',
  'nhanh:inventoryChange',
  'nhanh:orderAdd',
  'nhanh:orderUpdate',
  'nhanh:orderDelete',
  'nhanh:webhooksEnabled',
] as const;

export type HealthLevel = 'ok' | 'warn' | 'stale' | 'never';

/**
 * How long an event may stay silent before it is worth flagging.
 *
 * Tuned to observed production traffic (12/08/2026): inventoryChange and
 * productUpdate arrive continuously during trading hours, orders far less
 * often, and productDelete/webhooksEnabled are rare by nature. Thresholds are
 * deliberately generous — a false alarm every night would train people to
 * ignore the page.
 */
export const SILENCE_THRESHOLDS_HOURS: Record<
  string,
  { warn: number; stale: number }
> = {
  'nhanh:productUpdate': { warn: 12, stale: 24 },
  'nhanh:inventoryChange': { warn: 12, stale: 24 },
  'nhanh:orderAdd': { warn: 24, stale: 48 },
  'nhanh:orderUpdate': { warn: 24, stale: 48 },
  'nhanh:productAdd': { warn: 72, stale: 168 },
  'nhanh:productDelete': { warn: 168, stale: 336 },
  'nhanh:orderDelete': { warn: 168, stale: 336 },
  'nhanh:webhooksEnabled': { warn: Infinity, stale: Infinity },
};

const DEFAULT_THRESHOLD = { warn: 24, stale: 48 };

export function thresholdFor(event: string): { warn: number; stale: number } {
  return SILENCE_THRESHOLDS_HOURS[event] ?? DEFAULT_THRESHOLD;
}

/**
 * Classify how worrying an event's silence is.
 *
 * `never` means nothing has ever been recorded for this event — which during
 * the July outage would have been the single most useful signal on the page.
 */
export function levelFor(
  event: string,
  lastSeenAt: Date | null | undefined,
  now: Date = new Date(),
): HealthLevel {
  if (!lastSeenAt) return 'never';

  const hours = (now.getTime() - new Date(lastSeenAt).getTime()) / 3_600_000;
  const { warn, stale } = thresholdFor(event);

  if (hours >= stale) return 'stale';
  if (hours >= warn) return 'warn';
  return 'ok';
}

/** Human-readable "3 phút trước" / "2 ngày trước". */
export function timeAgo(
  at: Date | null | undefined,
  now: Date = new Date(),
): string {
  if (!at) return 'chưa từng nhận';

  const seconds = Math.floor((now.getTime() - new Date(at).getTime()) / 1000);
  if (seconds < 0) return 'vừa xong';
  if (seconds < 60) return `${seconds} giây trước`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;

  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
}

/** Sum of per-day counters over the last `days` days, inclusive of today. */
export function countLastDays(
  daily: Record<string, number> | undefined,
  days: number,
  now: Date = new Date(),
): number {
  if (!daily) return 0;

  let total = 0;
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    total += daily[d.toISOString().slice(0, 10)] ?? 0;
  }
  return total;
}

export interface HealthRow {
  event: string;
  lastSeenAt: Date | null;
  lastSeenText: string;
  level: HealthLevel;
  totalCount: number;
  invalidCount: number;
  lastInvalidAt: Date | null;
  lastInvalidReason: string | null;
  last24h: number;
  last7d: number;
  lastBusinessId: string | null;
}

interface RawRecord {
  event: string;
  lastSeenAt?: Date | null;
  lastBusinessId?: string | null;
  totalCount?: number;
  invalidCount?: number;
  lastInvalidAt?: Date | null;
  lastInvalidReason?: string | null;
  daily?: Record<string, number>;
}

/**
 * Merge what was recorded with the full list of expected events, so an event
 * that has never arrived still gets a row. An absent row would read as "fine"
 * when it is the most alarming case of all.
 */
export function buildRows(
  records: RawRecord[],
  now: Date = new Date(),
): HealthRow[] {
  const byEvent = new Map(records.map((r) => [r.event, r]));
  const known = new Set<string>(NHANH_EVENTS);
  const extra = records.map((r) => r.event).filter((e) => !known.has(e));
  const order = [...NHANH_EVENTS, ...extra];

  return order.map((event) => {
    const r = byEvent.get(event);
    const lastSeenAt = r?.lastSeenAt ? new Date(r.lastSeenAt) : null;

    return {
      event,
      lastSeenAt,
      lastSeenText: timeAgo(lastSeenAt, now),
      level: levelFor(event, lastSeenAt, now),
      totalCount: r?.totalCount ?? 0,
      invalidCount: r?.invalidCount ?? 0,
      lastInvalidAt: r?.lastInvalidAt ? new Date(r.lastInvalidAt) : null,
      lastInvalidReason: r?.lastInvalidReason ?? null,
      last24h: countLastDays(r?.daily, 1, now),
      last7d: countLastDays(r?.daily, 7, now),
      lastBusinessId: r?.lastBusinessId ?? null,
    };
  });
}

/**
 * Overall verdict shown at the top of the page.
 *
 * `webhooksEnabled` is excluded: it only fires when someone saves the webhook
 * configuration on Nhanh, so its silence says nothing about health.
 */
export function overallVerdict(rows: HealthRow[]): {
  level: HealthLevel;
  message: string;
} {
  const meaningful = rows.filter((r) => r.event !== 'nhanh:webhooksEnabled');

  if (meaningful.every((r) => r.level === 'never')) {
    return {
      level: 'never',
      message:
        'CHƯA NHẬN ĐƯỢC WEBHOOK NÀO. Nếu trang này vừa được triển khai thì đây là bình thường — hãy đợi vài phút. Nếu đã chạy lâu, webhook có thể đã bị Nhanh tắt.',
    };
  }

  const stale = meaningful.filter((r) => r.level === 'stale');
  if (stale.length > 0) {
    return {
      level: 'stale',
      message: `${stale.length} loại sự kiện đã im lặng quá lâu: ${stale
        .map((r) => r.event)
        .join(', ')}. Kiểm tra cấu hình webhook trên open.nhanh.vn/apps.`,
    };
  }

  const warn = meaningful.filter((r) => r.level === 'warn');
  if (warn.length > 0) {
    return {
      level: 'warn',
      message: `${warn.length} loại sự kiện im lâu hơn thường lệ: ${warn
        .map((r) => r.event)
        .join(', ')}. Có thể chỉ là giờ thấp điểm, nhưng nên theo dõi.`,
    };
  }

  return { level: 'ok', message: 'Webhook đang hoạt động bình thường.' };
}
