# Product Catalog Sync Architecture

This document describes how product/catalog data is synced from `nhanh.vn` into the backend. It covers the actual implementation, worker flow, sync endpoints, and the key files developers should reference.

## Purpose

The backend does not treat Nhanh as a passive feed. It actively syncs:

- products and product details
- product categories and parent relationships
- product brands
- product inventories
- depots (warehouses)

The sync is implemented in the worker process via `worker/src/services/nhanh-sync.service.ts` and orchestrated by job handlers in `worker/src/processors/jobs.processor.ts`.

## Entry points

The sync is started by CMS-only HTTP endpoints in `src/nhanh/nhanh.controller.ts`.

Main endpoints:

- `POST /api/v1/nhanh/sync/products` — full product sync chain
- `POST /api/v1/nhanh/sync/product-details` — sync full details for products already imported
- `POST /api/v1/nhanh/sync/product-embed` — embed variants into parents and populate metadata
- `POST /api/v1/nhanh/sync/product-categories` — category sync
- `POST /api/v1/nhanh/sync/product-inventories` — inventory sync
- `POST /api/v1/nhanh/sync/product-brands` — brand sync
- `POST /api/v1/nhanh/sync/depots` — depot sync
- `POST /api/v1/nhanh/sync/all` — start all core sync jobs together

Each endpoint starts a background job through `JobsService`.

## Sync job orchestration

The worker job processor `worker/src/processors/jobs.processor.ts` owns the sync lifecycle:

- `NHANH_PRODUCT_LIST_SYNC` — Step 1: fetch product list pages
- `NHANH_PRODUCT_DETAIL_SYNC` — Step 2: fetch individual product details
- `NHANH_PRODUCT_EMBED_SYNC` — Step 3+4: embed variants and populate parent metadata
- `NHANH_CATEGORY_SYNC` — category sync
- `NHANH_INVENTORY_SYNC` — inventory sync
- `NHANH_BRAND_SYNC` — brand sync
- `NHANH_DEPOT_SYNC` — depot sync

Jobs are cancellable, heartbeating, and rate-limit aware. Product sync uses paginated pages with explicit delays when Nhanh returns rate-limit errors.

## Product sync workflow

The product sync workflow is implemented in `worker/src/services/nhanh-sync.service.ts`.

### Step 1: Product list sync

Endpoint: `POST /api/v1/nhanh/sync/products`

This job:

- fetches `/v3.0/product/list` from Nhanh
- always applies `status: [2]` (selling products)
- uses cursor-based pagination with page size 100
- maps each Nhanh payload through `NhanhProductMapper.toDomain()`
- bulk upserts products via `ProductRepository.bulkUpsert()`
- keeps a `productSyncCursor` to continue pagination safely
- builds a category mapping once per sync to resolve product categories

Important details:

- product status mapping is derived from Nhanh status values
- the Nhanh payload is stored raw in `product.snapshot`
- derived fields include `code`, `name`, `prices`, `images`, `inventory`, `category`, `stock`, `status`, and `attributes`

### Step 2: Product detail sync

Endpoint: `POST /api/v1/nhanh/sync/product-details`

This job:

- finds products needing detail sync via `ProductRepository.findProductsNeedingDetailSync()`
- calls `/v3.0/product/detail` for each product snapshot ID
- maps the response with `NhanhProductMapper.toDomain()`
- if the product exists by `snapshot.id`, updates it; otherwise creates it

Preservation rule:

- when a product already exists, `syncProductById()` excludes `description` and `content` from the update to preserve CMS customizations.

### Step 3+4: Product embed and parent metadata

Endpoint: `POST /api/v1/nhanh/sync/product-embed`

This step is DB-only and does not call Nhanh.

It runs:

- `embedVariantsInParents(businessId)` — groups child variants under their parent products in the database
- `populateParentMetadata(businessId)` — fills parent metadata on variants for faster cart/checkout behavior

This is the step that makes variant-based browsing and pricing efficient in the shop.

### Chaining rules

- `sync/products` starts `NHANH_PRODUCT_LIST_SYNC`.
- after `NHANH_PRODUCT_LIST_SYNC` completes, it automatically starts `NHANH_PRODUCT_EMBED_SYNC`.
- `sync/product-details` starts `NHANH_PRODUCT_DETAIL_SYNC`, which chains to `NHANH_PRODUCT_EMBED_SYNC` after completion.

So the full product sync pattern is:

- list sync → embed sync
- or detail sync → embed sync

