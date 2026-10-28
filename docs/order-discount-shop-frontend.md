# Order Discount Promotion - Shop Frontend Integration Guide

## Overview

This document describes how to integrate the new **Order Discount** promotion type into the Shop frontend (customer-facing). This promotion type provides two modes:

1. **Auto-Apply**: Automatically applied when cart meets conditions
2. **Promo Code**: Customer enters a code to apply the discount

## How It Works

### Auto-Apply Promotions

- Backend automatically checks eligible auto-apply promotions when cart is updated
- If cart subtotal meets `minimumOrderValue`, discount is applied automatically
- Displayed as an applied voucher in the checkout session
- No customer action required

### Promo Code Promotions

- Customer enters promo code in the voucher/coupon input field
- Backend validates the code against CMS ORDER_DISCOUNT promotions
- If valid and eligible, discount is applied to the session
- Same flow as existing CDP vouchers

## API Integration

### 1. Apply Promo Code

Use the existing voucher apply endpoint:

```
POST /shop/voucher/apply
```

Request body:
```json
{
  "sessionId": "checkout-session-id",
  "code": "SALE50K"
}
```

The backend will:
1. Check if code matches a CMS ORDER_DISCOUNT promotion
2. Validate eligibility (min order, usage limits, exclusivity)
3. Apply to session if valid
4. Return updated session with applied voucher

### 2. Checkout Session Response

The checkout session will include applied order discounts in the `appliedVouchers` array:

```typescript
interface CheckoutSession {
  // ... other fields
  appliedVouchers: AppliedVoucher[];
  voucherDiscount: number; // Total discount from all vouchers
}

interface AppliedVoucher {
  code: string;              // Promo code or "AUTO_{promotionId}"
  name: string;              // Promotion name
  source: 'CDP' | 'CMS';     // Source of the voucher
  discountType: number;      // 0 = fixed, 1 = percentage
  discountValue: number;     // Original discount value
  discountAmount: number;    // Calculated discount amount
  minimumOrderValue: number;
  maxDiscountValue?: number;
  notApplicableWithOtherPromotions: boolean;
  promotionId?: string;      // CMS promotion ID (for tracking)
}
```

### 3. Auto-Apply Detection

Auto-apply promotions are automatically included when:
- Cart subtotal >= `minimumOrderValue`
- No exclusive voucher is already applied
- User hasn't exceeded single-use limit (if enabled)
- Total usage limit not reached

The frontend doesn't need to explicitly request auto-apply promotions - they appear in `appliedVouchers` automatically.

## UI Implementation

### 1. Voucher Input Section

The existing voucher/coupon input works for both CDP vouchers and CMS promo codes:

```tsx
// No changes needed - existing flow handles CMS promo codes
<VoucherInput
  onApply={(code) => applyVoucher(sessionId, code)}
  placeholder={t('checkout.enterPromoCode')}
/>
```

### 2. Applied Vouchers Display

Update the applied vouchers display to handle both sources:

```tsx
interface AppliedVoucherItemProps {
  voucher: AppliedVoucher;
  onRemove?: () => void;
}

function AppliedVoucherItem({ voucher, onRemove }: AppliedVoucherItemProps) {
  const isAutoApply = voucher.code.startsWith('AUTO_');

  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="font-medium">{voucher.name}</span>
        {!isAutoApply && (
          <span className="text-gray-500 text-sm ml-2">({voucher.code})</span>
        )}
        {isAutoApply && (
          <span className="text-green-600 text-sm ml-2">
            {t('checkout.autoApplied')}
          </span>
        )}
      </div>
      <div className="flex items-center gap-2">
        <span className="text-red-500">
          -{formatCurrency(voucher.discountAmount)}
        </span>
        {/* Only show remove for promo codes, not auto-apply */}
        {!isAutoApply && onRemove && (
          <button onClick={onRemove} className="text-gray-400">
            <XIcon size={16} />
          </button>
        )}
      </div>
    </div>
  );
}
```

### 3. Voucher Validation Messages

Handle error messages from the backend:

| Error Key | English | Vietnamese | When |
|-----------|---------|------------|------|
| `promotion.minimumOrderNotMet` | Minimum order of {minimum} VND not met | Chưa đạt giá trị đơn tối thiểu {minimum} VND | Cart total < minimumOrderValue |
| `promotion.notApplicableWithOtherPromotions` | Cannot combine with other promotions | Không thể dùng chung với khuyến mãi khác | Exclusive voucher conflict |
| `promotion.usageLimitReached` | Promotion usage limit reached | Khuyến mãi đã hết lượt sử dụng | Total usage exhausted |
| `promotion.alreadyUsedByCustomer` | You have already used this promotion | Bạn đã sử dụng khuyến mãi này | Single-use per customer |
| `promotion.promoCodeInvalid` | Invalid promo code | Mã khuyến mãi không hợp lệ | Code not found |
| `promotion.promoCodeExpired` | Promo code has expired | Mã khuyến mãi đã hết hạn | Promotion ended |

