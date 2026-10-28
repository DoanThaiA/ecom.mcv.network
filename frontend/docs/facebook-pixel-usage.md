# Facebook Pixel Usage Guide

## Overview

The Facebook Pixel utility (`lib/utils/fbPixel.ts`) provides TypeScript-safe functions for tracking e-commerce events. The pixel is already loaded in `app/layout.tsx` and automatically tracks `PageView` on all pages.

## Import

```typescript
import {
  trackAddToCart,
  trackPurchase,
  trackInitiateCheckout,
  trackViewContent,
  trackSearch,
  trackAddToWishlist,
  trackCompleteRegistration,
  trackEvent,
  trackCustomEvent,
} from '@/lib/utils/fbPixel';
```

---

## Usage Examples

### 1. Track Add to Cart

**File:** `components/product/ProductCard.tsx` or `components/product/ProductDetail.tsx`

```typescript
import { trackAddToCart } from '@/lib/utils/fbPixel';

const handleAddToCart = (product: Product, quantity: number) => {
  // ... existing add to cart logic ...

  // Track Facebook Pixel event
  trackAddToCart({
    productId: product.sku || product._id,
    productName: product.name,
    value: product.price * quantity,
    currency: 'VND',
    quantity: quantity,
  });
};
```

### 2. Track Purchase (Order Success)

**File:** `components/payment/PaymentSuccessContent.tsx` or order success page

```typescript
import { trackPurchase } from '@/lib/utils/fbPixel';

useEffect(() => {
  if (order && isSuccess) {
    trackPurchase({
      productIds: order.items.map((item) => item.sku || item.productId),
      value: order.totalAmount,
      currency: 'VND',
      numItems: order.items.reduce((sum, item) => sum + item.quantity, 0),
    });
  }
}, [order, isSuccess]);
```

### 3. Track Initiate Checkout

**File:** `components/cart/ConfirmOrderContent.tsx`

```typescript
import { trackInitiateCheckout } from '@/lib/utils/fbPixel';

useEffect(() => {
  // Track when user enters checkout
  if (cartItems.length > 0) {
    trackInitiateCheckout({
      productIds: cartItems.map((item) => item.sku || item.productId),
      value: cartTotal,
      currency: 'VND',
      numItems: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    });
  }
}, []);
```

### 4. Track View Product (Product Detail Page)

**File:** `app/[locale]/products/[id]/page.tsx` or `components/product/ProductDetail.tsx`

```typescript
import { trackViewContent } from '@/lib/utils/fbPixel';

useEffect(() => {
  if (product) {
    trackViewContent({
      productId: product.sku || product._id,
      productName: product.name,
      value: product.price,
      currency: 'VND',
      category: product.category?.name,
    });
  }
}, [product]);
```

### 5. Track Search

**File:** `components/search/SearchBar.tsx` or search page

```typescript
import { trackSearch } from '@/lib/utils/fbPixel';

const handleSearch = (searchTerm: string) => {
  // ... existing search logic ...

  trackSearch(searchTerm);
};
```

### 6. Track Add to Wishlist

**File:** `components/product/WishlistButton.tsx`

```typescript
import { trackAddToWishlist } from '@/lib/utils/fbPixel';

const handleAddToWishlist = (product: Product) => {
  // ... existing wishlist logic ...

  trackAddToWishlist({
    productId: product.sku || product._id,
    productName: product.name,
    value: product.price,
    currency: 'VND',
  });
};
```

### 7. Track User Registration

**File:** `components/auth/RegisterForm.tsx` or registration success handler

```typescript
import { trackCompleteRegistration } from '@/lib/utils/fbPixel';

const onRegisterSuccess = () => {
  trackCompleteRegistration({
    status: true,
  });
};
```

### 8. Generic Event Tracking

For standard events not covered by convenience functions:

```typescript
import { trackEvent } from '@/lib/utils/fbPixel';

// Track payment info added
trackEvent('AddPaymentInfo', {
  content_category: 'credit_card',
  value: 500000,
  currency: 'VND',
});

// Track lead
trackEvent('Lead', {
  content_name: 'Newsletter Signup',
  value: 0,
  currency: 'VND',
});
```

### 9. Custom Event Tracking

For non-standard events specific to your business:

```typescript
import { trackCustomEvent } from '@/lib/utils/fbPixel';

// Track promo code usage
trackCustomEvent('PromoCodeApplied', {
  content_name: 'SALE20',
  value: 100000, // discount amount
  currency: 'VND',
});

// Track product review submitted
trackCustomEvent('ReviewSubmitted', {
  content_ids: ['SKU123'],
  content_name: 'Product Review',
});

// Track chat initiated
trackCustomEvent('ChatInitiated', {
  content_category: 'customer_support',
});
```

---

## Best Practices

### 1. Track Events in useEffect

For page-level events (ViewContent, InitiateCheckout), use `useEffect` with proper dependencies:

```typescript
useEffect(() => {
  if (data) {
    trackViewContent({ ... });
  }
}, [data]); // Only track when data is available
```

### 2. Avoid Duplicate Tracking

Use flags or refs to prevent duplicate event tracking:

```typescript
const hasTracked = useRef(false);

useEffect(() => {
  if (isSuccess && !hasTracked.current) {
    hasTracked.current = true;
    trackPurchase({ ... });
  }
}, [isSuccess]);
```

### 3. Handle SSR

All functions check for `typeof window !== 'undefined'`, so they're safe to call during SSR. No additional guards needed.

### 4. Use Correct Currency

Always use `'VND'` for Vietnamese Dong. The utility defaults to VND if not specified.

---

## Facebook Events Manager

To verify events are being tracked:

1. Go to [Facebook Events Manager](https://business.facebook.com/events_manager)
2. Select your Pixel (ID: `855304492221650`)
3. Click "Test Events" tab
4. Open your website in a new tab
5. Perform actions (add to cart, checkout, etc.)
6. Events should appear in real-time in Events Manager

---

## Standard Events Reference

| Event | Description | When to Use |
|-------|-------------|-------------|
| `PageView` | Page load | Automatic (in layout.tsx) |
| `ViewContent` | Product page viewed | Product detail page |
| `AddToCart` | Item added to cart | Add to cart button click |
| `InitiateCheckout` | Checkout started | Enter checkout page |
| `AddPaymentInfo` | Payment info added | Payment method selected |
| `Purchase` | Order completed | Order success page |
| `Search` | Search performed | Search submitted |
| `AddToWishlist` | Item added to wishlist | Wishlist button click |
| `CompleteRegistration` | User registered | Registration success |

---

## Files

- **Utility:** `lib/utils/fbPixel.ts`
- **Pixel Script:** `app/layout.tsx`
- **Pixel ID:** `855304492221650`
