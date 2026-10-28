
## 1.7.53
- **Feature**: Mobile SearchOverlay full-screen dialog with trending keywords and recently viewed
- Mobile search now opens as full-screen overlay with back button instead of header-attached panel
- Added "Trending keywords today" section - extracted from personalized recommendations API
- Added "Recently viewed" section - displays products from personalized recommendations API
- Uses single API call `/shop/recommendations/personalized` for both sections
- Clicking a trending keyword performs search with that keyword
- Files: `components/search/SearchOverlay.tsx`, `lib/repositories/product.repository.ts`, `messages/en.json`, `messages/vi.json`

## 1.7.52
- **Fix**: Remove shipping promotion when cart quantity changes
- Shipping promotions are tier-based (by order total), so they need to be re-applied when quantity changes
- Auto-removes shipping promotion and shows toast notification asking user to re-apply
- Files: `components/cart/hooks/useCartContent.ts`, `messages/vi.json`, `messages/en.json`

## 1.7.51
- **Feature**: Flash Sale - Limit products to max 50 on homepage
- Only show "View All" button when total > 50 products
- **Feature**: Order Detail - Display shipping discount when freeship promotion applied
- Shows shipping promotion name (or fallback to "Shipping fee discount") with discount amount
- Uses `shippingDiscount` and `shippingPromotionName` from API response
- Files: `app/[locale]/HomeContent.tsx`, `components/account/OrderDetailSection.tsx`

## 1.7.50
- **Feature**: Display Free Ship badge in "Ưu đãi áp dụng" section
- When shipping promotion type is `freeship`, show `free-ship.svg` badge instead of discount amount
- Read shipping promotion from `checkoutSession.shippingPromotion` field (primary source)
- Remove X button from shipping promotions in both VoucherSection and PaymentDetails
- Falls back to regular discount badge for non-freeship shipping promotions
- Files: `components/cart/VoucherSection.tsx`, `components/cart/PaymentDetails.tsx`, `components/cart/CartContent.tsx`, `components/cart/CartContentDesktop.tsx`, `components/cart/ConfirmOrderContent.tsx`

## 1.7.49
- **Feature**: Display Free Ship badge in "Ưu đãi áp dụng" section
- When shipping promotion results in free shipping (shippingDiscount >= shippingFee), show `free-ship.svg` badge instead of discount amount
- Condition: shipping promotion exists AND discount covers or exceeds shipping fee AND shipping fee > 0
- Remove button positioned at top-right corner of badge with white background
- Falls back to regular discount badge when shipping promotion doesn't result in free shipping
- Files: `components/cart/VoucherSection.tsx`

## 1.7.48
- **Refactor**: Remove redundant shipping promotion types
- Deleted `types/shippingPromotion.ts` - duplicate types that existed in gen types
- Updated `promotion.repository.ts` to use `ShippingPromotion` from gen types instead of custom `ShippingPromotionResponse`
- Simplified `VoucherManagementContent.tsx`:
  - Removed `processShippingPromotions()` function (61 lines)
  - Removed `ProcessedShippingPromotion` type import
  - Added inline eligibility calculation using `ShippingPromotionType` enum
  - Uses gen types directly for cleaner, maintainable code
  - Added `discountAmount` from `appliedPromotions` when shipping promotion is applied
- **Fix**: Fixed shipping discount showing 0 instead of actual discount amount
- PaymentDetails now uses `shippingPromotion.discountAmount` instead of `shippingDiscount`
- Only shows shipping discount line when `discountAmount > 0`
- Files: `types/shippingPromotion.ts` (deleted), `lib/repositories/promotion.repository.ts`, `components/cart/VoucherManagementContent.tsx`, `components/cart/PaymentDetails.tsx`

## 1.7.47
- **Fix**: Fix "delete and re-apply" shipping promotion bug
- When user removes a shipping promotion and reopens the voucher dialog, selectedIds now correctly syncs with the updated appliedPromotions
- Previously, the ref prevented re-initialization causing stale selection state
- Added tracking of previous appliedPromotions key to detect external changes
- **Fix**: Fix PopupAdsDialog import path for PopupAds type
- Changed import from non-existent `@/types/gen/shared/shared/popup-ads/popup-ads` to correct path `@/types/gen/shop/shop/popup-ads/popup-ads`
- Files: `components/cart/VoucherManagementContent.tsx`, `components/popup-ads/PopupAdsDialog.tsx`, `lib/repositories/shop.repository.ts`

## 1.7.46
- **Fix**: Fix shipping promotion API not being called when selecting "Miễn phí vận chuyển"
- When user selects a shipping promotion in VoucherManagementContent and clicks confirm, the `handleConfirm()` function now correctly finds the promotion in `shippingPromotionItems` (was only searching in `allPromotions`, causing shipping promotions to be skipped)
- API `POST /shop/checkout/sessions/{id}/apply-shipping-promotion` is now called correctly
- Files: `components/cart/VoucherManagementContent.tsx`

