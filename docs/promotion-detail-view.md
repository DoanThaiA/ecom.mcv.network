# Promotion Detail View - CMS Module

## Overview

The Promotion Detail View adds read-only detail pages for all three promotion types in the CMS: **Product Discount**, **Order Discount**, and **Shock Deal (Bundle Deal)**. Each detail page shows promotion info, configuration, order statistics, and product statistics (where applicable).

Accessible by clicking a row in the promotion list table, which navigates to `/:type/:id`.

---

## Architecture

### Page Structure

Each promotion type follows the same layout pattern:

```
PromotionDetailHeader (shared)
├── Promotion metadata (type, subType, name, time range, status)
└── Action buttons (Back, Pause/Resume, Duplicate [disabled])

Tabs
├── Tab 1: Info Section (type-specific config + product list)
├── Tab 2: Orders Tab (paginated order stats with date filter)
└── Tab 3: Products Tab (paginated product stats with date filter) — Product Discount & Shock Deal only
```

### File Structure

```
cms/src/
├── pages/
│   ├── product-discount-detail.tsx          # Lazy page wrapper
│   ├── order-discount-detail.tsx
│   └── shock-deal-detail.tsx
├── sections/
│   ├── promotion/components/
│   │   └── promotion-detail-header.tsx      # Shared header component
│   ├── product-discount/
│   │   ├── product-discount-detail-view.tsx # Main detail view
│   │   └── components/
│   │       ├── product-discount-info-section.tsx
│   │       ├── product-discount-orders-tab.tsx
│   │       └── product-discount-products-tab.tsx
│   ├── order-discount/
│   │   ├── order-discount-detail-view.tsx
│   │   └── components/
│   │       ├── order-discount-info-section.tsx
│   │       └── order-discount-orders-tab.tsx
│   └── shock-deal/
│       ├── shock-deal-detail-view.tsx
│       └── components/
│           ├── shock-deal-info-section.tsx
│           ├── shock-deal-orders-tab.tsx
│           └── shock-deal-products-tab.tsx
```

---

## Routes

Added in `cms/src/routes/sections.tsx`:

| Path | Page |
|------|------|
| `/product-discount/:id` | Product Discount Detail |
| `/order-discount/:id` | Order Discount Detail |
| `/shock-deal/:id` | Shock Deal Detail |

Navigation from the promotion list table row click → `router.push('/product-discount/{id}')` (based on promotion type).

---

## Backend API Endpoints

### Existing

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/promotions/:id` | Get promotion detail |
| `PATCH` | `/v1/promotions/:id/pause` | Pause promotion |
| `PATCH` | `/v1/promotions/:id/resume` | Resume promotion |
| `GET` | `/v1/promotions/:id/products` | Get promotion products (paginated) |

### New (Promotion Statistics)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/v1/promotions/:id/stats/orders` | Order statistics with summary |
| `GET` | `/v1/promotions/:id/stats/products` | Product statistics with summary |

#### Query Parameters

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `page` | number | 1 | Page number (1-indexed) |
| `limit` | number | 10 | Items per page |
| `fromDate` | string (ISO) | — | Start date filter |
| `toDate` | string (ISO) | — | End date filter |

#### Response Shapes

All stats endpoints return paginated responses with a `summary` object. The response shape varies by promotion type — see Proto definitions below.

---

## Proto Definitions

### File: `proto/cms/promotions/promotion.proto`

#### Query Request

```protobuf
message QueryPromotionStatsRequest {
  string          id        = 1;
  optional int32  page      = 2;
  optional int32  limit     = 3;
  optional string from_date = 4;
  optional string to_date   = 5;
}
```

#### Order Statistics

Three row types, one per promotion type:

```protobuf
message ProductDiscountOrderRow {
  string order_id, order_number, customer_name, customer_phone, product_name, created_at;
  optional int32 nhanh_order_id;
  int32 quantity;
  double discounted_price, total_discount, payment_amount;
}

message OrderDiscountOrderRow {
  string order_id, order_number, customer_name, customer_phone, created_at;
  optional int32 nhanh_order_id;
  double pre_discount_value, discount_value, payment_amount;
}

message BundleDealOrderRow {
  string order_id, order_number, customer_name, customer_phone, gift_product_name, created_at;
  optional int32 nhanh_order_id;
  int32 gift_quantity;
  double gift_unit_price, gift_value, payment_amount;
}
```

Summary and paginated responses:

```protobuf
message PromotionOrderSummary {
  int32 total_orders;
  optional int32  total_quantity;
  optional double total_discount_amount;
  double          total_payment_amount;
  optional double total_pre_discount_value;
  optional double total_gift_value;
}

message ProductDiscountOrdersResponse { repeated ProductDiscountOrderRow docs; ... PromotionOrderSummary summary; }
message OrderDiscountOrdersResponse   { repeated OrderDiscountOrderRow   docs; ... PromotionOrderSummary summary; }
message BundleDealOrdersResponse      { repeated BundleDealOrderRow      docs; ... PromotionOrderSummary summary; }
```

#### Product Statistics

