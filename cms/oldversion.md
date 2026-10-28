
## 1.0.318 (2026-02-26)
- **FIX**: Fix browser back button blocking not working
- Change isBlockingBack from state to ref to prevent race condition
- Fix dependency array to only include [when] in popstate effect
- Eliminate stale closure issues in popstate handler
- Back button now correctly shows unsaved changes dialog
- File modified: use-unsaved-changes-warning.ts

## 1.0.317 (2026-02-26)
- **FEAT**: Add browser back/forward button blocking with custom dialog
- Implement sentinel history state pattern for back navigation detection
- Show same MUI dialog for back/forward as in-app navigation
- Handle edge cases: rapid clicks, cleanup, external navigation
- File modified: use-unsaved-changes-warning.ts

## 1.0.316 (2026-02-26)
- **FEAT**: Add unsaved changes warning for navigation in affiliates edit page
- Block browser navigation (back/forward/close tab) with beforeunload event
- Block in-app navigation (menu clicks, links) with custom MUI dialog
- Create reusable useUnsavedChangesWarning hook for navigation blocking
- Integrate with existing unsaved changes dialog in affiliates form
- Show warning dialog when user tries to navigate away with unsaved changes
- Dialog options: "Cancel" (stay on page) or "Discard Changes" (proceed with navigation)
- Files modified: affiliates-form.tsx
- Files added: use-unsaved-changes-warning.ts
## 1.0.315 (2026-02-26)
- fix error when change tab shipping config.

## 1.0.314 (2026-02-26)
- add button to sync product from nhanh

## 1.0.313 (2026-02-26)
- Mapping shippingDiscountConfig.

## 1.0.312 (2026-02-26)
- **FIX**: Fix newly added products disappearing after editing commission rate in affiliates edit page
- Preserve 'add' operation when editing commission rates for new products
- Modified handleSaveEdit and handleApplyBulkEdit to check if product has operation='add'
- If product is newly added: preserve 'add' operation and update rate within it
- If product is from backend: create 'update' operation as before
- Update displayData within 'add' operation to reflect new rate and estimated commission
- Fixes critical bug where editing rate changed 'add' → 'update', losing displayData
- File modified: products-table-section.tsx

## 1.0.311 (2026-02-26)
- **FEAT**: Display newly added products at top of table in affiliates edit page
- Modified displayProducts memo to separate new products into dedicated array
- New products (operation='add') now appear first, followed by existing backend products
- Changed return to [...newProducts, ...Array.from(backendMap.values())]
- Improves user experience - users immediately see their newly added products
- File modified: products-table-section.tsx

## 1.0.310 (2026-02-26)
- **FIX**: Fix product selection dialog losing existing products when selecting new ones
- Add existingProducts prop to ProductSelectionDialog component
- Initialize selectedProductsCacheRef with full Product objects from existingProducts on dialog open
- Create existingProductsForDialog memo in products-table-section.tsx to transform displayProducts
- Fixes bug where products from other pages disappeared when selecting new products
- Dialog now retains all previously selected products across pagination
- Files modified: product-selection-dialog.tsx, products-table-section.tsx

## 1.0.309 (2026-02-26)
- **FEAT**: Add visual indicators for pending product changes in affiliates edit page
- Add status badges to show pending operations: green "Add", orange "Update", red "Delete"
- Add pendingStatus column to commission product table
- Use MUI Chip component with color variants (success, warning, error)
- Add pendingOperations prop to CommissionProductTable component
- Pass pendingOperations Map from ProductsTableSection to table
- Improves user feedback - users can see which products have unsaved changes
- Files modified: commission-product-table.tsx, products-table-section.tsx
## 1.0.308 (2026-02-26)
- Mua X tặng Y'' khi xóa tự fill = 0-> expect: fill =1

## 1.0.306 (2026-02-26)
- Sửa UI cho tài khoản affiliate

## 1.0.305 (2026-02-25)
- Sửa UI màn chi tiết yêu cầu rút tiền theo UX

## 1.0.304 (2026-02-25)
- **FEAT**: Add popup ads management

