/**
 * Safe Array Utility Functions
 * Prevent "Cannot read properties of undefined (reading 'length')" errors
 */

/**
 * Safely get length of an array
 * @returns 0 if value is null/undefined, otherwise returns length
 */
export const safeLength = <T>(arr: T[] | null | undefined): number => {
  return arr?.length ?? 0;
};

/**
 * Safely access first element of array
 * @returns undefined if array is null/undefined/empty
 */
export const safeFirst = <T>(arr: T[] | null | undefined): T | undefined => {
  return arr?.[0];
};

/**
 * Safely access last element of array
 * @returns undefined if array is null/undefined/empty
 */
export const safeLast = <T>(arr: T[] | null | undefined): T | undefined => {
  return arr?.[arr.length - 1];
};

/**
 * Check if array is empty or null/undefined
 * @returns true if array is null, undefined, or has no elements
 */
export const isEmpty = <T>(arr: T[] | null | undefined): boolean => {
  return !arr || arr.length === 0;
};

/**
 * Check if array is not empty
 * @returns true if array exists and has at least one element
 */
export const isNotEmpty = <T>(arr: T[] | null | undefined): arr is T[] => {
  return !!arr && arr.length > 0;
};

/**
 * Safely map over array (returns empty array if null/undefined)
 */
export const safeMap = <T, R>(
  arr: T[] | null | undefined,
  fn: (item: T, index: number) => R
): R[] => {
  return arr?.map(fn) ?? [];
};

/**
 * Safely filter array (returns empty array if null/undefined)
 */
export const safeFilter = <T>(
  arr: T[] | null | undefined,
  fn: (item: T, index: number) => boolean
): T[] => {
  return arr?.filter(fn) ?? [];
};

/**
 * Safely find element in array (returns undefined if array is null/undefined)
 */
export const safeFind = <T>(
  arr: T[] | null | undefined,
  fn: (item: T, index: number) => boolean
): T | undefined => {
  return arr?.find(fn);
};
