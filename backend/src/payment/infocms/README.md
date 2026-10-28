# InfoCMS VietQR Payment Integration

## Overview

This module integrates InfoCMS POS Payment (VietQR) into the checkout flow. It enables QR code-based payments where customers scan a VietQR code and pay via their banking app.

## Features

- **Payment Service**: VietQR POS payment
- **Payment Method**: `infocms_vietqr`
- **Flow**: Generate QR → Customer scans & pays → Callback notification
- **Environment**: Configurable via environment variables

---

## Payment Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PAYMENT FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

1. User selects InfoCMS VietQR payment
   │
   ▼
   POST /api/v1/shop/checkout/sessions/:id/place-order
   Body: { paymentMethod: "infocms_vietqr" }
   │
   ├── Validates checkout session
   ├── Creates Order (PaymentStatus.PENDING)
   ├── Calls InfoCMS API to create QR code
   ├── Stores transactionUuid and ecollectionCd in order
   └── Returns { success: true, order, qrUrl, qrData }
   │
   ▼
2. Frontend displays QR code to customer
   │
   ▼
3. Customer scans QR with banking app and pays
   │
   ▼
4. Bank processes payment → InfoCMS receives confirmation
   │
   ▼
5. InfoCMS Callback (server-to-server)
   │
   POST /api/v1/webhooks/infocms/callback
   │
   ├── Extract orderNumber from transactionUuid
   ├── Find order by orderNumber
   ├── Update PaymentStatus to PAID
   ├── Store transId and bankTransId
   ├── Sync to CDP & Nhanh (fire-and-forget)
   └── Return success response to InfoCMS
```

---

## API Endpoints

### 1. Create QR Code

Called internally when order is placed with `infocms_vietqr` payment method.

**InfoCMS API**: `POST /ocms/v3/ec/po_create_qr`

**Returns**:
- `qrUrl`: VietQR image URL for display
- `qrData`: Raw QR data string
- `ecollectionCd`: E-collection code (virtual account)
- `transactionUuid`: Transaction ID for tracking

### 2. Payment Callback (Webhook)

**Endpoint**: `POST /api/v1/webhooks/infocms/callback`

**Request Body**:
```json
{
  "data": {
    "bankCd": "123456",
    "motherAccntNo": "3004000039629000",
    "ecollectionCd": "4331448460967701",
    "payerNo": "84379834830",
    "transId": "M00000060123070110251135060322",
    "bankTransId": "434190143943145F20221128",
    "depositAmt": 200000,
    "depositDtm": "20230704010101",
    "recvDtm": "20230704011000",
    "transactionUuid": "POS00120231215113509ABC123",
    "posUniqueId": "POS001"
  }
}
```

**Response**:
```json
{
  "responseCd": "000000",
  "responseMsg": "OK.",
  "responseTs": "2023-07-04 01:10:05 123",
  "responseTraceId": "uuid"
}
```

### 3. Cancel QR Code

**InfoCMS API**: `POST /ocms/v2/ec/po_cancel_qr`

Used when order is cancelled before payment.

### 4. Inquiry Receivables

**InfoCMS API**: `POST /ocms/v2/ec/po_inquiry_eccode_recv`

Query payment status for an e-collection code.

---

## Configuration

### Environment Variables

```bash
# InfoCMS Payment Gateway Configuration

# Required - Authentication
INFOCMS_MASTER_ID=your_master_id          # Master ID from CMS contract
INFOCMS_CLIENT_ID=your_client_id          # Client ID for API access
INFOCMS_CLIENT_SECRET=your_client_secret  # Client secret for HMAC auth
INFOCMS_BANK_CODE=your_bank_code          # Bank code for processing