## Category sync workflow

Implemented by `NhanhSyncService.syncProductCategories()`.

Process:

1. Fetch categories from `/v3.0/product/category` using cursor-based pagination.
2. Map each Nhanh category through `NhanhProductCategoryMapper.toDomain()`.
3. Bulk upsert category documents via `ProductCategoryRepository.bulkUpsert()`.
4. After all categories are inserted, resolve parent-child links:
   - build `snapshotId -> mongoId` mapping from `category.snapshot.id`
   - update category documents where `parentId` points to another category’s snapshot ID

Key points:

- categories are stored with `source: 'nhanh'` and `businessId`
- raw Nhanh data is stored in `snapshot`
- parent relationships are resolved in a second pass after all categories are available
- root categories are identified by `parentId === 0` or missing parent

## Inventory sync workflow

Implemented by `NhanhSyncService.syncProductInventories()`.

Process:

- fetch `/v3.0/product/inventory` pages with `status: [2]`
- build a Nhanh product ID → internal product ID map once from existing `source: 'nhanh'` products
- map each inventory payload via `NhanhProductInventoryMapper.toDomain()`
- bulk upsert inventory entries via `ProductInventoryRepository.bulkUpsert()`

Special handling:

- inventory sync does not create products; it only updates inventories for products already imported from Nhanh.
- if a Nhanh product ID cannot be mapped to an existing internal product, a warning is logged and that inventory row is skipped.

## Brand sync workflow

Implemented by `NhanhSyncService.syncProductBrands()`.

Process:

- fetch `/v3.0/product/brand` pages
- map brands via `NhanhProductBrandMapper.toDomain()`
- bulk upsert using `ProductBrandRepository.bulkUpsert()`

## Depot sync workflow

Implemented by `NhanhSyncService.syncDepots()`.

Process:

- fetch `/v3.0/business/depot`
- map depots via `NhanhDepotMapper.toDomain()`
- bulk upsert via `DepotRepository.bulkUpsert()`

## Data architecture and mapping conventions

The Nhanh sync layer follows these conventions:

- every synced entity has `source: 'nhanh'`
- `businessId` is stored from the Nhanh access token
- the raw Nhanh payload is persisted into `snapshot`
- derived domain fields are computed from snapshot data
- sync jobs are designed to be repeatable and idempotent

Mapper classes:

- `src/nhanh/mappers/nhanh-product.mapper.ts`
- `src/nhanh/mappers/nhanh-product-category.mapper.ts`
- `src/nhanh/mappers/nhanh-product-brand.mapper.ts`
- `src/nhanh/mappers/nhanh-product-inventory.mapper.ts`
- `src/nhanh/mappers/nhanh-depot.mapper.ts`

Product mapping rules:

- `snapshot.code` → `product.code`
- `snapshot.name` → `product.name`
- `snapshot.prices` → `product.prices`
- `snapshot.inventory.available` → `product.stock`
- `snapshot.status` → `ProductStatus`
- `snapshot.categoryId` or `snapshot.category.id` → `product.category`

Category mapping rules:

- raw Nhanh category fields are stored in `snapshot`
- `code`, `name`, and `status` are derived
- `parentId` is resolved by looking up category snapshot IDs after upsert

## Job reliability and rate limiting

The sync job processor includes:

- heartbeat updates to keep long-running jobs locked
- job cancellation support via `JobStatus.CANCELLED`
- retry and delay handling for `NhanhRateLimitException`
- progress updates for long-running pagination

Product list sync is specifically paginated with a delay between pages to avoid hitting Nhanh rate limits.

## What is not synced here

This document describes the Nhanh integration only. Business-specific product catalog logic such as:

- CMS product editing
- manual category management
- internal product promotions

is handled elsewhere in the backend.

## Developer notes

- Use `POST /api/v1/nhanh/sync/all` for a full refresh of depots, categories, brands, products, and inventories.
- Run category sync before product detail sync when you need accurate category resolution.
- Use separate product detail sync if you only need descriptions/content for already-imported products.
- `sync/product-embed` is safe to run after any upstream product import to refresh parent/variant relationships.
- If a Nhanh access token is missing, sync jobs fail early with `nhanh.noAccessToken`.

> Reference files: `worker/src/services/nhanh-sync.service.ts`, `worker/src/processors/jobs.processor.ts`, `src/nhanh/nhanh.controller.ts`, `src/nhanh/mappers/*`, `src/nhanh/utils/nhanh-api-client.ts`.
