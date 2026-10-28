/**
 * Format date to Y-m-d H:i:s format (e.g., 2025-01-01 10:30:00)
 * Commonly used for APIs like Nhanh.vn
 */
export function formatDateYmdHis(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/** IANA timezone identifier for Vietnam (UTC+7, no daylight saving). */
export const VIETNAM_TIME_ZONE = 'Asia/Ho_Chi_Minh';

/**
 * Format a date as `YYYY-MM-DD` in Vietnam local time (Asia/Ho_Chi_Minh, UTC+7).
 *
 * Use this instead of `date.toISOString().slice(0, 10)` whenever the calendar
 * day must reflect Vietnam local time. `toISOString()` returns the UTC date, so
 * its day only rolls over at 07:00 Vietnam time instead of midnight — e.g. an
 * order placed at 06:59 local would otherwise be tagged with the previous day.
 *
 * The result is assembled from `Intl.DateTimeFormat` parts (looked up by type),
 * so it is independent of both the host timezone and the locale's date ordering.
 *
 * @param date - The instant to format.
 * @returns The Vietnam-local calendar date as `YYYY-MM-DD`.
 */
export function formatVietnamDateISO(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: VIETNAM_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type: string): string =>
    parts.find((part) => part.type === type)?.value ?? '';

  return `${get('year')}-${get('month')}-${get('day')}`;
}
