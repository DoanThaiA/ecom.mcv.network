# Agent Development Rules

## 1. Internationalization (i18n) - BẮT BUỘC
- **KHÔNG hard-code text** - Dùng `t('key')` cho tất cả UI text
- **Kiểm tra key đã có** trong `messages/vi.json`, `messages/en.json` trước khi tạo mới
- **Reuse keys từ "common"** cho text chung (save, cancel, delete, edit...)
- **Client Components**: `useTranslations('namespace')` từ `next-intl`
- **Server Components**: `await getTranslations('namespace')` từ `next-intl/server`
- **KHÔNG truyền translations qua props** - Component tự gọi useTranslations

```tsx
// ❌ SAI
<Button>Đăng nhập</Button>
<Text>{total.toLocaleString()}đ</Text>

// ✅ ĐÚNG - Client Component
'use client';
import { useTranslations } from 'next-intl';
const t = useTranslations('auth');
const tCommon = useTranslations('common');
<Button>{t('signIn')}</Button>
<Button>{tCommon('save')}</Button>

// ✅ ĐÚNG - Server Component
import { getTranslations } from 'next-intl/server';
const t = await getTranslations('auth');
```

### 1.1 i18n Key Reuse - BẮT BUỘC
- **Ưu tiên dùng keys từ `common`** trước khi tạo key mới trong namespace riêng
- **Kiểm tra `common.*` trước** khi thêm translation mới

**Các nhóm trong common:**
| Nhóm | Keys | Ví dụ |
|------|------|-------|
| `common.buttons.*` | cancel, confirm, apply, save, edit, delete, continue, submit, backToHome, viewAll, loadMore, update, close | `tCommon('buttons.cancel')` |
| `common.form.*` | fullName, email, phone, password, newPassword, confirmPassword, address, city, district, ward + placeholders | `tCommon('form.email')` |
| `common.errors.*` | required, emailInvalid, phoneInvalid, passwordRequired, passwordInvalid, confirmPasswordRequired, confirmPasswordMismatch | `tCommon('errors.emailInvalid')` |
| `common.status.*` | loading, saving, submitting, processing, updating | `tCommon('status.loading')` |
| `common.success.*` | saved, deleted, updated | `tCommon('success.saved')` |
| `common.commerce.*` | addToCart, buyNow, flashSale, outOfStock, inStock | `tCommon('commerce.addToCart')` |
| `common.auth.*` | signIn, signUp, logout | `tCommon('auth.signIn')` |
| `common.order.*` | orderNumber, orderDate, orderStatus, shippingAddress, paymentMethod, subtotal, shippingFee, discount, total | `tCommon('order.orderNumber')` |
| `common.labels.*` | size, color, quantity, price, products, default | `tCommon('labels.quantity')` |

```tsx
// ❌ SAI - Tạo key mới cho text đã có trong common
const t = useTranslations('cart');
<Button>{t('cancel')}</Button>  // cart.cancel - KHÔNG NÊN

// ✅ ĐÚNG - Dùng key từ common
const tCommon = useTranslations('common');
<Button>{tCommon('buttons.cancel')}</Button>

// ✅ ĐÚNG - Form fields từ common
<LabeledTextField
  label={tCommon('form.email')}
  error={tCommon('errors.emailInvalid')}
/>

// ✅ ĐÚNG - Status messages từ common
{isLoading ? tCommon('status.loading') : t('specificAction')}
```

## 2. Code Quality
- Chạy `npm run lint` sau khi hoàn thành
- Code phải pass lint trước khi commit

## 3. Version Management - BẮT BUỘC
- **Update cả `version.json` VÀ `VERSION.md`** sau mỗi task
- Semantic versioning: MAJOR.MINOR.PATCH (breaking/feature/fix)

```json
// version.json
{"version": "1.0.2"}
```
```markdown
// VERSION.md
## 1.0.2 (2025-11-14)
- Mô tả ngắn gọn thay đổi (tối đa 5 dòng)
```