## 1.0.303 (2026-02-25)
- **FEAT**: Add column sorting to affiliates table
- Click column headers to sort by name, type, or status
- Supports ascending/descending/no sort (3-state toggle)
- Sorting integrated with filters and pagination
- API called with sort params: `{"orderBy":"name","order":"asc"}`
- File modified: affiliates-view.tsx

## 1.0.302 (2026-02-25)
- **FEAT**: Add immediate filtering for status and type in affiliates page
- **FEAT**: Add 300ms debounce to affiliates search field
- Status and type dropdowns now trigger API immediately without search button
- Search field auto-searches after 300ms of no typing
- Search button and Enter key bypass debounce for immediate search
- File modified: affiliates-view.tsx

## 1.0.301 (2026-02-24)
- **FIX**: Commission settings section now refreshes after updating default commission rate
- **FIX**: Commission table now refreshes after editing commission rates
- **FIX**: Product table now refreshes after updating default commission rate
- **FIX**: Edit button now enabled immediately after commission rate update succeeds
- **FIX**: Affiliate link generation now uses environment-based URLs
- **FIX**: Show "-" instead of "0%" when default commission rate is null/undefined/0
- **FEAT**: Add product name navigation in commission table
- Product names in commission table are now clickable and navigate to product detail page
- Clicking product name navigates to `/product/{productId}` for viewing product details
- Product table automatically refreshes when default rate is updated to show latest data
- Edit button no longer waits for backend recalculation to complete before enabling
- Fix EditCommissionDialog and BulkEditCommissionDialog closing prematurely
- Files modified: formatted-number-input.tsx, format.ts, edit-default-commission-rate-dialog.tsx
## 1.0.300 (2026-02-24)
- Hide status on buy x get y product section
- Remove duplicate withdraw request tab

## 1.0.299 
- **FIX**: Remove duplicate success toast in affiliates-commission page
- Show only saga toast when updating default commission rate
- Remove "recalculatingCommissions" toast, always show standard success message
- Remove duplicate `/withdrawal-request` in nav bar.
- File modified: affiliates-commission-view.tsx, src/layouts/config-nav-dashboard.tsx.

## 1.0.298 (2026-02-23)

- **FEAT**: Add isEnabled field to Order Discount form
- Add "Trạng thái" (Status) RadioGroup to Order Discount create/edit forms
- Reuse existing BasicInfoSection component which already supports isEnabled props
- Load isEnabled from API in edit view, send in update payload
- Files modified: order-discount-form.tsx, order-discount-edit-view.tsx

## 1.0.297 (2026-02-23)
- Increase version

## 1.0.296 (2026-02-23)

- **FIX**: Fix remaining duplicate API calls on affiliates edit page
- Add deduplication to AffiliatesEditView for affiliate fetch using pendingRequestsRef
- Add deduplication to CommissionProductTable for product categories fetch
- Files modified: affiliates-edit-view.tsx, commission-product-table.tsx

## 1.0.295 (2026-02-23)

- **FIX**: Prevent duplicate API calls on affiliates edit page
- Add deduplication logic to ProductsTableSection using pendingRequestsRef pattern
- Add cleanup on unmount in AffiliatesEditView to reset currentAffiliate state
- Files modified: products-table-section.tsx, affiliates-edit-view.tsx

## 1.0.294 (2026-02-23)

- **FIX**: Fix edit navigation in affiliates data table
- Change route from `/affiliates/:id/edit` to `/affiliates/edit/:id`
- Align navigation with route definition pattern (e.g., shipping-promotion/edit/:id)
- File modified: src/sections/affiliates/affiliates-view.tsx

## 1.0.293 (2026-02-21)

- **FIX**: Timezone issue in affiliates orders date filter
- Change date serialization from toISOString() to format('YYYY-MM-DD')
- Prevents date shifting when converting local time to UTC
- User selects 2025-12-04 → API now receives "2025-12-04" instead of "2025-12-03T17:00:00.000Z"
- File modified: src/sections/affiliates/components/affiliates-orders-tab.tsx

## 1.0.292 (2026-02-21)

