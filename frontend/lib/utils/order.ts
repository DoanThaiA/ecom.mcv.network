import initial from 'lodash/initial';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import join from 'lodash/join';
import size from 'lodash/size';
import trim from 'lodash/trim';

/**
 * Trích xuất mã đơn hàng từ vpc_MerchTxnRef
 * Format: {orderNumber}-{timestamp}
 * Ví dụ: "ORD-123456-1704067200000" -> "ORD-123456"
 * @param merchTxnRef - Giá trị vpc_MerchTxnRef từ OnePay
 * @returns Mã đơn hàng hoặc null nếu không hợp lệ
 */
export function extractOrderNumber(merchTxnRef: string | null | undefined): string | null {
  // Early return for empty/nil values
  if (isNil(merchTxnRef) || isEmpty(merchTxnRef)) {
    return null;
  }

  const trimmed = trim(merchTxnRef);
  if (isEmpty(trimmed)) {
    return null;
  }

  const parts = trimmed.split('-');

  // If only one part or empty, return the original value
  if (size(parts) < 2) {
    return trimmed;
  }

  // Remove last part (timestamp) and join the rest
  const orderParts = initial(parts);

  // Handle edge case where orderParts might be empty after initial
  if (isEmpty(orderParts)) {
    return null;
  }

  return join(orderParts, '-');
}