## 4. File Size - BẮT BUỘC
- **Tối đa 500 dòng/file** - Tách components thành files riêng
- Mỗi component 1 file để dễ maintain

```tsx
// ✅ ĐÚNG - Tách components
// components/ProductPage/index.tsx
import { ProductHeader } from './ProductHeader';
import { ProductInfo } from './ProductInfo';

// ❌ SAI - Tất cả trong 1 file 700 dòng
```

## 5. Code Reusability
- Kiểm tra component/function tương tự đã có chưa trước khi tạo mới
- Reuse existing code thay vì duplicate

## 6. Helper/Util Functions
- Tạo trong `/lib/utils/` hoặc `/lib/helpers/` - KHÔNG tạo inline trong component

```tsx
// ❌ SAI
export function MyComponent() {
  const formatDate = (date) => { ... }  // Inline
}

// ✅ ĐÚNG
// lib/utils/format.ts
export const formatDate = (date) => { ... }
// Component
import { formatDate } from '@/lib/utils/format';
```

## 7. Styling - BẮT BUỘC
- **Sử dụng Tailwind CSS** - KHÔNG viết CSS trực tiếp hoặc inline styles
- Font config trong `config/fonts.ts`

```tsx
// ❌ SAI
<div style={{ display: 'flex', padding: '16px' }}>

// ✅ ĐÚNG
<div className="flex p-4 bg-blue-500 hover:bg-blue-600">
```

## 8. UI Components & Icons - BẮT BUỘC
- **Sử dụng Radix UI components** từ `@radix-ui/themes` - KHÔNG dùng thẻ HTML trực tiếp
- **Radix Icons**: `@radix-ui/react-icons` cho icons
- Images trong `/assets` chỉ cho logo, photos, illustrations

```tsx
// ❌ SAI - Dùng thẻ HTML
<div className="flex">...</div>
<span>Text</span>
<button onClick={...}>Click</button>
<p>Paragraph</p>
<h1>Heading</h1>

// ✅ ĐÚNG - Dùng Radix components
import { Box, Flex, Text, Button, Heading } from '@radix-ui/themes';
import { BellIcon } from '@radix-ui/react-icons';
<Flex>...</Flex>
<Text>Text</Text>
<Button onClick={...}><BellIcon /> Click</Button>
<Text as="p">Paragraph</Text>
<Heading as="h1">Heading</Heading>
```

**Common Radix components**: `Box`, `Flex`, `Grid`, `Text`, `Heading`, `Button`, `Card`, `Dialog`, `TextField`, `TextArea`, `Select`, `Checkbox`, `RadioGroup`, `Switch`, `Badge`, `Avatar`, `Separator`, `Table`, `Tabs`, `DropdownMenu`, `Tooltip`

## 8.1 Shared Form Components
- **LabeledTextField**: `@/components/common/LabeledTextField` - Chuẩn text field của app với label, error handling
- **PrimaryButton**: `@/components/common/PrimaryButton` - Chuẩn primary button của app (màu cam brand color, loading state)
- **OutlineButton**: `@/components/common/OutlineButton` - Button viền đen, dùng cho Cancel/secondary actions trong dialogs
- **GradientButton**: `@/components/common/GradientButton` - Button gradient cam, dùng cho Confirm/primary actions trong dialogs

```tsx
// ❌ SAI - Tự style TextField.Root và Button
<TextField.Root value={email} className="border..." />
<Button className="bg-[#FAA63E]...">Submit</Button>

// ✅ ĐÚNG - Dùng shared components đã chuẩn hóa
import { LabeledTextField } from '@/components/common/LabeledTextField';
import { PrimaryButton } from '@/components/common/PrimaryButton';
import { OutlineButton } from '@/components/common/OutlineButton';
import { GradientButton } from '@/components/common/GradientButton';

<LabeledTextField
  label={t('email')}
  value={email}
  onChange={handleChange}
  error={error}
/>
<PrimaryButton onClick={handleSubmit} isLoading={isLoading}>
  {t('submit')}
</PrimaryButton>

{/* Dialog buttons */}
<OutlineButton onClick={onCancel}>{t('cancel')}</OutlineButton>
<GradientButton onClick={onConfirm}>{t('confirm')}</GradientButton>
```

