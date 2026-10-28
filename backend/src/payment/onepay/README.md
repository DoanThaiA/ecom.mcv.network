# OnePay Payment Gateway Integration

## Overview

This module integrates OnePay Direct Payment (card only) into the checkout flow using a redirect-based payment with IPN callback.

## Features

- **Payment Service**: Direct Payment only
- **Payment Methods**:
  - `onepay_intercard` - International cards only (Visa, MC, JCB, AMEX, CUP)
  - `onepay_domestic` - Domestic ATM cards (Vietnamese banks)
- **Flow**: Redirect to OnePay → User pays → IPN callback → Redirect back
- **Environment**: Sandbox credentials as defaults

---

## Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PAYMENT FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

1. User selects payment method and clicks "Place Order"
   │
   ▼
   POST /api/v1/shop/checkout/sessions/:id/place-order
   Body: { paymentMethod: "onepay_intercard" }  // or "onepay_domestic"
   │
   ├── Validates checkout session
   ├── Creates Order (PaymentStatus.PENDING)
   ├── Marks checkout session as completed
   ├── Clears cart items
   ├── Increments flash sale soldCount
   └── Returns { success: true, order, paymentUrl }
   │
   ▼
2. Frontend redirects user to OnePay payment URL
   │
   ▼
3. User completes card payment on OnePay portal
   │
   ├─────────────────────────────────┐
   │                                 │
   ▼                                 ▼
4. IPN Callback (server-to-server)  5. User Redirect (browser)
   │                                 │
   GET /api/v1/webhooks/onepay/ipn   GET /api/v1/shop/payment/onepay/return
   │                                 │
   ├── Verify vpc_SecureHash         ├── Verify vpc_SecureHash
   ├── Find order by orderNumber     ├── Redirect to frontend:
   ├── Update PaymentStatus:         │   - Success: /checkout/success?orderNumber=X
   │   - "0" → PAID                  │   - Failed: /checkout/payment-error?orderNumber=X&code=Y
   │   - else → FAILED               │   - Invalid: /checkout/payment-error?reason=invalid_signature
   ├── If PAID: Sync to CDP & Nhanh  │
   └── Return: responsecode=1&desc=confirm-success
```

---

## API Endpoints

### 1. Place Order (with OnePay payment)

**Endpoint**: `POST /api/v1/shop/checkout/sessions/:id/place-order`

**Authentication**: Shop auth (JWT or session ID)

**Request**:
```json
{
  "paymentMethod": "onepay_intercard"  // or "onepay_domestic"
}
```

**Response**:
```json
{
  "success": true,
  "paymentUrl": "https://mtf.onepay.vn/paygate/vpcpay.op?vpc_Version=2&...",
  "order": {
    "id": "...",
    "orderNumber": "ORD-20241226-0001",
    "total": 500000,
    "paymentStatus": "pending",
    "paymentMethod": "onepay_intercard",
    ...
  }
}
```

**Note**: `paymentUrl` is only returned for OnePay payment methods. For COD or other methods, only `order` is returned.

**Error Response**:
```json
{
  "success": false,
  "missingFields": ["customer.name", "shippingAddress.cityId"],
  "validationErrors": [
    {
      "productId": "...",
      "productName": "Product A",
      "error": "unavailable",
      "message": "Product is not available"
    }
  ]
}
```

### 2. IPN Callback (Webhook)

**Endpoint**: `GET /api/v1/webhooks/onepay/ipn`

**Authentication**: None (public endpoint, verified by signature)

**Query Parameters**: All OnePay response parameters including `vpc_SecureHash`

**Response**: Plain text
- Success: `responsecode=1&desc=confirm-success`
- Failure: `responsecode=0&desc=confirm-fail`

### 3. Return URL Handler

**Endpoint**: `GET /api/v1/shop/payment/onepay/return`

**Authentication**: None (public endpoint, verified by signature)

**Query Parameters**: All OnePay response parameters

**Response**: HTTP 302 Redirect to frontend URLs

---

## Configuration

### Environment Variables

```bash
# OnePay Payment Gateway Configuration
# For production, replace with actual merchant credentials from OnePay

