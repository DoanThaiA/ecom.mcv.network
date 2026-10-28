import * as crypto from 'crypto';

/**
 * Generate HMAC-SHA512 signature for InfoCMS login authentication
 * Formula: Base64(HMAC-SHA512(clientId + DATE(YYYYMMDD) + clientSecret, clientSecret))
 */
export function generateHmacSignature(
  clientId: string,
  clientSecret: string,
  date?: Date,
): string {
  const dateStr = formatDateYYYYMMDD(date || new Date());
  const dataToSign = clientId + dateStr + clientSecret;

  const hmac = crypto.createHmac('sha512', clientSecret);
  hmac.update(dataToSign);
  return hmac.digest('base64');
}

/**
 * Generate RSA-SHA256 signature for InfoCMS API requests (CMS-RSA-Signature header)
 * Signs the JSON request body using the private key
 *
 * @param data - The request body object to sign (will be JSON stringified)
 * @param privateKeyBase64 - Base64 encoded PKCS#8 private key
 * @returns Base64 encoded RSA signature
 */
export function generateRsaSignature(
  data: Record<string, unknown>,
  privateKeyBase64: string,
): string {
  // Convert Base64 private key to PEM format
  const privateKeyPem = `-----BEGIN PRIVATE KEY-----\n${privateKeyBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PRIVATE KEY-----`;

  // Create the JSON string to sign (same format as request body)
  const dataToSign = JSON.stringify(data);

  // Sign using RSA-SHA256
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(dataToSign);
  sign.end();

  return sign.sign(privateKeyPem, 'base64');
}

/**
 * Verify RSA-SHA256 signature for InfoCMS callbacks (CMS-RSA-Signature header)
 * Verifies the signature using InfoCMS's public key
 *
 * @param data - The request body (object or string)
 * @param signature - Base64 encoded RSA signature from CMS-RSA-Signature header
 * @param publicKeyBase64 - Base64 encoded public key from InfoCMS
 * @returns true if signature is valid, false otherwise
 */
export function verifyRsaSignature(
  data: Record<string, unknown> | string,
  signature: string,
  publicKeyBase64: string,
): boolean {
  try {
    // Convert Base64 public key to PEM format
    const publicKeyPem = `-----BEGIN PUBLIC KEY-----\n${publicKeyBase64.match(/.{1,64}/g)?.join('\n')}\n-----END PUBLIC KEY-----`;

    // Get the data to verify (same format as signed)
    const dataToVerify = typeof data === 'string' ? data : JSON.stringify(data);

    // Verify using RSA-SHA256
    const verify = crypto.createVerify('RSA-SHA256');
    verify.update(dataToVerify);
    verify.end();

    return verify.verify(publicKeyPem, signature, 'base64');
  } catch {
    return false;
  }
}

/**
 * Format date as YYYYMMDD string
 */
export function formatDateYYYYMMDD(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * Format date as YYYYMMDDhhmmss string
 */
export function formatDateYYYYMMDDHHMMSS(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}${seconds}`;
}

/**
 * Format timestamp as YYYY-MM-DD HH:MI:SS sss
 */
export function formatTimestamp(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds} ${ms}`;
}

/**
 * Generate unique request ID
 */
export function generateRequestId(): string {
  return crypto.randomUUID();
}

/**
 * Generate unique transaction UUID for POS based on orderNumber
 * Format: {orderNumber}-{timestamp} (same as OnePay's merchTxnRef pattern)
 * This allows order lookup using orderNumber extracted from transactionUuid
 */
export function generateTransactionUuid(orderNumber: string): string {
  const timestamp = Date.now();
  return `${orderNumber}-${timestamp}`;
}

/**
 * Extract orderNumber from transactionUuid
 * Format: {orderNumber}-{timestamp}
 */
export function extractOrderNumberFromTransactionUuid(
  transactionUuid: string,
): string | null {
  const parts = transactionUuid.split('-');
  if (parts.length < 2) {
    return null;
  }
  // Remove the last part (timestamp) and join the rest (in case orderNumber contains dashes)
  parts.pop();
  return parts.join('-');
}

/**
 * Encode string to Base64
 */
export function toBase64(str: string): string {
  return Buffer.from(str, 'utf-8').toString('base64');
}

/**
 * Decode Base64 to string
 */
export function fromBase64(base64: string): string {
  return Buffer.from(base64, 'base64').toString('utf-8');
}

/**
 * InfoCMS response interface
 */
export interface InfocmsBaseResponse {
  responseCd: string;
  responseMsg: string;
  responseTs: string;
  responseTraceId: string;
  requesterTrId?: string;
  data?: string | Record<string, unknown>;
}

/**
 * Login response data (decrypted)
 */
export interface InfocmsLoginData {
  accessToken: string;
  refreshIdx: number | string;
}

/**
 * Create QR response data (decrypted)
 */
export interface InfocmsCreateQrData {
  qrUrl: string;
  qrData: string;
  transactionUuid: string;
  ecollectionCd: string;
  motherAccountNo: string;
  accountHolderNm: string;
}

/**
 * Callback data (decrypted)
 */
export interface InfocmsCallbackData {
  bankCd: string;
  motherAccntNo: string;
  ecollectionCd: string;
  payerNo: string;
  transId: string;
  bankTransId: string;
  depositAmt: number;
  depositDtm: string;
  recvDtm: string;
  transactionUuid: string;
  posUniqueId: string;
}

/**
 * Inquiry response data item
 */
export interface InfocmsInquiryDataItem {
  receivableId: string;
  motherAccntNo: string;
  ecollectionCd: string;
  receivableAmt: number;
  paidYn: string;
}

/**
 * Check if response is successful
 */
export function isSuccessResponse(responseCd: string): boolean {
  return responseCd === '000000';
}

/**
 * Parse InfoCMS error code to human-readable message
 */
export function getErrorMessage(
  responseCd: string,
  responseMsg: string,
): string {
  const errorMessages: Record<string, string> = {
    '000001': 'General error',
    '999999': 'Server error',
    S00001: 'Client ID not found',
    S00002: 'Client secret does not match',
    S00003: 'HMAC authorization code invalid',
    S00004: 'Authorization token does not match client ID',
    S00005: 'IP address not allowed',
    S00006: 'ID or password does not match',
    S00007: 'No permission for this request',
    S00008: 'Login required',
    S00009: 'Token expired, please use refresh token',
    S00010: 'All tokens expired, please login again',
    S00011: 'Invalid token',
    S00013: 'Not authorized to use API',
    C00054: 'E-collection code does not exist',
    C00125: 'No available e-collection code',
    C00126: 'Already paid',
    C00127: 'Already cancelled',
    C00128: 'Duplicate transaction UUID',
  };

  return errorMessages[responseCd] || responseMsg || 'Unknown error';
}
