import dayjs from 'dayjs';

/**
 * Format utilities for displaying data in Vietnamese locale
 */

/**
 * Format price with Vietnamese locale and currency symbol
 * @param price - Price value to format
 * @returns Formatted price string (e.g., "1.000.000đ") or "--" if null/undefined
 */
export const formatPrice = (price: number | null | undefined): string => {
  if (price == null) return '--';
  return `${price.toLocaleString('vi-VN')}đ`;
};

/**
 * Format number with Vietnamese locale (thousand separators)
 * @param value - Number value to format
 * @returns Formatted number string (e.g., "1.000.000") or "--" if null/undefined
 */
export const formatNumber = (value: number | null | undefined): string => {
  if (value == null) return '--';
  return value.toLocaleString('vi-VN');
};

/**
 * Format date string to Vietnamese format using dayjs
 * @param dateString - ISO date string to format
 * @param format - dayjs format string (default: 'DD/MM/YYYY HH:mm')
 * @returns Formatted date string (e.g., "25/12/2024 14:30")
 */
export const formatDate = (
  dateString: string | Date,
  format: string = 'DD/MM/YYYY HH:mm'
): string => {
  return dayjs(dateString).format(format);
};

/**
 * Format datetime using native toLocaleString
 * @param dateString - ISO date string to format
 * @returns Formatted datetime string (e.g., "14:30 25/12/2024")
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

/**
 * Convert date value (Date | string | undefined) to ISO string
 * Handles both Date objects from protobuf and string values from JSON serialization
 * @param date - Date value (Date object, ISO string, or undefined)
 * @returns ISO string or null if date is invalid/undefined
 */
export const toISOString = (date: Date | string | undefined): string | null => {
  if (!date) return null;
  if (date instanceof Date) return date.toISOString();
  if (typeof date === 'string') return date;
  // Fallback: try to convert to Date then to ISO string
  try {
    return new Date(date).toISOString();
  } catch {
    return null;
  }
};

// ----------------------------------------------------------------------
// Input Number Formatting
// Uses Intl.NumberFormat for reliable cross-browser formatting
// ----------------------------------------------------------------------

/**
 * Number formatter using Intl.NumberFormat
 * Uses comma as thousand separator (1,000,000) which is common in Vietnamese business contexts
 * Provides:
 * - Consistent output across browsers/environments
 * - Predictable behavior regardless of user's locale settings
 * - Better performance when cached
 */
const inputNumberFormatter = new Intl.NumberFormat('en-US', {
  style: 'decimal',
  maximumFractionDigits: 0,
  useGrouping: true,
});

/**
 * Format a number with thousand separators for display in input fields
 * Uses Intl.NumberFormat for reliable cross-browser formatting
 * @param value - Number or string value to format
 * @returns Formatted string with comma separators (e.g., "1,000,000")
 */
export const formatInputNumber = (value: number | string | undefined | null): string => {
  if (value === undefined || value === null || value === '') return '';

  // Remove existing separators (both comma and dot) before parsing
  const num = typeof value === 'string' ? parseFloat(value.replace(/[,\.]/g, '')) : value;

  if (isNaN(num) || !isFinite(num)) return '';

  return inputNumberFormatter.format(Math.floor(num));
};

/**
 * Format number for commission input with decimal support
 * @param num - Number to format
 * @param decimalPlaces - Number of decimal places (default: 2)
 * @returns Formatted string with decimals
 */
export const formatCommissionNumber = (num: number, decimalPlaces: number = 2): string => {
  if (!num || isNaN(num) || !isFinite(num)) {
    return '0';
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: decimalPlaces,
    useGrouping: true,
  });

  return formatter.format(num);
};

/**
 * Parse a formatted number string back to a numeric value
 * @param formattedValue - Formatted string with comma separators (e.g., "1,000,000")
 * @returns Parsed number value
 */
export const parseInputNumber = (formattedValue: string): number => {
  if (!formattedValue) return 0;

  // Remove thousand separators (commas) and parse
  const cleaned = formattedValue.replace(/,/g, '');
  const parsed = parseFloat(cleaned);

  return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
};
