/**
 * Truncate string if it exceeds max length
 * @param str - String to truncate
 * @param maxLength - Maximum allowed length
 * @returns Truncated string with "..." suffix if needed
 */
export function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) {
    return str;
  }
  return str.substring(0, maxLength - 3) + '...';
}