### 4. Order Summary Display

Show the discount breakdown in the order summary:

```tsx
function OrderSummary({ session }: { session: CheckoutSession }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span>{t('checkout.subtotal')}</span>
        <span>{formatCurrency(session.subtotal)}</span>
      </div>

      {/* Show each applied voucher */}
      {session.appliedVouchers.map((voucher, idx) => (
        <div key={idx} className="flex justify-between text-green-600">
          <span>
            {voucher.name}
            {voucher.code.startsWith('AUTO_')
              ? ` (${t('checkout.autoApplied')})`
              : ` (${voucher.code})`
            }
          </span>
          <span>-{formatCurrency(voucher.discountAmount)}</span>
        </div>
      ))}

      {/* Shipping, etc. */}

      <div className="flex justify-between font-bold border-t pt-2">
        <span>{t('checkout.total')}</span>
        <span>{formatCurrency(session.total)}</span>
      </div>
    </div>
  );
}
```

### 5. Promo Code Suggestions (Optional)

For logged-in users, you could show available promo codes:

```
GET /shop/promotions/order-discounts/available
```

Response:
```json
{
  "data": [
    {
      "promotionId": "abc123",
      "name": "Giảm 50k cho đơn từ 200k",
      "promoCode": "SALE50K",
      "discountType": "fixed",
      "discountValue": 50000,
      "minimumOrderValue": 200000,
      "isEligible": true,
      "reason": null
    },
    {
      "promotionId": "def456",
      "name": "Giảm 10% tối đa 100k",
      "promoCode": "SAVE10",
      "discountType": "percentage",
      "discountValue": 10,
      "maxDiscountValue": 100000,
      "minimumOrderValue": 500000,
      "isEligible": false,
      "reason": "Chưa đạt giá trị đơn tối thiểu 500,000 VND"
    }
  ]
}
```

**Note**: This endpoint is optional and not yet implemented. The core flow works without it.

## i18n Keys

Add these translation keys:

```json
{
  "checkout.enterPromoCode": "Nhập mã khuyến mãi",
  "checkout.applyCode": "Áp dụng",
  "checkout.autoApplied": "Tự động áp dụng",
  "checkout.promoCodeApplied": "Đã áp dụng mã khuyến mãi",
  "checkout.removeVoucher": "Xóa",
  "checkout.voucherDiscount": "Giảm giá voucher",
  "checkout.minimumOrderRequired": "Đơn hàng tối thiểu {amount}",
  "checkout.cannotCombine": "Không thể dùng chung với khuyến mãi khác"
}
```

## Edge Cases

### 1. Exclusive Voucher Conflict

When user tries to apply a code that has `notApplicableWithOtherPromotions: true`:
- If other vouchers already applied → Show error, don't apply
- If this voucher applied first → Block adding other vouchers

### 2. Auto-Apply Removed When Cart Changes

- If cart subtotal drops below `minimumOrderValue`, auto-apply voucher is removed
- Frontend should re-fetch session after cart updates

### 3. User Not Logged In

- `singleUsePerCustomer` cannot be enforced for guests
- Backend may choose to allow or block based on business rules
- Promo codes may require login (backend decides)

### 4. Usage Limit Reached During Checkout

- If promotion reaches `totalUsageLimit` between cart and payment:
- Backend will reject at order placement
- Show error and suggest removing the voucher

## Files to Modify

1. **Checkout Session Types**: Add `promotionId` and `source` fields to voucher interface
2. **Applied Vouchers Component**: Handle auto-apply display and CMS source
3. **Voucher Input Component**: No changes needed (existing flow works)
4. **Order Summary**: Show discount breakdown with voucher names
5. **i18n**: Add Vietnamese/English translation keys
6. **Error Handling**: Map backend error codes to user-friendly messages

## Testing Checklist

- [ ] Apply valid promo code → Discount applied
- [ ] Apply invalid promo code → Error message shown
- [ ] Apply expired promo code → Error message shown
- [ ] Apply code below minimum order → Error with minimum shown
- [ ] Apply exclusive code with existing voucher → Conflict error
- [ ] Apply code already used (single-use) → Already used error
- [ ] Cart meets auto-apply conditions → Discount auto-applied
- [ ] Cart drops below minimum → Auto-apply removed
- [ ] Remove promo code → Discount removed
- [ ] Cannot remove auto-apply voucher → No remove button shown