- **FEAT**: Implement Order List tab in Affiliates Detail View
- Add affiliates-orders-tab.tsx component with date filter and pagination
- Create getAffiliateOrders repository method for API integration
- Display order data: order number (blue link), customer, amounts, discounts (red)
- Add i18n keys: orderValue, totalPromotionValue
- Navigate to order detail on order number click

## 1.0.291 (2026-02-21)

- **PERF**: Add 300ms debounce to search field in Affiliates Performance View
- Prevent excessive API calls - typing "test" now triggers 1 call instead of 4
- Implement two-state pattern: searchInput (immediate UI) + searchQuery (debounced API trigger)
- Add searchTimeoutRef for timeout management and cleanup
- Search button bypasses debounce for immediate results
- Update renderEmptyState to check searchInput for instant feedback
- Reduces API calls by up to 90% for typical searches
- Follows proven pattern from commission-product-table.tsx
- Benefits: Better performance, less server load, faster UI, no input lag
- File modified: src/sections/affiliates/affiliates-performance-view.tsx

## 1.0.290 (2026-02-21)

- **FIX**: Prevent UI jump when searching/filtering in Affiliates Performance View
- Add `renderEmptyState()` function to handle loading and empty states consistently
- Set `minHeight: 400px` on table container to prevent collapse during loading
- Always render pagination with default values (`total: 0`, `totalPages: 1`) instead of conditionally showing/hiding
- Use `{renderEmptyState() || <DataTable />}` pattern matching flash-sale-view and cms-user-list-view
- Fixes wild 500-700px layout jump that occurred when users search or change categories
- Benefits: Stable layout, consistent UX, better accessibility, prevents scroll position jumps
- i18n keys used: `loading`, `noData`, `noSearchResults` (all already existed in locale files)
- File modified: src/sections/affiliates/affiliates-performance-view.tsx

## 1.0.289 (2026-02-21)

