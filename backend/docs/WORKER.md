# Worker Architecture

This document explains the purpose and implementation of the separate worker process in the backend. The worker is a dedicated NestJS application in `worker/src` that handles background jobs, external webhook processing, cron tasks, and long-running integrations.

## Why we need a worker

The worker exists to keep the main application responsive and scalable by moving heavy, asynchronous workloads out of request/response paths.

Key reasons:

- **Isolate long-running work**: product sync, inventory sync, order sync, affiliate jobs, and other batch processes can run without blocking the main API.
- **Separate scaling**: the worker can be scaled independently from the main web app.
- **Retry and durability**: BullMQ queues allow retry policies, delayed jobs, and failure handling.
- **Webhook processing**: Nhanh webhooks and other external callbacks are handled by the worker so that incoming external events are processed in isolation.
- **Resource separation**: CPU, memory, and Redis usage for background tasks are kept separate from user-facing traffic.

## Main worker responsibilities

The worker handles three broad execution domains:

1. **Job queue processing**
2. **Order task queue processing**
3. **System task queue processing**
4. **Webhook handling**
5. **Scheduled cron jobs**

## Worker entry point

- `worker/src/main.ts`

This file bootstraps the worker NestJS app.

What it configures:

- Loads `.env`
- Creates the `WorkerModule`
- Sets request body size to `5mb` for large webhook payloads
- Enables API prefixing and versioning for webhook routes
- Starts the server on `WORKER_PORT` (default `3001`)
- Exposes a health endpoint for probes
- Handles graceful shutdown on `SIGTERM` and `SIGINT`

## Worker module

- `worker/src/worker.module.ts`

This is the root module for the worker.

It imports:

- `ScheduleModule` for cron jobs
- `ConfigModule` + app config files shared with the main app
- `MongooseModule` for database access
- `BullModule` for Redis queue processing
- `CacheModule`, required by Nhanh auth and other services
- `I18nModule` for translated error messages
- Worker-specific modules:
  - `JobsWorkerModule`
  - `SystemTasksWorkerModule`
  - `OrderTasksWorkerModule`
  - `CronsModule`
  - `WebhookModule`
  - `HealthModule`

It also registers three BullMQ queues:

- `jobQueueName`
- `systemTaskQueueName`
- `orderTaskQueueName`

## Queue responsibilities

### `jobQueueName`

Handled by `JobsProcessor` in `worker/src/processors/jobs.processor.ts`.
This queue processes major batch jobs such as:

- Nhanh product sync
- Nhanh category sync
- Nhanh inventory sync
- Nhanh brand sync
- Nhanh depot sync
- Flash sale import jobs
- Product discount import jobs
- Commission recalculation jobs
- Recommendation precompute jobs

This is the most general worker queue.

### `orderTaskQueueName`

Handled by `OrderTasksProcessor` in `worker/src/processors/order-tasks.processor.ts`.
This queue handles order-specific background operations:

- CDP order sync
- CDP order cancellation sync
- Nhanh order sync
- Order confirmation token creation
- Affiliate commission creation / status updates
- Promotion usage increment

These are tasks that should happen after checkout/payment/order changes and should not block the main flow.

### `systemTaskQueueName`

Handled by `SystemTasksProcessor` in `worker/src/processors/system-tasks.processor.ts`.
This queue handles internal, lower-priority system jobs such as:

- thumbnail generation for review media
- flash sale sold-count increments

This queue is intentionally separate so system tasks do not compete with order and sync work.

## Detailed job catalog

### `JobsProcessor` job types

These jobs are the main batch and integration jobs handled by `worker/src/processors/jobs.processor.ts`.

- `NHANH_PRODUCT_LIST_SYNC`
  - Fetches product snapshots from Nhanh in paginated batches.
  - Uses `NhanhSyncService.syncProductsPage()` and a cursor-based sync flow.
  - Sends periodic heartbeats and supports cancellation while iterating pages.
  - Chains to `NHANH_PRODUCT_EMBED_SYNC` after completion.

