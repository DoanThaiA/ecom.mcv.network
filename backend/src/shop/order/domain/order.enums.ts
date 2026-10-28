/**
 * Order status enum
 */
export enum OrderStatus {
  /** Order is pending confirmation */
  PENDING = 'pending',
  /** Order is confirmed and awaiting processing */
  CONFIRMED = 'confirmed',
  /** Order is being processed/prepared */
  PROCESSING = 'processing',
  /** Order is shipped/out for delivery */
  SHIPPED = 'shipped',
  /** Order is delivered */
  DELIVERED = 'delivered',
  /** Order is cancelled */
  CANCELLED = 'cancelled',
  /** Order is refunded */
  REFUNDED = 'refunded',
}

/**
 * Payment status enum
 */
export enum PaymentStatus {
  /** Payment is pending */
  PENDING = 'pending',
  /** Payment is completed */
  PAID = 'paid',
  /** Payment failed */
  FAILED = 'failed',
  /** Payment is refunded */
  REFUNDED = 'refunded',
}

/**
 * Payment method enum
 */
export enum PaymentMethod {
  /** Cash on delivery */
  COD = 'cod',
  /** Bank transfer */
  BANK_TRANSFER = 'bank_transfer',
  /** Credit/Debit card */
  CARD = 'card',
  /** E-wallet (Momo, ZaloPay, etc.) */
  EWALLET = 'ewallet',
  /** OnePay - International cards (Visa, MC, JCB, AMEX, CUP) */
  ONEPAY_INTERCARD = 'onepay_intercard',
  /** OnePay - Domestic ATM cards (Vietnamese banks) */
  ONEPAY_DOMESTIC = 'onepay_domestic',
  /** InfoCMS - VietQR POS payment */
  INFOCMS_VIETQR = 'infocms_vietqr',
}

/**
 * Check if payment method is an OnePay method
 */
export function isOnepayMethod(method: PaymentMethod): boolean {
  return (
    method === PaymentMethod.ONEPAY_INTERCARD ||
    method === PaymentMethod.ONEPAY_DOMESTIC
  );
}

/**
 * Check if payment method is an InfoCMS method
 */
export function isInfocmsMethod(method: PaymentMethod): boolean {
  return method === PaymentMethod.INFOCMS_VIETQR;
}

/**
 * Check if payment method requires online payment confirmation
 * (payment is processed externally and requires webhook callback)
 */
export function isOnlinePaymentMethod(method: PaymentMethod): boolean {
  return isOnepayMethod(method) || isInfocmsMethod(method);
}

/**
 * Mapping of payment methods to Vietnamese display labels
 */
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  [PaymentMethod.COD]: 'COD',
  [PaymentMethod.BANK_TRANSFER]: 'Chuyển khoản',
  [PaymentMethod.CARD]: 'Thẻ tín dụng',
  [PaymentMethod.EWALLET]: 'Ví điện tử',
  [PaymentMethod.ONEPAY_INTERCARD]: 'Thẻ quốc tế',
  [PaymentMethod.ONEPAY_DOMESTIC]: 'ATM nội địa',
  [PaymentMethod.INFOCMS_VIETQR]: 'VietQR',
};

/**
 * Get Vietnamese display label for payment method
 * @param method - Payment method
 * @returns Vietnamese display label
 */
export function getPaymentMethodLabel(method: PaymentMethod): string {
  return PAYMENT_METHOD_LABELS[method] || 'Khác';
}
