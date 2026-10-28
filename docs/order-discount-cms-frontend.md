# Order Discount Promotion - CMS Frontend Integration Guide

## Overview

This document describes how to integrate the new **Order Discount** promotion type (`PROMOTION_TYPE_ORDER_DISCOUNT`) into the CMS frontend. This promotion type allows admins to create discounts that apply to entire orders based on configurable conditions.

## Proto Changes

### New Enum: `OrderDiscountSubType`

Located in `shared/common/enums.proto`:

```protobuf
enum OrderDiscountSubType {
  ORDER_DISCOUNT_SUB_TYPE_UNSPECIFIED = 0;
  ORDER_DISCOUNT_SUB_TYPE_AUTO_APPLY  = 1; // Automatically applied when conditions met
  ORDER_DISCOUNT_SUB_TYPE_PROMO_CODE  = 2; // Requires customer to enter promo code
}
```

### New Message: `CreateOrderDiscountConfigInput`

Located in `cms/promotions/promotion.proto`:

```protobuf
message CreateOrderDiscountConfigInput {
  OrderDiscountSubType sub_type                             = 1;
  optional string      promo_code                           = 2;  // Required for PROMO_CODE sub_type
  DiscountType         discount_type                        = 3;
  double               discount_value                       = 4;
  optional double      max_discount_value                   = 5;  // Cap for percentage discounts
  double               minimum_order_value                  = 6;
  optional bool        not_applicable_with_other_promotions = 7;  // Default: false
  optional bool        single_use_per_customer              = 8;  // Default: false
  optional int32       total_usage_limit                    = 9;
}
```

### Response Message: `OrderDiscountConfig`

Located in `shared/promotions/promotion.proto`:

```protobuf
message OrderDiscountConfig {
  OrderDiscountSubType         sub_type                             = 1;
  optional string              promo_code                           = 2;
  DiscountType                 discount_type                        = 3;
  double                       discount_value                       = 4;
  optional double              max_discount_value                   = 5;
  double                       minimum_order_value                  = 6;
  bool                         not_applicable_with_other_promotions = 7;
  bool                         single_use_per_customer              = 8;
  optional int32               total_usage_limit                    = 9;
  int32                        current_usage_count                  = 10;
  repeated PromotionUsageRecord usage_records                       = 11;
}
```

## UI Implementation

### 1. Promotion Type Selection

Add "Order Discount" (Giảm giá hóa đơn) to the promotion type dropdown:

| Value | English Label | Vietnamese Label |
|-------|---------------|------------------|
| `PROMOTION_TYPE_ORDER_DISCOUNT` (2) | Order Discount | Giảm giá hóa đơn |

### 2. Order Discount Form Fields

When `type === PROMOTION_TYPE_ORDER_DISCOUNT`, display the following form:

#### Sub-Type Selection (Required)

| Field | Type | Options |
|-------|------|---------|
| `subType` | Radio/Select | AUTO_APPLY (1): "Tự động áp dụng" / PROMO_CODE (2): "Mã khuyến mãi" |

#### Promo Code (Conditional)

| Field | Type | Validation |
|-------|------|------------|
| `promoCode` | Text Input | Required when subType = PROMO_CODE, max 50 chars, must be unique |

**Show this field only when `subType === ORDER_DISCOUNT_SUB_TYPE_PROMO_CODE`**

#### Discount Configuration (Required)

| Field | Type | Validation | Description |
|-------|------|------------|-------------|
| `discountType` | Select | Required | FIXED (1): "Giảm cố định (VND)" / PERCENTAGE (2): "Giảm phần trăm (%)" |
| `discountValue` | Number | >= 0, if percentage: 0-100 | Amount or percentage to discount |
| `maxDiscountValue` | Number | >= 0, optional | Only show when discountType = PERCENTAGE |
| `minimumOrderValue` | Number | >= 0, required | Minimum order value to qualify (VND) |

#### Usage Restrictions (Optional)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `notApplicableWithOtherPromotions` | Checkbox | false | "Không áp dụng chung với khuyến mãi khác" |
| `singleUsePerCustomer` | Checkbox | false | "Mỗi khách hàng chỉ được sử dụng 1 lần" |
| `totalUsageLimit` | Number | null | "Tổng số lượt sử dụng tối đa" (null = unlimited) |

### 3. Form Validation Rules

```typescript
// Validation rules for Order Discount config
const orderDiscountValidation = {
  subType: {
    required: true,
    enum: [1, 2], // AUTO_APPLY or PROMO_CODE
  },
  promoCode: {
    required: (subType) => subType === 2, // Required for PROMO_CODE
    maxLength: 50,
  },
  discountType: {
    required: true,
    enum: [1, 2], // FIXED or PERCENTAGE
  },
  discountValue: {
    required: true,
    min: 0,
    max: (discountType) => discountType === 2 ? 100 : Infinity,
  },
  maxDiscountValue: {
    show: (discountType) => discountType === 2, // Only for PERCENTAGE
    min: 0,
  },
  minimumOrderValue: {
    required: true,
    min: 0,
  },
  totalUsageLimit: {
    min: 1, // If provided, must be at least 1
  },
};
```

### 4. API Request Examples

#### Create Order Discount (Auto-Apply)

