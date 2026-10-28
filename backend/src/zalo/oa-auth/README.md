# Zalo Official Account (OA) OAuth Integration

This module implements OAuth 2.0 authentication for Zalo Official Accounts, allowing your application to integrate with Zalo OA API.

## Features

- OAuth 2.0 Authorization Code Flow
- Automatic token refresh (access tokens expire in 1 hour, refresh tokens in 90 days)
- Token caching with Redis (fallback to in-memory)
- Persistent token storage in database
- Connection verification endpoint
- Comprehensive error handling with i18n support
- Hardcoded OAuth endpoints (no configuration needed for URLs)

## Prerequisites

1. A Zalo Official Account
2. Registered application at [Zalo For Developers](https://developers.zalo.me/)
3. App ID and App Secret from your Zalo application (same credentials used for user authentication)

## Configuration

### Environment Variables

Add the following to your `.env` file (same credentials as user auth):

```env
# Zalo App credentials (used for both user auth and OA integration)
ZALO_APP_ID=your_app_id_here
ZALO_APP_SECRET=your_app_secret_here
```

**Note**: The OAuth URLs are hardcoded in the service and don't need environment variables:
- OAuth URL: `https://oauth.zaloapp.com/v4/oa/permission`
- Token URL: `https://oauth.zaloapp.com/v4/oa/access_token`
- API URL: `https://openapi.zalo.me`

### Callback URL Configuration

In your Zalo application settings, configure the OAuth callback URL as:

```
{CMS_DOMAIN}/integration/zalo
```

For example: `http://localhost:3002/integration/zalo`

## API Endpoints

### 1. Get Authorization URL

**Endpoint:** `GET /api/v1/integration/zalo/redirect`

**Description:** Generates the OAuth authorization URL for OA admin to authorize your application.

**Response:**
```json
{
  "url": "https://oauth.zaloapp.com/v4/oa/permission?app_id=123&redirect_uri=..."
}
```

**Usage:**
1. Call this endpoint to get the authorization URL
2. Redirect the OA admin to this URL
3. Admin grants permissions
4. Zalo redirects back to your callback URL with authorization code

### 2. Handle OAuth Callback

**Endpoint:** `POST /api/v1/integration/zalo/callback`

**Description:** Exchanges authorization code for access token and refresh token.

**Request Body:**
```json
{
  "code": "authorization_code_from_zalo"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "refresh_token_abc123",
  "expires_in": 3600,
  "created_at": 1706745600
}
```

**Notes:**
- Access token expires in 1 hour (3600 seconds)
- Refresh token expires in 90 days
- Tokens are automatically cached and stored in database
- The service will auto-refresh expired access tokens when needed

### 3. Check Connection

**Endpoint:** `GET /api/v1/integration/zalo/connection`

**Description:** Verifies the connection status and token validity with Zalo OA API.

**Response:**
```json
{
  "connected": true,
  "expiresAt": 1706749200,
  "refreshTokenExpiresAt": 1714521600,
  "oaId": "1234567890"
}
```

**Notes:**
- Clears cached token to force fresh validation
- Auto-refreshes expired access token if refresh token is valid
- Returns OA ID if available

## OAuth Flow Diagram

```
┌─────────────┐                                    ┌──────────────┐
│   Frontend  │                                    │   Zalo OA    │
│     (CMS)   │                                    │    OAuth     │
└──────┬──────┘                                    └───────┬──────┘
       │                                                   │
       │ 1. GET /integration/zalo/redirect                │
       ├──────────────────────────────────────────────────┤
       │                                                   │
       │ 2. Returns authorization URL                     │
       │◄──────────────────────────────────────────────────┤
       │                                                   │
       │ 3. Redirect admin to authorization URL           │
       ├──────────────────────────────────────────────────►
       │                                                   │
       │ 4. Admin grants permissions                      │
       │                                                   │
       │ 5. Redirect to callback with code                │
       │◄──────────────────────────────────────────────────┤
       │                                                   │
       │ 6. POST /integration/zalo/callback {code}        │
       ├──────────────────────────────────────────────────►
       │                                                   │
       │ 7. Exchange code for tokens                      │
       │                                                   │
       │ 8. Returns access_token & refresh_token          │
       │◄──────────────────────────────────────────────────┤
       │                                                   │
```

## Token Management

### Storage Strategy

The module uses a dual-layer caching strategy:

1. **Redis Cache (L1)**: Fast in-memory cache with TTL based on token expiration
2. **Database (L2)**: Persistent storage using `SecretRepository` key-value store

### Automatic Token Refresh

When retrieving tokens via `getAccessToken()`:

1. Check Redis cache first
2. If access token expired but refresh token valid → auto-refresh
3. If cache miss → check database
4. If database token expired but refresh token valid → auto-refresh
5. Update both cache and database with new token

### Token Expiration

- **Access Token**: 1 hour (3600 seconds)
- **Refresh Token**: 90 days (~7,776,000 seconds)

## Using Tokens in Your Service

```typescript
import { ZaloOaAuthService } from '../zalo/oa-auth/zalo-oa-auth.service';

export class YourService {
  constructor(private zaloOaAuthService: ZaloOaAuthService) {}

  async callZaloOaApi() {
    // Get valid access token (auto-refreshes if needed)
    const tokenData = await this.zaloOaAuthService.getAccessToken();

    if (!tokenData) {
      throw new Error('No Zalo OA token available. Please authenticate first.');
    }

    // Use the access token
    const response = await axios.get('https://openapi.zalo.me/v2.0/oa/...', {
      headers: {
        'access_token': tokenData.accessToken,
      },
    });

    return response.data;
  }
}
```

## Module Structure

```
src/zalo/
├── config/
│   ├── zalo-config.type.ts      # Shared Zalo config type
│   └── zalo.config.ts            # Shared Zalo config (appId, appSecret)
├── dto/
│   ├── zalo-user-login.dto.ts   # User auth DTOs
│   ├── zalo-oa-callback.dto.ts  # OA auth callback DTO
│   ├── zalo-oa-token-response.dto.ts  # OA token response DTO
│   └── zalo-oa-connection-check.dto.ts  # OA connection check DTO
├── interfaces/
│   └── zalo.interface.ts         # Shared interfaces for user & OA
├── user-auth/                    # User OAuth login
│   ├── zalo-user-auth.controller.ts
│   ├── zalo-user-auth.service.ts
│   └── zalo-user-auth.module.ts
└── oa-auth/                      # Official Account OAuth
    ├── zalo-oa-auth.controller.ts
    ├── zalo-oa-auth.service.ts
    ├── zalo-oa-auth.module.ts
    └── README.md (this file)
```

## Error Handling

All errors are internationalized and available in English and Vietnamese:

| Error Key | English | Vietnamese |
|-----------|---------|------------|
| `credentialsNotConfigured` | Zalo OA credentials not configured | Chưa cấu hình thông tin xác thực Zalo OA |
| `failedToGetAccessToken` | Failed to get access token from Zalo OA | Không thể lấy access token từ Zalo OA |
| `failedToRefreshToken` | Failed to refresh access token from Zalo OA | Không thể làm mới access token từ Zalo OA |
| `noAccessToken` | No Zalo OA access token available | Không có access token Zalo OA |
| `apiTimeout` | Zalo OA API request timeout | API Zalo OA hết thời gian chờ |

## Differences from User Auth

| Feature | User Auth | OA Auth |
|---------|-----------|---------|
| OAuth Version | v4 | v3 (auth) + v4 (token) |
| PKCE | Yes | No |
| State Management | MongoDB (temporary) | Not needed |
| Token Storage | None (single-use) | Redis + Database |
| Token Refresh | No | Yes (automatic) |
| Purpose | User login | Integration/API access |
| Endpoint | `/api/v1/auth/zalo` | `/api/v1/integration/zalo` |

## Security Considerations

1. **Shared Credentials**: Uses the same `ZALO_APP_ID` and `ZALO_APP_SECRET` as user auth
2. **Token Storage**: Access tokens are stored encrypted in database
3. **HTTPS Only**: Always use HTTPS for callback URLs in production
4. **Token Scope**: Tokens are scoped to specific OA permissions granted by admin

## Testing

### Manual Testing Flow

1. Start your backend server
2. Call `GET /api/v1/integration/zalo/redirect` to get authorization URL
3. Open the URL in browser (as OA admin)
4. Grant permissions to your application
5. After redirect, extract the `code` parameter from URL
6. Call `POST /api/v1/integration/zalo/callback` with the code
7. Verify token is stored by calling `GET /api/v1/integration/zalo/connection`

## Troubleshooting

### Common Issues

**Problem**: "Zalo OA credentials not configured"
- **Solution**: Ensure `ZALO_APP_ID` and `ZALO_APP_SECRET` are set in `.env`

**Problem**: "Failed to get access token"
- **Solution**: Check that the authorization code hasn't expired (valid for ~10 minutes)
- **Solution**: Verify callback URL matches exactly with Zalo app settings

**Problem**: "No Zalo OA access token available"
- **Solution**: Complete the OAuth flow by calling redirect → callback endpoints first

**Problem**: Token refresh fails
- **Solution**: Refresh token may have expired (90 days) - re-authenticate via OAuth flow

## References

- [Zalo Official Account OAuth Documentation](https://developers.zalo.me/docs/official-account/bat-dau/xac-thuc-va-uy-quyen-cho-ung-dung-new)
- [Zalo OA API Reference](https://developers.zalo.me/docs/api/official-account-api-147)
