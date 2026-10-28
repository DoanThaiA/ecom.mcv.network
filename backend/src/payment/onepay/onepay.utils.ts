import * as crypto from 'crypto';

/**
 * Generate SHA256 HMAC secure hash for OnePay request
 * Only includes params starting with 'vpc_' (excluding vpc_SecureHash itself)
 */
export function generateSecureHash(
  params: Record<string, string>,
  hashCode: string,
): string {
  // Filter and sort vpc_* params (excluding vpc_SecureHash and vpc_SecureHashType)
  const vpcParams = Object.keys(params)
    .filter(
      (key) =>
        key.startsWith('vpc_') &&
        key !== 'vpc_SecureHash' &&
        key !== 'vpc_SecureHashType',
    )
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  // Generate HMAC-SHA256
  const hmac = crypto.createHmac('sha256', Buffer.from(hashCode, 'hex'));
  hmac.update(vpcParams);
  return hmac.digest('hex').toUpperCase();
}

/**
 * Verify secure hash from OnePay response (IPN or return URL)
 */
export function verifySecureHash(
  params: Record<string, string>,
  hashCode: string,
): boolean {
  const receivedHash = params['vpc_SecureHash'];
  if (!receivedHash) {
    return false;
  }

  const calculatedHash = generateSecureHash(params, hashCode);
  return receivedHash.toUpperCase() === calculatedHash.toUpperCase();
}

/**
 * Generate merchant transaction reference
 * Format: {orderNumber}-{timestamp}
 */
export function generateMerchTxnRef(orderNumber: string): string {
  const timestamp = Date.now();
  return `${orderNumber}-${timestamp}`;
}

/**
 * Extract order number from merchant transaction reference
 */
export function extractOrderNumber(merchTxnRef: string): string | null {
  if (!merchTxnRef) return null;
  const parts = merchTxnRef.split('-');
  if (parts.length < 2) return merchTxnRef;
  // Remove last part (timestamp) and join the rest
  parts.pop();
  return parts.join('-');
}
