# Version Development Report
## 1.1.0 (2026-07-31)
- **FEAT**: Quản trị ba vùng ảnh mô tả sản phẩm trong cài đặt website.
- Vùng 1/3 hỗ trợ thêm, thay, xóa một ảnh; Vùng 2 hỗ trợ multi-upload và kéo-thả.
- Thêm giới hạn 10 MB/file và i18n Việt/Anh.

## 1.0.423 (2026-05-29)
- **FIX**: Toast retry sync Nhanh hiển thị lý do lỗi thật từ backend
- Thêm field `error` vào response endpoint sync-nhanh
- Saga ghép prefix `nhanhRetrySyncFailed` + chi tiết lỗi

## 1.0.421 (2026-05-12)
- Format height

## 1.0.419 (2026-05-12)
- Edit css facebook link

## 1.0.418 (2026-05-12)
- **FIX**: Add Facebook video embed insertion to product description editor toolbar
- Add Facebook iframe node/dialog alongside image, YouTube, and Vimeo editor actions
- Support optional Facebook post text display when embedding videos
- Add VI/EN translation keys for Facebook video insertion
- Files: `src/components/html-editor/HtmlEditor.tsx`, `src/i18n/vi/common.json`, `src/i18n/en/common.json`

## 1.0.417 (2026-05-11)
- **Feature**: Thêm filter theo Danh mục trong màn Sản phẩm CMS (`/product`)
- CMS: Section "Danh mục" mới ở đầu filter drawer, hỗ trợ multi-select với chips, debounced search + lazy load category list
- CMS: New `CategoryMultiSelect` component (`sections/product/components/CategoryMultiSelect.tsx`) — không sửa `CategoryAutocomplete` cũ để giữ nguyên flow Product-Combo
- CMS: `ProductFilterValues` mở rộng thêm `categoryIds: string[]`; map vào `getProductsRequest` qua field `categoryIds`; tính vào `activeFilterCount`
- CMS: Nút "Xuất Excel" cũng forward `categoryIds` (JSON-stringified) lên backend export endpoint
- Backend: `GET /v1/products/export` nhận thêm `@Query('categoryIds')` (JSON string), parse + validate là array of string, forward xuống `streamVariantsForExport` áp `filter['category.id'] = { $in: ... }`
- Files (CMS): `sections/product/components/CategoryMultiSelect.tsx` (new), `sections/product/components/ProductFilterDrawer.tsx`, `pages/product.tsx`, `repositories/product.repository.ts`
- Files (Backend): `products/products.controller.ts`, `products/products.service.ts`, `products/domain/product.repository.ts`, `products/model/product.repository.ts`

## 1.0.416 (2026-05-09)
- **FIX**: News form validation - chấp nhận content có YouTube embed (iframe) trong VI/EN localization
- `isHtmlEmpty` không còn coi content chỉ có `<iframe>`/`<img>`/`<video>`/`<audio>`/`<source>`/`<embed>` là rỗng → YouTube embed không bị strip khi submit
- `isFormValid` dùng `isHtmlEmpty` thay vì kiểm tra trực tiếp `formData.content` → tránh trường hợp editor để lại `<p></p>` rỗng vẫn bật nút submit
- Files: `src/sections/news/news-form.tsx`

## 1.0.415 (2026-05-05)
- **Feature**: Import Excel sản phẩm vào Topic (chủ đề sản phẩm) - tương tự luồng flashsale/CTKM
- CMS: Thêm button "Import Excel" trong tab "Danh sách sản phẩm" của trang chỉnh sửa topic (chỉ hiện trong edit mode khi topic đã tồn tại + topic type = PRODUCT)
- CMS: New `TopicExcelImportDialog` component - stepper upload → validate → preview (valid/invalid tabs) → confirm → background job polling → complete
- CMS: Excel template `topic-products-template.xlsx` với 2 cột: `Mã sản phẩm` + `Tên sản phẩm` (tham khảo). Order tự động append vào cuối topic theo thứ tự dòng
- CMS: Skip + warning cho sản phẩm đã có trong topic (mark invalid với reason `ALREADY_IN_TOPIC`, các sản phẩm khác vẫn import được)
- Backend: 5 endpoints mới `/v1/topics/:id/import-session` (create/get/getRows/deleteRow/confirm) - reuse pattern từ `import-sessions` module
- Backend: New `JobType.TOPIC_PRODUCT_IMPORT` được xử lý trong worker `JobsProcessor.processTopicProductImport` - chunk 200 sản phẩm/batch
- Files (CMS): `topic-excel-import-dialog.tsx`, `topic-products-tab.tsx`, `topic-form.tsx`, `topic-edit-view.tsx`, `topic.repository.ts`, `import-session.ts`, `vi/common.json`, `en/common.json`, `topic-products-template.xlsx`
- Files (Backend): `topic-import-sessions.controller.ts`, `validate-excel-products.dto.ts` (topics), `import-sessions.service.ts`, `import-sessions.module.ts`, `import-session.schema.ts`, `import-session.mapper.ts`, `import-session.repository.ts`, `import-session-response.dto.ts`, `import-session.ts` (domain), `job-type.enum.ts`, `topic.json` (vi+en)
- Files (Worker): `jobs.processor.ts`, `jobs-worker.module.ts`

