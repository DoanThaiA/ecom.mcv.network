# Affiliate & Commission Module — Final Implementation Plan (Backend Phase 1)

## Context

The CChat E-Commerce platform needs a **referral/tracking program**:
- Affiliates (KOL, CTV, Publisher) receive unique codes for URL tracking (e.g., `?aff=AF0812`)
- Orders placed through affiliate links earn commission based on a 4-level rate cascade
- Phase 1 covers **backend only** (CRUD, settings, product commissions). CMS admin pages planned separately.
- Phase 2 covers frontend tracking, order attribution, actual commission calculation, stats & order tabs.

### Commission Rate Priority (4-level cascade, highest wins)

| Level | Source | Scope |
|-------|--------|-------|
| 0 | Global `defaultCommissionRate` | All products, all affiliates |
| 1 | Global per-product `commissionRate` | Specific product, all affiliates |
| 2 | Affiliate `defaultCommissionRate` | All products, specific affiliate |
| 3 | Affiliate per-product `commissionRate` | Specific product, specific affiliate |

**Resolved rate storage:** Each `product_commissions` row stores the **resolved** `commissionRate` — the final effective rate after applying the cascade at the time of creation or last rate update. This avoids cascade computation at query time and makes `estimatedCommission` calculation straightforward (`costPrice × commissionRate / 100`).

**When rates change:** If a higher-priority rate is set/changed (e.g., Level 3 override added), only that specific row is updated inline by the API. If a lower-priority default rate changes (Level 0 or 2), a background job recalculates all rows that were inheriting from that default (see Step 5).

### `autoUpdateProducts` Behavior
When enabled, two sync behaviors run via a **scheduled cron** (Step 4):
- **Phase A — Denormalized data sync:** Keep `name`, `code`, `images`, `costPrice`, `stock` fresh from source products. Recalculates `estimatedCommission` using each row's stored `commissionRate`.
- **Phase B — Global-to-affiliate mirroring:** When affiliate has `autoUpdateProducts=true`, their product list mirrors the global list (add/remove propagation).

Separately, a **job-driven recalculation** (Step 5) handles `defaultCommissionRate` changes — this is NOT part of the cron.

---

## Step 1: Backend — Affiliates Module

**Directory:** `backend/src/affiliates/` — Template: `cms-users/`

| File | Purpose |
|------|---------|
| `domain/affiliate.ts` | Domain entity |
| `domain/affiliate.repository.ts` | Abstract repository |
| `domain/affiliate-type.enum.ts` | `AffiliateType` enum (KOL=1, CTV=2, PUBLISHER=3) |
| `domain/affiliate-status.enum.ts` | `AffiliateStatus` enum (ACTIVE=1, INACTIVE=2) |
| `model/affiliate.schema.ts` | Mongoose schema |
| `model/affiliate.repository.ts` | Document repository |
| `model/affiliate.mapper.ts` | Domain ↔ Document mapper |
| `model/affiliate-document.module.ts` | MongoDB module |
| `dto/create-affiliate.dto.ts` | Create DTO with validation |
| `dto/update-affiliate.dto.ts` | Update DTO (PartialType) |
| `dto/query-affiliate.dto.ts` | Query DTO (filter, sort, paginate) |
| `dto/affiliate-response.dto.ts` | Response DTO |
| `affiliates.controller.ts` | REST endpoints |
| `affiliates.service.ts` | Business logic |
| `affiliates.module.ts` | Module registration |

