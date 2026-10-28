import isNaN from 'lodash/isNaN';
import isNumber from 'lodash/isNumber';
import { DiscountType } from '@/types/gen/shared/shared/common/enums';

/**
 * Format price với VND currency
 * @param amount - Số tiền cần format
 * @returns String đã format (vd: "299,000đ")
 */
export const formatPrice = (amount: number): string => {
  if (!isNumber(amount) || isNaN(amount)) return '0đ';
  return amount.toLocaleString('vi-VN') + 'đ';
};

/**
 * Format number với thousand separators
 * @param value - Số cần format
 * @param decimals - Số chữ số thập phân (default: 0)
 * @returns String đã format (vd: "1,234,567")
 */
export const formatNumber = (value: number, decimals: number = 0): string => {
  if (!isNumber(value) || isNaN(value)) return '0';
  return value.toLocaleString('vi-VN', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

/**
 * Format percentage
 * @param value - Giá trị phần trăm (0-100)
 * @param decimals - Số chữ số thập phân (default: 0)
 * @returns String đã format (vd: "25%")
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  if (!isNumber(value) || isNaN(value)) return '0%';
  return value.toFixed(decimals) + '%';
};

/**
 * Format time countdown (MM:SS)
 * @param seconds - Số giây
 * @returns String đã format (vd: "05:30")
 */
export const formatTime = (seconds: number): string => {
  if (!isNumber(seconds) || isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Format time countdown đầy đủ (HH:MM:SS)
 * @param seconds - Số giây
 * @returns Object { hours, minutes, seconds } đã format
 */
export const formatCountdown = (
  seconds: number
): { hours: string; minutes: string; seconds: string } => {
  if (!isNumber(seconds) || isNaN(seconds) || seconds < 0) {
    return { hours: '00', minutes: '00', seconds: '00' };
  }
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return {
    hours: String(hours).padStart(2, '0'),
    minutes: String(mins).padStart(2, '0'),
    seconds: String(secs).padStart(2, '0'),
  };
};

/**
 * Format date theo locale vi-VN
 * @param date - Date object hoặc string
 * @param format - 'short' (dd/mm/yyyy) hoặc 'long' (dd/mm/yyyy HH:mm)
 * @param timeZone - Múi giờ IANA tùy chọn
 * @param locale - Locale dùng để định dạng (mặc định vi-VN)
 * @returns String đã format
 */
export const formatDate = (
  date: Date | string,
  format: 'short' | 'long' = 'short',
  timeZone?: string,
  locale: string = 'vi-VN',
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) return '';

  const options: Intl.DateTimeFormatOptions =
    format === 'long'
      ? {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }
      : { day: '2-digit', month: '2-digit', year: 'numeric' };

  if (timeZone) options.timeZone = timeZone;

  return dateObj.toLocaleDateString(locale, options);
};

/**
 * Format price range
 * @param min - Giá min
 * @param max - Giá max
 * @returns String đã format (vd: "100,000đ — 500,000đ")
 */
export const formatPriceRange = (min: number, max: number): string => {
  return `${formatPrice(min)} — ${formatPrice(max)}`;
};

/**
 * Tính giá flash sale
 * @param retailPrice - Giá gốc (retail)
 * @param discountType - Loại giảm giá (PERCENTAGE hoặc FIXED)
 * @param discountValue - Giá trị giảm (% hoặc VND)
 * @returns Giá sau khi giảm
 */
export const calculateFlashSalePrice = (
  retailPrice: number,
  discountType: DiscountType,
  discountValue: number
): number => {
  if (!isNumber(retailPrice) || retailPrice <= 0) return 0;
  if (!isNumber(discountValue) || discountValue <= 0) return retailPrice;

  if (discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE) {
    return Math.round(retailPrice * (1 - discountValue / 100));
  }
  // FIXED
  return Math.max(0, retailPrice - discountValue);
};

/**
 * Tính phần trăm giảm giá flash sale
 * @param retailPrice - Giá gốc (retail)
 * @param discountType - Loại giảm giá (PERCENTAGE hoặc FIXED)
 * @param discountValue - Giá trị giảm (% hoặc VND)
 * @returns Phần trăm giảm giá
 */
export const calculateFlashSaleDiscount = (
  retailPrice: number,
  discountType: DiscountType,
  discountValue: number
): number => {
  if (!isNumber(retailPrice) || retailPrice <= 0) return 0;
  if (!isNumber(discountValue) || discountValue <= 0) return 0;

  if (discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE) {
    return Math.round(discountValue);
  }
  // FIXED - calculate percentage
  return Math.round((discountValue / retailPrice) * 100);
};
