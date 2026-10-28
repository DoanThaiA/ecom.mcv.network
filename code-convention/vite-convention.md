#  React/TypeScript Convention - Tóm tắt

**Áp dụng:** React 18 + TypeScript + Vite projects
**Triết lý:** Code phải sạch, hiệu quả, dễ maintain và mở rộng

**📋 Tài liệu liên quan:**
- **[Testing Convention](./react-test-convention.md)** - Quy ước chi tiết về Integration Testing với Vitest & React Testing Library

---

## 1. Code Quality Cơ bản

- ✅ Code ngắn gọn, rõ ràng, dễ hiểu
- ✅ KHÔNG duplicate code (DRY principle)
- ✅ Dùng `.map`, `.filter`, `.reduce` thay vì `for` loops
- ✅ Dùng Lodash (`_`) để xử lý null/undefined
- ❌ KHÔNG commit thay đổi format không liên quan

## 2. TypeScript Strict

- ✅ Khai báo type đầy đủ cho props, state, functions
- ❌ **TUYỆT ĐỐI KHÔNG dùng `any`** (trừ khi có comment giải thích)
- ✅ Dùng `import type` cho type-only imports
- ✅ Strict mode: `noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`

## 3. Giới hạn Kích thước

- **File:** Max 300 dòng
- **Function/Component:** Max 50 dòng
- Vượt quá → refactor thành smaller components

## 4. Function Conventions

### Private Functions
- Private function PHẢI có underscore prefix: `_formatTime`
- Public/exported function KHÔNG có underscore: `formatTime`

### Parameters (≥2 params)
- NÊN dùng object destructuring thay vì positional parameters
- Ví dụ: `format({ value, emptyDisplay })` thay vì `format(value, emptyDisplay)`
- Lý do: Rõ ràng, dễ thêm/xóa params, self-documenting

### Error Handling
- Public functions NÊN có try-catch với fallback value
- KHÔNG để caller xử lý fallback bằng `|| null`

### Documentation
- Public functions PHẢI có JSDoc đầy đủ (mô tả, @param, @returns, @example)
- Private functions CÓ THỂ có JSDoc nếu logic phức tạp

## 5. Redux-Saga Architecture

### 3-Layer Pattern
```
redux/
├── apis/    # Layer 1: API wrappers
├── saga/    # Layer 2: Business logic + side effects
└── store/   # Layer 3: State management
```

### QUAN TRỌNG: Business Logic Placement
- ✅ Business logic PHẢI nằm trong **Saga layer**
- ❌ Components CHỈ lo rendering + dispatch actions
- ❌ KHÔNG được có: time conversion, object creation, loops trong UI

### Naming Conventions
- Actions PHẢI cụ thể với context: `toggleAttendanceOvertimeRequest` (KHÔNG phải `toggleOvertimeRequest`)
- Saga functions: `toggleAttendanceOvertime` (bỏ "Request" suffix)

## 6. Component Refactoring

- ❌ KHÔNG duplicate code - tạo reusable components
- ✅ Tách styled components ra file riêng
- ✅ Tạo small, focused components
- ✅ Sử dụng composition pattern
- **Kết quả:** 70-80% giảm lines of code

## 7. Comments & Documentation

### JSDoc cho Saga Functions (Tiếng Việt)
PHẢI bao gồm:
1. Mô tả tổng quan - Saga làm GÌ?
2. Flow xử lý (numbered list)
3. Input/Output parameters
4. Context - Được gọi từ đâu?

### Inline Comments
- Giải thích **WHY** (lý do), KHÔNG giải thích **WHAT** (code đã rõ)
- Giải thích business context, technical decisions, side effects, edge cases

### Khi KHÔNG cần comment
- Self-documenting code
- Obvious operations
- Type definitions đã rõ

## 8. Testing

### Coverage Requirements
- Utils functions: 100%
- Business logic: ≥90%
- Components: ≥80%

### Boundary Cases PHẢI Test
- Null/undefined
- Empty values
- Extreme numbers
- Invalid input
- Exception handling

## 9. Performance

- ✅ Lazy load ALL pages: `React.lazy(() => import('./Page'))`
- ✅ `useMemo` cho expensive computations
- ✅ `useCallback` cho callbacks
- ✅ `React.memo()` cho pure components
- ✅ Cache expensive operations

## 10. Internationalization (i18n)

- ❌ KHÔNG hard-code text
- ✅ Mọi user-facing text phải qua `t("key")`
- ✅ Sử dụng nested keys: `employee.errors.not_found`

## 11. Error Handling

- Saga: try-catch với `toastError(error)`
- Public functions: try-catch với fallback value
- Toast notifications: `toastSuccess()`, `toastError()`, `toastWarning()`

## 12. Security & Best Practices

### CẤM
- ❌ **KHÔNG Promise.all()** trong client code (một fail → tất cả fail)
- ❌ **CẤM vòng lặp vô hạn** - luôn có điều kiện dừng rõ ràng
- ❌ Recursive functions KHÔNG có base case hoặc depth limit

### Bắt buộc
- ✅ Vòng lặp PHẢI có max iterations hoặc break condition
- ✅ Recursive PHẢI có base case + MAX_DEPTH check

## 13. Pull Request Rules

- **Một PR, một việc** (feature | bug fix | refactor - KHÔNG mix)
- Screenshots/videos cho UI changes
- Test trên multiple viewports (desktop, tablet, mobile)
- Proto changes → backend PR merge trước
- Feature Flag cho chức năng mới
- No console errors trong production build

## 14. Code Review Checklist

**Structure:**
- [ ] Components < 300 dòng, functions < 50 dòng
- [ ] Business logic trong sagas, KHÔNG trong components
- [ ] No code duplication - reusable components created

**TypeScript:**
- [ ] Type đầy đủ, KHÔNG dùng `any`
- [ ] Function naming đúng (private: `_name`, public: `name`)
- [ ] Public functions có JSDoc đầy đủ

**Performance:**
- [ ] Lazy loading cho pages
- [ ] Memoization cho expensive operations

**i18n & UX:**
- [ ] i18n cho tất cả text
- [ ] Toast notifications cho user feedback
- [ ] Error handling đầy đủ

**Security:**
- [ ] KHÔNG Promise.all()
- [ ] KHÔNG vòng lặp vô hạn (có max iterations)
- [ ] Recursive có base case + depth limit

**Testing:**
- [ ] Tests cover boundary cases
- [ ] No console errors trong production
- [ ] Tested trên multiple viewports

---

**Chi tiết đầy đủ:** `/code-convention/vibe-convention.md` (1734 dòng)
**Testing chi tiết:** `/code-convention/react-test-convention.md`