## 1.0.413 (2026-05-04)
- **Feature**: Nhanh.vn order sync visibility — alert admins when orders fail to push to Nhanh.vn
- CMS: Header notification icon (next to language switcher) with warning badge showing unsynced count; click to open a popover with the message and "Xem ngay" shortcut to `/order?tab=nhanhUnsynced`
- CMS: Session-scoped warning dialog on dashboard mount when there are unsynced orders (suppressed for the session via `sessionStorage`)
- CMS: New "Chưa sync Nhanh" tab in `/order` with live badge count of unsynced orders (orders without `nhanh.orderId`)
- CMS: Per-row "Retry" button replaces the empty Nhanh ID column for unsynced orders; calls `POST /orders/:id/sync-nhanh`
- CMS: Dialog "Xem ngay" deep-links to `/order?tab=nhanhUnsynced` and auto-activates the tab
- Backend: New `GET /v1/orders/nhanh-sync/count` returning `{ count }`; new `nhanhSynced` filter on `GET /v1/orders` mapped to `{ 'nhanh.orderId': { $exists } }`
- Files: `order-view.tsx`, `order-tabs.tsx`, `nhanh-unsynced-dialog.tsx`, `nhanh-unsynced-banner.tsx`, `nhanhSlice.ts`, `nhanhSaga.ts`, `order.repository.ts` (CMS); `cms-order.controller.ts`, `order.service.ts`, `order.repository.ts`, `order.dto.ts` (backend)

## 1.0.411 (2026-03-27)
- **Feature**: Add Banner topic type (TopicType.BANNER) to interleave banners between topics on shop homepage
- CMS: Topic form supports Banner type with media upload (responsive: mobile/tablet/desktop), drag-and-drop reorder, add/edit/delete banner items
- CMS: Topic list shows "Topic Type" column and "Total Items" column (replaces "Total Products")
- Backend: New endpoints for banner CRUD in topics (add/remove/reorder/update banners)
- Proto: Added TOPIC_TYPE_BANNER enum, TopicBannerMedia/TopicBannerResponse messages

## 1.0.410 (2026-03-10)
- **FIX**: Flash-sale edit - API now called after Excel import completes
- Simplified handleImportComplete condition to only check if onProductPageChange exists
- Removed restrictive isServerPagination check that blocked API refresh when productsPagination was undefined
- Ensures imported products are fetched and displayed immediately after dialog closes
- Files: product-list-tab.tsx:441 (flash-sale)

## 1.0.409 (2026-03-10)
- **FIX**: Flash-sale edit - Now sends all fields in payload (not just changed fields)
- Removed delta update logic - matches product-discount pattern for consistency
- Ensures unchanged fields are included when editing after Excel import
- User expectation: all visible fields sent to backend, not just modified ones
- Files: flash-sale-form.tsx:377-385 (flash-sale)

## 1.0.408 (2026-03-10)
- **FIX**: Flash-sale edit - originalProductsMap now updates with fresh server data on refresh
- Removed condition that prevented updating existing products in originalProductsMap
- Fixes payload using stale cached values when user edits one field after Excel import
- Now ensures "original" baseline always reflects server state, not stale cache
- Files: flash-sale-form.tsx:140-150 (flash-sale)

## 1.0.407 (2026-03-10)
- **FIX**: Flash-sale edit - Imported products now save correctly with imported values (not defaults)
- Fixed handleImportComplete to refresh current page after Excel import completes
- Improved from v1.0.379 - refreshes current page instead of navigating to page 1
- Syncs form state (originalProductsMap) with server after import
- Files: product-list-tab.tsx:438-443 (flash-sale)

## 1.0.406 (2026-03-10)
- **FIX**: Product-discount edit - discountValue now saves correctly for newly added products
- Fixed stale closure bug in handleUpdateProduct callback (products-table-section.tsx)
- Added missing dependencies (editedProductsMap, addedProductsMap) to dependency array
- When user adds product then edits discountValue, changes now track correctly and save to API
- Files: products-table-section.tsx:410 (product-discount)
## 1.0.405 (2026-03-08)
- fix: environment url

## 1.0.404 (2026-03-06)
- fix prefill product in discount page.

## 1.0.403 (2026-03-08)
- fix: environment url

