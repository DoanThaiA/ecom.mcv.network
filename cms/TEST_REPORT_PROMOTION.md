# Promotion Feature Test Report
**Date:** 2025-12-29
**Version:** 1.0.159
**Tester:** Claude

## Test Summary

| Feature | Status | Notes |
|---------|--------|-------|
| Promotion List Page | PASSED | Shows all promotions with tabs, search, pagination |
| Create Shock Deal | PASSED | Form works, API call successful |
| Edit Shock Deal | PARTIAL | Data loads but benefit tiers missing (backend issue) |
| Pause Promotion | PASSED | Button toggles to "Tiếp tục" |
| Resume Promotion | PASSED | Button toggles to "Tạm dừng", toast shown |
| Delete Promotion | PASSED | Confirmation dialog, deletion successful |
| **Product Features** | | |
| Multiple Products in 1 Tier | **BUG** | Only 1 product added when selecting multiple |
| Multiple Tiers | PASSED | "+ Thêm mức ưu đãi" button works |
| Product Selection Dialog | PASSED | Search, pagination, select/deselect all work |
| Remove Product from Tier | PASSED | Delete button removes product correctly |

---

## Detailed Test Results

### 1. Promotion List Page
**Status:** PASSED

**Tested:**
- Page loads at `/promotion`
- Shows 4 promotion type cards (only "Mua kèm deal sốc" active)
- Promotions table displays correctly
- Tabs work: Tất cả, Đang diễn ra, Tạm dừng, Sắp diễn ra, Đã kết thúc
- Pagination shows correct total count

**Fixed Bug:**
- API returns `docs` and `totalDocs` but FE expected `data` and `total`
- Fixed in `src/repositories/promotion.repository.ts` by transforming API response

### 2. Create Shock Deal
**Status:** PASSED

**Tested:**
- Navigate to `/shock-deal/create`
- Fill form: name, start date, end date
- Add benefit tier with min order value
- Select gift product via dialog
- Submit form → redirects to list with new promotion

**API Request:**
```json
{
  "type": 1,
  "name": "Test Promotion Claude",
  "startTime": "2025-12-28T17:00:00.000Z",
  "endTime": "2026-01-30T17:00:00.000Z",
  "bundleDeal": {
    "subType": 1,
    "tiers": [{
      "minOrderValue": 100000,
      "giftProductIds": ["694f8d8c0c3427a36bc35780"]
    }]
  }
}
```

### 3. Edit Shock Deal
**Status:** PARTIAL (Backend Issue)

**Tested:**
- Navigate to `/shock-deal/edit/:id`
- Form loads with basic info (name, dates)

**Issue Found:**
- Benefit tier data (minOrderValue, giftProducts) not loading
- **Root Cause:** Backend API `GET /promotions/:id` doesn't return `bundleDeal` field
- API Response missing benefit tiers data

**This is a BACKEND BUG - not FE issue.**

### 4. Pause Promotion
**Status:** PASSED

**Tested:**
- Click "Tạm dừng" button on edit page
- API call `PATCH /promotions/:id/pause` successful
- Button text changes to "Tiếp tục"

### 5. Resume Promotion
**Status:** PASSED

**Tested:**
- Click "Tiếp tục" button on edit page
- API call `PATCH /promotions/:id/resume` successful
- Button text changes to "Tạm dừng"
- Toast message: "Kích hoạt lại chương trình thành công"

### 6. Delete Promotion
**Status:** PASSED

**Tested:**
- Click delete button on promotion row
- Confirmation dialog appears: "Bạn có chắc chắn muốn xoá chương trình khuyến mại?"
- Click "Xoá" → promotion deleted
- List updates correctly (total decreases)

---

## Product Features Tests

### 7. Multiple Products in 1 Tier
**Status:** BUG FOUND

**Tested:**
- Open product selection dialog
- Select 3 products (Áo thun Kristy, Áo kiểu Kysine, Áo kiểu cổ hoa trai)
- Button shows "Thêm sản phẩm(3)"
- Click to add products

**Issue Found:**
- Only 1 product (Áo thun Kristy) was added to the tier
- Expected: All 3 selected products should be added
- **This is a FE BUG** - multiple product selection doesn't work

### 8. Multiple Tiers
**Status:** PASSED

**Tested:**
- Click "+ Thêm mức ưu đãi" button
- Second tier row appears with:
  - New row number (2)
  - Empty minOrderValue field
  - "+ Thêm sản phẩm" button
  - Delete tier button

### 9. Product Selection Dialog
**Status:** PASSED

**Tested:**
- **Search:** Typing "áo" filters products correctly
- **Pagination:** 103 products, 11 pages - clicking page 2 shows different products
- **Select:** Checkbox selects product, button shows count "(1)"
- **Deselect:** Clicking selected checkbox removes selection, button disabled

### 10. Remove Product from Tier
**Status:** PASSED

**Tested:**
- Click delete button next to product in tier
- Product removed from tier
- Tier shows "+ Thêm sản phẩm" button again

---

## Bugs Found

### 1. [FIXED] API Response Structure Mismatch
**Location:** `src/repositories/promotion.repository.ts`
**Issue:** API returns `{ docs, totalDocs }` but FE expected `{ data, total }`
**Fix:** Added transformation in `queryPromotions` method
**Status:** Fixed

### 2. [BACKEND] Benefit Tiers Not Returned in GET /promotions/:id
**Location:** Backend API
**Issue:** `GET /promotions/:id` response missing `bundleDeal.tiers` data
**Impact:** Edit form cannot display minOrderValue and gift products
**Status:** Requires backend fix

### 3. [FE] Multiple Product Selection Only Adds First Product
**Location:** Product Selection Dialog / Benefit Tiers Section
**Issue:** When selecting multiple products in the dialog, only the first product is added to the tier
**Reproduce:**
1. Open product selection dialog
2. Select 3 products
3. Click "Thêm sản phẩm(3)"
4. Only 1 product appears in the tier
**Status:** Needs FE fix

---

## Missing Features

1. **Other Promotion Types Disabled**
   - "Giảm giá sản phẩm" - button disabled
   - "Giảm giá hoá đơn" - button disabled
   - "Combo Khuyến Mãi" - button disabled
   - Only "Mua kèm deal sốc" is implemented

2. **No Status Column in Table**
   - Table shows: #, Loại, Phân loại, Tên, Thời gian, Thao tác
   - Missing: Status (Đang diễn ra/Tạm dừng/etc.)

3. **No Success Toast on Create/Delete**
   - Create promotion: no success toast (just redirect)
   - Delete promotion: no success toast

---

## Redundant Features

None identified.

---

## Recommendations

1. **Backend Priority:** Fix `GET /promotions/:id` to return `bundleDeal` data
2. **Add Status Column:** Show promotion status in the table
3. **Add Toast Notifications:** Show success messages for create/delete operations
4. **Implement Other Promotion Types:** Enable the disabled buttons when ready

---

## Files Modified During Testing

1. `src/repositories/promotion.repository.ts` - Fixed API response transformation