- `NHANH_PRODUCT_DETAIL_SYNC`
  - Loads all local products marked as missing Nhanh detail.
  - Calls `NhanhSyncService.syncProductById()` for each product, with rate-limit retries and exponential backoff.
  - Updates progress and error counts.
  - Chains to `NHANH_PRODUCT_EMBED_SYNC` when done.

- `NHANH_PRODUCT_EMBED_SYNC`
  - Runs two DB-only passes:
    1. `NhanhSyncService.embedVariantsInParents()` embeds variant associations into parent products.
    2. `NhanhSyncService.populateParentMetadata()` populates metadata on variants for faster cart/checkout lookups.
  - No external Nhanh API calls are made in this step.

- `NHANH_CATEGORY_SYNC`
  - Syncs Nhanh category data via `NhanhSyncService.syncProductCategories()`.
  - Performs a two-phase import:
    1. bulk-upsert categories from Nhanh pages
    2. resolve parent-child relationships by updating parent IDs after all categories exist.

- `NHANH_INVENTORY_SYNC`
  - Syncs product inventory from Nhanh via `NhanhSyncService.syncProductInventories()`.
  - Builds an internal mapping of Nhanh product IDs to local product IDs first.
  - Bulk-upserts inventory records in batches.

- `NHANH_BRAND_SYNC`
  - Syncs Nhanh brands via `NhanhSyncService.syncProductBrands()`.
  - Bulk-upserts brand records from paged Nhanh results.

- `NHANH_DEPOT_SYNC`
  - Syncs warehouse/depot data from Nhanh using `NhanhSyncService.syncDepots()`.
  - Updates local depot records for shipping origin handling.

- `FLASH_SALE_IMPORT`
  - Imports flash sale products from an import session.
  - Reads valid session rows in chunks of 200.
  - Calls `FlashSalesService.bulkAddProducts()` per chunk.
  - Tracks progress, failed rows, and marks the import session completed.

- `PRODUCT_DISCOUNT_IMPORT`
  - Imports product discount data from an import session.
  - Reads valid session rows in chunks of 200.
  - Calls `PromotionsService.bulkAddPromotionProducts()` per chunk.
  - Tracks progress, failed rows, and marks the import session completed.

- `COMMISSION_RATE_RECALCULATION`
  - Recalculates commission rates for products when global or affiliate defaults change.
  - Uses `ProductCommissionRepository` and optionally `AffiliateRepository`.
  - Can run in `global` or `affiliate` scope.

- `RECOMMENDATION_PRECOMPUTE`
  - Triggers `RecommendationsService.precomputeRecommendations()`.
  - Refreshes recommendation tables for active users and trending products.

## Job processor details

- `worker/src/processors/jobs.processor.ts`

This processor is configured with:

- `lockDuration: 300000` (5 minutes)
- `stalledInterval: 300000`
- `concurrency: 1`

The low concurrency reflects the fact that these jobs often coordinate external rate-limited APIs and global database operations.

Important features:

- heartbeat support for long-running jobs
- cancellation checks during pagination loops
- rate-limit handling for Nhanh API calls
- exponential retry handling for API errors
- progress reporting for import sessions and product detail sync

Key implementation details:

- `processNhanhProductListSync()` paginates the Nhanh product list, updates progress, and chains to embed sync.
- `processNhanhProductDetailSync()` fetches products that need detail enrichment and retries each product on rate limits or transient API errors.
- `processNhanhProductEmbedSync()` performs parent/variant embedding in the local DB.
- `processFlashSaleImport()` and `processProductDiscountImport()` both process import session rows in chunks of 200, using bulk service calls and marking the import session complete.
- `processCommissionRateRecalculation()` updates existing commission records and handles both global default and per-affiliate recalculation.
- `processRecommendationPrecompute()` runs recommendation refresh work without external API calls.

This processor is the main place where Nhanh integration jobs and import batch jobs are coordinated.

## Order tasks processor details

