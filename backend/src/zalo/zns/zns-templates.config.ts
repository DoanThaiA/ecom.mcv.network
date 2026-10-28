/**
 * ZNS Template Configurations
 * Define all ZNS templates and their corresponding data types here
 */

export interface OtpTemplateData {
  otp: string;
}

/**
 * Order confirmation template data
 * Template ID: 526724
 */
export interface OrderConfirmationTemplateData {
  /** Customer name */
  ten_khach_hang: string;
  /** Order code */
  ma_don_hang: string;
  /** Quantity */
  so_luong: string;
  /** Product name */
  ten_san_pham: string;
  /** Product size */
  size: string;
  /** Payment method */
  hinh_thuc: string;
  /** Total cost */
  cost: string;
  /** Confirmation token */
  token: string;
}

/**
 * Registration voucher template data
 * Template ID: 534035
 */
export interface RegistrationVoucherTemplateData {
  /** Voucher expiry date (DD/MM/YYYY) */
  expire: string;
  /** Voucher code */
  voucher_code: string;
  /** Customer name */
  customer_name: string;
  /** CDP customer ID */
  customer_id: string;
  /** Voucher start date (DD/MM/YYYY) */
  start_date: string;
}

/**
 * ZNS Template IDs
 */
export const ZNS_TEMPLATES = {
  OTP: '506405',
  ORDER_CONFIRMATION: '526724',
  REGISTRATION_VOUCHER: '534035',
} as const;

/**
 * Type-safe template data helper
 */
export type ZnsTemplateData<T extends keyof typeof ZNS_TEMPLATES> =
  T extends 'OTP'
    ? OtpTemplateData
    : T extends 'ORDER_CONFIRMATION'
      ? OrderConfirmationTemplateData
      : never;

/**
 * Generate tracking ID for OTP template
 */
export function generateOtpTrackingId(otp: string): string {
  return `otp_${otp}_${Date.now()}`;
}

/**
 * Generate tracking ID for order confirmation template
 */
export function generateOrderConfirmationTrackingId(
  orderNumber: string,
): string {
  return `order_confirm_${orderNumber}_${Date.now()}`;
}

/**
 * Generate tracking ID for registration voucher template
 */
export function generateRegistrationVoucherTrackingId(
  customerId: string,
): string {
  return `reg_voucher_${customerId}_${Date.now()}`;
}
