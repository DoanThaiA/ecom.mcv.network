/**
 * Environment variables wrapper that provides default values.
 * Use this instead of process.env directly to ensure consistent defaults.
 */
export const env = {
  // App
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_NAME: process.env.APP_NAME || 'app',
  APP_PORT: process.env.APP_PORT || process.env.PORT || '3000',
  // TODO: Hardcode domains for demo. Remove later
  WEBSITE_DOMAIN: process.env.WEBSITE_DOMAIN,
  CMS_DOMAIN: process.env.CMS_DOMAIN,
  BACKEND_DOMAIN: process.env.BACKEND_DOMAIN || 'http://localhost:3000',
  API_PREFIX: process.env.API_PREFIX || 'api',
  APP_FALLBACK_LANGUAGE: process.env.APP_FALLBACK_LANGUAGE || 'en',
  APP_HEADER_LANGUAGE: process.env.APP_HEADER_LANGUAGE || 'x-custom-lang',

  // Database
  MONGODB_URL: process.env.MONGODB_URL,
  DATABASE_MAX_CONNECTIONS: process.env.DATABASE_MAX_CONNECTIONS || '100',

  // Cache
  // CHỈ DÀNH CHO MÔI TRƯỜNG INTERNAL — KHÔNG MERGE DÒNG NÀY LÊN NHÁNH main.
  // Trỏ Redis về localhost để backend/worker internal không nối được Redis
  // production, qua đó ngừng tiêu thụ chung hàng đợi BullMQ với prod.
  // Hệ quả trên internal: cache tự lùi về in-memory, các job/cron không chạy.
  REDIS_URL: 'redis://localhost:6379',
  CACHE_TTL: process.env.CACHE_TTL || '300000',

  // Auth
  AUTH_JWT_SECRET: process.env.AUTH_JWT_SECRET,
  AUTH_JWT_TOKEN_EXPIRES_IN: '7d',
  // AUTH_JWT_TOKEN_EXPIRES_IN: process.env.AUTH_JWT_TOKEN_EXPIRES_IN,
  AUTH_REFRESH_SECRET: process.env.AUTH_REFRESH_SECRET,
  AUTH_REFRESH_TOKEN_EXPIRES_IN: process.env.AUTH_REFRESH_TOKEN_EXPIRES_IN,
  AUTH_FORGOT_SECRET: process.env.AUTH_FORGOT_SECRET,
  AUTH_FORGOT_TOKEN_EXPIRES_IN: process.env.AUTH_FORGOT_TOKEN_EXPIRES_IN,
  AUTH_CONFIRM_EMAIL_SECRET: process.env.AUTH_CONFIRM_EMAIL_SECRET,
  AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN:
    process.env.AUTH_CONFIRM_EMAIL_TOKEN_EXPIRES_IN,

  // Mail
  MAIL_HOST: process.env.MAIL_HOST,
  MAIL_PORT: process.env.MAIL_PORT || '587',
  MAIL_USER: process.env.MAIL_USER,
  MAIL_PASSWORD: process.env.MAIL_PASSWORD,

  // Files (S3)
  FILE_DRIVER: 's3', // process.env.FILE_DRIVER,
  ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
  SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
  AWS_DEFAULT_S3_BUCKET: process.env.AWS_DEFAULT_S3_BUCKET || 'mmenu-dev',
  AWS_S3_REGION: process.env.AWS_S3_REGION || 'ap-southeast-1',

  // Facebook
  FACEBOOK_APP_ID: process.env.FACEBOOK_APP_ID,
  FACEBOOK_APP_SECRET: process.env.FACEBOOK_APP_SECRET,

  // Google
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

  // Zalo
  ZALO_APP_ID: process.env.ZALO_APP_ID,
  ZALO_APP_SECRET: process.env.ZALO_APP_SECRET,

  // Nhanh
  NHANH_APP_ID: process.env.NHANH_APP_ID,
  NHANH_APP_SECRET: process.env.NHANH_APP_SECRET,
  NHANH_OAUTH_URL: process.env.NHANH_OAUTH_URL || 'https://nhanh.vn/oauth',
  NHANH_API_URL: process.env.NHANH_API_URL || 'https://pos.open.nhanh.vn',

  // ESMS
  ESMS_API_KEY: process.env.ESMS_API_KEY,
  ESMS_SECRET_KEY: process.env.ESMS_SECRET_KEY,

  // CDP
  CDP_PHONE: process.env.CDP_PHONE,
  CDP_PASSWORD: process.env.CDP_PASSWORD,

  // Proxy
  VN_PROXY_URL: process.env.VN_PROXY_URL || 'https://proxy.mmenu.io',

  // OnePay (sandbox defaults)
  ONEPAY_MERCHANT_ID: process.env.ONEPAY_MERCHANT_ID || 'TESTONEPAY',
  ONEPAY_ACCESS_CODE: process.env.ONEPAY_ACCESS_CODE || '6BEB2546',
  ONEPAY_HASH_CODE:
    process.env.ONEPAY_HASH_CODE || '6D0870CDE5F24F34F3915FB0045120DB',

  // InfoCMS (BIDV UAT defaults)
  INFOCMS_MASTER_ID: process.env.INFOCMS_MASTER_ID || 'DEBAEKJE',
  INFOCMS_CLIENT_ID:
    process.env.INFOCMS_CLIENT_ID || 'be3a25cd25e38b9b7a01c0aafdcb2e75',
  INFOCMS_CLIENT_SECRET:
    process.env.INFOCMS_CLIENT_SECRET ||
    'e073d2321ffad6f96cd00fe7fa585c1395110de1cf3efb6e0056fcf69ce73790',
  INFOCMS_BANK_CODE: process.env.INFOCMS_BANK_CODE || '01202001',
  INFOCMS_POS_UNIQUE_ID: process.env.INFOCMS_POS_UNIQUE_ID || 'DEBAEKP1',
  INFOCMS_PRIVATE_KEY:
    process.env.INFOCMS_PRIVATE_KEY ||
    'MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDVerHwlgaldbSAKsub6iBiZp9w3yIaX07zcQYyGtPVSlpAmQ4esVinSqIa0qExHmmTzJxNJseHayXmhUWbYU7s+esCFqpnWd2SFx3F+o3fbiQoZwzXwmpn1krtMje98nqyBw4/djyqR9xeNiMbqry2WhoFT+0/oYe33c6OakZYJAAvQxOxxLklpHGnKxN+CtuNojepXJOVcH1dacmlLWF+e4pqw7sXPPMOB6+95EqsZrx89Gb/nrPzZJTq+XZ73LvzXYztViS8TxZsjw8AIHyC9x6OMuvPDbKuJEPzhgazjwlR6CIxKrBnsjL20GkR2hcdmM/swVkmQgvxLShj+0rLAgMBAAECggEBALZoNi66IkeywV5aMsuwS6eIxGevYPZjxZQhWQfrAGHZPDDCFtyG8JdRIB4HJ5BOyittw4fwwMCm/yVvbsCLbuLx0KpiL4xLrxUrB1eo9Ryage67zq91AXJkGnV+WT7GN6xyduwm3UMqT9N4MptrUgAGEQHE/5VFMjAbKGlryVt5JzC+ExSspc8f5LLr46fHt+X0Mq1xIvJAAzJqt4HXkhELlbfU/QR04yjDBk3GsU2qtc5KaGHstPDcUso8719/oxnkM8HZpAAQ3BL3XIv7avfXRn708FNe+JmL4NX6nxvtxGMCviIP8tUVKu+3rtQJGSXKWmENQOy5Vb0Alnl7BIECgYEA+CDv3vi24Oyhjs7UgLIMyfwMSsjo44tHxVof8aMqWLf+LGzmUcquTldsa/ufqG5RObO0XA4UdtimKpPaO8kSTBivSDDt/PBm/B3i46FclyPGDiF2lTOS8f4ZioQ3bqQh91/RORrsDZknrkrR8YP2onjKrTs9p30Y0zwKkQAZjasCgYEA3EBeeJ3hvFZHq8ykL/E3m6/nbLyX2zdzM6LIVLfkbF6GL9SUhvGcQmX0Ia21rNZ7iG6aifWH1H/Q4Igcx9un+5Bw9w4j+bUCGKAyHDILyyu96dI37hS/ruuLJdPwemy4Fqad0nQubh563XK34Q8JSzrwRoA3T9szUpcihUb212ECgYEAjOgfcA7rw8V9ZZzdHox+KMIitOFtJ7LzugYZN97B8InkJJRfIzmnTMPmxVeqbjrfk5YSqWgxhOA5VNqLxwHDi0VFXQi0Tbyzrx7FtyDudMIS+flU3xvfqd7z4C5/UCyTQWi/Zt98B6je2OKSYMXg7JkN99w5ggDPdT2WfouA92sCgYB7tiAaKbwgeGn7Yo+aaifs58nadrfpJuUrTLSveTbxc8p1VTcz8MPvO6r7u8F+2l46zL063lG0FzLw2yMnUwaws3nwGt40JOqPgHOFCMs9DE245x4JOVhNXPokfj3l1ek0t9OP4TgvHCmw9v23iSWUPv+06dGnphzWuBNovuppIQKBgHn19X/iaHUv9i+rzdsPat9/BazPIBYMY5A+DZRrA8i+ZBuE1BybhcUoInRbD0jyCLESPHoq4jo76ISUdQnVVGz172CXRcK3VYze5NLBy6OrYvAe5FUOIDiuMa+46R0T2Vy90Vva0xvv37LLM1Pw84TOSmWBl0cqJH0/laTqnXL1',
  // InfoCMS public key for verifying callback signatures (from InfoCMS)
  INFOCMS_PUBLIC_KEY:
    process.env.INFOCMS_PUBLIC_KEY ||
    'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAgMUnPB/tg6brTxRJ9OMNNFuSGGeYeG2wJu8Jdb5L5Q3OwymXb1FY/7LVWK6PJPMMFEWoUJ3GU+6M/tFDLjzXU5JZDUnAiRe1DKVWvb1fWw9vtMy/6Fkdc0Omm2Igj/LUaqLS9xM270F8hsN4uq8QnllsSYN7CWvDYewyg2euQFxKCdu5GEWA/J8lo3LRoHL487saYkL+rEJ5Es4lk3Q+9HyWXaw0EdPxcaJ5TB2wP2U0QplkXJYf2sGIR4zm+aatwsiqR9vEoOydvAPlIffnsvj7ANJpQKuadJ6WuzO90YkpJIbv7UfCkbXtyFJN7bozSzeAyXUzQuzYyU3qkrHzFwIDAQAB',

  // OpenAI
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',

  // Telegram
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN || '',
  TELEGRAM_CHANNEL_ID: process.env.TELEGRAM_CHANNEL_ID || '',

  // Bull Board (job queue monitor)
  ADMIN_USERNAME: process.env.ADMIN_USERNAME || 'admin',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || 'mmenu@123',
};

/**
 * Returns true if the current environment uses production-grade infrastructure.
 * Both "production" and "internal" connect to prod databases, APIs, and services.
 */
export const isProductionLike =
  env.NODE_ENV === 'production' || env.NODE_ENV === 'internal';

export const jobQueueName = `cchat-jobs-${env.NODE_ENV}`;

export const systemTaskQueueName = `cchat-system-tasks-${env.NODE_ENV}`;

export const pushNotificationQueueName = `cchat-push-notifications-${env.NODE_ENV}`;

export const orderTaskQueueName = `cchat-order-tasks-${env.NODE_ENV}`;

export const cacheKeyPrefix = `cchat-${env.NODE_ENV}`;

export function getCacheKey(key: string): string {
  return `${cacheKeyPrefix}:${key}`;
}
