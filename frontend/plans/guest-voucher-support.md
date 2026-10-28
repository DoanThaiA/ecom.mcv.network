# Cho khách chưa đăng nhập (guest) dùng voucher — thiết kế cuối

## Mục tiêu
Guest áp voucher **chỉ qua ô nhập mã**, và **đủ điều kiện đơn hàng là áp được**. Sheet "Chọn ưu đãi" (CTKM) **ẩn hoàn toàn** với guest, nhưng guest **vẫn xem + xóa được** mã đã áp.

> **Chốt nghiệp vụ (2026-07-20):** shop yêu cầu *"cứ đủ điều kiện đơn hàng là áp được voucher thôi"* — mã có tick "Mã dùng 1 lần cho 1 user" **cũng cho guest áp**. Bản thiết kế đầu tiên chặn guest ở loại mã này đã bị thay thế.

## Quy tắc
| Loại | Guest | Đã đăng nhập |
|---|---|---|
| Mã CMS (ORDER_DISCOUNT) **không** tick 1-lần/khách | ✅ Áp được | ✅ Áp được |
| Mã CMS **có** tick 1-lần/khách | ✅ **Áp được** (không tra được lượt dùng → bỏ qua check) | ⛔ Lần 2 bị chặn |
| Mã đã hết `totalUsageLimit` (tổng lượt) | ⛔ "Mã đã hết lượt sử dụng" | ⛔ như guest |
| Voucher CDP | ⛔ "Vui lòng đăng nhập…" (cần `cdpCustomerId`) | ✅ |
| Product discount / flash sale / free ship (auto-apply) | ✅ Không đụng — item-level, vốn đã đúng | ✅ |

**Đánh đổi shop đã chấp nhận:** 1 người có thể dùng lại mã "1 lần/khách" nhiều lần qua guest checkout (hoặc bằng cách đăng xuất). `totalUsageLimit` là hàng rào ngân sách còn lại → nên đặt giới hạn tổng cho mọi mã.

## Backend — `src/shop/promotion/shop-promotion.service.ts`
1. `applyVoucher` (~L385) và `applyProductDiscount` (~L1230): giữ `if (config.singleUsePerCustomer && userId)` — không có `userId` thì bỏ qua bước tra `existsByPromotionIdAndUserId`, không reject.
2. `checkOrderDiscountEligibility` (~L1349): **KHÔNG đổi** — list order-discount chỉ sheet đọc, mà sheet đã ẩn với guest.
3. Nhánh CDP (~L427): đổi `UNAUTHORIZED` → `UNPROCESSABLE_ENTITY`. **Bắt buộc**: guest không có refresh token, nên 401 rơi vào interceptor ở `lib/axios.ts:112` → `clearAuth()` + bắn `USER_LOGOUT`, và error bị reject là `refreshError` (không có `.response`) nên toast rơi về message chung. 422 đi thẳng tới người dùng.

> `handlers/order-discount.handler.ts:186` (validate lúc đặt hàng) vốn đã có guard `options?.userId` → guest đi lọt sẵn, không lệch giữa lúc áp mã và lúc đặt đơn. Worker `processIncrementPromotionUsage` tăng `currentUsageCount` không phụ thuộc `userId` nên `totalUsageLimit` vẫn trừ đúng cho đơn guest.

## Frontend — `components/cart/VoucherSection.tsx`
1. Ô nhập (L238) + nút (L248): bỏ `!isAuthenticated` khỏi `disabled`.
2. Prompt (L262-275): đổi key `forContinueApplyVoucher` → `toUnlockMoreOffers` ("tài khoản để mở khóa thêm ưu đãi"). Giữ dialog đăng nhập.
3. Khối "Ưu đãi áp dụng" (L278): điều kiện `checkoutSession?.id && (isAuthenticated || hasAppliedDiscounts)`.
   - Guest + chưa có mã → ẩn. Guest + đã có mã → hiện nhánh badge (có nút X xóa), KHÔNG vào nhánh "Chọn ưu đãi".
4. Header Flex `onClick` (L283): `isAuthenticated ? handleOpenPromotionSheet : undefined`. Cursor badge chỉ pointer khi `isAuthenticated`.
5. `handleOpenPromotionSheet` (L122): thêm `if (!isAuthenticated) return` (phòng thủ).
6. Nút X xóa + `removeVoucher`: giữ nguyên (guest dùng được — ShopAuthGuard cho phép).

## i18n — `messages/vi.json` + `messages/en.json`
- Đổi tên `forContinueApplyVoucher` → `toUnlockMoreOffers`:
  - vi: "tài khoản để mở khóa thêm ưu đãi"
  - en: "account to unlock more offers"

## Test — `test/shop/promotion/shop-promotion.service.spec.ts`
- `applyVoucher`: guest + mã single-use → **áp được**, không gọi `existsByPromotionIdAndUserId`.
- `applyVoucher`: user đăng nhập đã dùng mã single-use → vẫn chặn (`voucherMaxUsagePerCustomerExceeded`).
- `applyVoucher`: guest + mã hết `totalUsageLimit` → vẫn chặn (`voucherUsageLimitExceeded`).
- `applyVoucher`: guest + mã công khai → áp được.
- `applyProductDiscount`: guest + order-discount single-use → áp được.
- Mock thêm: `checkoutService.applyOrderDiscountToSession`, `promotionUsageRecordRepository.existsByPromotionIdAndUserId`.

## Version
- `backend/version.json` → 1.0.544 + entry `backend/versions.MD`; `frontend/version.json` → 1.8.1 + entry `frontend/VERSION.md`.

## Gate
- BE: `npx eslint` trên file thay đổi, `npm run build`, chạy spec của mình. (Repo có sẵn 8 test fail ở `addGiftToCart - BUY_X_GET_Y` + lint errors ở file khác — không phải regression.)
- FE: `npx eslint components/cart/VoucherSection.tsx`, `npm run build`.