## 1.0.402 (2026-03-06)
- **FIX**: Product-discount Update button now disables immediately when validation errors appear
- Removed 300ms debounce from validation useEffect in products-table-section
- Button disable is now instant when user types invalid discountValue
- TextField focus still preserved during typing (no regression)
- Validation runs immediately on every product state change
- Files: products-table-section.tsx (product-discount)

## 1.0.401 (2026-03-06)
- **VERIFICATION**: Product-discount validation confirmed working correctly
- Invalid discountValue automatically disables Update button via form validation
- TextField focus preserved during typing using local state pattern (updates parent on blur only)
- Real-time validation shows errors immediately without causing focus loss
- Architecture: PerProductDiscountCell → ProductsTableSection → ProductDiscountForm → FormActionButtons
- No code changes needed - feature already fully implemented

## 1.0.400 (2026-03-06)
- **FIX**: Flash sale fixed discount validation now uses effective selling price
- Validate against productDiscountPrice (after product discount) instead of originalPrice
- Prevents negative final prices when flash sale applies on products with existing product discounts
- Example: Product with 100k original price, 20% product discount (80k) → flash sale discount of 90k now correctly shows error
- Files: product-list-tab.tsx (flash-sale)

## 1.0.399 (2026-03-06)
- **ARCHITECTURAL FIX**: Decisively fix TextField focus loss by preventing parent rerenders during typing
- Remove parent state update from handleChange (only update on blur)
- Remove unnecessary custom React.memo comparison function from v1.0.407
- Clean, simple architecture: local state for typing, parent update on blur
- TextField focus preserved permanently during typing
- Real-time validation error display still works
- Submit button disables after blur
- Files: products-table-section.tsx, product-discount-form.tsx.

## 1.0.398 (2026-03-06)
- **FIX**: Show discount validation while typing (not only on blur)
- Validation now appears 300ms after user stops typing
- Improves UX - users see errors immediately after finishing input
- No need to click out of field to see validation errors

## 1.0.397 (2026-03-06)
- **FIX**: Add 300ms debounce to flash sale discount validation
- Error messages appear 300ms after user stops typing
- Reduces visual noise during rapid input
- Submit button disable logic unchanged (still immediate)

## 1.0.396 (2026-03-06)
- **FIX**: Disable submit button when flash sale discount validation errors exist
- Propagate discount errors from ProductRow to parent form via onValidationChange
- Submit button disabled when percentage > 100% or fixed amount > originalPrice
- Follow existing order validation pattern for consistency

## 1.0.395 (2026-03-06)
- **FIX**: Add validation for flash sale discount value field
- Percentage discount cannot exceed 100%
- Fixed amount discount cannot exceed original price
- Display validation error messages below input field
- Files: product-list-tab.tsx, vi/common.json, en/common.json

## 1.0.394 (2026-03-05)
- **FIX**: Flash sale - show upsert result dialog and wait for user to close before navigating
- Move navigation from onSuccess callback to dialog close handler
- User can now see bulk operation results before returning to list view
- Files: flash-sale-edit-view.tsx

## 1.0.393 (2026-03-05)
- **FIX**: Product discount search - use JSON string format (match affiliate endpoint)
- Backend expects filters={"search":"value"}, NOT filters[search]=value
- Use JSON.stringify to match working affiliate product-commissions endpoint
- Only include filter fields with actual values (no empty arrays/undefined)
- Files: promotion.repository.ts

## 1.0.392 (2026-03-05)
- **FIX**: Product discount search - use nested params instead of JSON string
- Backend expects filters[search]=value, NOT filters={"search":"value"}
- Remove JSON.stringify and pass filters object directly to axios
- Axios serializes as nested query params matching NestJS validation
- Files: promotion.repository.ts

## 1.0.391 (2026-03-05)
- **FIX**: Add productDiscountPrice in order to display in flashsale

## 1.0.390 (2026-03-05)
- **FIX**: Product discount search - build clean filters without empty arrays/undefined
- Backend rejects filters with empty arrays and undefined values
- Build filters object conditionally (only include fields with actual values)
- Use JSON.stringify format matching working endpoints (commission.repository pattern)
- Files: promotion.repository.ts

## 1.0.389 (2026-03-05)
- **FIX**: Product discount - correct filters serialization for /promotions/{id}/products endpoint
- Pass filters as object instead of JSON string to match backend validation
- Backend expects nested params (filters[search]=) not stringified JSON
- Fixes "nested property filters must be either object or array" validation error
- Files: promotion.repository.ts

## 1.0.388 (2026-03-05)
- **FIX**: Product discount edit - fix search not working for existing promotion products
- Changed from direct search parameter to filters object format
- Updated promotionRepository.getPromotionProducts to use filters={"search":"..."}
- Export FilterProduct type from products types for reusability
- Files: promotion.repository.ts, product-discount-edit-view.tsx, products.ts