- `worker/src/processors/order-tasks.processor.ts`

This processor is configured with:

- `lockDuration: 120000` (2 minutes)
- `stalledInterval: 120000`
- `concurrency: 5`

The moderate concurrency is chosen because order tasks are typically independent across orders, but still need coordination with external services.

Order task types:

- `SYNC_ORDER_CDP`
  - Calls `OrderCdpSyncService.syncOrder(order)`.
  - Sends order data to the CDP system after checkout or order updates.
  - Failure here is considered significant enough to retry in the worker rather than blocking checkout.

- `SYNC_ORDER_CANCELLATION_CDP`
  - Calls `OrderCdpSyncService.syncOrderCancellation(order)`.
  - Propagates canceled order state to the CDP.

- `SYNC_ORDER_NHANH`
  - Calls `OrderNhanhSyncService.syncOrder(order, shipping)`.
  - Synchronizes order details to Nhanh, including shipping information when available.
  - Useful for merchant order fulfillment flows and third-party order tracking.

- `CREATE_ORDER_CONFIRMATION`
  - Calls `OrderConfirmationService.createOrderConfirmationToken(order)`.
  - Creates Zalo order confirmation tokens or other confirmation artifacts after payment.

- `CREATE_AFFILIATE_COMMISSION`
  - Calls `AffiliateOrderCommissionsService.createFromOrder(order, affiliateId, affiliateCode)`.
  - Creates affiliate commission records when an order is attributed to an affiliate.

- `UPDATE_AFFILIATE_COMMISSION_STATUS`
  - Calls `AffiliateOrderCommissionsService.updateOrderStatus(orderId, newStatus)`.
  - Updates commission records when order status changes, such as cancellation or completion.

- `INCREMENT_PROMOTION_USAGE`
  - Handles promotion usage tracking and sold counts after checkout.
  - For product discounts, it creates `PromotionUsageRecord` entries per user and increments sold counts on `PromotionProduct` rows.
  - For order discounts, it increments order-discount usage counts and optionally creates usage records.
  - For bundle deals, it increments gift counts for `BUY_X_GET_Y` promotions.

These tasks are queued by checkout/payment flows so the main order path stays fast while integrations and promotion accounting happen asynchronously.

## System tasks processor details

- `worker/src/processors/system-tasks.processor.ts`

This processor handles low-priority internal system jobs and is configured with:

- `lockDuration: 300000` (5 minutes)
- `stalledInterval: 300000`
- `concurrency: 2`

Task types:

- `THUMBNAIL_GENERATION`
  - Uses `ThumbnailService.generateThumbnail(videoKey)`.
  - Generates a thumbnail image from a review video file.
  - Updates the review record via `ReviewRepository.updateMediaThumbnail()`.
  - If the review or media index is invalid, it logs a warning but does not crash the worker.

- `INCREMENT_FLASH_SALE_SOLD_COUNT`
  - Uses `FlashSaleProductRepository.incrementSoldCount()` for each checkout item.
  - Increments sold counts for flash sale items after a successful order.
  - Logs warnings for products that are missing or disabled.

These jobs are intentionally kept in a separate queue so review/media and flash sale accounting do not compete with external sync or order integration traffic.

## Worker services

The worker contains worker-only services such as:

- `worker/src/services/nhanh-sync.service.ts` — Nhanh product/category/brand/inventory/depot sync logic
- `worker/src/services/thumbnail.service.ts` — review media thumbnail creation

These services are not part of the main app and are meant for batch, background, or integration work only.

## Webhook processing

- `worker/src/webhooks/webhook.module.ts`

The worker exposes webhook endpoints, most importantly:

- `POST /api/v1/webhooks/nhanh` for Nhanh webhook callbacks

This allows the worker to process external events and then enqueue background jobs or update the local state asynchronously.

## Cron jobs

- `worker/src/modules/crons.module.ts`

The worker also runs scheduled tasks via `ScheduleModule`. These cron jobs handle periodic maintenance and sync operations that need to run on a fixed cadence.