**LabeledTextField props**: `label`, `value`, `onChange`, `type`, `error`, `disabled`, `labelPosition` ('above' | 'placeholder')
**PrimaryButton props**: `onClick`, `disabled`, `isLoading`, `loadingText`, `fullWidth`
**OutlineButton props**: `onClick`, `disabled`, `isLoading`, `loadingText`, `fullWidth`, `className`
**GradientButton props**: `onClick`, `disabled`, `isLoading`, `loadingText`, `fullWidth`, `className`

## 9. Server-Side Rendering (SSR)
- **Ưu tiên Server Components** - Chỉ dùng `'use client'` khi cần state/events/browser APIs

```tsx
// ❌ SAI - Không cần 'use client'
'use client';
export default function Page() { return <div>Static</div>; }

// ✅ ĐÚNG - Server Component
import { getTranslations } from 'next-intl/server';
export default async function Page() {
  const t = await getTranslations('home');
  return <div>{t('title')}</div>;
}

// ✅ ĐÚNG - Client Component khi cần interactivity
'use client';
import { useState } from 'react';
export function Counter() {
  const [count, setCount] = useState(0);
  return <button onClick={() => setCount(c => c + 1)}>{count}</button>;
}
```

## 10. Notifications - BẮT BUỘC
- **Sử dụng `@/lib/helpers/toastHelper`** - KHÔNG import `toast` từ `sonner` trực tiếp

```tsx
// ❌ SAI
import { toast } from 'sonner';
toast.success(message);

// ✅ ĐÚNG
import { showSuccessToast, showErrorToast } from '@/lib/helpers/toastHelper';
showSuccessToast(t('success.saved'));
showErrorToast(error);  // Tự động extract error.message
```

**Functions**: `showSuccessToast`, `showErrorToast`, `showInfoToast`, `showWarningToast`, `showLoadingToast`

## 11. Submit Buttons & Loading States - BẮT BUỘC
- **Tất cả submit buttons phải có loading state**
- Disable button khi loading, hiển thị loading text

```tsx
// ❌ SAI - Không có loading state
<Button onClick={handleSubmit}>Submit</Button>

// ✅ ĐÚNG
<Button
  onClick={handleSubmit}
  disabled={isLoading}
  className="disabled:opacity-50 disabled:cursor-not-allowed"
>
  {isLoading ? t('submitting') : t('submit')}
</Button>
```

## 12. Dialog Components - BẮT BUỘC
- **Dialog.Content phải có `onPointerDownOutside={preventDialogCloseOnToast}`**
- **Dialog.Content phải có `Dialog.Title`** (dùng VisuallyHidden nếu cần ẩn)

```tsx
import { Dialog, VisuallyHidden } from '@radix-ui/themes';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';

<Dialog.Content onPointerDownOutside={preventDialogCloseOnToast}>
  <VisuallyHidden><Dialog.Title>Title</Dialog.Title></VisuallyHidden>
  {/* hoặc <Dialog.Title>Visible Title</Dialog.Title> */}
</Dialog.Content>
```

## 13. Redux Action Payload Types - BẮT BUỘC
- **Định nghĩa type riêng trước khi tạo action** - KHÔNG inline type

```tsx
// ❌ SAI - Inline type
export const loginRequest = createAction<{ email: string; password: string }>('auth/login');

// ✅ ĐÚNG - Type riêng
export type LoginPayload = { email: string; password: string; onSuccess?: () => void };
export const loginRequest = createAction<LoginPayload>('auth/loginRequest');
```

## 14. Redux Saga Patterns
- **Chỉ thêm callbacks (onSuccess) khi cần** (navigation, close dialog...)
- Toast/error handling xử lý trong saga bằng toastHelper

```tsx
// ✅ Saga đơn giản
export type LoginPayload = { email: string; password: string };

// ✅ Saga với callback khi cần navigation
export type LoginPayload = {
  email: string;
  password: string;
  onSuccess?: () => void;  // Chỉ khi cần
};
```

