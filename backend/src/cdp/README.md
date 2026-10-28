# CDP Integration

This module provides integration with the MMenu CDP (Customer Data Platform) system via gRPC.

## Features

- **Lazy Authentication**: Server authenticates on first API call (not on startup)
- **Token Management**: Access tokens cached in Redis and database (1 year expiration, refreshes 1 day before expiry)
- **Two-Tier Storage**: Cache Manager (Redis) for fast access, SecretRepository (MongoDB) for persistence
- **User Synchronization**: Automatically syncs user data to CDP on create/update operations
- **CDP Customer ID Tracking**: Stores CDP customer ID in user model for reference

## Configuration

Add the following environment variables to your `.env` file:

```env
CDP_PHONE=your_cdp_phone
CDP_PASSWORD=your_cdp_password
```

## Architecture

### Services

- **CdpService**: Low-level gRPC client for CDP API
  - Handles authentication and token management using Cache Manager + SecretRepository pattern (same as Zalo OA and Nhanh)
  - Token flow: Cache (Redis) → Database (MongoDB) → Authenticate
  - Provides `createOrUpdateCustomer` method
  - Hardcoded to use `internalcdpapi.mmenu.io` domain
  - Tokens automatically refresh 1 day before expiration

- **CdpSyncService**: High-level service for syncing users
  - Maps User domain objects to CDP Customer objects
  - Handles errors gracefully to avoid blocking user operations
  - Returns CDP customer ID for storage

### Integration Points

User sync is triggered in [UsersService](../users/users.service.ts):
- On user creation (line ~115)
- On user update (line ~277)

Sync operations run asynchronously to avoid blocking user operations.

## Data Mapping

User fields are mapped to CDP Customer fields as follows:

| User Field | CDP Customer Field | Notes |
|------------|-------------------|-------|
| phone | phone | |
| email | email | |
| firstName + lastName | name | Concatenated |
| photo.path | image_urls[0] | Single image |
| - | status | Always set to 'active' |
| - | brand.brand_code | Always set to 'CCHAT' (deprecated field) |
| cdpCustomerId | customer_id | For updates |
| socialId (Zalo) | interactive_channels[].zalo_user_id | If provider is 'zalo' |

## Proto Files

Proto definitions are located in [src/proto/cdp/](../proto/cdp/):
- `auth.proto`: Authentication service
- `customer.proto`: Customer management service

TypeScript types are generated in [types/](./types/).

## Error Handling

CDP sync errors are logged but do not block user operations. This ensures the application remains functional even if CDP is unavailable.

## Implementation Notes

The CDP API uses native gRPC protocol. The implementation uses `@grpc/grpc-js` with the following configuration:

- Server address: `mmenu-cdp-server-prod.mmenu-prod.svc.cluster.local:8081` (internal k8s service)
- Credentials: Insecure (for internal k8s communication)
- Required metadata: `appid: mmenu-internal`
- Authorization metadata: `Bearer {token}` (for authenticated endpoints)
- Proto files loaded at runtime from `src/proto/cdp/`

### Logging

Essential operations are logged with `[CDP]` prefix:
- Service initialization
- Authentication success/failure
- Sync errors

## Usage Example

```typescript
// Manual sync (if needed)
import { CdpSyncService } from './cdp/cdp-sync.service';

constructor(private cdpSyncService: CdpSyncService) {}

async syncUserManually(user: User) {
  const cdpUserId = await this.cdpSyncService.syncUser(user);
  if (cdpUserId) {
    console.log('Synced to CDP:', cdpUserId);
  }
}
```
