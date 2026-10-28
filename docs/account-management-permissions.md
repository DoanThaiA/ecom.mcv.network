# Account Management & Permissions Module

> **Module Owner:** CMS Team  
> **Status:** Implemented  
> **Last Updated:** 2026-02-12

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Data Model](#data-model)
  - [Enums](#enums)
  - [MongoDB Schema](#mongodb-schema)
  - [Domain Entity](#domain-entity)
  - [Proto Definition](#proto-definition)
- [Backend](#backend)
  - [API Endpoints](#api-endpoints)
  - [DTOs & Validation](#dtos--validation)
  - [Service Logic](#service-logic)
  - [Repository Layer](#repository-layer)
  - [Permission Guards](#permission-guards)
  - [JWT Integration](#jwt-integration)
  - [i18n Error Messages](#i18n-error-messages)
- [CMS Frontend](#cms-frontend)
  - [Pages & Routes](#pages--routes)
  - [Redux State Management](#redux-state-management)
  - [Repository (API Client)](#repository-api-client)
  - [Form Components](#form-components)
  - [Sidebar Permission Filtering](#sidebar-permission-filtering)
  - [i18n Labels](#i18n-labels)
- [Permission Enforcement Matrix](#permission-enforcement-matrix)
- [File Inventory](#file-inventory)

---

## Overview

The Account Management & Permissions module provides a comprehensive system for managing CMS user accounts with role-based access control (RBAC) at two levels:

1. **Permission Groups** (role-level): `owner`, `manager`, `staff` — controls high-level access to the CMS Users management section itself.
2. **Module Permissions** (feature-level): Fine-grained permissions for individual CMS modules (products, orders, flash sales, etc.) — controls which features a non-owner user can access.

Additionally, the module supports two **Account Types**:

- **Website Admin** — standard CMS administrator with email/password login
- **Affiliate** — linked to an existing affiliate record, auto-populated from affiliate data, with a system-generated password

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                   CMS Frontend                       │
│                                                      │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │  Pages   │  │   Redux   │  │   Sidebar Nav    │  │
│  │ List/    │→ │ Slice +   │→ │   filterNav()    │  │
│  │ Create/  │  │ Saga      │  │   by permissions │  │
│  │ Edit     │  └─────┬─────┘  └──────────────────┘  │
│  └──────────┘        │                               │
│                      ▼                               │
│              ┌───────────────┐                        │
│              │  Repository   │ (axios HTTP client)    │
│              └───────┬───────┘                        │
└──────────────────────┼───────────────────────────────┘
                       │  REST API
┌──────────────────────┼───────────────────────────────┐
│                Backend (NestJS)                       │
│                      ▼                               │
│  ┌────────────────────────────────────────────────┐  │
│  │            CmsUsersController                  │  │
│  │  @UseGuards(AuthGuard('jwt-cms'),              │  │
│  │             CmsPermissionsGuard)               │  │
│  │  @CmsPermissions(PermissionGroupEnum.owner)    │  │
│  └───────────────────┬────────────────────────────┘  │
│                      ▼                               │
│  ┌──────────────────────────┐                        │
│  │     CmsUsersService      │                        │
│  │  - create()              │                        │
│  │  - update()              │                        │
│  │  - findManyWithPagination│                        │
│  │  - remove()              │                        │
│  └───────────┬──────────────┘                        │
│              ▼                                       │
│  ┌──────────────────────────┐                        │
│  │   CmsUserRepository      │ (abstract)             │
│  │   └─ CmsUsersDocumentRepo│ (MongoDB impl)        │
│  │      └─ CmsUserMapper    │ (domain ↔ document)   │
│  └───────────┬──────────────┘                        │
│              ▼                                       │
│  ┌──────────────────────────┐                        │
│  │  MongoDB: cms_users      │                        │
│  └──────────────────────────┘                        │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │  ModulePermissionsGuard (applied to 16      │  │
│  │  controllers) — checks user.permissions[]      │  │
│  │  against @RequireModulePermission() metadata│  │
│  │  Owner bypasses all module permission checks   │  │
│  └────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────┘
```

---

## Data Model

### Enums

All enums use **numeric values** (proto-style) for consistency between backend, proto, and frontend.

#### PermissionGroupEnum

| Value | Key       | Description                                                      |
| ----- | --------- | ---------------------------------------------------------------- |
| `1`   | `owner`   | Full access, manages other accounts, bypasses module permissions |
| `2`   | `manager` | Mid-level access, subject to module permissions                  |
| `3`   | `staff`   | Limited access, subject to module permissions                    |

**File:** `backend/src/cms-users/permissions/permissions.enum.ts`

#### AccountTypeEnum

| Value | Key             | Description                         |
| ----- | --------------- | ----------------------------------- |
| `1`   | `website_admin` | Standard CMS admin with password    |
| `2`   | `affiliate`     | Linked to affiliate, auto-populated |

**File:** `backend/src/cms-users/permissions/account-type.enum.ts`

#### ModulePermission

| Value | Key                     | Controls Access To                                                        |
| ----- | ----------------------- | ------------------------------------------------------------------------- |
| `1`   | `product_management`    | Products, combos, categories, banners, color variants, reviews, inventory |
| `2`   | `order_management`      | Orders (CMS view)                                                         |
| `3`   | `return_management`     | Return requests                                                           |
| `4`   | `flash_sale_management` | Flash sale campaigns                                                      |
| `5`   | `promotion_management`  | Promotions                                                                |
| `6`   | `news_management`       | Articles                                                                  |
| `7`   | `homepage_management`   | Topics, menus, banners                                                    |
| `8`   | `settings`              | Shipping promotions, affiliate management, withdrawal requests            |

**File:** `backend/src/cms-users/permissions/module-permission.enum.ts`

#### StatusEnum

| Value | Key        |
| ----- | ---------- |
| `1`   | `active`   |
| `2`   | `inactive` |

**File:** `backend/src/statuses/statuses.enum.ts`

### Proto Enum Transformation

All enum values transmitted over the API use numeric proto format. Backend DTOs use `@TransformProtoEnum()` decorator with corresponding proto maps to handle both numeric and string enum values.

Proto maps are defined in `backend/src/utils/transformers/proto-enum.transformer.ts`:

- `STATUS_PROTO_MAP` — `{1:1, 2:2}`
- `PERMISSION_GROUP_PROTO_MAP` — `{1:1, 2:2, 3:3}`
- `ACCOUNT_TYPE_PROTO_MAP` — `{1:1, 2:2}`
- `MODULE_PERMISSION_PROTO_MAP` — `{1:1, 2:2, ..., 8:8}`

### MongoDB Schema

**Collection:** `cms_users`

| Field             | Type     | Required | Default             | Index   |
| ----------------- | -------- | -------- | ------------------- | ------- |
| `email`           | String   | Yes      | —                   | unique  |
| `password`        | String   | Yes      | —                   | —       |
| `firstName`       | String   | No       | —                   | —       |
| `lastName`        | String   | No       | —                   | —       |
| `phone`           | String   | No       | —                   | —       |
| `photo`           | File     | No       | —                   | —       |
| `permissionGroup` | Number   | Yes      | —                   | indexed |
| `accountType`     | Number   | No       | `1` (website_admin) | indexed |
| `permissions`     | [Number] | No       | `[]`                | —       |
| `affiliateId`     | String   | No       | `null`              | indexed |
| `status`          | Number   | No       | `1` (active)        | —       |
| `createdAt`       | Date     | Auto     | `now()`             | —       |
| `updatedAt`       | Date     | Auto     | `now()`             | —       |
| `deletedAt`       | Date     | No       | —                   | —       |

**File:** `backend/src/cms-users/model/cms-user.schema.ts`

### Domain Entity

```typescript
export class CmsUser {
  id: number | string;
  email?: string | null; // @Expose(['me', 'cms-admin'])
  password?: string; // @Exclude (never serialized)
  firstName: string | null;
  lastName?: string | null;
  phone?: string | null;
  photo?: File | null;
  permissionGroup?: PermissionGroupEnum | null;
  accountType?: AccountTypeEnum | null;
  permissions?: ModulePermission[];
  affiliateId?: string | null;
  status?: StatusEnum | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date;
}
```

**File:** `backend/src/cms-users/domain/cms-user.ts`

### Proto Definition

```protobuf
message CmsUser {
  string          id               = 1;
  optional string email            = 2;
  optional string first_name       = 3;
  optional string last_name        = 4;
  optional File   photo            = 5;
  optional PermissionGroupEnum      permission_group = 6;
  optional StatusEnum               status           = 7;
  Timestamp       created_at       = 8;
  Timestamp       updated_at       = 9;
  Timestamp       deleted_at       = 10;
  optional string phone            = 11;
  optional AccountTypeEnum          account_type     = 12;
  repeated ModulePermissionEnum  permissions      = 13;
  optional string affiliate_id     = 14;
}
```

**File:** `proto/cms/cms-users/cms-user.proto`

---

## Backend

### API Endpoints

All endpoints require `AuthGuard('jwt-cms')` + `CmsPermissionsGuard` at the controller level, restricted to **owner** permission group only.

Base path: `/api/v1/cms-users`

| Method   | Path             | Description                | Status Code |
| -------- | ---------------- | -------------------------- | ----------- |
| `POST`   | `/cms-users`     | Create a new CMS user      | `201`       |
| `GET`    | `/cms-users`     | List CMS users (paginated) | `200`       |
| `GET`    | `/cms-users/:id` | Get single CMS user by ID  | `200`       |
| `PATCH`  | `/cms-users/:id` | Update CMS user            | `200`       |
| `DELETE` | `/cms-users/:id` | Delete CMS user            | `204`       |

All mutations (`POST`, `PATCH`, `DELETE`) are decorated with `@AuditLog()` for audit trail tracking. The `password` field is marked as a sensitive field in audit logs.

**File:** `backend/src/cms-users/cms-users.controller.ts`

### DTOs & Validation

#### CreateCmsUserDto

| Field             | Type                  | Required        | Validation                          |
| ----------------- | --------------------- | --------------- | ----------------------------------- |
| `email`           | string                | Yes             | `@IsEmail`, `@Transform(lowerCase)` |
| `password`        | string                | Conditional\*   | `@MinLength(6)`                     |
| `firstName`       | string                | Yes             | `@IsNotEmpty`                       |
| `lastName`        | string                | No              | —                                   |
| `phone`           | string                | No              | `@IsString`                         |
| `photo`           | FileDto               | No              | —                                   |
| `permissionGroup` | PermissionGroupEnum   | Yes             | `@TransformProtoEnum`               |
| `accountType`     | AccountTypeEnum       | Yes             | `@TransformProtoEnum`               |
| `permissions`     | ModulePermission[] | No              | `@IsArray`, `@IsEnum(each)`         |
| `affiliateId`     | string                | Conditional\*\* | `@IsString`                         |
| `status`          | StatusEnum            | No              | `@TransformProtoEnum`               |

\* Required for `website_admin` account type; auto-generated for `affiliate` type.  
\*\* Required when `accountType` = `affiliate`.

**File:** `backend/src/cms-users/dto/create-cms-user.dto.ts`

#### UpdateCmsUserDto

Extends `PartialType(CreateCmsUserDto)` — all fields are optional. Only fields that are explicitly provided in the request body are updated (conditional payload building prevents overwriting with `undefined`).

**File:** `backend/src/cms-users/dto/update-cms-user.dto.ts`

#### QueryCmsUserDto / FilterCmsUserDto

Query parameters are passed as JSON-encoded strings:

- `filters`: `{"search":"john","statuses":[1],"accountTypes":[1,2],"permissionGroups":[1,2,3]}`
- `sort`: `[{"orderBy":"email","order":"asc"}]`

The `search` filter performs a case-insensitive regex match across `firstName`, `lastName`, `email`, and `phone`.

**File:** `backend/src/cms-users/dto/query-cms-user.dto.ts`

### Service Logic

#### Create Flow

```
create(dto) →
  1. Determine accountType (default: website_admin)
  2. If affiliate:
     a. Validate affiliateId exists
     b. Check no existing CMS account for this affiliate
     c. Auto-populate name/email/phone from affiliate record
     d. Generate random 16-byte hex password
  3. If website_admin:
     a. Require password field
     b. Hash password with bcrypt
  4. Check email uniqueness
  5. Validate permissionGroup enum
  6. Validate status enum (if provided)
  7. Resolve photo file (if provided)
  8. Create record in repository
```

#### Update Flow

```
update(id, dto) →
  1. Hash new password if changed
  2. Validate email uniqueness (excluding current user)
  3. Resolve photo file
  4. Validate permissionGroup and status enums
  5. Build conditional payload (only include defined fields)
     ↳ Prevents overwriting fields with undefined/null values
     ↳ Prevents E11000 duplicate key errors on empty email
  6. Update via repository
```

**File:** `backend/src/cms-users/cms-users.service.ts`

### Repository Layer

The repository follows the project's standard pattern:

- **Abstract repository:** `backend/src/cms-users/domain/cms-user.repository.ts`
- **MongoDB implementation:** `backend/src/cms-users/model/cms-user.repository.ts`
- **Mapper:** `backend/src/cms-users/model/cms-user.mapper.ts`

Key repository methods:

- `create(data)` — insert new CMS user
- `findManyWithPagination({filterOptions, sortOptions, paginationOptions})` — paginated query with search, status, accountType, permissionGroup filters
- `findById(id)` — single lookup
- `findByEmail(email)` — email uniqueness check
- `findByAffiliateId(affiliateId)` — check if affiliate already linked
- `update(id, payload)` — partial update via mapper merge
- `remove(id)` — hard delete

### Permission Guards

The module introduces two guard layers:

#### 1. CmsPermissionsGuard (Role-Level)

Checks the user's `permissionGroup` against `@CmsPermissions()` decorator values. Used to restrict entire controllers to specific roles (e.g., owner-only for CMS user management).

```typescript
@CmsPermissions(PermissionGroupEnum.owner)
@UseGuards(AuthGuard('jwt-cms'), CmsPermissionsGuard)
```

**Files:**

- `backend/src/cms-users/permissions/permissions.guard.ts`
- `backend/src/cms-users/permissions/permissions.decorator.ts`

#### 2. ModulePermissionsGuard (Feature-Level)

Checks the user's `permissions[]` array against `@RequireModulePermission()` decorator values. Owner role automatically bypasses this check.

```typescript
@UseGuards(AuthGuard('jwt-cms'), ModulePermissionsGuard)
@RequireModulePermission(ModulePermission.product_management)
```

Guard logic:

1. Read `modulePermissions` metadata from reflector
2. If no required permissions → allow (pass-through)
3. If user is owner (`permissionGroup === 1`) → allow (bypass)
4. Otherwise → check if user's `permissions[]` includes **any** of the required permissions

**Files:**

- `backend/src/cms-users/permissions/module-permissions.guard.ts`
- `backend/src/cms-users/permissions/module-permissions.decorator.ts`

### JWT Integration

The CMS JWT strategy (`backend/src/auth/strategies/jwt-cms.strategy.ts`) embeds the following fields in the JWT payload, making them available on `request.user` for guard checks:

- `id`
- `permissionGroup`
- `permissions` (array of numeric module permission values)
- `accountType`
- `sessionId`

### i18n Error Messages

**File:** `backend/src/i18n/en/cms-user.json`

| Key                        | Message                                         |
| -------------------------- | ----------------------------------------------- |
| `permissionGroupNotExists` | Permission group does not exist                 |
| `affiliateIdRequired`      | Affiliate ID is required for affiliate accounts |
| `affiliateNotFound`        | Affiliate not found                             |
| `affiliateAlreadyLinked`   | This affiliate already has a linked CMS account |
| `passwordRequired`         | Password is required for website admin accounts |

Vietnamese translations are in `backend/src/i18n/vi/cms-user.json`.

---

## CMS Frontend

### Pages & Routes

| Route                 | Component           | Description                 |
| --------------------- | ------------------- | --------------------------- |
| `/cms-users`          | `CmsUserListView`   | Paginated list with filters |
| `/cms-users/create`   | `CmsUserCreateView` | Create new CMS user form    |
| `/cms-users/edit/:id` | `CmsUserEditView`   | Edit existing CMS user      |

Routes are registered in `cms/src/routes/sections.tsx` with lazy loading.

**Page files:**

- `cms/src/pages/cms-user.tsx`
- `cms/src/pages/cms-user-create.tsx`
- `cms/src/pages/cms-user-edit.tsx`

**Section components:**

- `cms/src/sections/cms-user/cms-user-list-view.tsx` — Table with search, status filter, account type filter, permission group filter. Uses `@tanstack/react-table`.
- `cms/src/sections/cms-user/cms-user-create-view.tsx` — Wrapper for create form
- `cms/src/sections/cms-user/cms-user-edit-view.tsx` — Wrapper that loads user data then renders form
- `cms/src/sections/cms-user/cms-user-form.tsx` — Shared form for create/edit with:
  - Account type selector (changes form behavior)
  - Affiliate search autocomplete (when affiliate type selected)
  - Permission group selector
  - Module permission checkboxes (with "All Permissions" toggle)
  - Status toggle
- `cms/src/sections/cms-user/components/affiliate-search.tsx` — Autocomplete component for searching affiliates

### Redux State Management

#### Slice: `cmsUserSlice`

**State shape:**

```typescript
{
  cmsUsers: CmsUserData[];        // list page data
  currentCmsUser: CmsUserData;    // single user for edit
  loading: boolean;               // list loading
  currentLoading: boolean;        // single user loading
  createLoading: boolean;         // create operation
  updateLoading: boolean;         // update operation
  deleteLoading: boolean;         // delete operation
  pagination: { page, limit, total, totalPages };
  filters: FilterCmsUserDto;
  sort: SortCmsUserDto[];
}
```

**Saga actions:**

- `getCmsUsersRequest` — fetch paginated list
- `getCmsUserRequest` — fetch single user by ID
- `createCmsUserRequest` — create new user (with `onSuccess` callback for navigation)
- `updateCmsUserRequest` — update user (with `onSuccess` callback)
- `deleteCmsUserRequest` — delete user

**Files:**

- `cms/src/redux/store/cmsUserSlice.ts`
- `cms/src/redux/saga/cmsUserSaga.ts`

### Repository (API Client)

```typescript
class CmsUserRepository {
  queryCmsUsers(params): Promise<QueryCmsUsersResponse>; // GET /cms-users
  getCmsUser(id): Promise<CmsUserData>; // GET /cms-users/:id
  createCmsUser(data): Promise<CmsUserData>; // POST /cms-users
  updateCmsUser(id, data): Promise<CmsUserData>; // PATCH /cms-users/:id
  deleteCmsUser(id): Promise<void>; // DELETE /cms-users/:id
}
```

The repository also exports local TypeScript enum copies (`AccountTypeEnum`, `ModulePermission`, `ALL_MODULE_PERMISSIONS`) and all type interfaces used by the slice and saga.

**File:** `cms/src/repositories/cms-user.repository.ts`

### Form Components

The `CmsUserForm` component (`cms/src/sections/cms-user/cms-user-form.tsx`) provides intelligent form behavior based on account type:

**Website Admin mode:**

- Shows email, password, first name, last name, phone fields
- Password is required on create, optional on edit

**Affiliate mode:**

- Shows affiliate search autocomplete
- Auto-populates email, first name, phone from selected affiliate
- Password field is hidden (auto-generated on backend)
- Affiliate fields become read-only after selection

**Permission checkboxes:**

- Only shown for `manager` and `staff` permission groups
- Owner automatically has all permissions (checkboxes hidden)
- "All Permissions" toggle to select/deselect all at once
- Individual module permission checkboxes

### Sidebar Permission Filtering

The dashboard sidebar dynamically filters navigation items based on the logged-in user's permissions.

**How it works:**

1. Each `NavItem` in `config-nav-dashboard.tsx` has an optional `permission` field of type `ModulePermissionEnum`.
2. The `filterNav()` function in `layout.tsx` applies filtering logic:
   - **Owner** (`permissionGroup === PERMISSION_GROUP_OWNER`): sees **all** nav items
   - **Manager/Staff**: only sees nav items where their `permissions[]` array includes the item's `permission` value
   - Nav items **without** a `permission` field (e.g., Account Management) are **owner-only**

**Nav item → Permission mapping:**

| Nav Section           | Required Permission                               |
| --------------------- | ------------------------------------------------- |
| Product Management    | `MODULE_PERMISSION_PRODUCT_MANAGEMENT` (1)    |
| Order Management      | `MODULE_PERMISSION_ORDER_MANAGEMENT` (2)      |
| Return Management     | `MODULE_PERMISSION_RETURN_MANAGEMENT` (3)     |
| Flash Sale Management | `MODULE_PERMISSION_FLASH_SALE_MANAGEMENT` (4) |
| Promotion Management  | `MODULE_PERMISSION_PROMOTION_MANAGEMENT` (5)  |
| News Management       | `MODULE_PERMISSION_NEWS_MANAGEMENT` (6)       |
| Homepage Management   | `MODULE_PERMISSION_HOMEPAGE_MANAGEMENT` (7)   |
| Withdrawal Requests   | `MODULE_PERMISSION_SETTINGS` (8)              |
| Shipping Fee Config   | `MODULE_PERMISSION_SETTINGS` (8)              |
| Affiliate Management  | `MODULE_PERMISSION_SETTINGS` (8)              |
| Account Management    | _(owner-only, no permission field)_               |

**Files:**

- `cms/src/layouts/config-nav-dashboard.tsx` — NavItem definitions with `permission` field
- `cms/src/layouts/dashboard/layout.tsx` — `filterNav()` function + `selectCurrentUser` integration

### i18n Labels

**File:** `cms/src/i18n/en/common.json` (lines 981–1010)

| Key                             | English                      |
| ------------------------------- | ---------------------------- |
| `accountManagement`             | Account Management           |
| `accountType`                   | Account Type                 |
| `websiteAdmin`                  | Website Admin                |
| `affiliateAgent`                | Affiliate Agent              |
| `cmsPermissions`                | CMS Permissions              |
| `allPermissions`                | All Permissions              |
| `productManagementPermission`   | Product Management           |
| `orderManagementPermission`     | Order Management             |
| `returnManagementPermission`    | Return Management            |
| `flashSaleManagementPermission` | Flash Sale Management        |
| `promotionManagementPermission` | Promotion Management         |
| `newsManagementPermission`      | News Management              |
| `homepageManagementPermission`  | Homepage Management          |
| `settingsPermission`            | Settings                     |
| `affiliateCode`                 | Affiliate Code               |
| `selectAffiliate`               | Select Affiliate             |
| `searchAffiliate`               | Search affiliate by name...  |
| `createAccountSuccess`          | Account created successfully |
| `updateAccountSuccess`          | Account updated successfully |
| `deleteAccountSuccess`          | Account deleted successfully |
| `deleteAccountMessage`          | Are you sure you want to...  |
| `editAccount`                   | Edit Account                 |
| `createAccount`                 | Create Account               |
| `accountList`                   | Account List                 |

Vietnamese translations available in `cms/src/i18n/vi/common.json`.

---

## Permission Enforcement Matrix

This table shows which controllers are protected by `ModulePermissionsGuard` and which `ModulePermission` is required.

| Controller                     | File Path                                                                   | Permission                  |
| ------------------------------ | --------------------------------------------------------------------------- | --------------------------- |
| `ProductsController`           | `backend/src/products/products.controller.ts`                               | `product_management` (1)    |
| `CombosController`             | `backend/src/combos/combos.controller.ts`                                   | `product_management` (1)    |
| `ProductCategoriesController`  | `backend/src/product-categories/product-categories.controller.ts`           | `product_management` (1)    |
| `CmsProductBannersController`  | `backend/src/product-banners/controllers/cms-product-banners.controller.ts` | `product_management` (1)    |
| `CmsColorVariantsController`   | `backend/src/color-variants/controllers/cms-color-variants.controller.ts`   | `product_management` (1)    |
| `CmsReviewsController`         | `backend/src/reviews/cms-reviews.controller.ts`                             | `product_management` (1)    |
| `ProductInventoriesController` | `backend/src/product-inventories/product-inventories.controller.ts`         | `product_management` (1)    |
| `CmsOrderController`           | `backend/src/shop/order/cms-order.controller.ts`                            | `order_management` (2)      |
| `CmsReturnsController`         | `backend/src/returns/cms-returns.controller.ts`                             | `return_management` (3)     |
| `FlashSalesController`         | `backend/src/flash-sales/flash-sales.controller.ts`                         | `flash_sale_management` (4) |
| `PromotionsController`         | `backend/src/promotions/promotions.controller.ts`                           | `promotion_management` (5)  |
| `CmsArticlesController`        | `backend/src/articles/controllers/cms-articles.controller.ts`               | `news_management` (6)       |
| `TopicsController`             | `backend/src/topics/topics.controller.ts`                                   | `homepage_management` (7)   |
| `MenusController`              | `backend/src/menus/menus.controller.ts`                                     | `homepage_management` (7)   |
| `CmsBannersController`         | `backend/src/banners/controllers/cms-banners.controller.ts`                 | `homepage_management` (7)   |
| `ShippingPromotionsController` | `backend/src/shipping-promotions/shipping-promotions.controller.ts`         | `settings` (8)              |

**Note:** The `CmsUsersController` itself is restricted to `owner` only via the role-level `CmsPermissionsGuard` (not module-level).

---

## File Inventory

### Backend

| Path                                                                | Description                                 |
| ------------------------------------------------------------------- | ------------------------------------------- |
| `backend/src/cms-users/cms-users.module.ts`                         | NestJS module registration                  |
| `backend/src/cms-users/cms-users.controller.ts`                     | REST controller (owner-only)                |
| `backend/src/cms-users/cms-users.service.ts`                        | Business logic (create/update/delete)       |
| `backend/src/cms-users/domain/cms-user.ts`                          | Domain entity class                         |
| `backend/src/cms-users/domain/cms-user.repository.ts`               | Abstract repository interface               |
| `backend/src/cms-users/model/cms-user.schema.ts`                    | Mongoose schema + indexes                   |
| `backend/src/cms-users/model/cms-user.repository.ts`                | MongoDB repository implementation           |
| `backend/src/cms-users/model/cms-user.mapper.ts`                    | Domain ↔ Document mapper                    |
| `backend/src/cms-users/dto/create-cms-user.dto.ts`                  | Create DTO with validation                  |
| `backend/src/cms-users/dto/update-cms-user.dto.ts`                  | Update DTO (partial)                        |
| `backend/src/cms-users/dto/query-cms-user.dto.ts`                   | Query/Filter/Sort DTOs                      |
| `backend/src/cms-users/dto/cms-user.dto.ts`                         | Simple ID DTO for params                    |
| `backend/src/cms-users/permissions/permissions.enum.ts`             | `PermissionGroupEnum`                       |
| `backend/src/cms-users/permissions/permissions.guard.ts`            | `CmsPermissionsGuard` (role-level)          |
| `backend/src/cms-users/permissions/permissions.decorator.ts`        | `@CmsPermissions()`                         |
| `backend/src/cms-users/permissions/account-type.enum.ts`            | `AccountTypeEnum`                           |
| `backend/src/cms-users/permissions/module-permission.enum.ts`   | `ModulePermission`                       |
| `backend/src/cms-users/permissions/module-permissions.guard.ts`     | `ModulePermissionsGuard` (feature-level) |
| `backend/src/cms-users/permissions/module-permissions.decorator.ts` | `@RequireModulePermission()`             |
| `backend/src/utils/transformers/proto-enum.transformer.ts`          | Proto enum maps                             |
| `backend/src/utils/decorators/transform-proto-enum.decorator.ts`    | `@TransformProtoEnum()`                     |
| `backend/src/i18n/en/cms-user.json`                                 | English error messages                      |
| `backend/src/i18n/vi/cms-user.json`                                 | Vietnamese error messages                   |
| `backend/test/cms-users/cms-users.service.spec.ts`                  | Service unit tests                          |
| `backend/test/auth/cms-auth.service.spec.ts`                        | Auth service tests (updated)                |

### Proto

| Path                                 | Description                                       |
| ------------------------------------ | ------------------------------------------------- |
| `proto/cms/cms-users/cms-user.proto` | Protobuf definitions for all CMS user types/enums |

### CMS Frontend

| Path                                                        | Description                                               |
| ----------------------------------------------------------- | --------------------------------------------------------- |
| `cms/src/types/gen/cms/cms/cms-users/cms-user.ts`           | Generated TypeScript types from proto (manually extended) |
| `cms/src/repositories/cms-user.repository.ts`               | API client + local type definitions                       |
| `cms/src/redux/store/cmsUserSlice.ts`                       | Redux Toolkit slice (state + reducers + selectors)        |
| `cms/src/redux/saga/cmsUserSaga.ts`                         | Redux-Saga effects (async API calls)                      |
| `cms/src/pages/cms-user.tsx`                                | List page                                                 |
| `cms/src/pages/cms-user-create.tsx`                         | Create page                                               |
| `cms/src/pages/cms-user-edit.tsx`                           | Edit page                                                 |
| `cms/src/sections/cms-user/index.ts`                        | Barrel exports                                            |
| `cms/src/sections/cms-user/cms-user-list-view.tsx`          | List view with table + filters                            |
| `cms/src/sections/cms-user/cms-user-create-view.tsx`        | Create view wrapper                                       |
| `cms/src/sections/cms-user/cms-user-edit-view.tsx`          | Edit view wrapper                                         |
| `cms/src/sections/cms-user/cms-user-form.tsx`               | Shared create/edit form                                   |
| `cms/src/sections/cms-user/components/affiliate-search.tsx` | Affiliate autocomplete                                    |
| `cms/src/layouts/config-nav-dashboard.tsx`                  | Nav items with `permission` field                         |
| `cms/src/layouts/dashboard/layout.tsx`                      | `filterNav()` permission filtering                        |
| `cms/src/routes/sections.tsx`                               | Route registration (lazy loaded)                          |
| `cms/src/i18n/en/common.json`                               | English labels                                            |
| `cms/src/i18n/vi/common.json`                               | Vietnamese labels                                         |