## 15. Storage Service - BẮT BUỘC
- **Sử dụng `storageService`** từ `@/lib/services/storage.service`
- KHÔNG import `localStorage` trực tiếp

```tsx
// ❌ SAI
import { localStorage } from '@/lib/services/localStorage';
const token = localStorage.getItem(localStorageKeys.ACCESS_TOKEN);

// ✅ ĐÚNG
import { storageService } from '@/lib/services/storage.service';
const token = storageService.getToken();
storageService.setAuthTokens(token, refreshToken, expires);
storageService.clearAuth();
```

**Methods**: `getToken/setToken`, `getUser/setUser`, `getCart/setCart/addCartItem`, `setAuthTokens`, `clearAuth`, `isAuthenticated`

## 16. TypeScript Types in Repository - BẮT BUỘC
- **Sử dụng types từ `@/types`** - KHÔNG inline types trong repository
- Dùng `any` tạm thời nếu chưa có type, sau đó tạo type trong `types/`

```tsx
// ❌ SAI - Inline type
interface ProductResponse { id: string; }  // Trong repository file

// ✅ ĐÚNG
import { Product, PaginatedResponse } from '@/types';
async getProducts(): Promise<PaginatedResponse<Product>> { ... }
```

## 17. Safe Array Length Access - BẮT BUỘC
- **Sử dụng safe pattern** khi truy cập `.length` của arrays có thể undefined/null
- Pattern: `(arr?.length ?? 0)` để tránh "Cannot read property 'length' of undefined"
- Helper function có sẵn: `safeLength()` từ `@/lib/helpers/arrayHelper`

```tsx
// ❌ SAI - Có thể gây lỗi undefined
if (items.length > 0) { ... }
const count = arr.length;

// ✅ ĐÚNG - Sử dụng optional chaining với nullish coalescing
if ((items?.length ?? 0) > 0) { ... }
const count = arr?.length ?? 0;

// ✅ ĐÚNG - Sử dụng helper function
import { safeLength } from '@/lib/helpers/arrayHelper';
if (safeLength(items) > 0) { ... }
const count = safeLength(arr);
```

## 18. Data Processing & Lodash - BẮT BUỘC
- **Sử dụng lodash** cho data processing
- **Early return pattern** - Tránh nested conditions

```tsx
import _ from 'lodash';

// ✅ ĐÚNG - Lodash + Early return
function getActiveUsers(users: User[]): User[] {
  if (_.isEmpty(users)) return [];
  const active = _.filter(users, { status: 'active' });
  if (_.isEmpty(active)) return [];
  return _.orderBy(active, ['lastLogin'], ['desc']);
}

// ❌ SAI - Nested conditions
function getActiveUsers(users: User[]): User[] {
  if (users) {
    if (users.length > 0) {
      const active = users.filter(u => u.status === 'active');
      if (active.length > 0) {
        return active.sort(...);
      }
    }
  }
  return [];
}
```

**Common lodash**: `_.isEmpty`, `_.get`, `_.pick`, `_.omit`, `_.orderBy`, `_.filter`, `_.map`, `_.uniq`, `_.groupBy`, `_.cloneDeep`, `_.debounce`

## 19. Number/Date Formatting - BẮT BUỘC
- **Sử dụng `@/lib/utils/format`** - KHÔNG tạo inline format functions
- KHÔNG dùng `toLocaleString()` hoặc `Intl.NumberFormat` trực tiếp

```tsx
// ❌ SAI
const formatPrice = (n) => n.toLocaleString('vi-VN') + 'đ';  // Inline
<Text>{total.toLocaleString('vi-VN')}đ</Text>  // Direct

// ✅ ĐÚNG
import { formatPrice, formatDate, formatPriceRange } from '@/lib/utils/format';
<Text>{formatPrice(299000)}</Text>           // "299,000đ"
<Text>{formatDate('2024-01-15')}</Text>      // "15/01/2024"
<Text>{formatPriceRange(100000, 500000)}</Text>  // "100,000đ — 500,000đ"
```