```protobuf
message ProductDiscountProductStatsRow {
  string product_id, code, name;
  optional string image;
  double selling_price, discounted_price, total_discount_value;
  int32 quantity_discounted;
}

message BundleDealGiftProductStatsRow {
  string product_id, code, name;
  optional string image;
  double selling_price, gift_value;
  int32 quantity_gifted;
}

message PromotionProductStatsSummary {
  int32 total_quantity;
  optional double total_discount_value;
  optional double total_gift_value;
}

message ProductDiscountProductStatsResponse { repeated ProductDiscountProductStatsRow docs; ... PromotionProductStatsSummary summary; }
message BundleDealProductStatsResponse      { repeated BundleDealGiftProductStatsRow  docs; ... PromotionProductStatsSummary summary; }
```

### Generated TypeScript

Run `cd cms && npm run proto:gen` to regenerate.

Output: `cms/src/types/gen/cms/cms/promotions/promotion.ts`

Import example:
```typescript
import type {
  ProductDiscountOrderRow,
  ProductDiscountOrdersResponse,
} from 'src/types/gen/cms/cms/promotions/promotion';
```

---

## Components

### PromotionDetailHeader (shared)

Used by all three detail views. Displays:
- Promotion type, sub-type, name, time range, status badge
- Fixed bottom action bar: **Back**, **Pause/Resume** (hidden when ended), **Duplicate** (disabled, not yet implemented)

Props: `promotion`, `onBack`, `onPauseResume`, `onDuplicate`, `pauseLoading`

### Info Sections (per type)

**ProductDiscountInfoSection** — Shows discount config (type, value, max, min order, voucher code, usage limits) + paginated product table (code, image, name, selling price, discounted price). Fetches products via `GET /promotions/:id/products`.

**OrderDiscountInfoSection** — Shows discount config (type, value, max, min order, promo code, usage limit, single use per customer).

**ShockDealInfoSection** — Branches by `BundleDealSubType`:
- `BUY_TO_GET_GIFT`: Tier table with columns (STT, Condition, Gift Product image + name). Uses `<table>` with `rowSpan` for tiers with multiple gift products.
- `BUY_X_GET_Y`: Info rows (min order, required qty, gift qty, usage limit) + required products table + gift products table.

### Orders Tabs

All three types share the same pattern:
- Date range filter (DatePicker from/to)
- Summary row (total orders, total quantity, total discount/gift value, total payment)
- Paginated table with type-specific columns
- Uses `GET /promotions/:id/stats/orders`

### Products Tabs (Product Discount & Shock Deal only)

Same pattern as Orders Tab:
- Date range filter
- Summary row
- Paginated table (product code, image, name, price, quantity, total value)
- Uses `GET /promotions/:id/stats/products`

---

## Backend: PromotionStatsService

**File:** `backend/src/promotions/promotion-stats.service.ts`

Aggregates order data from MongoDB using `$facet` pipeline for efficient single-query pagination + summary.

Key methods:
- `getPromotionOrders(id, query)` — Dispatches by promotion type
- `getPromotionProductStats(id, query)` — Dispatches by promotion type (Product Discount & Bundle Deal only)

Data source: Matches orders by `discountDetails.promotionId` field in the `orders` collection.

---

## CMS Repository

**File:** `cms/src/repositories/promotion.repository.ts`

New methods:
```typescript
getPromotionProducts(promotionId, params)     // GET /promotions/:id/products
getPromotionOrders(promotionId, params)       // GET /promotions/:id/stats/orders
getPromotionProductStats(promotionId, params) // GET /promotions/:id/stats/products
```

---

## i18n Keys Added

| Key | Vietnamese | English |
|-----|-----------|---------|
| `viewDetail` | Xem chi tiết | View Detail |
| `programName` | Tên chương trình | Program Name |
| `promotionTime` | Thời gian diễn ra chương trình | Promotion Period |
| `classification` | Phân loại | Classification |
| `discountCondition` | Điều kiện ưu đãi | Discount Condition |
| `duplicatePromotion` | Nhân bản | Duplicate |
| `dateRangeFilter` | Lọc theo khoảng thời gian | Date Range Filter |
| `quantityDiscounted` | Số lượng được giảm | Quantity Discounted |
| `totalDiscountValue` | Tổng giá trị giảm | Total Discount Value |
| `quantityGifted` | Số lượng được tặng | Quantity Gifted |
| `giftTotalValue` | Tổng giá trị quà tặng | Gift Total Value |
| `giftUnitPrice` | Đơn giá quà tặng | Gift Unit Price |
| `preDiscountValue` | Giá trị trước giảm | Pre-discount Value |
| `discountValue` | Giá trị giảm | Discount Value |
| `total` | Tổng | Total |
| `minOrderValue` | Giá trị đơn tối thiểu | Minimum Order Value |

---

## Navigation Flow

1. User opens **Quản lý khuyến mãi** (Promotion Management) list
2. Clicks a promotion row → navigates to `/:type/:id` based on promotion type
3. Detail page loads promotion data via `GET /promotions/:id`
4. User can switch tabs (Info, Orders, Products)
5. Orders/Products tabs lazy-load stats data with date range filter
6. User can Pause/Resume the promotion from the bottom action bar
7. Back button returns to the promotion list
