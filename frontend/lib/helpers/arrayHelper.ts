/**
 * Safely get the length of an array, handling undefined/null cases
 * @param arr - Array that may be undefined or null
 * @returns The array length, or 0 if the array is undefined/null
 */
export function safeLength<T>(arr?: readonly T[] | null): number {
  return arr?.length ?? 0;
}
