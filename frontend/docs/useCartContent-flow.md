# useCartContent Hook - Mô tả luồng xử lý

## Mục lục

1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Luồng mở giỏ hàng (Desktop)](#2-luồng-mở-giỏ-hàng-desktop)
3. [Luồng chọn/bỏ chọn sản phẩm](#3-luồng-chọnbỏ-chọn-sản-phẩm)
4. [Luồng chọn quà tặng (Gift)](#4-luồng-chọn-quà-tặng-gift)
5. [Luồng xóa quà tặng (Gift)](#5-luồng-xóa-quà-tặng-gift)
6. [Luồng xóa toàn bộ giỏ hàng](#6-luồng-xóa-toàn-bộ-giỏ-hàng)
7. [Cơ chế chống race condition](#7-cơ-chế-chống-race-condition)

---

## 1. Tổng quan kiến trúc

### Component Hierarchy (Desktop)

```
CartPage
└── CartContentDesktop
    ├── useCartContent (hook)           ← Quản lý cart items, checkout session
    │   └── checkoutSession state       ← Session được pass từ parent
    │
    ├── PaymentDetails                  ← Hiển thị tổng tiền, shippingPromotion
    │   └── Dùng checkoutSession từ useCartContent
    │
    └── CartDesktopCheckout             ← Panel nhập thông tin giao hàng
        └── useConfirmOrder (hook)      ← Quản lý shipping address, payment
            └── useConfirmOrderAddress  ← Fetch addresses, auto-fill form
```

### Hai nguồn checkout session

| Hook | Vai trò | Session source |
|------|---------|----------------|
| `useCartContent` | Cart items, vouchers, gifts | Parent state (via `onCheckoutSessionUpdate`) |
| `useConfirmOrder` | Shipping, payment, place order | Internal state + sync từ parent |

**Vấn đề:** Khi `useConfirmOrder` update session (sau khi fetch addresses), nó phải notify parent để `PaymentDetails` hiển thị đúng `shippingPromotion`.

---

## 2. Luồng mở giỏ hàng (Desktop)

**Trigger:** User click "Xem giỏ hàng" từ cart preview popup.

### Timeline chi tiết

```
t=0ms   User click "Xem giỏ hàng"
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  CartContentDesktop renders                                      │
│  ├── useCartContent khởi tạo                                    │
│  └── CartDesktopCheckout renders                                │
│      └── useConfirmOrder khởi tạo                               │
│          └── useConfirmOrderAddress khởi tạo                    │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  EFFECT 0 (useCartContent): Fetch existing session              │
│  ─────────────────────────────────────────────────────────────  │
│  GET /shop/checkout/sessions/{id}                               │
│  → Response có thể có shippingPromotion (nếu đã set trước đó)   │
│  → onCheckoutSessionUpdate(session)                             │
│  → setExistingSessionFetched(true)  ← QUAN TRỌNG: Unblock Effect 2 │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  EFFECT 1 (useCartContent): Load cart                           │
│  ─────────────────────────────────────────────────────────────  │
│  dispatch(loadCartRequest())                                    │
│  → Redux saga gọi GET /cart                                     │
│  → cart.items được populate                                     │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────────────────────────────────┐
│  EFFECT 2 (useCartContent): Auto-select items                   │
│  ─────────────────────────────────────────────────────────────  │
│  ĐIỀU KIỆN: existingSessionFetched === true (đợi Effect 0)      │
│  │                                                              │
│  ├── Lọc non-gift items                                         │
│  ├── setSelectedItems([...])                                    │
│  └── processSelectionChange(initialSelection)                   │
│      │                                                          │
│      ├── POST /shop/checkout/sessions (upsert)                  │
│      │   → items, combos, paymentMethod                         │
│      │   → KHÔNG có shipping address                            │
│      │   → Response có thể KHÔNG có shippingPromotion           │
│      │                                                          │
│      ├── GET /cart/sync                                         │
│      └── GET /promotions/bundle-deal-eligibility                │
└─────────────────────────────────────────────────────────────────┘
        │
        ▼ (Song song với Effect 2)
┌─────────────────────────────────────────────────────────────────┐
│  EFFECT (useConfirmOrderAddress): Fetch addresses               │
│  ─────────────────────────────────────────────────────────────  │
│  GET /addresses                                                 │
│  → Tìm default address                                          │
│  → updateCheckoutSession(formData)                              │
│      │                                                          │
│      ├── POST /shop/checkout/sessions (upsert)                  │
│      │   → customer, shippingAddress                            │
│      │   → Backend tính shipping fee                            │
│      │   → Backend auto-apply shippingPromotion nếu eligible    │
│      │   → Response CÓ shippingPromotion                        │
│      │                                                          │
│      └── setCheckoutSession(session)                            │
│          → Wrapper function gọi onCheckoutSessionUpdate         │
│          → Parent (CartContentDesktop) nhận được session mới    │
│          → PaymentDetails re-render với shippingPromotion       │
└─────────────────────────────────────────────────────────────────┘
```

### Race condition đã fix

**Vấn đề cũ:**
```
Effect 0: GET session → shippingPromotion: có
Effect 2: POST session (không có shipping) → shippingPromotion: null  ← OVERWRITE!
Addresses: POST session (có shipping) → shippingPromotion: có
           nhưng chỉ update internal state, không notify parent
```

**Fix:**
1. Effect 2 đợi Effect 0 hoàn thành (`existingSessionFetched`)
2. `useConfirmOrder.setCheckoutSession` wrapper gọi `onCheckoutSessionUpdate` để notify parent

---

## 3. Luồng chọn/bỏ chọn sản phẩm

### Case 3.1: Chọn/bỏ chọn sản phẩm đơn lẻ

```
User click checkbox sản phẩm A
       ↓
Kiểm tra: Sản phẩm A có thuộc combo không?
       ↓
KHÔNG thuộc combo → Toggle trạng thái của riêng sản phẩm A
       ↓
selectedItems được cập nhật
       ↓
processSelectionChange(newSelectedItems)
       ↓
[Tuần tự]
├── POST /shop/checkout/sessions (upsert)
├── GET /cart/sync
└── GET /promotions/bundle-deal-eligibility
       ↓
UI cập nhật: tổng tiền, ưu đãi mới
```

### Case 3.2: Chọn/bỏ chọn sản phẩm combo

```
User click checkbox sản phẩm A (thuộc Combo X gồm A + B + C)
       ↓
Kiểm tra: Sản phẩm A có thuộc combo không?
       ↓
CÓ thuộc combo → Lấy tất cả sản phẩm cùng Combo X
       ↓
Toggle trạng thái của CẢ 3 sản phẩm A, B, C cùng lúc
       ↓
selectedItems được cập nhật
       ↓
processSelectionChange(...)
```

### Case 3.3: Chọn tất cả / Bỏ chọn tất cả

```
User click "Chọn tất cả"
       ↓
Kiểm tra: Hiện tại đã chọn hết chưa?
       ↓
├── ĐÃ CHỌN HẾT → Bỏ chọn tất cả: selectedItems = []
└── CHƯA CHỌN HẾT → Chọn tất cả sản phẩm (trừ quà tặng)
       ↓
processSelectionChange(...)
```

**Lưu ý:** Quà tặng (gift) KHÔNG được tính vào "chọn tất cả" vì gift luôn tự động được chọn.

---

## 4. Luồng chọn quà tặng (Gift)

**Điều kiện tiên quyết:**
- Tổng giá trị sản phẩm đã chọn >= ngưỡng nhận quà của promotion
- Promotion đang trong thời gian hiệu lực
- User đã authenticated

```
User click "Chọn quà" trên món quà X
       ↓
POST /promotions/add-gift-to-cart
Body: { promotionId, tierId, productId, variantId }
       ↓
Server thêm quà vào cart và trả về cart mới
       ↓
dispatch(setCart(updatedCart))
       ↓
processSelectionChange(selectedItems)
       ↓
UI cập nhật:
- Quà X hiển thị trong giỏ hàng với giá 0đ
- Nút "Chọn quà" đổi thành "Đã chọn"
```

---

## 5. Luồng xóa quà tặng (Gift)

### Case 5.1: User tự xóa quà tặng

```
User click "Xóa" trên quà tặng X
       ↓
DELETE /promotions/remove-gift-from-cart
Body: { productId, variantId }
       ↓
Server xóa quà khỏi cart và trả về cart mới
       ↓
dispatch(setCart(updatedCart))
       ↓
processSelectionChange(selectedItems)
       ↓
UI cập nhật:
- Quà X biến mất khỏi giỏ hàng
- Danh sách ưu đãi hiển thị lại Quà X trong phần "Có thể chọn"
```

### Case 5.2: Quà tặng bị xóa tự động do không còn đủ điều kiện

**Ví dụ:**
- Giỏ hàng: Sản phẩm A (400k), Sản phẩm B (200k) → Tổng 600k
- Đã chọn Quà X (yêu cầu tối thiểu 500k)
- User bỏ chọn Sản phẩm B → Tổng còn 400k < 500k

```
User bỏ chọn Sản phẩm B
       ↓
processSelectionChange(...)
       ↓
GET /cart/sync
       ↓
Server phát hiện: tổng giá trị đã chọn (400k) < ngưỡng quà (500k)
       ↓
Server TỰ ĐỘNG xóa Quà X khỏi cart
       ↓
Trả về cart mới (không còn Quà X)
       ↓
dispatch(setCart(updatedCart))
       ↓
UI cập nhật:
- Quà X biến mất khỏi giỏ hàng
- Phần ưu đãi quà tặng hiển thị: "Mua thêm 100k để nhận quà"
```

---

## 6. Luồng xóa toàn bộ giỏ hàng

```
User click "Xóa tất cả"
       ↓
Hiển thị dialog xác nhận
       ↓
User click "Xác nhận"
       ↓
setIsClearingCart(true) → Hiển thị loading
       ↓
DELETE /cart/clear
       ↓
Server xóa toàn bộ cart và trả về cart rỗng
       ↓
dispatch(setCart(emptyCart))
setSelectedItems([])
setGiftEligibility(null)
storageService.clearCheckoutSession()
onCheckoutSessionUpdate(null)
       ↓
UI cập nhật: Hiển thị "Giỏ hàng trống"
```

---

## 7. Cơ chế chống race condition

### 7.1. Race condition giữa Effect 0 và Effect 2 (useCartContent)

**Vấn đề:**
```
Effect 0: GET /sessions/{id} → session có shippingPromotion
Effect 2: POST /sessions (upsert) → session KHÔNG có shippingPromotion
          (vì Effect 2 chạy song song, có thể finish SAU Effect 0)
          → Overwrite session, mất shippingPromotion!
```

**Giải pháp: `existingSessionFetched` state**

```typescript
// State
const [existingSessionFetched, setExistingSessionFetched] = useState(false);

// Effect 0: Fetch existing session
useEffect(() => {
  const fetchExistingSession = async () => {
    // ... fetch session ...
    setExistingSessionFetched(true);  // ← Mark as done
  };
  fetchExistingSession();
}, [isActive, onCheckoutSessionUpdate]);

// Effect 2: Auto-select items
useEffect(() => {
  if (!existingSessionFetched) return;  // ← Wait for Effect 0
  // ... auto-select and processSelectionChange ...
}, [isActive, cart.items, processSelectionChange, existingSessionFetched]);
```

### 7.2. Race condition giữa useConfirmOrder và parent

**Vấn đề:**
```
useConfirmOrderAddress: GET /addresses → updateCheckoutSession()
                        → POST /sessions (có shipping)
                        → Response có shippingPromotion
                        → setCheckoutSession(session)  ← Chỉ update internal state!
                        → Parent's PaymentDetails vẫn dùng session cũ
```

**Giải pháp: `onCheckoutSessionUpdate` callback**

```typescript
// useConfirmOrder.ts
const setCheckoutSession = useCallback(
  (session: CheckoutSession | null) => {
    setCheckoutSessionState(session);           // Update internal
    onCheckoutSessionUpdate?.(session);         // Notify parent
  },
  [onCheckoutSessionUpdate],
);

// CartDesktopCheckout.tsx
<CartDesktopCheckout
  onCheckoutSessionUpdate={onCheckoutSessionUpdate}  // Pass callback
/>
```

### 7.3. Tránh infinite loop khi sync từ parent

**Vấn đề:**
```
Parent update session → useConfirmOrder sync effect triggers
                      → setCheckoutSession(externalSession)
                      → onCheckoutSessionUpdate(session)
                      → Parent update session → LOOP!
```

**Giải pháp: Dùng raw setter cho sync effect**

```typescript
// Sync external session updates from parent
useEffect(() => {
  if (externalSession && externalSession.id === checkoutSessionId) {
    setCheckoutSessionState(externalSession);  // ← Raw setter, không gọi callback
  }
}, [externalSession, checkoutSessionId]);
```

### 7.4. Debounce cho selection changes

**Mục đích:** Tránh gọi API liên tục khi user thao tác nhanh.

**Cơ chế:** `processSelectionChange` có debounce check với module-level timestamp.

```typescript
const DEBOUNCE_MS = 100;
let lastProcessingTimestamp = 0;

const processSelectionChange = useCallback(async (...) => {
  const now = Date.now();
  if (now - lastProcessingTimestamp < DEBOUNCE_MS || isProcessingRef.current) {
    return;  // Skip if too soon or already processing
  }
  lastProcessingTimestamp = now;
  // ... process ...
}, [...]);
```

---

## Tóm tắt các API được gọi

| Hành động | API | Mô tả |
|-----------|-----|-------|
| Load cart | `GET /cart` | Lấy giỏ hàng |
| Sync cart | `GET /cart/sync` | Đồng bộ cart, server tự xóa gift không hợp lệ |
| Clear cart | `DELETE /cart/clear` | Xóa toàn bộ giỏ hàng |
| Get checkout session | `GET /shop/checkout/sessions/{id}` | Lấy session đã có |
| Upsert checkout session | `POST /shop/checkout/sessions` | Tạo/cập nhật session |
| Check gift eligibility | `GET /promotions/bundle-deal-eligibility` | Kiểm tra ưu đãi quà tặng |
| Add gift | `POST /promotions/add-gift-to-cart` | Thêm quà vào giỏ |
| Remove gift | `DELETE /promotions/remove-gift-from-cart` | Xóa quà khỏi giỏ |
| Get addresses | `GET /addresses` | Lấy danh sách địa chỉ user |

---

## Tóm tắt State & Refs

### useCartContent State

| State | Mục đích |
|-------|----------|
| `selectedItems[]` | Danh sách key của các sản phẩm đang được chọn |
| `isCalculatingCheckout` | Loading state khi đang tính checkout |
| `giftEligibility[]` | Danh sách ưu đãi quà tặng khả dụng |
| `isLoadingGiftEligibility` | Loading state khi đang check gift |
| `isClearDialogOpen` | Trạng thái dialog xác nhận xóa |
| `isClearingCart` | Loading state khi đang xóa cart |
| `existingSessionFetched` | **NEW:** Đánh dấu Effect 0 đã hoàn thành |

### useCartContent Refs

| Ref | Mục đích |
|-----|----------|
| `selectionInitializedRef` | Đánh dấu đã init selection chưa |
| `isProcessingRef` | Đánh dấu đang process selection change |

### useConfirmOrder State

| State | Mục đích |
|-------|----------|
| `checkoutSession` | Internal checkout session state |
| `isLoading` | Loading state |
| `paymentMethod` | Phương thức thanh toán |
| `fieldErrors` | Validation errors cho form |

### useConfirmOrder Props

| Prop | Mục đích |
|------|----------|
| `onCheckoutSessionUpdate` | **NEW:** Callback để notify parent khi session thay đổi |

---

## Diagram: Session State Flow (Desktop)

```
┌─────────────────┐     onCheckoutSessionUpdate      ┌──────────────────┐
│ CartContentDesktop│◄────────────────────────────────│ CartDesktopCheckout│
│                  │                                  │                   │
│  checkoutSession │                                  │  useConfirmOrder  │
│  (from parent)   │                                  │  └─ checkoutSession│
│        │         │     checkoutSession prop         │        (internal) │
│        ▼         │─────────────────────────────────►│                   │
│  useCartContent  │                                  │  useConfirmOrderAddress
│  PaymentDetails  │                                  │  └─ updateCheckoutSession
└─────────────────┘                                  └──────────────────┘

Flow khi addresses được fetch:
1. GET /addresses → tìm default address
2. updateCheckoutSession(formData) → POST /sessions với shipping
3. Backend trả về session có shippingPromotion
4. setCheckoutSession(session)
   ├─ setCheckoutSessionState(session)  ← Update internal
   └─ onCheckoutSessionUpdate(session)  ← Notify parent
5. Parent's PaymentDetails re-render với shippingPromotion
```