# Required - POS Configuration
INFOCMS_POS_UNIQUE_ID=POS001              # Unique ID for this POS system
# Optional
INFOCMS_POS_FRANCHISEE_NAME=Your Store    # Store name (shown on receipt)
INFOCMS_POS_COMPANY_NAME=Your Company     # Company name
```

---

## Security

### Authentication Flow

1. **Login**: HMAC-SHA512 signature
   ```
   Authorization = Base64(HMAC-SHA512(clientId + YYYYMMDD + clientSecret, clientSecret))
   ```

2. **API Calls**: JWT token in `token` header
   - Access token expires in 30 minutes
   - Refresh token expires in 24 hours
   - Service auto-refreshes tokens

### Encryption Options

#### Option 1: PGP Encryption (Default)
- Request body encrypted with InfoCMS public key
- Response decrypted with your private key
- Most secure option

#### Option 2: RSA Signing (Unused)
- Request body signed with your RSA private key
- Signature included in `CMS-RSA-Signature` header
- Lighter weight than PGP

---

## File Structure

```
src/payment/infocms/
├── config/
│   ├── infocms-config.type.ts    # Config type definition
│   └── infocms.config.ts         # NestJS config with validation
├── infocms.constants.ts          # API URLs, endpoints, error codes
├── infocms.utils.ts              # Crypto utilities, types
├── infocms.service.ts            # Core payment service
├── infocms-webhook.controller.ts # Callback handler
├── infocms.module.ts             # Module definition
└── README.md                     # This documentation
```

---

## Order Fields

Orders with InfoCMS payment include a nested `infocms` object:

| Field | Description |
|-------|-------------|
| `infocms.transactionUuid` | POS transaction ID (generated at QR creation) |
| `infocms.ecollectionCd` | E-collection code / virtual account |
| `infocms.transId` | InfoCMS transaction ID (from callback) |
| `infocms.bankTransId` | Bank transaction ID (from callback) |

---

## Error Handling

### Common Error Codes

| Code | Message | Action |
|------|---------|--------|
| `000000` | Success | - |
| `S00010` | All tokens expired | Service will auto re-login |
| `C00125` | No available e-collection code | Check POS configuration |
| `C00126` | Already paid | Order already processed |
| `C00127` | Already cancelled | QR was cancelled |
| `C00128` | Duplicate transaction UUID | Retry with new UUID |

### Service Behavior

- **Token Management**: Auto-refreshes tokens before expiry
- **Idempotency**: Callbacks are idempotent (skips if already PAID)
- **Amount Verification**: Logs warning if callback amount differs from order

---

## Integration with Checkout

To use InfoCMS payment in checkout:

```typescript
// In checkout service
if (paymentMethod === PaymentMethod.INFOCMS_VIETQR) {
  const qrResult = await this.infocmsService.createPaymentQr(order);

  if (!qrResult.success) {
    throw new Error(qrResult.errorMessage);
  }

  // Update order with InfoCMS data (nested object)
  await this.orderRepository.update(order.id, {
    infocms: {
      transactionUuid: qrResult.transactionUuid,
      ecollectionCd: qrResult.ecollectionCd,
    },
  });

  return {
    order,
    qrUrl: qrResult.qrUrl,
    qrData: qrResult.qrData,
  };
}
```

---

## Testing

### Manual Testing Flow

1. Configure environment variables
2. Create order with `paymentMethod: "infocms_vietqr"`
3. Display returned `qrUrl` as QR code
4. Scan with banking app (use test credentials if available)
5. Verify callback received and order updated to PAID

### Testing Callback Locally

Use ngrok to expose local server:

```bash
ngrok http 3000
```

Update `BACKEND_DOMAIN` in `.env`:
```bash
BACKEND_DOMAIN=https://abc123.ngrok.io
```

---

## Production Checklist

- [ ] Obtain production credentials from InfoCMS
- [ ] Update all INFOCMS_* environment variables
- [ ] Configure PGP keys
- [ ] Ensure `BACKEND_DOMAIN` is publicly accessible HTTPS
- [ ] Register callback URL with InfoCMS
- [ ] Test end-to-end payment flow
- [ ] Set up monitoring for callback failures
- [ ] Configure alerts for payment errors

---

## References

- [InfoCMS API Documentation](docs/infocms-pos-api.md) - Full API specification
- InfoCMS Support: Contact your InfoCMS representative
