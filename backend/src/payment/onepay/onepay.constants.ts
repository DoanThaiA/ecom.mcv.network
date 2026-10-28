// Sandbox URL (change to 'https://onepay.vn/paygate/vpcpay.op' for production)
export const ONEPAY_PAYMENT_URL = 'https://mtf.onepay.vn/paygate/vpcpay.op';

// API parameters
export const ONEPAY_VERSION = '2';
export const ONEPAY_COMMAND = 'pay';
export const ONEPAY_CURRENCY = 'VND';
export const ONEPAY_LOCALE = 'vn';

// URL paths (will be appended to BACKEND_DOMAIN from app config)
export const ONEPAY_RETURN_PATH = '/api/v1/shop/payment/onepay/return';
export const ONEPAY_IPN_PATH = '/api/v1/webhooks/onepay/ipn';
