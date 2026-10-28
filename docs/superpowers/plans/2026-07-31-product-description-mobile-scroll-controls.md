# Product Description Mobile Scroll Controls Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Thêm nút mũi tên nổi để cuộn ngang Vùng 3 theo từng đoạn trên mobile mà không ảnh hưởng thao tác vuốt, document hoặc desktop.

**Architecture:** `ProductDescriptionMediaImage` sở hữu scroll container, theo dõi khả năng cuộn trái/phải từ `scrollLeft`, `clientWidth` và `scrollWidth`, rồi render control mobile ngay trong một wrapper tương đối. Mỗi nút gọi `scrollBy` trên chính container với quãng đường bằng 75% chiều rộng nhìn thấy.

**Tech Stack:** React, TypeScript, Radix UI, Radix Icons, Tailwind CSS, Vitest, Testing Library.

## Global Constraints

- Chỉ Vùng 3 có control; Vùng 1 không đổi.
- Control chỉ hiển thị dưới breakpoint `md`.
- Không thêm dependency hoặc slider mới.
- Cuộn mượt 75% chiều rộng rail; vuốt tay tiếp tục hoạt động.
- Nút trái/phải chỉ hiển thị khi còn nội dung theo hướng tương ứng.

---

### Task 1: Điều khiển cuộn ngang Vùng 3

**Files:**
- Modify: `frontend/components/product/product-description/ProductDescriptionMediaImage.tsx`
- Modify: `frontend/test/components/product/ProductDescriptionMediaImage.test.tsx`
- Modify: `frontend/VERSION.md`

**Interfaces:**
- Consumes: prop hiện có `mobileHorizontalScroll?: boolean`.
- Consumes: hai key i18n hiện có `productDetail.previousImage` và `productDetail.nextImage`.
- Produces: hai nút có accessible name theo locale hiện tại; không thay đổi public props.

- [x] **Step 1: Viết test fail cho trạng thái và thao tác cuộn**

Trong test, gán `clientWidth = 300`, `scrollWidth = 900`, `scrollLeft = 0` cho rail; phát sự kiện `load` của ảnh và xác nhận chỉ có nút phải. Bấm nút phải và xác nhận:

```ts
expect(scrollBy).toHaveBeenCalledWith({ left: 225, behavior: 'smooth' });
```

Sau đó đặt `scrollLeft = 300`, phát `scroll`, xác nhận có cả hai nút; đặt `scrollLeft = 600`, phát `scroll`, xác nhận chỉ còn nút trái. Test Vùng 1 xác nhận không có nút `Ảnh trước` hoặc `Ảnh tiếp theo`.

- [x] **Step 2: Chạy test để xác nhận RED**

Run:

```bash
npm test -- --run test/components/product/ProductDescriptionMediaImage.test.tsx
```

Expected: FAIL vì component chưa render nút `Cuộn ảnh sang phải`.

- [x] **Step 3: Implement trạng thái scroll tối thiểu**

Thêm `'use client'`, `useCallback`, `useEffect`, `useRef`, `useState`, `useTranslations('productDetail')`; wrapper `relative`; Radix `Button`; `ArrowLeftIcon` và `ArrowRightIcon`. Dùng lại key `previousImage`/`nextImage`, không tạo hoặc hard-code chuỗi mới. Hàm cập nhật dùng ngưỡng một pixel:

```ts
const canScrollLeft = scrollLeft > 1;
const canScrollRight = scrollLeft + clientWidth < scrollWidth - 1;
```

Hàm điều hướng gọi:

```ts
rail.scrollBy({
  left: direction * rail.clientWidth * 0.75,
  behavior: 'smooth',
});
```

Lắng nghe `scroll` trên rail và `resize` trên window; cập nhật lại sau `img.onLoad`. Render control `absolute bottom-3 left-3 hidden gap-2 md:hidden` chỉ khi ít nhất một hướng còn cuộn được.

- [x] **Step 4: Chạy targeted test để xác nhận GREEN**

Run:

```bash
npm test -- --run test/components/product/ProductDescriptionMediaImage.test.tsx
```

Expected: 4 tests pass.

- [x] **Step 5: Cập nhật changelog trong cùng version 1.9.1**

Sửa mục `1.9.1` để ghi rõ Vùng 3 hỗ trợ nút điều hướng theo đoạn trên mobile; không tăng version lần nữa vì thay đổi chưa merge và vẫn thuộc cùng release `1.9.1`.

- [x] **Step 6: Chạy verification đầy đủ**

Run:

```bash
npm test -- --run
npm run lint -- --quiet
npm run build
git diff --check
```

Expected: toàn bộ test, lint và build pass; không có whitespace error.

- [ ] **Step 7: Commit và cập nhật hai PR**

Commit source/test/changelog/plan, push nhánh `fix/product-description-media-mobile-scroll`, sau đó cherry-pick commit tương đương sang `fix/product-description-media-mobile-scroll-internal`, chạy lại verification và push. Hai PR giữ nguyên base lần lượt là `main` và `internal`.
