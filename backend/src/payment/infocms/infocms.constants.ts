import { isProductionLike } from '../../utils/env';

// InfoCMS API Base URLs
// UAT environment (BIDV OpenAPI)
export const INFOCMS_API_URL_UAT =
  'https://uat-bidv-openapi.infocms.com.vn/ocms';
// Production environment
export const INFOCMS_API_URL_PROD = 'https://openapi.infocms.com.vn/ocms';

// Current API URL (determined by NODE_ENV)
export const INFOCMS_API_URL = isProductionLike
  ? INFOCMS_API_URL_PROD
  : INFOCMS_API_URL_UAT;

// API Versions
export const INFOCMS_API_VERSION_V2 = 'v2';
export const INFOCMS_API_VERSION_V3 = 'v3';

// API Endpoints
export const INFOCMS_LOGIN_PATH = '/auth/login';
export const INFOCMS_REFRESH_PATH = '/auth/refresh';
export const INFOCMS_CREATE_QR_PATH = '/ec/po_create_qr';
export const INFOCMS_CREATE_QR_V3_PATH = '/ec/po_create_qr'; // Same path, different version
export const INFOCMS_CANCEL_QR_PATH = '/ec/po_cancel_qr';
export const INFOCMS_INQUIRY_RECV_PATH = '/ec/po_inquiry_eccode_recv';

// Callback paths (appended to BACKEND_DOMAIN)
export const INFOCMS_CALLBACK_PATH = '/api/v1/webhooks/infocms/callback';
export const INFOCMS_RETURN_PATH = '/api/v1/shop/payment/infocms/return';

// Token expiration times (in milliseconds)
export const INFOCMS_ACCESS_TOKEN_EXPIRY = 30 * 60 * 1000; // 30 minutes
export const INFOCMS_REFRESH_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

// Response codes
export const INFOCMS_SUCCESS_CODE = '000000';

// Common error codes
export const INFOCMS_ERROR_CODES = {
  SUCCESS: '000000',
  ERROR: '000001',
  SERVER_ERROR: '999999',
  CLIENT_ID_NOT_FOUND: 'S00001',
  CLIENT_SECRET_MISMATCH: 'S00002',
  HMAC_INVALID: 'S00003',
  TOKEN_CLIENT_MISMATCH: 'S00004',
  IP_NOT_ALLOWED: 'S00005',
  INVALID_CREDENTIALS: 'S00006',
  NO_PERMISSION: 'S00007',
  LOGIN_REQUIRED: 'S00008',
  TOKEN_EXPIRED_EXTEND: 'S00009',
  ALL_TOKENS_EXPIRED: 'S00010',
  INVALID_TOKEN: 'S00011',
  NO_API_PERMISSION: 'S00013',
  ECOLLECTION_NOT_FOUND: 'C00054',
  NO_AVAILABLE_ECCODE: 'C00125',
  ALREADY_PAID: 'C00126',
  ALREADY_CANCELLED: 'C00127',
  DUPLICATE_TRANSACTION_UUID: 'C00128',
};

// HTTP Headers
export const INFOCMS_HEADER_TOKEN = 'token';
export const INFOCMS_HEADER_CLIENT_ID = 'clientId';
export const INFOCMS_HEADER_REQUEST_ID = 'requestId';
export const INFOCMS_HEADER_BANK_CODE = 'bankCode';
export const INFOCMS_HEADER_AUTHORIZATION = 'Authorization';
export const INFOCMS_HEADER_AUTHORIZATION_PARAMS =
  'AuthorizationHeaderParameters';
export const INFOCMS_HEADER_RSA_SIGNATURE = 'CMS-RSA-Signature';