**Functions**: `formatPrice`, `formatNumber`, `formatPercentage`, `formatTime`, `formatCountdown`, `formatDate`, `formatPriceRange`

## 20. API Base URL - BẮT BUỘC
- **Sử dụng `API_BASE_URL` từ `@/lib/config/api`** - KHÔNG định nghĩa lại trong mỗi file
- URL được config trong `.env`: `NEXT_PUBLIC_API_URL=https://internalcchatapi.mmenu.io/api/v1`

```tsx
// ❌ SAI - Định nghĩa lại API_BASE_URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// ✅ ĐÚNG - Import từ config
import { API_BASE_URL } from '@/lib/config/api';
const url = `${API_BASE_URL}/shop/products`;
```

## 21. CSS Units cho Responsive Design

### Font Sizes - BẮT BUỘC dùng REM
- **KHÔNG dùng px cho font-size** - breaks accessibility
- Dùng Tailwind classes (`text-base`, `text-sm`, `text-lg`) hoặc arbitrary rem (`text-[1.125rem]`)
- Tailwind CSS mặc định đã sử dụng rem cho font sizes

### Spacing/Padding/Margin - Khuyến khích REM
- Ưu tiên Tailwind classes (`p-4`, `m-2`, `gap-3`) - đã là rem
- Khi cần arbitrary values, ưu tiên rem (`p-[1.5rem]`)

### Chấp nhận PX cho:
- Fixed image/thumbnail sizes (`w-[100px]`, `h-[80px]`)
- Icon sizes khi cần exact dimensions
- Border widths (`border-2`)
- Box shadows
- Các chi tiết visual nhỏ cần pixel-perfect

```tsx
// ❌ SAI - px cho font size (breaks accessibility)
<Text style={{ fontSize: '16px' }}>Text</Text>
<Text className="text-[16px]">Text</Text>

// ✅ ĐÚNG - Tailwind classes cho text (mặc định là rem)
<Text className="text-base">Text</Text>           // 1rem = 16px
<Text className="text-sm">Small text</Text>       // 0.875rem = 14px
<Text className="text-[1.125rem]">18px equivalent</Text>

// ✅ ĐÚNG - Tailwind classes cho spacing
<Box className="p-4">Padding 1rem</Box>           // 1rem = 16px
<Flex className="gap-2">Gap 0.5rem</Flex>         // 0.5rem = 8px

// ✅ ĐÚNG - px cho fixed dimensions, borders, shadows
<Box className="w-[100px] h-[100px]">Thumbnail</Box>
<Flex className="border-2 shadow-md">Container</Flex>
<Box className="shadow-[0_2px_4px_rgba(0,0,0,0.1)]">Shadow</Box>
```

### Tailwind Spacing Scale (rem-based):
| Class | Size | Pixels (base 16px) |
|-------|------|-------------------|
| `p-1` | 0.25rem | 4px |
| `p-2` | 0.5rem | 8px |
| `p-4` | 1rem | 16px |
| `p-6` | 1.5rem | 24px |
| `p-8` | 2rem | 32px |

### Tại sao REM quan trọng cho Accessibility:
- Users có thể tăng browser default font size (phổ biến với người khiếm thị)
- REM-based layouts sẽ scale phù hợp, giữ readability
- PX cho font sizes sẽ ignore user preferences → accessibility issue

**Note**: Rule này áp dụng cho code mới. Existing code không yêu cầu refactor.

## 22. Figma MCP Tools - Xử lý Rate Limit

Khi làm việc với Figma designs, có 2 MCP tools để lấy thông tin:
- `mcp__figma-developer-mcp__get_figma_data` - Lấy layout, content, visuals, component info
- `mcp__figma__get_design_context` - Generate UI code từ Figma node

**Nếu bị rate limit với 1 tool, hãy thử tool còn lại:**

```
// Tool 1 bị rate limit
mcp__figma-developer-mcp__get_figma_data → Rate limit error

// Thử Tool 2
mcp__figma__get_design_context → Có thể hoạt động
```
