# Affiliate & Commission Module — CMS Reference Guide

> Quick reference for understanding the data models, APIs, business rules, and background automation of the Affiliate & Commission system.

---

## Table of Contents

1. [Module Overview](#1-module-overview)
2. [Data Models](#2-data-models)
3. [Enums](#3-enums)
4. [API Reference](#4-api-reference)
5. [Business Rules](#5-business-rules)
6. [Background Automation](#6-background-automation)

---

## 1. Module Overview

The system enables a **referral/tracking program**: affiliates (KOL, CTV, Publisher) receive unique codes for URL tracking (e.g., `?aff=AFF-X7K9M2`). Products are assigned commission rates, and estimated commissions are pre-calculated per row.

### Three Modules

| Module | Collection | Purpose |
|--------|-----------|---------|
| **Affiliates** | `affiliates` | Affiliate profiles (CRUD) |
| **Commission Settings** | `commission_settings` | Global singleton config (default rate, auto-add toggle) |
| **Product Commissions** | `product_commissions` | Per-product rates — unified for global (`affiliateId=null`) and per-affiliate |

### How They Connect

```
Commission Settings (singleton)
  ├── defaultCommissionRate  ──── fallback rate for all rows
  ├── autoUpdateProducts     ──── auto-add new products to global list
  └── Global Product List    ──── product_commissions where affiliateId=null
        │
        │  (cron mirrors global list to affiliates with autoUpdate=true)
        ▼
Affiliate
  ├── defaultCommissionRate  ──── override global default for this affiliate (optional)
  ├── autoUpdateProducts     ──── auto-sync from global list
  └── Affiliate Product List ──── product_commissions where affiliateId=<id>
```

---

## 2. Data Models

### 2.1 Affiliate

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | `string` | auto | ObjectId |
| `name` | `string` | yes | Display name |
| `affiliateCode` | `string` | auto | Unique `AFF-XXXXXX` (immutable after creation) |
| `type` | `AffiliateType` | yes | KOL / CTV / Publisher |
| `email` | `string` | yes | |
| `phone` | `string` | yes | Unique among non-deleted |
| `bankAccountHolder` | `string?` | no | |
| `bankName` | `string?` | no | |
| `bankAccountNumber` | `string?` | no | |
| `citizenId` | `string?` | no | CCCD |
| `notes` | `string?` | no | |
| `status` | `AffiliateStatus` | yes | Default: ACTIVE |
| `defaultCommissionRate` | `number?` | no | 0-100%. `null` = inherit global |
| `autoUpdateProducts` | `boolean` | yes | Default: `true` |
| `createdAt` | `Date` | auto | |
| `updatedAt` | `Date` | auto | |
| `deletedAt` | `Date?` | auto | Soft delete |

### 2.2 Commission Settings (Singleton)

Only **one document** ever exists.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | ObjectId |
| `defaultCommissionRate` | `number` | Global default rate (0-100%) |
| `autoUpdateProducts` | `boolean` | Auto-add new products to global list |
| `lastProductSyncCursor` | `Date?` | Internal: cron sync cursor |
| `updatedAt` | `Date` | |

GET response also includes:

| Field | Type | Description |
|-------|------|-------------|
| `isRecalculating` | `boolean` | `true` while a recalculation job is running |

### 2.3 Product Commission

Unified collection — `affiliateId=null` means global, otherwise affiliate-specific.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `string` | ObjectId |
| `affiliateId` | `string \| null` | `null` = global; ObjectId = affiliate-specific |
| `productId` | `string` | Product reference |
| `name` | `string` | Denormalized product name (cron-synced) |
| `code` | `string` | Denormalized product code |
| `images` | `{ avatar?, others? }` | Denormalized product images |
| `costPrice` | `number` | `product.prices.import ?? product.prices.retail ?? 0` |
| `stock` | `number` | Denormalized stock |
| `commissionRate` | `number` | **Resolved** effective rate (0-100%) |
| `estimatedCommission` | `number` | `round(costPrice * rate / 100)` to nearest 100 |
| `isCustomRate` | `boolean` | `true` = rate explicitly set; `false` = inherited default |
| `createdAt` | `Date` | |
| `updatedAt` | `Date` | |

**Unique index:** `{ affiliateId, productId }`

---

## 3. Enums

```typescript
enum AffiliateType {
  KOL = 1,
  CTV = 2,
  PUBLISHER = 3,
}

enum AffiliateStatus {
  ACTIVE = 1,
  INACTIVE = 2,
}

// Background job type (used internally)
enum JobType {
  COMMISSION_RATE_RECALCULATION = 8,
}
```

---

## 4. API Reference

**Base URL:** `/api/v1` | **Auth:** JWT-CMS + Owner/Manager permission on all endpoints.

### 4.1 Affiliates

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/v1/affiliates` | Create (auto-generates `affiliateCode`) |
| `GET` | `/v1/affiliates?page&limit&filters&sort` | List with pagination |
| `GET` | `/v1/affiliates/:id` | Get single |
| `PATCH` | `/v1/affiliates/:id` | Update (returns `jobId` if rate changed) |
| `DELETE` | `/v1/affiliates/:id` | Soft delete |

**Query params:**

| Param | Type | Example |
|-------|------|---------|
| `page` | number | `1` |
| `limit` | number | `20` |
| `filters` | JSON string | `{"statuses":[1],"types":[1,2],"search":"nguyen"}` |
| `sort` | JSON string | `[{"orderBy":"name","order":"asc"}]` |

**Sortable fields:** `name`, `createdAt`, `type`, `status`

**Create request body:**
```json
{
  "name": "Nguyen Van A",
  "type": 1,
  "email": "a@example.com",
  "phone": "0901234567",
  "bankAccountHolder": "NGUYEN VAN A",
  "bankName": "Vietcombank",
  "bankAccountNumber": "1234567890",
  "citizenId": "079123456789",
  "notes": "Top KOL",
  "status": 1,
  "defaultCommissionRate": 15,
  "autoUpdateProducts": true
}
```

**Error codes:** `400` validation, `409` phone exists or recalculation in progress

### 4.2 Commission Settings

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/v1/commission-settings` | Get singleton (includes `isRecalculating`) |
| `PATCH` | `/v1/commission-settings` | Update (returns `jobId` if rate changed) |

**Update request:**
```json
{
  "defaultCommissionRate": 12,
  "autoUpdateProducts": true
}
```

**Update response** (when rate changed):
```json
{
  "id": "...",
  "defaultCommissionRate": 12,
  "autoUpdateProducts": true,
  "updatedAt": "...",
  "isRecalculating": true,
  "jobId": "665a1b2c3d4e5f6789012346"
}
```

**Error:** `409` if recalculation already in progress

### 4.3 Global Product Commissions

Base path: `/v1/commission-settings/products` (manages `affiliateId=null` rows)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/products?page&limit&filters&sort` | List global products |
| `POST` | `/products` | Bulk add products |
| `PATCH` | `/products/:productId` | Update single rate (sets `isCustomRate=true`) |
| `POST` | `/products/bulk-update-rate` | Bulk update rates |
| `DELETE` | `/products/:productId` | Remove single product |
| `POST` | `/products/bulk-delete` | Bulk remove (POST, not DELETE) |

**Bulk add request:**
```json
{
  "products": [
    { "productId": "prod123", "commissionRate": 15 },
    { "productId": "prod456" }
  ]
}
```
`commissionRate` optional — if omitted, uses global default. If provided, sets `isCustomRate=true`.

**Bulk add response:**
```json
{ "addedCount": 2, "failedCount": 0, "failedProducts": [] }
```

**Update rate request:** `{ "commissionRate": 18 }`

**Bulk update request:** `{ "productIds": ["id1", "id2"], "commissionRate": 20 }`

**Bulk delete request:** `{ "productIds": ["id1", "id2"] }`

**Product query filters:** `{ search?: string, categoryId?: string }`

### 4.4 Affiliate Product Commissions

Base path: `/v1/affiliates/:affiliateId/product-commissions`

**Identical endpoint shapes** to Global Product Commissions, just scoped by affiliate:

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/:affiliateId/product-commissions` | List products |
| `POST` | `/:affiliateId/product-commissions` | Bulk add |
| `PATCH` | `/:affiliateId/product-commissions/:productId` | Update rate |
| `POST` | `/:affiliateId/product-commissions/bulk-update-rate` | Bulk update |
| `DELETE` | `/:affiliateId/product-commissions/:productId` | Remove |
| `POST` | `/:affiliateId/product-commissions/bulk-delete` | Bulk remove |

Same request/response shapes as global. Rate fallback on add: `explicit > affiliate.defaultRate > global.defaultRate`.

---

## 5. Business Rules

### 5.1 Commission Rate Cascade (4 Levels)

Rates are **resolved at write time** and stored per-row. No runtime cascade lookup.

| Level | Source | Scope | `isCustomRate` |
|-------|--------|-------|----------------|
| 0 | Global `defaultCommissionRate` | All products, all affiliates | `false` |
| 1 | Global per-product rate | Specific product, all affiliates | `true` |
| 2 | Affiliate `defaultCommissionRate` | All products, specific affiliate | `false` |
| 3 | Affiliate per-product rate | Specific product, specific affiliate | `true` |

**On row creation:**
```
Global row:     rate = explicitRate ?? globalDefault       → isCustomRate = (explicit provided)
Affiliate row:  rate = explicitRate ?? affiliateDefault ?? globalDefault  → isCustomRate = (explicit provided)
```

**On default rate change:** Background job updates all rows where `isCustomRate=false`.

### 5.2 Estimated Commission Formula

```
estimatedCommission = Math.round((costPrice * commissionRate) / 10000) * 100
```

Rounded to nearest **hundred** (VND). Examples:
- `120,000 * 10%` → `12,000`
- `123,456 * 10%` → `12,300`

### 5.3 `autoUpdateProducts` Behavior

When **affiliate** `autoUpdateProducts = true`:
- Products added to global list → auto-added to affiliate (uses affiliate's default rate)
- Products removed from global list → auto-removed from affiliate (**only** non-custom-rate rows)
- Custom-rate products are **never** auto-removed

### 5.4 Concurrency Guard

- Only one recalculation job per scope runs at a time
- API returns `409 Conflict` if rate is changed while job is running
- CMS should check `isRecalculating` flag and disable the rate input while `true`

---

## 6. Background Automation

### 6.1 Product Data Sync Cron (Every 5 Minutes)

| Phase | What it does |
|-------|-------------|
| **A** | Syncs denormalized fields (`name`, `code`, `images`, `costPrice`, `stock`) from products collection. Recalculates `estimatedCommission` from existing `commissionRate`. Does NOT change rates. |
| **B** | Mirrors global product list → affiliate lists for affiliates with `autoUpdateProducts=true`. Adds missing products, removes extras (non-custom only). |

### 6.2 Commission Rate Recalculation Job (On-Demand)

**Triggered by:** Changing `defaultCommissionRate` on Commission Settings or an Affiliate.

| Scope | When | Rows Affected |
|-------|------|---------------|
| `global` | Global default rate changed | All `isCustomRate=false` rows (global + affiliates inheriting global) |
| `affiliate` | Affiliate default rate changed | That affiliate's `isCustomRate=false` rows |

**CMS flow:**
1. Save rate change → API returns `jobId`
2. Poll job status with `useJobPolling(jobId)` (every 3s)
3. Disable rate input + show "Recalculating..." while running
4. On completion → re-fetch data, re-enable input