- **REFACTOR**: Replace custom search with SearchBar component in Affiliates Performance View
- Refactor search implementation to use common SearchBar component from `src/components/table`
- Replace TextField + Button pattern with SearchBar component for consistency
- Simplify from two state variables (searchInput/searchValue) to single searchQuery state
- Remove custom button styling - use SearchBar's built-in blue button
- Align with codebase pattern used in 15+ other views
- Benefits: Improved code maintainability, consistency, reduced code duplication
- Trade-off: Removed Enter key support (SearchBar doesn't have built-in support, but search button provides clear UX)
- File modified: src/sections/affiliates/affiliates-performance-view.tsx

## 1.0.288 (2026-02-21)

- **FIX**: Set search button to blue color in Affiliates Performance View
- Add `color="primary"` prop to search button in product analytics filters
- Ensures consistent blue button styling matching Material-UI primary theme
- File modified: src/sections/affiliates/affiliates-performance-view.tsx:370

## 1.0.287 (2026-02-21)

- **REFACTOR**: Move Affiliates Performance View to detail view tab
- Convert performance view to accept affiliateId as prop instead of URL params
- Integrate performance view into Performance Statistics tab (Tab 1)
- Remove standalone /affiliates-performance/:id route and page
- Remove affiliates-performance menu item from navigation

## 1.0.286 (2026-02-21)

- **FEAT**: Implement Affiliates Performance View with analytics dashboard
- Add overview metrics: clicks, orders, conversion rate, revenue, estimated commission
- Add product analytics table with category/search filters and pagination
- Create affiliatesPerformanceSlice and saga for state management
- Update route to /affiliates-performance/:id to support affiliate-specific analytics
- Add analytics API methods to affiliate.repository.ts

## 1.0.285 (2026-02-15)

- **FEAT**: Implement immediate search and category filtering in affiliate detail product list
- Add debounced search (300ms delay) - automatically triggers search after user stops typing
- No need to click search button - more responsive user experience
- Category filter now triggers immediately on selection change (no button needed)
- Add `searchTimeoutRef` to commission-product-table.tsx for debounce management
- Implement `handleSearchInputChange` with 300ms debounce matching codebase patterns
- Update SearchBar onChange to use debounced handler
- Update SearchBar onSearch to clear timeout for immediate search on Enter/button click
- Update Autocomplete onChange to immediately call onCategoryChange when categories selected
- Add cleanup useEffect to prevent memory leaks on component unmount
- Backward compatible: Search button and Enter key still work for immediate search
- Improves UX: Fewer API calls, automatic filtering, no manual triggers needed
- File modified: src/sections/affiliates/components/commission-product-table.tsx

## 1.0.284 (2026-02-15)

- **FIX**: Fix category filter and search in affiliate detail product list
- Add category filtering support to affiliate product commissions in detail view
- Update `getAffiliateProductCommissions` repository method to accept `categoryNames` parameter (src/repositories/commission.repository.ts:158-176)
- Add filters object to API request matching global commission method pattern
- Add `categoryNamesFilter` state to track selected categories in affiliates-detail-view.tsx
- Update `loadProductCommissions` function to support categoryNames parameter
- Implement `handleCategoryChange` handler to process category filter changes
- Replace empty stub `onCategoryChange={() => {}}` with real handler
- Category selection now properly filters product list
- Search and category filter work together correctly
- Page resets to 1 when category filter changes
- Request deduplication includes categoryNames in cache key
- Fixes issue where category dropdown and search had no effect in "Danh sách sản phẩm" section

## 1.0.283 (2026-02-15)

- **FEAT**: Display ON/OFF for auto-add products switch in affiliate detail view
- Update "Tự động thêm sản phẩm mới" section in commission settings to show "ON" or "OFF" instead of "Hoạt động"/"Không hoạt động"
- Add new translation keys "on" and "off" to both English and Vietnamese i18n files (src/i18n/en/common.json, src/i18n/vi/common.json)
- Update commission-settings-section.tsx to use t('on')/t('off') instead of t('active')/t('inactive')
- Cleaner, more concise status display matching modern UI patterns
- Change only affects read-only view in affiliate detail page (src/sections/affiliates/affiliates-detail-view.tsx:467-475)

## 1.0.282 (2026-02-15)

- **FEAT**: Remove actions column from product commission table in read-only mode
- Conditionally include actions column in commission-product-table.tsx based on readOnly prop
- When readOnly={true}: Actions column is completely removed from table (no "Thao tác" header, no "-" placeholder)
- When readOnly={false}: Actions column displays normally with Edit and Delete buttons
- Pattern matches selection column conditional inclusion for consistency
- Makes affiliate detail view table cleaner without unnecessary column
- Global commission settings page retains full functionality with actions column

## 1.0.281 (2026-02-15)

- **FIX**: Fix product commission table data display issue in affiliate detail view
- Add data transformation in `loadProductCommissions` to map API response fields to table interface
- Transform ProductCommission API response to CommissionProduct table format:
  - Map `code` → `productCode` (fixes empty product code column)
  - Map `name` → `productName` (fixes empty product name column)
  - Map `images.avatar` → `productImage` (fixes default avatar placeholder)
- Add import for ProductCommission type from generated types
- Product table now correctly displays product codes, names, and images
- Other columns (price, stock, commission rate, estimated commission) continue to work correctly

## 1.0.280 (2026-02-15)

- **FEAT**: Make Affiliate Detail View commission tab read-only
- Add `readOnly` prop to CommissionSettingsSection component
- Replace auto-add products toggle with read-only text display showing "Bật/Tắt" (Active/Inactive)
- Add `readOnly` prop to CommissionProductTable component
- Hide all edit buttons when in read-only mode:
  - "Add Products" button hidden
  - "Bulk Edit" button hidden
  - Edit product buttons (per row) hidden
  - Delete product buttons (per row) hidden
  - Row selection checkboxes hidden
- Actions column displays "-" placeholder in read-only mode
- Edit Default Commission Rate button remains disabled
- Search, filter, and pagination still functional
- Global commission settings page (`/affiliates-commission`) remains fully editable
- Fix handleSearch to properly reload product data with search parameter

## 1.0.279 (2026-02-15)

- **FEAT**: Redesign Affiliate Detail View with comprehensive management interface
- Replace read-only detail view with full management interface matching UI design
- Add 2-column grid header displaying:
  - Left: Name, join date, email, bank account holder, account number, bank branch, affiliate link with copy button
  - Right: Type badge (KOL/CTV/Publisher), affiliate code, phone, citizen ID, bank name, status chip
- Implement tabbed interface with 3 tabs:
  - Commission Settings: Default rate settings + auto-add products toggle
  - Performance Statistics: Placeholder for future implementation
  - Order List: Placeholder for future implementation
- Integrate commission management components in Commission Settings tab:
  - CommissionSettingsSection for default commission rate and auto-add toggle
  - CommissionProductTable for product-specific commission management (search, filter, pagination)
  - Full CRUD operations: Add products, edit commission rate, delete products, bulk edit
- Implement affiliate link generation: `https://cchat.vn/?ref=AF{affiliateCode}`
- Add copy-to-clipboard functionality with success toast notification
- Use affiliate-specific commission repository methods:
  - getAffiliateProductCommissions, addAffiliateProductCommissions
  - updateAffiliateProductCommission, deleteAffiliateProductCommission
  - bulkUpdateAffiliateProductCommissions
- Add request deduplication using refs to prevent duplicate API calls
- Add i18n translations (Vietnamese/English):
  - performanceStatistics, orderList, orderListComingSoon
  - joinDate, branch, affiliateLink, linkCopied
- Update route from `/affiliates/:id` to comprehensive management interface
- Complete redesign matches provided UI image with all sections and functionality

## 1.0.278 (2026-02-15)

- **FEAT**: Add Affiliate Detail View page
- Create new affiliate detail page at `/affiliates/:id` following Order Detail pattern
- Display comprehensive affiliate information in organized sections:
  - Header: Affiliate code, name, status chip, and type badge
  - Basic Information: Name, email, phone, type, created date with icons
  - Bank Account Information: Account holder, bank name, account number, citizen ID
  - Commission Settings: Default rate, auto-update products toggle, manage products button
  - Additional Info: Notes and last updated timestamp
  - Performance Metrics: Placeholder with link to performance page
- Update view icon navigation from `/affiliates/:id/performance` to `/affiliates/:id`
- Implement loading state with CircularProgress spinner
- Implement empty state for missing affiliate data
- Add cleanup on component unmount (clear currentAffiliate from Redux)
- Use existing Redux infrastructure: getAffiliateRequest, selectCurrentAffiliate, selectLoading
- API endpoint: `GET /api/v1/affiliates/{id}` returns full Affiliate object
- Add i18n translations for Vietnamese and English
- Color-coded status chips (Active=green, Inactive=gray)
- Type badges with different colors (KOL=primary, CTV=info, Publisher=secondary)
- Responsive layout with MUI Grid (2 columns on medium+ screens)
- Edit and delete actions remain unchanged (already working correctly)

## 1.0.277 (2026-02-13)

- **PERF**: Optimize LocalProductsManager product selection to eliminate individual API calls
- Remove individual getProductById calls when adding products to commission settings
- Transform Product[] data directly from ProductSelectionDialog instead of re-fetching
- Add productCache state to store transformed CommissionProduct data
- Replace async useEffect with synchronous useEffect that derives display data from cache
- Clean up cache when products are removed
- Remove unnecessary loading state
- Zero API calls when selecting products - instant display
- Improves performance and user experience in affiliates commission product management

## 1.0.276 (2026-02-12)

- **FIX**: Fix duplicate API calls on affiliates list page
- Add mounted ref pattern to prevent React StrictMode double-invocations
- Implement request deduplication using refs to track pending requests
- Create memoized `loadAffiliates` function with useCallback
- Update useEffect to only run once on initial mount (empty dependency array)
- Update all handler functions to explicitly call `loadAffiliates`
- Consistent with pattern used in affiliates-commission-view (v1.0.263)
- API now called only once on page load and once per user action

## 1.0.275 (2026-02-12)

- **FEAT**: Implement complete affiliates management view UI
- Add affiliates list table with TanStack Table integration
- Implement search and filtering by status and type
- Add pagination with customizable page size
- Implement CRUD actions: view, edit, delete with confirmation
- Add row selection for future bulk operations
- Connect to existing Redux store (queryAffiliatesRequest, deleteAffiliateRequest)
- Use all existing i18n keys from locale files
- Style with MUI components matching design specifications
- Display affiliate code, name, email, phone, type, and status
- Color-coded status chips (green for active, gray for inactive)
- Action buttons with proper icons (view, edit, delete)
- Navigate to create/edit/performance pages

## 1.0.274 (2026-02-11)

- **UI/UX**: Remove duplicate "Quản lý sản phẩm" header in LocalProductsManager
- Remove "Product Management" header from LocalProductsManager component
- Keep action buttons (Bulk Edit, Add Product) but remove redundant title
- Eliminate duplicate headers by relying on CommissionProductTable's "Danh sách sản phẩm" title
- Improve UI clarity by showing single "Product List" header instead of multiple headers
- Change button alignment from space-between to flex-end after removing left-side title
- Clean up all debug code (console.log statements, debug boxes) from diagnostic session

## 1.0.273 (2026-02-11)

- **UI/UX**:
- Add affiliates management.

## 1.0.263 (2026-02-11)

- **FIX**: Fix duplicate API calls on affiliates commission page
- Add mounted ref pattern to prevent StrictMode double-invocations
- Implement request deduplication using refs to track pending requests
- Memoize data loading functions with useCallback
- Update all handler functions to use memoized loaders

## 1.0.262 (2026-02-11)

- **REFACTOR**: Rename "Agent" to "Affiliates" throughout codebase
- Update routes: /agent → /affiliates, /agent-performance → /affiliates-performance, /agent-commission → /affiliates-commission
- Rename directory: src/sections/agent → src/sections/affiliates
- Update all component names, i18n keys, and type definitions from agent to affiliates
- Update navigation menu and enum values to reflect affiliate terminology

## 1.0.261 (2026-02-11)

- **FIX**: Fix commission products table pagination to use API response data
- Remove client-side pagination and filtering logic from table component
- Implement server-side pagination with manualPagination flag
- Configure TanStack Table to trigger API calls on page/size/search changes
- Use pagination.total from API for correct item count display

## 1.0.246 (2026-02-09)

- Add mock darta withdrawlRequest

## 1.0.245 (2026-02-09)

- Revert

## 1.0.244 (2026-02-09)

- **FEAT**: Add Withdrawal Request View (Quản lý yêu cầu rút tiền)
- List view with status tabs, search by agent name, bulk actions
- Detail view with status-based actions (Approve/Reject/Pay)
- Redux Toolkit + Redux-Saga state management
- i18n support (Vietnamese & English)
- Fix locale file conflicts and duplicate keys

## 1.0.234 (2026-02-09)

- **FEAT**: Add Agent Management navigation group with 4 subpages
- Add agentManagement, agent, agentPerformance, withdrawalRequest, agentCommission nav items
- Create placeholder pages: /agent, /agent-performance, /withdrawal-request, /agent-commission
- Add Vietnamese and English translations for all agent-related keys
- Export view components from src/sections/agent/index.ts

## 1.0.233 (2026-02-09)

- **FEAT**: Add Withdrawal Request Management (Quản lý yêu cầu rút tiền)
- List view with MUI Table: checkbox, agent name, amount, request date, processor, process date, status, actions
- Detail view with status-based action buttons (Approve/Reject for PENDING, Pay for APPROVED, Back for PAID/REJECTED)
- Status flow: PENDING → APPROVED → PAID, or PENDING → REJECTED
- Bulk actions: Approve, Reject (with reason dialog), Pay
- Tab-based status filter (Tất cả, Chờ duyệt, Chờ chi trả, Đã chi trả, Từ chối)
- Search by agent name
- Redux Toolkit slice + Redux-Saga for state management
- Repository with API methods: getWithdrawalRequests, getById, approve, reject, pay, bulkApprove, bulkReject, bulkPay, getTabCounts
- Routes: /withdrawal-request, /withdrawal-request/:id
- Navigation: Added to sidebar menu
- i18n: Vietnamese and English translations
- Note: Types in src/types/withdrawal-request.ts (TODO: delete when proto available)

## 1.0.232 (2026-02-03)

- enable product discount

## 1.0.231 (2026-02-03)

- bump version

## 1.0.230 (2026-02-03)

- **FIX**: Remove "Giới hạn áp dụng" (Usage Restrictions) section from Order Discount form
- Remove UsageRestrictionsSection component, related handlers, and form fields
- Remove notApplicableWithOtherPromotions, singleUsePerCustomer, totalUsageLimit from form data and API payloads

## 1.0.228 (2026-02-02)

- **FEAT**: add product discount

## 1.0.227 (2026-02-02)

- **FEAT**: Add environment file generation step to CMS GitHub Actions workflow
- Automatically sets VITE_API_URL for internal environment during build
- Matches frontend workflow pattern for consistent environment configuration

## 1.0.226 (2026-02-02)

- **FIX**: Fix update button disabled when switching to percentage discount type
- Reset discountValue to 0 when switching from fixed to percentage if value > 100
- Previously, switching from fixed (e.g., 100,000 VND) to percentage would fail validation (discountValue <= 100)

## 1.0.225 (2026-02-02)

- **FIX**: Fix discount type radio button not showing selected value when editing Order Discount
- Add apiStringToDiscountType helper in promotion.repository.ts to convert API response strings ("fixed"/"percentage") back to enum values
- Add transformPromotionResponse helper to transform API response with correct enum types
- Apply transformation to getPromotion, createPromotion, updatePromotion, pausePromotion, resumePromotion methods
- Previously, API returned "fixed"/"percentage" strings but RadioGroup expected numeric enum values (1/2)

## 1.0.224 (2026-02-02)

- **FEAT**: Improve Order Discount form UI with number formatting and 2-column layout
- Add FormattedNumberInput component (src/components/input) with comma thousand separators (1,000,000)
- Add formatInputNumber, parseInputNumber utilities to src/utils/format.ts (uses Intl.NumberFormat)
- Update DiscountConfigSection: horizontal layout for discount value + max discount when percentage type
- Update order-discount-form.tsx: 2-column Grid layout (lg breakpoint)
- Add FormattedNumberInput documentation to AGENTS.md section 8

## 1.0.223 (2026-02-02)

- **FIX**: Fix promotion toggle switch not updating after pause/resume
- Update setPausePromotionSuccess and setResumePromotionSuccess in promotionSlice to also update isEnabled field
- Previously only status field was updated, causing Switch component to not reflect the change

## 1.0.222 (2026-02-02)

- **FIX**: Update Promotion List Table UI according to Figma design
- Reorder columns: selection → index → timeRange → type → subType → name → status → toggle → actions
- Add Status column with color-coded text (green=ongoing, orange=upcoming, gray=paused, default=ended)
- Add Toggle (On/Off) column with Switch component for enabling/disabling promotions
- Update timeRange column to display start/end times on separate lines
- Update Actions column with colored icon buttons (blue edit, red delete) with rounded background
- Pin toggle and actions columns to right side of table

## 1.0.221 (2026-02-02)

- **FIX**: Fix Invoice Discount API - correct discountType conversion
- Backend requires DIFFERENT formats for fields: subType expects NUMBER (1, 2), discountType expects STRING ("fixed", "percentage")
- Add discountTypeToApiString helper to convert DiscountType enum to string format
- Add transformOrderDiscountConfig to transform only discountType field (keep subType as number)
- Fixes 422 "discountType must be one of: fixed, percentage" validation error

## 1.0.220 (2026-02-02)

- **FIX**: Fix Invoice Discount API - send enum values as numbers
- Remove incorrect enum-to-string conversion in promotion.repository.ts
- Backend expects numeric enum values (1, 2), not string values ("fixed", "auto_apply")
- Remove unused helper functions: discountTypeToApiString, orderDiscountSubTypeToApiString, transformOrderDiscountConfig
- Simplify createPromotion and updatePromotion methods to send data directly