## 1.7.45
- **Feature**: Separate shipping promotions section in voucher dialog
- Display shipping promotions in its own section "Ưu đãi vận chuyển" instead of mixing with regular promotions
- Add shipping discount display line in "Chi tiết thanh toán" showing how much shipping fee is reduced
- Add remove button (X) for shipping discount in payment details section
- Fix API type mismatch: handle "freeship" type from API (was "freeshipping")
- Use `checkoutSession.shippingPromotion` field to track applied shipping promotion
- Files: `components/cart/VoucherManagementContent.tsx`, `components/cart/PaymentDetails.tsx`, `components/cart/CartContent.tsx`, `components/cart/CartContentDesktop.tsx`, `components/cart/ConfirmOrderContent.tsx`, `types/shippingPromotion.ts`

## 1.7.44
- **Feature**: Add shipping promotions to cart page
- Fetch and display shipping promotions in VoucherManagementContent
- Support apply/remove shipping promotions
- Display applied shipping promotions in VoucherSection
- Files: `lib/repositories/promotion.repository.ts`, `components/cart/VoucherManagementContent.tsx`, `components/cart/VoucherSection.tsx`, `types/shippingPromotion.ts`
## 1.7.47
- **Fix**: auth for promotion

## 1.7.44
- **Fix**: products description (TODO revert) 

## 1.7.43
- **Fix**: toast error message for add gift

## 1.7.42
- **Fix**: Fix HeroSlider runtime TypeError when resizing browser
- Added `emblaApi.reInit()` when visibleSlides changes to sync autoplay plugin state
- Prevents "Cannot read properties of undefined (reading '0')" error on breakpoint change
- Files: `components/hero/HeroSlider.tsx`

## 1.7.41
- Feat: add UI for article display

## 1.7.39
- Feat: add popup ads management

## 1.7.37 (2026-02-11)
- Fix infinity loop when not memorized colors name.

## 1.7.36 (2026-02-11)
- **Fix**: Prevent iOS Safari auto-zoom on input focus
- Changed input font-size from 0.875rem (14px) to 1rem (16px)
- iOS Safari auto-zooms when input font-size < 16px
- Affects all forms using LabeledTextField (SignIn, SignUp, ForgotPassword, etc.)
- Files: `components/common/LabeledTextField.tsx`

## 1.7.33 (2026-02-06)
- **Feature**: Optimize product image loading with preloading and lazy loading for instant color switching
- Background preload variant images on idle for all in-stock colors
- Hover preload for immediate color switching
- Convert ProductImageSlider to Next.js Image component with priority and lazy loading
- Files: `lib/utils/imagePreload.ts`, `lib/hooks/usePreloadVariantImages.ts`, `components/product/ProductDetailClient.tsx`, `components/product/ProductImageSlider.tsx`

## 1.7.32 (2026-02-05)
- fix selectec color

## 1.7.31 (2026-02-05)
- Flash Sale: show "Xem tất cả" link always visible below product grid (no longer only on last carousel slide)

## 1.7.30 (2026-02-05)
- Home: show "Xem tất cả" at end of product row (kế sản phẩm cuối) in topic sections

## 1.7.29 (2026-02-04)
- **Fix**: Fix sort size by pattern priority.
- file: `components/product/ProductDetailClient.tsx`.

## 1.7.28 (2026-02-04)
- add flashsale page

## 1.7.27 (2026-02-04)
- fix selection size