ONEPAY_MERCHANT_ID=TESTONEPAY          # Merchant ID
ONEPAY_ACCESS_CODE=6BEB2546            # Access code
ONEPAY_HASH_CODE=6D0870CDE5F24F34F3915FB0045120DB  # SHA256 HMAC hash code
```

### Code-Level Constants

Located in `src/onepay/onepay.constants.ts`:

```typescript
// Sandbox URL (change to 'https://onepay.vn/paygate/vpcpay.op' for production)
export const ONEPAY_PAYMENT_URL = 'https://mtf.onepay.vn/paygate/vpcpay.op';

// API parameters
export const ONEPAY_VERSION = '2';
export const ONEPAY_COMMAND = 'pay';
export const ONEPAY_CURRENCY = 'VND';
export const ONEPAY_LOCALE = 'vn';

// URL paths (appended to BACKEND_DOMAIN from app config)
export const ONEPAY_RETURN_PATH = '/api/v1/shop/payment/onepay/return';
export const ONEPAY_IPN_PATH = '/api/v1/webhooks/onepay/ipn';
```

---

## Payment Methods & Card Types

| Payment Method | vpc_CardList | Accepted Cards |
|----------------|--------------|----------------|
| `onepay_intercard` | `INTERCARD` | Visa, MasterCard, JCB, AMEX, CUP |
| `onepay_domestic` | `DOMESTIC` | Vietnamese ATM cards (VCB, ABB, etc.) |

---

## OnePay Request Parameters

When redirecting to OnePay, these parameters are sent:

| Parameter | Description | Example |
|-----------|-------------|---------|
| `vpc_Version` | API version | `2` |
| `vpc_Currency` | Currency code | `VND` |
| `vpc_Command` | Command type | `pay` |
| `vpc_AccessCode` | Merchant access code | From config |
| `vpc_Merchant` | Merchant ID | From config |
| `vpc_Locale` | UI language | `vn` |
| `vpc_ReturnURL` | User redirect URL | `{BACKEND_DOMAIN}/api/v1/shop/payment/onepay/return` |
| `vpc_MerchTxnRef` | Transaction reference | `{orderNumber}-{timestamp}` |
| `vpc_OrderInfo` | Order description | `Payment for order ORD-20241226-0001` |
| `vpc_Amount` | Amount in cents | `50000000` (500,000 VND) |
| `vpc_TicketNo` | Client IP address | `192.168.1.1` |
| `vpc_CardList` | Accepted card types | `INTERCARD` or `DOMESTIC` |
| `vpc_CallbackURL` | IPN webhook URL | `{BACKEND_DOMAIN}/api/v1/webhooks/onepay/ipn` |
| `vpc_SecureHash` | SHA256 HMAC signature | Auto-generated |
| `vpc_SecureHashType` | Hash algorithm | `SHA256` |

---

## OnePay Response Handling

### Response Codes

| vpc_TxnResponseCode | Meaning |
|---------------------|---------|
| `0` | Transaction successful |
| `1` | Transaction failed - Bank declined |
| `2` | Transaction failed - Invalid card |
| `3` | Transaction failed - Expired card |
| `4` | Transaction failed - Insufficient funds |
| `5` | Transaction failed - Card not enrolled |
| `6` | Transaction failed - Invalid CVV |
| `7` | Transaction failed - Invalid OTP |
| `99` | Transaction failed - User cancelled |
| Other | Transaction failed - Unknown error |

### IPN Callback Processing

1. **Verify Signature**: Validate `vpc_SecureHash` using SHA256 HMAC
2. **Extract Order**: Parse `orderNumber` from `vpc_MerchTxnRef`
3. **Idempotency Check**: Skip if `paymentStatus !== PENDING`
4. **Update Status**: Set to `PAID` (code=0) or `FAILED` (other codes)
5. **Sync on Success**: If `PAID`, sync order to CDP and Nhanh.vn (fire-and-forget)
6. **Return Response**: `responsecode=1&desc=confirm-success` or `responsecode=0&desc=confirm-fail`

---

## Security

### Signature Generation (vpc_SecureHash)

```typescript
// 1. Filter only vpc_* params (exclude vpc_SecureHash and vpc_SecureHashType)
// 2. Sort params alphabetically by key
// 3. Join as key=value&key2=value2
// 4. Generate HMAC-SHA256 with hash code (hex decoded)
// 5. Convert to uppercase hex string