## 1.0.387 (2026-03-05)
- **FEAT**: Flash sale - use single PUT upsert endpoint for add/update operations
- Replace separate PATCH and POST calls with unified upsert for better UI experience
- Add upsertFlashSaleProducts repository method and saga
- Files: flash-sale.repository.ts, flashSaleSlice.ts, flashSaleSaga.ts, flash-sale-edit-view.tsx, common.json (en/vi)

## 1.0.386 (2026-03-04)
- **FIX**: Product discount - preview for change instead of update

## 1.0.385 (2026-03-04)
- **FIX**: Flash sale - newly added products edited before submit now go to POST endpoint
- Check addedProductsMap before deciding which map to update
- Fix handleUpdateProduct and handleToggleProduct to preserve new product status
- Files: flash-sale-form.tsx

## 1.0.384 (2026-03-04)
- **FIX**: Flash sale edit now properly uses PATCH endpoint for product updates
- Separate new products (POST) from edited products (PATCH)
- Edited products only send changed fields, not all fields with defaults
- Remove optimization that bypassed PATCH endpoint
- Files: flash-sale-form.tsx, flash-sale-edit-view.tsx, flash-sale-create-view.tsx
## 1.0.383 (2026-03-04)
- **FIX**: disable voucher type for product discount

## 1.0.382 (2026-03-04)
- **FIX**: Import excel for product discount

## 1.0.381 (2026-03-04)
- **FIX**: Flash sale edit - discountValue now syncs when discountType changes
- Add useEffect to sync ProductRow local state with parent prop changes
- Prevents stale values when switching between fixed and percentage discounts
- TextField now immediately shows "0" when discount type changes
- Files: product-list-tab.tsx

## 1.0.380 (2026-03-03)
- **FIX**: Fix product selection dialog not prefilling products on first open in affiliates edit page
- Added onSuccess callback to getAffiliateProductIdsRequest action
- Dialog now opens only after API completes, ensuring product IDs are loaded
- Follows established onSuccess callback pattern used in 20+ existing sagas
- Files: commissionSlice.ts, commissionSaga.ts, products-table-section.tsx

## 1.0.377 (2026-03-02)
- **FIX**: Exclude deleted products from product selection dialog pre-fill
- Filter out deletedProductIds from existingProductIds calculation
- Removed products no longer appear as pre-selected when dialog is reopened
- Prevents confusion where removed products still show as selected
- Files: flash-sale-form.tsx

## 1.0.376 (2026-03-02)
- **FIX**: Handle product unselection in product selection dialog
- When products are unchecked in dialog and confirmed, they are now removed from flash sale
- handleAddProducts now detects both additions and removals
- Calls onRemoveProduct for unselected products
- Unselected products are temporarily removed until saved
- Files: product-list-tab.tsx

## 1.0.375 (2026-03-02)
- **FIX**: Fix empty pages when products are added (pages 3, 4, 5 were empty)
- Removed broken client-side pagination logic when hasLocalChanges is true
- Client-side pagination was trying to slice partial data (11 items), causing empty pages
- Now always uses server pagination, which correctly fetches each page from backend
- Added products remain visible on page 1 only (same as original behavior)
- Files: product-list-tab.tsx

## 1.0.374 (2026-03-02)
## 1.0.373 (2026-03-02)
- gen proto
## 1.0.372 (2026-03-02)
- bump version
## 1.0.371 (2026-03-02)
- Sua format time

## 1.0.370.8 (2026-03-02)
- **FIX**: Fix duplicate order validation not detecting duplicates on same page
- Root cause: Server products were overwriting current page products during deduplication
- Reversed array order in validation: server products (lowest priority) < current page < edited (highest)
- Map deduplication now keeps most recent edited values instead of stale server data
- Validation now correctly detects duplicates on current page AND across pages
- Added comprehensive debug logging to track validation data flow
- Files: product-list-tab.tsx, flash-sale-form.tsx

## 1.0.370.7 (2026-03-02)
- **FIX**: Fix cross-page duplicate order validation in flash sale
- Include all server products in duplicate checking via flashSaleProductIds
- Validation now catches duplicates against products on other pages
- Previously only checked current page + edited products
- Files: product-list-tab.tsx, flash-sale-form.tsx

## 1.0.370.6 (2026-03-02)
- **FIX**: Fix reversed product order in flash sale table
- Sort products immediately when added to maintain correct order
- Products now display 1, 2, 3, 4... from top to bottom (not 10, 9, 8...)
- Maintains previous fix: no auto-repositioning when changing order values
- Files: flash-sale-form.tsx

## 1.0.370.5 (2026-03-02)
- **FIX**: Flash sale product table no longer auto-sorts when order number changes
- Remove automatic sorting by order number from displayProducts
- Products maintain their position when user inputs order values
- Duplicate order validation continues to work correctly
- Improves UX by preventing confusing product repositioning
- Files: flash-sale-form.tsx

