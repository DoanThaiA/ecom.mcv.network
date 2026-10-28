# Zalo ZNS (Zalo Notification Service) Module

This module provides functionality to send ZNS (Zalo Notification Service) messages through the Zalo Official Account API.

## Features

- Send OTP via ZNS in phone registration/login flows
- Template-based messaging
- Automatic access token management (integrated with Zalo OA Auth)
- Type-safe template configuration
- Comprehensive error handling

## Integration with Phone Authentication

The ZNS module is integrated into the phone registration and login flows. Users can choose to receive OTP via ZNS (default) or SMS.

### Phone Registration with ZNS

**POST** `/api/v1/auth/phone/register`

```json
{
  "phone": "+84987654321",
  "firstName": "John",
  "lastName": "Doe",
  "otpMethod": "zns"
}
```

### Phone Login with ZNS

**POST** `/api/v1/auth/phone/login`

```json
{
  "phone": "+84987654321",
  "otpMethod": "zns"
}
```

**OTP Delivery Method:**
- `zns` (default) - Send OTP via Zalo Notification Service
- `sms` - Send OTP via SMS

If `otpMethod` is not specified, ZNS will be used by default.

## Template Configuration

Templates are defined in [zns-templates.config.ts](zns-templates.config.ts) with type safety:

```typescript
export const ZNS_TEMPLATES = {
  OTP: '506405',
  ORDER_CONFIRMATION: '6081926329735662467',
} as const;

export interface OtpTemplateData {
  otp: string;
}
```

## Usage in Code

### Send OTP

```typescript
import { ZaloZnsService } from './zalo/zns/zalo-zns.service';

@Injectable()
export class YourService {
  constructor(private zaloZnsService: ZaloZnsService) {}

  async sendOtp(phone: string, otp: string) {
    // Send OTP using the predefined template
    await this.zaloZnsService.sendOtp(phone, otp);
  }
}
```

### Send custom ZNS message

```typescript
await this.zaloZnsService.sendZns({
  phone: '+84987654321',
  templateId: ZNS_TEMPLATES.ORDER_CONFIRMATION,
  templateData: {
    customer_name: 'John Doe',
    order_code: 'ORD123',
    product_name: 'Product A',
    quantity: '1',
    total_amount: '100000',
  },
  trackingId: 'order_123',
});
```

## Template Configuration

1. Go to [Zalo Cloud](https://account.zalo.cloud/)
2. Navigate to your application
3. Create and configure ZNS templates
4. Get the template ID from the template management page
5. Use the template ID in your API requests

## Prerequisites

- Zalo Official Account must be authenticated (using the `/zalo/oa-auth` endpoints)
- ZNS templates must be created and approved in Zalo Cloud
- Valid access token (automatically managed by ZaloOaAuthService)

## Environment Variables

The module uses the following environment variables (configured in Zalo config):

- `ZALO_APP_ID` - Your Zalo application ID
- `ZALO_APP_SECRET` - Your Zalo application secret

## Error Handling

The service handles various error scenarios:

- **401 Unauthorized**: No valid access token available
- **408 Request Timeout**: API request timeout
- **422 Unprocessable Entity**: Failed to send ZNS message (invalid template, phone number, etc.)

## Integration with OA Auth

This module automatically integrates with the `ZaloOaAuthModule` to:

- Retrieve valid access tokens
- Automatically refresh expired tokens
- Handle token expiration gracefully

## API Documentation

For more details about the Zalo ZNS API, refer to:
- [Zalo ZNS Documentation](https://developers.zalo.me/docs/zalo-notification-service/gui-tin-zns/gui-zns)

## Template Data Format

Template data must match the placeholders defined in your ZNS template. All values must be strings.

Example template with placeholders:
- `{customer_name}` - Customer's name
- `{order_code}` - Order code
- `{product_name}` - Product name
- `{quantity}` - Quantity
- `{total_amount}` - Total amount

Make sure your template data keys match exactly with the template placeholders.