const vpcParams = Object.keys(params)
  .filter(key => key.startsWith('vpc_') &&
                 key !== 'vpc_SecureHash' &&
                 key !== 'vpc_SecureHashType')
  .sort()
  .map(key => `${key}=${params[key]}`)
  .join('&');

const hmac = crypto.createHmac('sha256', Buffer.from(hashCode, 'hex'));
hmac.update(vpcParams);
const hash = hmac.digest('hex').toUpperCase();
```

### Signature Verification

Both IPN callback and return URL verify the signature before processing:

```typescript
function verifySecureHash(params: Record<string, string>, hashCode: string): boolean {
  const receivedHash = params['vpc_SecureHash'];
  const calculatedHash = generateSecureHash(params, hashCode);
  return receivedHash?.toUpperCase() === calculatedHash.toUpperCase();
}
```

---

## File Structure

```
src/onepay/
├── config/
│   ├── onepay-config.type.ts    # Config type definition
│   └── onepay.config.ts         # NestJS config with validation
├── onepay.constants.ts          # Hardcoded constants
├── onepay.utils.ts              # Hash generation/verification utilities
├── onepay.service.ts            # Core payment service
├── onepay-webhook.controller.ts # IPN callback handler
├── onepay.module.ts             # Module definition
└── README.md                    # This documentation

src/shop/payment/
├── payment.controller.ts        # Return URL handler
└── payment.module.ts            # Payment module
```

---

## Testing

### Sandbox Test Cards

| Card Type | Number | Expiry | CVV | OTP |
|-----------|--------|--------|-----|-----|
| Visa | 4000000000001091 | 05/2026 | 123 | - |
| MasterCard | 5123450000000008 | 05/2026 | 123 | - |
| ATM (ABB) | 9704250000000001 | 01/13 | - | 123456 |
| ATM (VCB) | 9704360000000000002 | 01/13 | - | 123456 |

### Testing Flow

1. Create a checkout session with items
2. Call `POST /api/v1/shop/checkout/sessions/:id/place-order` with `paymentMethod: "onepay_intercard"`
3. Copy the `paymentUrl` from response
4. Open in browser and complete payment with test card
5. Verify:
   - IPN callback was received (check logs)
   - Order `paymentStatus` updated to `paid`
   - Order synced to CDP and Nhanh (check sync status)
   - User redirected to success page

### Testing IPN Locally

Use ngrok or similar to expose local server:

```bash
ngrok http 3000
```

Update `BACKEND_DOMAIN` in `.env`:
```bash
BACKEND_DOMAIN=https://abc123.ngrok.io
```

---

## Production Checklist

- [ ] Update `ONEPAY_MERCHANT_ID` with production merchant ID
- [ ] Update `ONEPAY_ACCESS_CODE` with production access code
- [ ] Update `ONEPAY_HASH_CODE` with production hash code
- [ ] Change `ONEPAY_PAYMENT_URL` in constants to `https://onepay.vn/paygate/vpcpay.op`
- [ ] Ensure `BACKEND_DOMAIN` is set to production domain with HTTPS
- [ ] Ensure `WEBSITE_DOMAIN` is set for correct frontend redirects
- [ ] Test end-to-end payment flow in production
- [ ] Monitor IPN callback logs for failures
- [ ] Set up alerts for payment failures

---

## Troubleshooting

### Common Issues

1. **Invalid Secure Hash**
   - Verify `ONEPAY_HASH_CODE` is correct
   - Check that all `vpc_*` params are included in hash calculation
   - Ensure params are sorted alphabetically

2. **IPN Not Received**
   - Check that `BACKEND_DOMAIN` is publicly accessible
   - Verify firewall allows incoming GET requests
   - Check OnePay merchant portal for IPN logs

3. **Order Not Found in IPN**
   - Verify `vpc_MerchTxnRef` format matches expected pattern
   - Check `extractOrderNumber()` parsing logic

4. **Payment Status Not Updated**
   - Check idempotency logic (order might already be processed)
   - Verify database connection
   - Check logs for errors

### Logging

Enable debug logging to see IPN params:

```typescript
this.logger.debug('IPN params:', JSON.stringify(params));
```

---

## References

- [OnePay Integration Documentation](https://mtf.onepay.vn/developer/)
- [OnePay Merchant Portal (Sandbox)](https://mtf.onepay.vn/merchant/)
- [OnePay Merchant Portal (Production)](https://onepay.vn/merchant/)