## 1.0.370.4 (2026-03-02)
- **FIX**: Fix page 2 showing empty table when adding products
- Switch to client-side pagination when local changes exist
- Update currentPage calculation to use clientPage when hasLocalChanges
- Prevent server page change handlers from triggering with local changes
- Fixes: Page 2 empty despite having 14 total products (4 server + 10 added)
- Files: product-list-tab.tsx

## 1.0.370.3 (2026-03-02)
- **FIX**: Fix pagination controls not showing page 2 when adding products
- Apply hasLocalChanges check to totalItems and totalPages calculations
- Pagination now correctly shows all pages when local changes exist
- Fixes: Page 2 button missing despite having 20+ products
- Files: product-list-tab.tsx

## 1.0.370.2 (2026-03-02)
- **FIX**: Fix pagination breaking when adding products in edit mode
- Apply client-side pagination when there are unsaved local changes
- Respect page size limit even with mixed server + local data
- Prevents table from showing more items than configured page limit
- Files: product-list-tab.tsx, flash-sale-form.tsx

## 1.0.370.1 (2026-03-02)
- **FIX**: Product selection dialog now prefills newly added products (not yet saved)
- Combine API products with locally added products in existingProductIds
- Fix: Dialog reopening shows all products (saved + unsaved) as selected
- Prevents users from accidentally re-adding products they just added
- Files: flash-sale-form.tsx

## 1.0.370 (2026-03-01)
- **FEAT**: Add product IDs API for global order validation in flash sale edit
- Fetch all existing product IDs with order numbers on edit page load
- API: GET /flash-sales/{id}/product-ids returns Array<{productId, order}>
- Prefill product selection dialog with existing products
- Validate order field across all pages (not just current page)
- Prevents duplicate order numbers globally before submission
- Files: flash-sale.repository.ts, flashSaleSlice.ts, flashSaleSaga.ts, flash-sale-edit-view.tsx, flash-sale-form.tsx, product-list-tab.tsx

## 1.0.369 (2026-03-01)
- **FIX**: Fix reversed order numbers when adding products to flash sale
- Sort products by order number in displayProducts for correct visual sequence
- Products now display 1-10 from top to bottom (not 10-1)
- Fixes visual order mismatch in create mode
- Maintains prepending behavior from v1.0.360
- Files: flash-sale-form.tsx

## 1.0.368 (2026-03-01)
- **FIX**: Recalculate total product count when adding or deleting products
- Adjust total count to include pending additions and deletions before submit
- Calculate: serverTotal + addedProducts - deletedProducts
- Fixes pagination display showing incorrect total count in edit mode
- Fixes page navigation and order number calculations
- Files: flash-sale-form.tsx, product-list-tab.tsx

## 1.0.367 (2026-03-01)
- **FIX**: Fix product selection dialog including unchanged existing products in payload
- Filter out existing products before processing in handleAddProducts
- Only process truly new product selections (not pre-filled existing ones)
- Prevents API receiving unnecessary updates for unchanged products
- Files: product-list-tab.tsx

## 1.0.366 (2026-03-01)
- **FIX**: Fix duplicate products with old data in flash sale edit submission
- Deduplicate products when combining editedProductsMap and addedProductsMap
- Edited products take priority over added products (prevents stale data)
- Fixes: Adding product then editing it now sends only edited values (no duplicates)
- Files: flash-sale-form.tsx

## 1.0.365 (2026-03-01)
- **OPTIMIZE**: Remove unnecessary PATCH API call for flash sale products
- Merge toAdd and toUpdate into single bulk POST operation
- Reduce from 2 API calls to 1 for product updates
- All products (new and updated) now use POST /products/bulk endpoint
- Files: flash-sale-edit-view.tsx

## 1.0.364 (2026-03-01)
- **FIX**: Fix product duplicates with proper deduplication at merge time
- Deduplicate products when merging addedProducts with normalizedProducts
- Revert v1.0.363 originalProductsMap checks (incomplete tracking caused false positives)
- Simple filter-based deduplication prevents all duplicate scenarios
- Files: flash-sale-form.tsx

## 1.0.363 (2026-03-01)
- **FIX**: Fix existing products being duplicated after navigation
- Only add products to addedProductsMap if they're NOT from server
- Use originalProductsMap to check if product exists in server data
- Prevents duplicate display when returning to page 1
- Files: flash-sale-form.tsx

## 1.0.362 (2026-03-01)
- **FIX**: Fix duplicate products appearing on all pages
- Only show newly added products on page 1 (not on page 2, 3, etc.)
- Added products still persist in addedProductsMap for form submission
- Prevents duplicate display while maintaining data integrity
- Files: flash-sale-form.tsx