## 1.7.26 (2026-02-04)
- **Fix**: Reset scroll position to top when opening home page
- Created HomePageClient wrapper component to handle scroll reset
- Prevents browser from restoring cached scroll position on home page
- Works for all navigation types (back button, direct link, menu clicks)
- Keeps HomeContent as server component for optimal performance
- Files: `app/[locale]/HomePageClient.tsx`, `app/[locale]/page.tsx`
## 1.7.25 (2026-02-04)
- **Feature**: Integrate Sentry error monitoring for internal deployment
- Added Sentry Next.js SDK (v10.38.0) with client, server, and edge runtime configs
- Client config filters common browser errors (ChunkLoadError, ResizeObserver, etc.)
- Performance tracing disabled to minimize overhead
- Instrumentation hooks capture request errors globally
- CI/CD pipeline injects Sentry credentials from GitHub secrets during build
- Files: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`, `instrumentation-client.ts`, `next.config.js`, `.env.example`, `package.json`
- fix minor

## 1.7.23 (2026-02-04)
- **Fix**: Enable add to cart for products with color variants but no size variants
- Simplified cart icon visibility condition to cover color-only products
- Added handler to add color-only products to cart directly
- Auto-selects first color if none selected when adding color-only products to cart
- Finds variant using productCode-color pattern for color-only variants
- Files: `components/product/ProductCard.tsx`

## 1.7.22 (2026-02-04)
- **Fix**: Center text in BEST_SELLER and CLEARANCE_SALE product badges
- Added vertical padding (py-1) to both text badges
- Increased horizontal padding from px-1 to px-2
- Increased min-height from 1rem to 1.5rem for better vertical centering
- Added min-height to CLEARANCE_SALE badge for consi
## 1.7.21 (2026-02-04)

## 1.7.20 (2026-02-04)
- **Fix**: Skip clearing checkout session for social OAuth login
- Backend now handles session ownership transfer for social authentication
- Added `skipClearSession` parameter to `processAuthSuccess` function
- Social login (Facebook/Google/Zalo) now preserves guest checkout session
- Other login methods (email/phone/OTP) maintain existing clear behavior
- Files: `lib/store/sagas/authSaga.ts`

## 1.7.19 (2026-02-04)
- **Refactor**: Renamed URL parameter from `sessionId` to `checkoutSessionId` in cart/confirm page flow
- Updated searchParams interface in cart/confirm page
- Updated router.push calls in CartContent and ProductDetailClient
- Ensures URL parameter name matches internal prop naming convention
- Files: `app/[locale]/cart/confirm/page.tsx`, `components/cart/CartContent.tsx`, `components/product/ProductDetailClient.tsx`

## 1.7.18 (2026-02-03)
- **Fix**: Fixed localStorage not being updated with new checkout session ID after OAuth redirect
- Added explicit localStorage update in `createGuestCheckoutSession` after creating new session
- Now calls `storageService.setCheckoutSession()` immediately after session creation
- Ensures both URL parameter and localStorage have matching new sessionId
- Prevents components from using stale cached sessionId after OAuth login
- Fixes cart appearing empty when "go back home" button clicked after OAuth login
- Files: `lib/store/sagas/authSaga.ts`

## 1.7.17 (2026-02-03)
- **Fix**: Fixed critical bug in OAuth callback session creation (v1.7.16 regression)
- Removed redundant `createGuestCheckoutSession` call in `oauthCallbackSaga` that was passing wrong parameter type (full URL instead of sessionId)
- Removed redundant `clearCheckoutSession` call that was clearing the newly created session
- Session is now created only once (before OAuth redirect), not twice (before and after)
- Fixes "go back home" button using old checkout session ID after OAuth login
- Fixes cart items being lost after OAuth login from cart/confirm page
- Files: `lib/store/sagas/authSaga.ts`

## 1.7.16 (2026-02-03)
- **Feature**: Proactive checkout session creation before OAuth redirect
- When users log in via OAuth from cart/confirm page, frontend now creates a new guest session BEFORE redirecting
- Replaces sessionId in returnUrl with new session ID to prevent cart loss after authentication
- Added `createGuestCheckoutSession` helper function in auth saga
- Modified `oauthRedirectSaga` to detect session in URL, create new session, and replace ID
- Prevents 403 errors and cart item loss when logging in during checkout
- Backwards compatible - existing migration logic serves as fallback
- Files: `lib/store/sagas/authSaga.ts`
## 1.7.15 (2026-02-03)
- **Fix**: Preserve checkout session when users log in via OAuth from cart confirm page
- Added proactive session migration in auth saga to transfer guest session to authenticated user
- Fetches guest session data before clearing, creates new authenticated session with same items
- Updates browser URL with new sessionId automatically after login
- Prevents "session not found" errors and cart loss after OAuth login from checkout flow
- Files: `lib/store/sagas/authSaga.ts`

## 1.7.14 (2026-02-03)
- **Fix**: Added 500ms debouncing to cart quantity changes to prevent incorrect totals
- When users rapidly click Plus/Minus buttons, changes are now batched into single API call
- Optimistic UI updates show quantity changes immediately while debouncing API calls
- Reduced API calls by ~80% and eliminated race conditions causing incorrect checkout totals
- Files: `components/cart/CartItem.tsx`, `components/cart/hooks/useCartContent.ts`, `components/cart/CartContent.tsx`, `components/cart/CartContentDesktop.tsx`

## 1.7.12 (2026-02-03)
- Bump version

## 1.7.10 (2026-02-03)
- fix html tag, `<br/>` tag

## 1.7.9 (2026-02-03)
- **Fix**: Fixed Google Analytics not tracking due to script loading race condition
- Changed gtag.js library strategy from `lazyOnload` to `afterInteractive`
- Both GA scripts now use same loading strategy, ensuring library loads before config runs
- Files: `app/layout.tsx`

## 1.7.8 (2026-02-03)
- **Fix**: Fixed Facebook/social media link previews showing raw HTML in product descriptions
- Added `stripHtmlTags` utility function to remove HTML markup from meta descriptions
- Updated all metadata generation functions (product, category, topic, news) to strip HTML
- Meta descriptions now display clean text (max 160 chars) instead of raw HTML tags
- Files: `lib/utils/seo/metadata-helpers.ts`

## 1.7.7 (2026-02-02)
- fix size badge
## 1.7.6 (2026-02-02)
- 
## 1.7.5 (2026-02-02)

## 1.7.2 (2026-02-02)
- Bump version for internal testing

## 1.7.1 (2026-02-02)
- fix video background flash sale.