**Schema fields:**
- `name` (string, required, indexed)
- `affiliateCode` (string, unique, auto-generated — format: `AFF-{6 random uppercase alphanumeric}`, retry on collision)
- `type` (AffiliateType enum, required, indexed)
- `email` (string, required)
- `phone` (string, required, unique, indexed)
- `bankAccountHolder`, `bankName`, `bankAccountNumber`, `citizenId`, `notes` (all string, optional)
- `status` (AffiliateStatus enum, default ACTIVE, indexed)
- `defaultCommissionRate` (number, percentage, nullable — null means use global Level 0)
- `autoUpdateProducts` (boolean, default true — when enabled, auto-sync product changes to this affiliate's commission records)
- `createdAt`, `updatedAt`, `deletedAt` (timestamps + soft delete)

**Endpoints:**
- `POST /affiliates` — Create (auto-generates affiliateCode)
- `GET /affiliates` — List with pagination, filter by status/type/search
- `GET /affiliates/:id` — Get single
- `PATCH /affiliates/:id` — Update
- `DELETE /affiliates/:id` — Soft delete

**Auth:** Use existing 3-tier permission group guard (`@UseGuards(AuthGuard('jwt-cms'), CmsPermissionsGuard)`) — no new permissions needed.

**i18n:** Create `backend/src/i18n/en/affiliate.json` and `backend/src/i18n/vi/affiliate.json`

**Register:** Add `AffiliatesModule` to `app.module.ts`

---

## Step 2: Backend — Commission Settings Module (Dedicated Singleton)

**Directory:** `backend/src/commission-settings/`

| File | Purpose |
|------|---------|
| `domain/commission-settings.ts` | Domain entity |
| `domain/commission-settings.repository.ts` | Abstract repository |
| `model/commission-settings.schema.ts` | Mongoose schema (singleton, `getOrCreate` + `upsert`) |
| `model/commission-settings.repository.ts` | Document repository |
| `model/commission-settings.mapper.ts` | Mapper |
| `model/commission-settings-document.module.ts` | MongoDB module |
| `dto/update-commission-settings.dto.ts` | Update DTO |
| `commission-settings.controller.ts` | REST endpoints |
| `commission-settings.service.ts` | Business logic |
| `commission-settings.module.ts` | Module registration |

**Schema fields:**
- `defaultCommissionRate` (number, percentage — Level 0 rate)
- `autoUpdateProducts` (boolean — when enabled, auto-sync product changes to global commission records)
- `updatedAt` (Date)

**Singleton pattern:** Repository uses `findOneAndUpdate({}, update, { upsert: true })` — always operates on a single document.

**Endpoints:**
- `GET /commission-settings` — Get global settings
- `PATCH /commission-settings` — Update global settings

**Auth:** Same 3-tier permission group guard as affiliates.

**Register:** Add to `app.module.ts`

---

## Step 3: Backend — Product Commissions Module (Unified)

**Directory:** `backend/src/product-commissions/` — Template: `promotion-products/` + `flash-sale-products/`

| File | Purpose |
|------|---------|
| `domain/product-commission.ts` | Domain entity |
| `domain/product-commission.repository.ts` | Abstract repository |
| `model/product-commission.schema.ts` | Mongoose schema |
| `model/product-commission.repository.ts` | Document repository |
| `model/product-commission.mapper.ts` | Mapper |
| `model/product-commission-document.module.ts` | MongoDB module |
| `dto/add-product-commissions.dto.ts` | Bulk add DTO |
| `dto/update-product-commission.dto.ts` | Update single product rate |
| `dto/bulk-update-commission-rate.dto.ts` | Bulk update rate |
| `dto/query-product-commission.dto.ts` | Query with pagination |
| `global-product-commissions.controller.ts` | Global routes (`/commission-settings/products/*`) |
| `affiliate-product-commissions.controller.ts` | Affiliate routes (`/affiliates/:affiliateId/product-commissions/*`) |
| `product-commissions.service.ts` | Business logic (shared, `affiliateId` param) |
| `product-commissions.module.ts` | Module registration |

**Two controllers, one service:** Both controllers delegate to `ProductCommissionsService` which accepts optional `affiliateId`. When `null` → global (Level 1); when set → affiliate-specific (Level 3).

**Schema (collection: `product_commissions`):**
- `affiliateId` (ObjectId, nullable — `null` = global)
- `productId` (ObjectId, indexed)
- Compound unique index: `{ affiliateId: 1, productId: 1 }`
- `name`, `code`, `images` (denormalized from product)
- `costPrice` (number, denormalized from product)
- `stock` (number, denormalized from product)
- `commissionRate` (number, percentage — the **resolved** effective rate for this row)
- `estimatedCommission` (number, calculated: `costPrice × commissionRate / 100`, rounded to hundreds)
- `createdAt`, `updatedAt`

**How `commissionRate` is set on each row:**
- **Global row** (`affiliateId: null`): Set explicitly via CMS (Level 1 per-product rate). If not set by CMS, defaults to `commission_settings.defaultCommissionRate` (Level 0) at creation time.
- **Affiliate row**: Set explicitly via CMS (Level 3 per-product rate). If not set by CMS, resolved as `affiliate.defaultCommissionRate ?? commission_settings.defaultCommissionRate` at creation time.
- **On default rate change**: Background job (Step 5) updates `commissionRate` + `estimatedCommission` for all rows that were using the old default.

**Denormalized data sync:** Handled by a worker cron job (see Step 4).

**Global Endpoints** (`GlobalProductCommissionsController`):
- `GET /commission-settings/products` — List (affiliateId=null), pagination, search, category filter
- `POST /commission-settings/products` — Bulk add
- `PATCH /commission-settings/products/:productId` — Update rate
- `POST /commission-settings/products/bulk-update-rate` — Bulk update rate
- `DELETE /commission-settings/products/:productId` — Remove
- `POST /commission-settings/products/bulk-delete` — Bulk remove (POST, not DELETE with body)

**Affiliate Endpoints** (`AffiliateProductCommissionsController`):
- `GET /affiliates/:affiliateId/product-commissions` — List
- `POST /affiliates/:affiliateId/product-commissions` — Bulk add
- `PATCH /affiliates/:affiliateId/product-commissions/:productId` — Update rate
- `POST /affiliates/:affiliateId/product-commissions/bulk-update-rate` — Bulk update
- `DELETE /affiliates/:affiliateId/product-commissions/:productId` — Remove
- `POST /affiliates/:affiliateId/product-commissions/bulk-delete` — Bulk remove

**Register:** Add to `app.module.ts`

---

## Step 4: Worker — Commission Product Sync Cron (Scheduled)

**File:** `backend/worker/src/crons/commission-product-sync.cron.ts`
**Pattern:** Follow `flash-sale-sync.cron.ts`
**Register in:** `backend/worker/src/modules/crons.module.ts`

**Responsibility:** Periodic sync of denormalized product data and global-to-affiliate mirroring. Does NOT handle rate recalculation (that's Step 5).

### Overview

Cron runs **every 5 minutes** (`*/5 * * * *`). Two independent phases per run:

| Phase | Purpose | Trigger | Atomic unit |
|-------|---------|---------|-------------|
| A | Sync denormalized product data (name, price, stock, images) | Source product `updatedAt` changed | Per-product batch |
| B | Mirror global commission list → affiliate lists (add/remove) | Global product list membership changed | Per-affiliate |

**Overlap guard:** In-memory `isRunning` flag prevents concurrent executions.

### Phase A: Denormalized Data Sync

**Scope:** Updates `name`, `code`, `images`, `costPrice`, `stock`, and recalculates `estimatedCommission` (from each row's existing `commissionRate`). Does NOT change `commissionRate`.

**Change detection:** Cursor-based on `products.updatedAt` (in-memory, resets on worker restart → full sync on first run).

**Logic:**
1. Query `products` where `updatedAt > lastCursor`, sorted by `updatedAt`, batch of 500
2. For each batch, check which productIds exist in `product_commissions`
3. `bulkWrite` one `updateMany` per changed product — updates ALL rows for that product (global + all affiliates) in a single op
4. Uses MongoDB **aggregation pipeline update** to compute `estimatedCommission` from each row's own `commissionRate`:
   ```
   $set: { costPrice: X, estimatedCommission: { $round: [$multiply: [X, $divide: ['$commissionRate', 100]]], -2] } }
   ```
   Note: `$round` with `-2` rounds to nearest hundred (e.g., 12,345 → 12,300).
5. Advance cursor, repeat until no more changed products
6. Soft-deleted products → remove from `product_commissions` entirely

**Scale:** 500 changed products per batch × 1 `updateMany` each = 500 ops per bulkWrite. Each `updateMany` touches up to 501 rows (1 global + 500 affiliates). Well within MongoDB limits.

### Phase B: Global-to-Affiliate Mirroring

**Scope:** Adds/removes affiliate product commission rows to mirror the global list. Sets `commissionRate` on new rows. Does NOT update existing rows' rates.

**Change detection:** Hash of sorted global `productId` list (in-memory). Skip if unchanged.

**Logic:**
1. Fetch all global commission products (`affiliateId: null`) — max ~5K
2. Hash their productId set, compare with cached hash. Skip if same.
3. Fetch all affiliates where `autoUpdateProducts: true`
4. Process in batches of 50 affiliates (parallel within batch):
   - Fetch affiliate's current productIds
   - Set diff: `toAdd = global - affiliate`, `toRemove = affiliate - global`
   - `bulkWrite`: upsert for adds (using `$setOnInsert` for createdAt), `deleteMany` for removes
   - New products get `commissionRate = affiliate.defaultCommissionRate ?? globalDefaultRate`
   - `estimatedCommission` = `round(costPrice × commissionRate / 100, -2)`

**Scale:** 500 affiliates / 50 per batch = 10 iterations. Each affiliate: 1 read + 1 bulkWrite. Typically small diffs (0-50 changes per affiliate per run).

### Edge Cases

- **Product deleted:** Phase A detects via `updatedAt` change + `deletedAt` set → removes from all commission rows
- **Affiliate deactivated:** Phase B's `findAutoUpdate()` excludes them; existing rows preserved for manual management
- **Affiliate deleted:** Handled by API delete logic (cascade delete commission rows), not by cron
- **`autoUpdateProducts=true` means global list is authoritative:** Manual removal of a product from affiliate's list will be re-added on next sync. To have manual control, set `autoUpdateProducts=false`.
- **Worker restart:** In-memory cursor resets → one full-sync run (~60-90s), then incremental

### Performance Estimates

| Scenario | Phase | Time |
|----------|-------|------|
| Steady state, nothing changed | A+B | < 100ms |
| 50 products changed, global list unchanged | A | ~2s |
| Global list changed (+10 products), 500 affiliates | B | ~15s |
| Cold start (full sync), 5K products, 500 affiliates | A+B | ~60-90s |

### Required Indexes on `product_commissions`

```
{ affiliateId: 1, productId: 1 }  — unique compound (already planned)
{ productId: 1 }                   — Phase A: updateMany by productId
{ affiliateId: 1 }                 — Phase B: fetch affiliate's products
```

Also ensure `products.updatedAt` is indexed (for Phase A cursor query).

### New Repository Methods Needed

- `ProductCommissionRepository`: `findByAffiliate(id|null)`, `findProductIdsByAffiliate(id)`, `findDistinctProductIds(ids[])`, `bulkWrite()`, `deleteMany()`
- `ProductRepository`: `findChangedSince({ since, limit, sort })`
- `AffiliateRepository`: `findAutoUpdate()`

---

## Step 5: Background Job — Commission Rate Recalculation (Job-Driven)

**Responsibility:** Recalculate `commissionRate` + `estimatedCommission` on affected rows when `defaultCommissionRate` changes. Runs in `JobsProcessor` via BullMQ (NOT in the cron).

**Problem:** When a CMS user changes `defaultCommissionRate` (global or affiliate level), all `product_commissions` rows that were inheriting from that default need both `commissionRate` and `estimatedCommission` updated. This can affect thousands of rows — must not be synchronous in the API response.

**Pattern:** Reuse existing BullMQ job system (`JobsService.startJob()` → `JobsProcessor` → CMS polls via `useJobPolling`).

### New Job Type

Add `COMMISSION_RATE_RECALCULATION = 'commission_rate_recalculation'` to `JobType` enum.

### Triggers (API endpoints that kick off the job)

| CMS Action | What changes | Affected rows | API response |
|-----------|--------------|---------------|--------------|
| Edit global `defaultCommissionRate` | Level 0 rate | All rows (global + affiliate) that were using the old default — i.e., rows without a higher-priority override | Returns `{ jobId }` |
| Edit affiliate `defaultCommissionRate` | Level 2 rate | All rows for that affiliate that don't have a per-product override (Level 3) | Returns `{ jobId }` |

### API Flow

1. `PATCH /commission-settings` or `PATCH /affiliates/:id` updates the rate in DB
2. If `defaultCommissionRate` changed, calls `JobsService.startJob(JobType.COMMISSION_RATE_RECALCULATION, params)` where `params = { scope: 'global', newRate }` or `{ scope: 'affiliate', affiliateId, newRate }`
3. Returns `{ ...updatedEntity, jobId }` to CMS
4. CMS uses `useJobPolling(jobId)` to show processing indicator — user can refresh (F5) to see updated data

### Worker Handler Logic (in `JobsProcessor.process()`)

**Global rate change** (`scope: 'global'`):
1. Fetch new `defaultCommissionRate` from job params
2. Update all global product commissions (`affiliateId: null`) that don't have a per-product override:
   - Set `commissionRate = newRate`
   - Set `estimatedCommission = round(costPrice × newRate / 100, -2)` using aggregation pipeline (reads `$costPrice` from each row)
3. For affiliates with `defaultCommissionRate: null` (inheriting global):
   - Update their rows that don't have a per-product override (Level 3)
   - Set `commissionRate = newRate`, recalculate `estimatedCommission`
   - Process in batches of 50 affiliates
4. Update job progress (`processed/total`) after each batch
5. Mark job as COMPLETED

**Affiliate rate change** (`scope: 'affiliate'`):
1. Fetch new rate from job params
2. Update all product commissions for that affiliate that don't have a per-product override
   - Set `commissionRate = newRate`, recalculate `estimatedCommission`
3. Update job progress, mark COMPLETED

**How to identify rows "without a per-product override":** Add a boolean field `isCustomRate` (default `false`) to `product_commissions` schema. When CMS explicitly sets a per-product rate (Level 1 or 3), set `isCustomRate = true`. The background job only updates rows where `isCustomRate = false`.

### Concurrency Guard

**`defaultCommissionRate` fields must be disabled while a recalculation job is in progress** to prevent race conditions / wrong data.

**Backend:**
- `PATCH /commission-settings` and `PATCH /affiliates/:id` check for an active (PENDING/RUNNING) job of type `COMMISSION_RATE_RECALCULATION` with matching scope before allowing rate changes
- If active job exists → return `409 Conflict` with message "Commission recalculation in progress, please wait"
- Uses `paramsHash` on the job to identify scope (global vs specific affiliate)

**CMS:**
- `GET /commission-settings` and `GET /affiliates/:id` response includes `isRecalculating: boolean` (derived from active job check)
- When `isRecalculating=true`, CMS disables the `defaultCommissionRate` input field and shows "Recalculating..." indicator
- `useJobPolling` continues polling — once terminal, CMS re-fetches entity and re-enables the field

### CMS UX

- After saving rate change, CMS shows a toast/banner: "Commission rates are being recalculated..."
- The `useJobPolling` hook polls every 3s until terminal
- `defaultCommissionRate` field stays disabled until job completes
- User can navigate away and refresh (F5) to see updated `estimatedCommission` values once complete
- No real-time UI update needed — eventual consistency via refresh

### Performance Estimates

| Scenario | Time |
|----------|------|
| Global default rate changed, 5K products, 500 inheriting affiliates | ~30-60s |
| Affiliate default rate changed, 5K products | ~2s |

### Files to Update

- `backend/src/jobs/domain/job-type.enum.ts` — add enum value
- `backend/worker/src/processors/jobs.processor.ts` — add case in `process()` switch
- `backend/src/commission-settings/commission-settings.service.ts` — trigger job on rate change
- `backend/src/affiliates/affiliates.service.ts` — trigger job on rate change

---

## File Summary

### Backend (~43 new files + updates)
- `backend/src/affiliates/` — 15 files
- `backend/src/commission-settings/` — 10 files
- `backend/src/product-commissions/` — 14 files (2 controllers)
- `backend/worker/src/crons/commission-product-sync.cron.ts` — 1 file
- `backend/src/i18n/{en,vi}/affiliate.json` — 2 files
- Update: `backend/src/app.module.ts` (add 3 modules)
- Update: `backend/worker/src/modules/crons.module.ts` (register cron + dependencies)
- Update: `backend/src/jobs/domain/job-type.enum.ts` (add `COMMISSION_RATE_RECALCULATION`)
- Update: `backend/worker/src/processors/jobs.processor.ts` (add handler case)
- Auth: Reuse existing `PermissionGroupEnum` (owner/manager/staff) guards

---

## Pros / Cons / Tradeoffs

### Unified `product_commissions` Collection (nullable `affiliateId`)

| | |
|---|---|
| **Pro** | Single collection, single service, no code duplication. One `productId` index serves Phase A updates for all rows. |
| **Pro** | MongoDB compound unique index `{ affiliateId, productId }` naturally handles `null` as a distinct value. |
| **Con** | Collection can grow large (5K × 500 = 2.5M rows worst case). Requires careful indexing. |
| **Con** | Queries must always filter by `affiliateId` to avoid scanning the full collection. |

### Resolved `commissionRate` Stored Per-Row

| | |
|---|---|
| **Pro** | No cascade computation at query time — `estimatedCommission` is always `costPrice × commissionRate / 100`. Simple, fast reads. |
| **Pro** | Phase A cron can recalculate `estimatedCommission` without knowing the cascade hierarchy — just uses the row's own `commissionRate`. |
| **Con** | When a default rate changes, a background job must update all inheriting rows. Adds complexity (Step 5) and eventual consistency delay. |
| **Con** | Need `isCustomRate` flag to distinguish rows with explicit overrides from rows inheriting defaults. |
| **Tradeoff** | Read simplicity vs write complexity. Given that reads (CMS list views) are far more frequent than default rate changes, this is the right tradeoff. |

### Cron-Based Sync (Step 4) vs Event-Driven

| | |
|---|---|
| **Pro** | Proven pattern in codebase (flash-sale-sync). No event infrastructure needed. |
| **Pro** | Naturally batched — handles bulk product changes efficiently. |
| **Pro** | Cursor-based change detection avoids full table scans. |
| **Con** | Up to 5-minute delay for denormalized data freshness. Acceptable for back-office. |
| **Con** | Worker restart causes one full-sync run (~60-90s). |
| **Tradeoff** | Simplicity vs real-time. Back-office data doesn't need sub-second freshness. |

### BullMQ Job for Rate Recalculation (Step 5) vs Inline

| | |
|---|---|
| **Pro** | Non-blocking API response. CMS stays responsive. |
| **Pro** | Progress tracking via existing `useJobPolling`. |
| **Pro** | Concurrency guard prevents race conditions with 409 Conflict. |
| **Con** | CMS user sees stale `estimatedCommission` until job completes (must F5). |
| **Con** | `defaultCommissionRate` field locked during job — minor UX friction. |
| **Tradeoff** | Responsiveness vs immediacy. Locking the field during recalculation is safer than allowing cascading edits. |

### Phase B Full Mirror vs Manual Management

| | |
|---|---|
| **Pro** | Affiliates with `autoUpdateProducts=true` always have the same product list as global — zero manual effort. |
| **Pro** | Clear opt-out: set `autoUpdateProducts=false` for manual control. |
| **Con** | CMS admin cannot selectively remove a product from one affiliate while keeping auto-sync. It's all-or-nothing. |
| **Tradeoff** | Simplicity vs granularity. Per-product exclusion lists could be added later if needed. |

---

## CMS Key Insights (For Later Planning)

When CMS is planned, these pages will be needed:

1. **Affiliate List Page** — Table with search/filter by status/type, bulk actions. Follow existing `PromotionListPage` pattern with TanStack Table.

2. **Affiliate Detail Page** — Tabs layout:
   - **Info Tab:** Form with personal info, bank details, status toggle
   - **Commission Settings Tab:** Default rate override, autoUpdateProducts toggle, product commission table (add/remove/update products with per-product rates)
   - **Performance Tab** (Phase 2): Statistics, charts
   - **Orders Tab** (Phase 2): Attributed orders list

3. **Global Commission Settings Page** — Simple form (default rate, autoUpdateProducts toggle) + product commission table (same component reused from affiliate detail)

4. **Sidebar:** Nested under "Quản lý đại lý" — only show implemented pages (no placeholders)

5. **Reusable Component:** The product commission table (search products, add, set rates, bulk actions) should be a shared component used by both global settings page and affiliate detail commission tab — only difference is the `affiliateId` param.

---

## Verification Plan

After implementation:
1. `cd backend && npm run lint` — Must pass with no errors
2. `cd backend && npm run build` — Must compile successfully
3. Manual API testing with REST client:
   - Create/list/update/delete affiliates
   - Get/update global commission settings
   - Add/remove/update global product commissions
   - Add/remove/update affiliate-specific product commissions
   - Verify unique index prevents duplicate product entries
   - Verify soft delete on affiliates
   - Verify affiliateCode auto-generation uniqueness
   - Verify `isRecalculating` flag and 409 Conflict during active job