### Why cron jobs

These jobs are scheduled because they maintain derived state, reconcile cross-collection data, and refresh expensive caches. They are not run on every request because:

- the work is often expensive or batchy and would hurt request latency if done synchronously;
- the data sources (promotions, flash sales, commissions) can change independently of individual user requests;
- some state must be recomputed regularly to preserve consistency across many products or affiliates;
- using cron jobs avoids missing state changes caused by out-of-band updates or complex event flows.

In short, these cron jobs provide a reliable, eventually-consistent synchronization layer for data that is too heavy or too global to update in real time.

### Scheduled cron jobs

- `PricingSyncCron` (`worker/src/crons/pricing-sync.cron.ts`)
  - Runs every minute.
  - Executes two sequential phases:
    1. `ProductDiscountSyncCron.syncProductDiscountToProducts()`
       - Syncs active product discount promotions into product documents.
       - Keeps `product.productDiscount` up to date for display and pricing logic.
       - Uses caching to skip work when promotion state is unchanged.
    2. `FlashSaleSyncCron.syncFlashSaleToProducts()`
       - Syncs active flash sale pricing into product documents.
       - Populates `product.flashSale` with effective price, discount amount, remaining stock, and end time.
       - Reads fresh product discount data first so flash sale pricing can stack correctly.

- `ProductDiscountSyncCron` (`worker/src/crons/product-discount-sync.cron.ts`)
  - Runs as part of `PricingSyncCron`.
  - Detects changes in active promotion IDs, update timestamps, or sold counts.
  - Bulk-updates product documents with promotion pricing and metadata.
  - Clears product discount fields when no active promotions remain.

- `FlashSaleSyncCron` (`worker/src/crons/flash-sale-sync.cron.ts`)
  - Runs as part of `PricingSyncCron`.
  - Synchronizes active flash sale details into products and `flash_sale_products`.
  - Calculates stackable flash sale prices using current product discount prices.
  - Clears flash sale data when there is no active flash sale.

- `CommissionProductSyncCron` (`worker/src/crons/commission-product-sync.cron.ts`)
  - Runs every 5 minutes.
  - Phase A: denormalizes product changes into `product_commissions` rows.
    - Picks up changed products using a persisted cursor.
    - Updates product name, code, images, costPrice, stock, category, and estimated commission.
    - Deletes commission rows for soft-deleted products.
  - Phase B: mirrors the global commission product set to affiliates that use auto-update.
    - Ensures affiliate-specific commission tables stay aligned with the global product list.

- `AffiliateBalanceAuditCron` (`worker/src/crons/affiliate-balance-audit.cron.ts`)
  - Runs every minute.
  - Phase A: audits commission records.
    - De-audits orders whose status is no longer successful.
    - Audits eligible commissions for successful orders.
  - Phase B: recomputes affiliate balances.
    - Calculates `totalEarned`, `totalWithdrawn`, `pendingAmount`, and `availableBalance`.
    - Updates each affiliate document with fresh balance data.

- `RecommendationPrecomputeCron` (`worker/src/crons/recommendation-precompute.cron.ts`)
  - Runs every 10 minutes.
  - Calls `RecommendationsService.precomputeRecommendations()`.
  - Rebuilds personalized and trending recommendation datasets used by the shop.

These scheduled jobs keep pricing, commission, and recommendation data fresh without relying on user traffic.

## Health and deployment

The worker exposes a health endpoint used by Kubernetes or process managers to verify it is alive.

It should be deployed separately from the main API server, with its own port and process.

## Summary: What the worker does

The worker is responsible for:

- syncing external data from `nhanh.vn`
- processing queued jobs in a durable and retriable way
- handling external webhook callbacks
- doing background order-related side effects
- running scheduled maintenance tasks
- isolating heavy work from the main web/API process

This makes the backend more reliable, scalable, and easier to maintain by keeping asynchronous business logic separate from customer-facing requests.