```typescript
const createAutoApplyPromotion = {
  type: 2, // PROMOTION_TYPE_ORDER_DISCOUNT
  name: "Giảm 10% đơn từ 500k",
  startTime: "2024-01-01T00:00:00Z",
  endTime: "2024-12-31T23:59:59Z",
  orderDiscountConfig: {
    subType: 1, // AUTO_APPLY
    discountType: 2, // PERCENTAGE
    discountValue: 10,
    maxDiscountValue: 100000, // Cap at 100k VND
    minimumOrderValue: 500000,
    notApplicableWithOtherPromotions: false,
    singleUsePerCustomer: false,
  },
};
```

#### Create Order Discount (Promo Code)

```typescript
const createPromoCodePromotion = {
  type: 2, // PROMOTION_TYPE_ORDER_DISCOUNT
  name: "Mã SALE50K giảm 50k",
  startTime: "2024-01-01T00:00:00Z",
  endTime: "2024-12-31T23:59:59Z",
  orderDiscountConfig: {
    subType: 2, // PROMO_CODE
    promoCode: "SALE50K",
    discountType: 1, // FIXED
    discountValue: 50000,
    minimumOrderValue: 200000,
    notApplicableWithOtherPromotions: true,
    singleUsePerCustomer: true,
    totalUsageLimit: 1000,
  },
};
```

### 5. Detail View Display

When viewing an Order Discount promotion, display:

| Field | Label (VI) | Format |
|-------|------------|--------|
| `subType` | Loại áp dụng | "Tự động" / "Mã khuyến mãi" |
| `promoCode` | Mã khuyến mãi | Show code if present |
| `discountType` | Loại giảm giá | "Cố định" / "Phần trăm" |
| `discountValue` | Giá trị giảm | Format as VND or % |
| `maxDiscountValue` | Giảm tối đa | Format as VND (only for percentage) |
| `minimumOrderValue` | Giá trị đơn tối thiểu | Format as VND |
| `notApplicableWithOtherPromotions` | Không dùng chung KM khác | Yes/No |
| `singleUsePerCustomer` | Giới hạn 1 lần/khách | Yes/No |
| `totalUsageLimit` | Tổng lượt sử dụng tối đa | Number or "Không giới hạn" |
| `currentUsageCount` | Đã sử dụng | Number |

### 6. List View

The promotion list already supports ORDER_DISCOUNT via the existing `PromotionListItem` message. The `tier_count` field will be `0` for order discounts.

Consider adding a column or badge to indicate:
- Sub-type: "Tự động" vs "Mã: XXXX"
- Usage: "500/1000 lượt" (if limited)

## i18n Keys

Add these translation keys:

```json
{
  "promotion.type.orderDiscount": "Giảm giá hóa đơn",
  "promotion.subType.autoApply": "Tự động áp dụng",
  "promotion.subType.promoCode": "Mã khuyến mãi",
  "promotion.field.promoCode": "Mã khuyến mãi",
  "promotion.field.discountType": "Loại giảm giá",
  "promotion.field.discountValue": "Giá trị giảm",
  "promotion.field.maxDiscountValue": "Giảm tối đa",
  "promotion.field.minimumOrderValue": "Giá trị đơn tối thiểu",
  "promotion.field.notApplicableWithOther": "Không áp dụng chung với khuyến mãi khác",
  "promotion.field.singleUsePerCustomer": "Mỗi khách hàng chỉ được sử dụng 1 lần",
  "promotion.field.totalUsageLimit": "Tổng lượt sử dụng tối đa",
  "promotion.field.currentUsageCount": "Đã sử dụng",
  "promotion.field.unlimited": "Không giới hạn",
  "promotion.discountType.fixed": "Cố định (VND)",
  "promotion.discountType.percentage": "Phần trăm (%)"
}
```

## Error Messages

The backend returns these error codes (already in i18n):

| Key | English | Vietnamese |
|-----|---------|------------|
| `promotion.invalidSubType` | Invalid sub-type | Loại phụ không hợp lệ |
| `promotion.promoCodeRequired` | Promo code is required | Mã khuyến mãi là bắt buộc |
| `promotion.promoCodeNotAllowedForAutoApply` | Promo code not allowed for auto-apply | Mã khuyến mãi không được phép cho loại tự động áp dụng |
| `promotion.promoCodeAlreadyExists` | Promo code already exists | Mã khuyến mãi đã tồn tại |
| `promotion.invalidDiscountType` | Invalid discount type | Loại giảm giá không hợp lệ |
| `promotion.invalidDiscountValue` | Invalid discount value | Giá trị giảm giá không hợp lệ |
| `promotion.percentageMustBe0To100` | Percentage must be 0-100 | Phần trăm phải từ 0 đến 100 |
| `promotion.invalidMinimumOrderValue` | Invalid minimum order value | Giá trị đơn tối thiểu không hợp lệ |
| `promotion.maxDiscountOnlyForPercentage` | Max discount only for percentage | Giảm tối đa chỉ áp dụng cho loại phần trăm |
| `promotion.usageLimitMustBePositive` | Usage limit must be at least 1 | Giới hạn sử dụng phải ít nhất là 1 |

## Files to Modify

1. **Types**: Add `OrderDiscountConfig` and `CreateOrderDiscountConfigInput` interfaces
2. **Promotion Form**: Add conditional form section for ORDER_DISCOUNT type
3. **Promotion Detail**: Add display section for order discount config
4. **i18n**: Add Vietnamese/English translation keys
5. **Validation**: Add form validation for order discount fields