## 1.0.361 (2026-03-01)
- **FIX**: Fix added products being cleared on pagination
- Change useEffect dependency from [initialProducts] to [flashSaleId]
- Only reset addedProductsMap when switching to different flash sale, not on pagination
- Newly added products now persist correctly across all page navigations
- Files: flash-sale-form.tsx

## 1.0.360 (2026-03-01)
- **FIX**: Fix newly added products appearing at bottom instead of top
- Change handleAddProduct to prepend: `[product, ...prev]` instead of `[...prev, product]`
- Change handleAddProducts to prepend: `[...uniqueNewProducts, ...prev]` instead of `[...prev, ...uniqueNewProducts]`
- Newly added products now appear at the top immediately when added
- Files: flash-sale-form.tsx

## 1.0.359 (2026-03-01)
- **FIX**: Fix newly added products disappearing when changing pagination pages
- Track newly added products in addedProductsMap for persistence across page changes
- Newly added products appear at the top of the list when navigating between pages
- Merge added products with server-paginated products after page navigation
- Update handleAddProduct and handleAddProducts to track in addedProductsMap
- Update handleRemoveProduct to distinguish newly added vs existing products (don't call DELETE API for unsaved products)
- Update handleSubmit to include added products in submission payload
- Clear addedProductsMap on form reset
- Files: flash-sale-form.tsx

## 1.0.358 (2026-03-01)
- **FIX**: Fix incorrect DELETE API calls in flash sale edit due to pagination bug
- Track explicitly deleted products in deletedProductIds state
- Only send DELETE API with products user actually deleted
- Prevent false deletions from server-side pagination mismatch
- Handle edge case: re-adding deleted products removes from delete list
- Files: flash-sale-form.tsx, flash-sale-edit-view.tsx

## 1.0.357 (2026-03-01)
- **PERF**: Optimize flash sale edit bulk updates with parallel API execution
- Replace sequential bulk operations (DELETE → PATCH → POST) with coordinated parallel saga
- Reduce API call time by 50-54% for typical scenarios (650ms → 300ms)
- Skip empty operations (e.g., only updates = 1 call instead of 3)
- Improve UX with single consolidated success toast and reliable navigation
- Files: flashSaleSaga.ts, flashSaleSlice.ts, flash-sale-edit-view.tsx, vi/common.json, en/common.json

## 1.0.356 (2026-03-01)
- **REFINE**: Remove "Edited" text chip from flash sale visual indicator
- Keep only background color indicator for edited products
- Simplify product name cell to Typography only
- Remove "edited" i18n keys from vi/common.json and en/common.json
- Files: product-list-tab.tsx, vi/common.json, en/common.json

## 1.0.355 (2026-03-01)
- **FIX**: Fix flash sale edit pagination bug - only products from current page submitted
- Implement editedProductsMap to track all edits across pages
- Display edited values when navigating back to previously edited pages
- Add visual indicator (chip + background) for edited products
- Validate order duplicates only among edited products
- Files: flash-sale-form.tsx, product-list-tab.tsx, vi/common.json, en/common.json

## 1.0.354 (2026-02-28)
- **FIX**: Flash sale order calculation - use max order value instead of count
- Changed from displayProducts.length to Math.max(...orders)
- Now correctly handles unsaved products and custom order values
- More robust solution for order auto-prefill

## 1.0.348 (2026-02-27)
Giảm giá phí VC
- Tắt/ Bật chương trình ở ngoài nhưng trạng thái chưa cập nhật đúng - CMS

## 1.0.346 (2026-02-27)
- **FIX**: Fix alignment of Link affiliate, Phân loại, and Trạng thái values in affiliates detail view
- Standardize label width from 200px to 220px to match other fields
- Add vertical centering (alignItems: center) to improve chip and link alignment
- File modified: affiliates-detail-view.tsx

## 1.0.345 
- bump version

## 1.0.344 (2026-02-27)
- **FIX**: Fix product selection dialog removing existing products when adding new ones
- Remove "delete unselected" logic from handleProductsSelected
- "Add Products" button now only adds new products without affecting existing ones
- Users can add products without losing current product commissions
- File modified: products-table-section.tsx

## 1.0.343 (2026-02-27)
- **FIX**: Ensure order field is always sent in flash sale edit payload
- Fix toBulkUpdateItem to always include order field (default to 0 if undefined)
- Prevents order field from being omitted in API requests due to undefined values
- JSON serialization no longer omits order field
- Files modified: product-list-tab.tsx
## 1.0.342 (2026-02-27)
- **FEAT**: Add unsaved products warning text in affiliates edit page
- Display red warning when product table has unsaved changes (add/edit/delete)
- Warning appears above products table section
- Message: "Danh sách sản phẩm đã thay đổi và chưa được lưu. Vui lòng nhấn 'Lưu' để cập nhật thay đổi"
- Uses MUI Alert component with error severity
- Files modified: affiliates-form.tsx, vi/common.json, en/common.json

## 1.0.341 (2026-02-27)
- **REMOVE**: Remove drag-and-drop reordering feature from flash sale products
- Remove DragHandle button from action column
- Remove DndContext and SortableContext wrappers
- Remove drag-and-drop event handlers and sensors
- Remove @dnd-kit imports and dependencies
- Remove reassignOrderNumbers and moveProductToPosition helper functions
- Users can still reorder products using the Order column input field
- Simplified action column (only delete button remains)
- Files modified: product-list-tab.tsx, flash-sale-form.tsx

## 1.0.340 (2026-02-27)
- **FIX**: Fix client-side pagination in flash sale create mode
- Add data slicing for client-side pagination (create mode)
- Add clientPage and clientPageSize state for create mode
- Page 1 now shows only 10 items (not all 14)
- Clicking page 2 now correctly shows remaining items
- Search filter combined with pagination works correctly
- Files modified: product-list-tab.tsx

## 1.0.339 (2026-02-27)
- **FIX**: Fix flash sale pagination when adding new products
- Use total product count instead of current page count for order assignment
- Pass totalProductCount prop from flash-sale-form to product-list-tab
- Fix order conflicts when adding products on non-first pages
- Reset pagination to page 1 after adding products (consistent with Excel import)
- Example: Adding products on page 2 of 35 total now assigns order 36, 37 (not 11, 12)
- Files modified: flash-sale-form.tsx, product-list-tab.tsx

## 1.0.338 (2026-02-27)
- fix affiliates code

## 1.0.337 (2026-02-27)
- **FIX**: Always include order field in flash sale update API payload
- Order field now sent in all update requests, not just when changed
- Ensures backend always receives order values for product sorting
- Remove debug console.log from toBulkUpdateItem
- Files modified: flash-sale-edit-view.tsx, product-list-tab.tsx

## 1.0.336 (2026-02-27)
- **FIX**: Include order field in flash sale edit view update logic
- Add order to originalProducts mapping
- Add order field comparison in change detection
- Order changes now properly detected and sent to API
- Files modified: flash-sale-edit-view.tsx

## 1.0.335 (2026-02-27)
- **FIX**: Ensure order field is sent in API payload
- Update toBulkUpdateItem to conditionally include fields with values
- Prevent JSON.stringify from omitting undefined fields
- Order field now correctly sent to backend when saving flash sale products
- Also fixes missing discountValue, promotionalQuantity, and isEnabled fields
- Files modified: product-list-tab.tsx

## 1.0.334 (2026-02-27)
- **FIX**: Remove setSelectionRange call for number inputs
- Fix InvalidStateError when restoring focus in order field
- Number inputs don't support setSelectionRange API
- Browser automatically handles cursor positioning for number inputs
- Files modified: product-list-tab.tsx

## 1.0.333 (2026-02-27)
- **FIX**: Keep cursor in order field after input completion
- Add focus preservation using useRef to track active order field
- Restore focus after validation re-renders
- Cursor stays at end of input while user types
- Improves UX for editing order numbers
- Files modified: product-list-tab.tsx

## 1.0.332 (2026-02-27)
- **FEAT**: Add duplicate order number validation for flash sale products
- Detect and display errors when multiple products have the same order number
- Show error message below order field with red border highlight
- Block form submission until all duplicate orders are resolved
- Real-time validation triggers on product changes
- Add i18n keys: duplicateOrderNumber (EN: "Duplicate order number", VI: "Số thứ tự trùng lặp")
- Files modified: product-list-tab.tsx, flash-sale-form.tsx, en/common.json, vi/common.json

## 1.0.331 (2026-02-27)
- **FIX**: Fix order field to allow clearing while maintaining prefill functionality
- Revert display logic to show empty string when order is undefined
- Keep initialization fix (|| operator) to convert 0-based orders to 1-based
- Users can now clear the field and re-enter new values
- Products still load with prefilled order values (1, 2, 3, 4...)
- Best of both worlds: prefilled on load, clearable for editing
- Files modified: product-list-tab.tsx

## 1.0.330 (2026-02-27)
- **FIX**: Fix order to start from 1 instead of 0
- Change nullish coalescing operator (??) to OR operator (||)
- Treat 0 as "not set" and convert to 1-based indexing
- Backend 0-based orders (0, 1, 2...) now converted to (1, 2, 3...)
- Orders now display correctly as 1, 2, 3, 4... for better UX
- Files modified: product-list-tab.tsx

## 1.0.329 (2026-02-27)
- **FIX**: Fix order field cannot be cleared and re-entered
- Change TextField value from `|| ''` to `?? ''` to allow 0 values
- Users can now clear the order field and input new values
- Nullish coalescing preserves 0 while treating null/undefined as empty
- Files modified: product-list-tab.tsx

## 1.0.328 (2026-02-27)
- **FIX**: Make order field editable in flash sale product table
- Remove `disabled` prop from order TextField
- Add handleUpdateProduct callback to update product order in state
- Users can now edit order values directly in the table
- Files modified: product-list-tab.tsx

## 1.0.327 (2026-02-27)
- **FIX**: Prefill order values starting from 1 on initial load
- Initialize order field with `p.order ?? index + 1` in flash-sale-form.tsx
- Products now show order values (1, 2, 3...) immediately on page load
- No more empty order fields on first render
- Files modified: flash-sale-form.tsx

## 1.0.326 (2026-02-27)
- **FEAT**: Add order column to flash sale product table
- Add editable order input field (number type) with min/max validation
- Order column displays at 120px width with input for manual sorting
- Validates order range from 1 to total product count
- Updates product order in local state via handleUpdateProduct callback
- Backend already supports order field in proto definitions
- Files modified: product-list-tab.tsx

## 1.0.325 (2026-02-26)
- **PERF**: Replace individual product commission updates with bulk update API
- Replace loop-based individual updates (one API call per product) with bulk update endpoint
- Group products by commission rate and make one bulk API call per rate group
- Remove 100ms delays between individual updates
- Performance improvement: 10x-100x faster for bulk operations
- Example: 100 products with same rate → 1 API call instead of 100 (from 10+ seconds to <1 second)
- Use existing bulk update infrastructure: bulkUpdateAffiliateProductCommissionsRequest
- API endpoint: POST /affiliates/{id}/product-commissions/bulk-update-rate
- Files modified: products-table-section.tsx (lines 432-460)

## 1.0.324 (2026-02-26)
- **FIX**: Complete defaultCommissionRate fix in create and edit views
- Fix parent view components that were re-applying the `|| undefined` pattern
- Even though affiliates-form.tsx was fixed in v1.0.323, the parent views were undoing the fix
- Apply same type-safe pattern to affiliates-create-view.tsx (line 34)
- Apply same type-safe pattern to affiliates-edit-view.tsx (line 89)
- Use `typeof data.defaultCommissionRate === 'number' ? data.defaultCommissionRate : null`
- Complete fix: Form → View → API all now preserve 0 values and send null when cleared
- Files modified: affiliates-create-view.tsx, affiliates-edit-view.tsx

## 1.0.323 (2026-02-26)
- **FIX**: Fix commission rate field to send null when cleared and preserve 0 values
- Change payload construction from `defaultCommissionRate || undefined` to type-safe check
- Use `typeof defaultCommissionRate === 'number' ? defaultCommissionRate : null`
- Backend now receives explicit `null` when field is cleared (distinguishable from "never set")
- Zero commission rate (0%) can now be saved correctly (not converted to undefined)
- No changes to other fields - pattern only problematic for numeric fields where 0 is valid
- Files modified: affiliates-form.tsx (line 251)

## 1.0.322 (2026-02-26)
- **FEAT**: Add validation for phone number and bank account number fields in affiliates form
- Phone validation: Must be exactly 10 digits starting with 0 (Vietnamese format)
- Bank account validation: Required field, must be 8-20 digits, numeric only
- Add error state and real-time error clearing for bank account number field
- Add i18n keys: phoneInvalid, bankAccountNumberRequired, bankAccountNumberInvalid (EN/VI)
- Improve form validation to prevent invalid data submission
- Files modified: affiliates-form.tsx, en/common.json, vi/common.json

## 1.0.321 (2026-02-26)
- **UI**: Move save and cancel buttons to bottom of affiliates edit page
- Remove buttons from header (top-right) to improve UX
- Add buttons at bottom of page (after Commission Settings Card)
- Buttons remain right-aligned and maintain all functionality (loading states, validation, handlers)
- Better UX for forms with scrollable content - users see action buttons after reviewing all fields
- Files modified: affiliates-form.tsx

## 1.0.320 (2026-02-26)
- **STYLE**: Center copy icon in affiliate link column
- Wrap IconButton in Box with centered flex layout for better visual alignment
- Icon now horizontally centered in the "Link affiliate" column
- Files modified: commission-product-table.tsx

## 1.0.319 (2026-02-26)
- **FEAT**: Add affiliate link column to commission products table in affiliate detail view
- Add copy icon button to each product row for copying product-specific affiliate links
- Link format: {baseUrl}/products/{productId}?ref={affiliateCode}
- Uses getCurrentBaseUrl() utility to determine correct domain (main/internal/staging)
- Shows success toast notification after copying link
- Column only appears when affiliateCode is provided (not in create/edit forms)
- Files modified: commission-product-table.tsx, products-table-section.tsx, affiliates-detail-view.tsx
