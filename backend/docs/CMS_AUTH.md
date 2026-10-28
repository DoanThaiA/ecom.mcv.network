# CMS Authentication

This document explains the CMS authentication flow implemented in `src/auth/cms-auth.controller.ts` and `src/auth/cms-auth.service.ts`.

## CMS auth architecture

CMS auth is intentionally separated from shop auth.
It uses a different user collection (`cms-users`), a different payload structure, and different route guards.

Key classes:

- `CmsAuthController` - CMS login, refresh, logout, current user, and update endpoints.
- `CmsAuthService` - validates CMS credentials and manages session-based JWT tokens.
- `JwtCmsStrategy` - validates CMS JWT access tokens.
- `JwtRefreshStrategy` - validates refresh tokens for both shop and CMS refresh flows.

## CMS auth flows

### Login

Endpoint:

- `POST /api/v1/auth/cms/login`

Behavior:

- Looks up the CMS user by email.
- Requires an existing hashed password.
- Rejects users with `status !== active`.
- Compares the provided password with bcrypt.
- Creates a CMS session via `SessionService.createForCmsUser()`.
- Issues a JWT access token and refresh token.

Why this flow exists:

- CMS users are separate from shoppers and have explicit permissions.
- CMS login is password-based only, with no public account registration.

### Access token payload

CMS JWT access tokens include:

- `id` - CMS user ID
- `permissions` - permission array used by admin authorization logic
- `accountType` - CMS account type
- `affiliateId` - optional affiliate scoping
- `sessionId` - session identifier

This allows downstream CMS guards and decorators to enforce permissions and account-level behavior.

### Refresh and logout

Endpoints:

- `POST /api/v1/auth/cms/refresh`
- `POST /api/v1/auth/cms/logout`

Behavior:

- Both endpoints use `AuthGuard('jwt-refresh')`.
- Refresh verifies the session exists and `hash` matches.
- Refresh rotates the session hash and issues new JWT tokens.
- Logout deletes the session record.

Why this flow exists:

- CMS sessions are stateful, so refresh tokens can be revoked by deleting the session.
- Token rotation improves security and prevents reuse of old refresh tokens.

### Current user and profile update

Endpoints:

- `GET /api/v1/auth/cms/me`
- `PATCH /api/v1/auth/cms/me`

Behavior:

- Protected by `AuthGuard('jwt-cms')`.
- `me` returns the current CMS user record.
- `update` allows changing CMS user fields and password.
- When password changes, existing sessions are invalidated except the current one.

Why this flow exists:

- CMS users can manage their own account data.
- Password changes force session renewal for security.

## CMS integration OAuth flows

Certain platform integrations are managed through CMS auth because they require owner-level credentials and backend-only token management.

### Zalo Official Account (Zalo OA)

Endpoints:

- `GET /api/v1/integration/zalo/redirect`
- `POST /api/v1/integration/zalo/callback`
- `GET /api/v1/integration/zalo/connection`

Behavior:

- Protected by `AuthGuard('jwt-cms')` and `ModulePermissionsGuard` with `ModulePermission.settings`.
- `redirect` returns the Zalo OA OAuth URL.
- `callback` exchanges the authorization code for access and refresh tokens.
- Access tokens are not returned to the client; they are stored server-side in cache/database.
- `connection` checks and refreshes the stored token if needed, then returns connection status.

Why this belongs in CMS auth:

- Zalo OA is a CMS integration, not a shop login method.
- The CMS owner explicitly authorizes the application to access the official account.
- Tokens are used by backend services and must be protected from client exposure.
- CMS owner permission is required because this affects business-level communication channels.

### Nhanh integration

Endpoints:

- `GET /api/v1/integration/nhanh/redirect`
- `POST /api/v1/integration/nhanh/callback`
- `GET /api/v1/integration/nhanh/connection`
- `POST /api/v1/integration/nhanh/sync/products`
- `POST /api/v1/integration/nhanh/sync/product-details`
- `POST /api/v1/integration/nhanh/sync/product-embed`
- `POST /api/v1/integration/nhanh/sync/product-categories`
- `POST /api/v1/integration/nhanh/sync/product-inventories`
- `POST /api/v1/integration/nhanh/sync/product-brands`
- `POST /api/v1/integration/nhanh/sync/depots`
- `POST /api/v1/integration/nhanh/sync/all`

Behavior:

- Protected by the same CMS owner/permission guards.
- `redirect` returns the Nhanh OAuth authorization URL.
- `callback` exchanges the Nhanh authorization code for a server-side token.
- `connection` verifies the stored Nhanh token and returns business info.
- Sync endpoints start async worker jobs for product/category/inventory/brand/depot sync.

Why this belongs in CMS auth:

- Nhanh integration is a backend integration point for product and inventory sync.
- Only CMS owners should configure and authorize Nhanh because it affects the merchant's external store data.
- Tokens are never exposed to the frontend, and sync jobs run independently from customer authentication.

## Separation from shop auth

Key differences:

- CMS auth uses a different user store (`cms-users`) and not the shop `users` collection.
- CMS tokens carry `permissions` and `accountType` fields.
- CMS login is email/password only.
- CMS endpoints are isolated under `/auth/cms` and use `jwt-cms` guard.

This separation ensures that CMS admin auth and shop customer auth are decoupled while reusing shared session/refresh token infrastructure where appropriate.
