# Agent Development Rules

> **🔴 QUAN TRỌNG**: File này chứa TẤT CẢ các quy tắc development cho project CMS.
> Claude Code sẽ tự động đọc file này thông qua `CLAUDE.md`.

---

## 1. Internationalization (i18n) - BẮT BUỘC
- **BẮT BUỘC: Không được hard-code text** - Tất cả text hiển thị trong UI/Page phải sử dụng hệ thống translations
- **BẮT BUỘC: ƯU TIÊN TÁI SỬ DỤNG keys đã có** - LUÔN kiểm tra và dùng lại keys sẵn có trước khi tạo mới
- **BẮT BUỘC: KHÔNG được tạo keys trùng lặp** - Mỗi nghĩa chỉ có MỘT key duy nhất
- **Luôn sử dụng `t('key')`** để hiển thị text, giống như `t('customers')`, `t('save')`, etc.
- **Phải cấu hình key-value trong các file ngôn ngữ** trong folder `src/i18n/` (vi/common.json, en/common.json)
- Sử dụng hook `useTranslation()` từ `react-i18next` để lấy translations

### Quy trình bắt buộc khi triển khai UI/Page:

#### Bước 0: Kiểm tra và tái sử dụng keys đã có (BẮT BUỘC)
```
⚠️ TRƯỚC KHI tạo key mới:
1. ĐỌC file src/i18n/vi/common.json và en/common.json
2. TÌM key có nghĩa giống/tương tự -> DÙNG LẠI
3. CHỈ tạo mới NẾU không có key phù hợp

Keys CHUNG thường dùng:
- Actions: save, cancel, delete, update, create, edit, add, remove, close, search
- Status: active, inactive, pending, completed, failed, success, error
- Common: name, description, email, phone, address, status, date, time, price, quantity

❌ SAI: "productSave", "customerName", "userEmail" (dùng "save", "name", "email")
✅ ĐÚNG: "productBarcode", "costPrice" (nghĩa đặc biệt)
```

#### Các bước tiếp theo:
```tsx
// 1. Thêm vào vi/common.json và en/common.json
{ "productBarcode": "Mã vạch" }  // vi
{ "productBarcode": "Barcode" }   // en

// 2. Sử dụng trong component
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<Typography>{t('name')}</Typography>  // Dùng key chung
<Typography>{t('productBarcode')}</Typography>  // Key đặc biệt
<Button>{t('save')}</Button>  // KHÔNG tạo "productSave"
```

### ⚠️ LƯU Ý QUAN TRỌNG:
1. **ĐỌC file i18n TRƯỚC** - Kiểm tra keys đã có trước khi tạo mới
2. **TÁI SỬ DỤNG TUYỆT ĐỐI** - Dùng lại keys chung (save, cancel, name, email, etc.)
3. **KHÔNG TRÙNG LẶP** - Mỗi nghĩa CHỈ MỘT key duy nhất
4. **KHÔNG hard-code text** - Luôn dùng t('key')
5. **ĐỒNG BỘ** vi/common.json và en/common.json - cùng keys

## 2. Code Quality
- **Chạy lại lint** sau khi hoàn thành chỉnh sửa
- Code phải pass lint trước khi commit
- Sử dụng: `npm run fm:fix` để kiểm tra

## 3. Version Management - BẮT BUỘC
- **BẮT BUỘC: Cập nhật version sau mỗi task hoàn thành**
- **PHẢI update cả `version.json` VÀ `versions.MD`**
- **BẮT BUỘC: Changelog trong versions.MD không quá 6 dòng** - Phải tóm tắt ngắn gọn
- Tuân thủ semantic versioning: MAJOR.MINOR.PATCH

### Quy tắc versioning:
1. **MAJOR version** (x.0.0) - Breaking changes, API changes lớn
2. **MINOR version** (0.x.0) - New features, không breaking
3. **PATCH version** (0.0.x) - Bug fixes, improvements

### Quy trình bắt buộc khi hoàn thành task:

#### Bước 1: Update version.json
```json
// Trước: {"version": "1.0.1"}
// Sau:  {"version": "1.0.2"}
```

#### Bước 2: Update versions.MD
```markdown
## 1.0.2 (2025-11-15)
- **FEAT/FIX/BREAKING**: Mô tả ngắn gọn task (1 dòng)
- Thay đổi chính 1
- Thay đổi chính 2
- Thay đổi chính 3 (nếu cần)
- Ghi rõ breaking changes (nếu có)
- KHÔNG QUÁ 6 DÒNG - Phải tóm tắt!
```

### Mẫu versioning:

#### ✅ ĐÚNG - Update version sau khi hoàn thành task:
```bash
# Task: Add new customer management feature

# Bước 1: Hoàn thành code
# Bước 2: Chạy lint và fix errors
# Bước 3: Update version.json (1.0.1 -> 1.0.2)
# Bước 4: Update versions.MD với changelog
```

#### ❌ SAI - Không update version:
```bash
# Task: Add new customer management feature
# Hoàn thành code và commit
# Quên update version.json và versions.MD  ❌ KHÔNG ĐƯỢC!
```

### Mẫu viết changelog trong versions.MD:

#### ✅ ĐÚNG - Changelog ngắn gọn (≤ 6 dòng):
```markdown
## 1.0.39 (2025-11-18)
- **FEAT**: Implement user management page with CRUD operations
- Create UserView component with table, search, and pagination
- Add CreateUserDialog and EditUserDialog components
- Integrate with user API endpoints
- Add translation keys: createUser, editUser, userManagement
- Export components from src/sections/user/index.ts
```

#### ❌ SAI - Changelog quá dài (> 6 dòng):
```markdown
## 1.0.39 (2025-11-18)
- **FEAT**: Implement user management page
- Create UserView component based on Figma design (node-id=123-456)
- Table specifications: sticky header, pagination, sorting, search
- Add CreateUserDialog component with form validation
- Dialog specifications: 512px width, 14px border radius, etc.
- Add EditUserDialog component with similar design
- Form fields: name, email, phone, role, status
- Add translation keys for all labels and buttons
- Integrate with GET /users, POST /users, PUT /users, DELETE /users APIs
- Export all components from src/sections/user/index.ts
- Follow AGENTS.md guidelines for table and dialog components
❌ QUÁ DÀI! Cần tóm tắt lại!
```

### ⚠️ LƯU Ý QUAN TRỌNG:
1. **LUÔN update version** sau mỗi task hoàn thành
2. **versions.MD phải có** mô tả chi tiết về thay đổi
3. **KHÔNG QUÁ 6 DÒNG** - Mô tả phải ngắn gọn, súc tích, tập trung vào điểm chính
4. **Đồng bộ** version giữa version.json và versions.MD
5. **Bump version đúng loại**: feature = MINOR, fix = PATCH

## 4. File Size
- **1 file không quá 500 dòng**
- Nếu file vượt quá 500 dòng, phải tách thành nhiều file nhỏ hơn
- Tách theo logic: components, utilities, types, constants

## 5. Code Reusability
- **Không tự tạo ra cái mới** - Ưu tiên dùng lại nếu được
- Kiểm tra xem đã có component/function tương tự chưa
- Reuse existing code thay vì duplicate

## 6. Common/Helper/Util Functions
- **Tạo folder và file phù hợp** hoặc dùng lại file đã có
- Structure:
  ```
  /src
    /utils      - Utility functions
    /helpers    - Helper functions
    /constants  - Constants
  ```

### Mẫu tổ chức helper functions:

#### ❌ Sai - Tạo function trong component:
```tsx
// components/MyComponent.tsx
export function MyComponent() {
  const formatDate = (date: Date) => { ... }  // Không nên
  const validateEmail = (email: string) => { ... }  // Không nên
}
```

#### ✅ Đúng - Tạo file utils:
```tsx
// src/utils/format.ts
export const formatDate = (date: Date) => { ... }

// src/utils/validation.ts
export const validateEmail = (email: string) => { ... }

// components/MyComponent.tsx
import { formatDate } from '@/utils/format';
import { validateEmail } from '@/utils/validation';
```

## 7. Styling - BẮT BUỘC
- **BẮT BUỘC: Sử dụng Material-UI (MUI) styling system**
- **Sử dụng MUI's `sx` prop** cho inline styling thay vì CSS files
- **Sử dụng MUI's `styled()` API** cho complex styling
- **KHÔNG được viết CSS trực tiếp** trong file `.css` (trừ global styles)
- Font configuration: Được quản lý trong theme configuration

### MUI Styling Usage:

#### ❌ Sai - Viết CSS trực tiếp hoặc inline styles:
```tsx
// Không dùng inline styles
<div style={{ display: 'flex', padding: '16px', backgroundColor: '#3b82f6' }}>
  Content
</div>

// Không tạo CSS file mới cho styling đơn giản
// styles.css
.my-container {
  display: flex;
  padding: 16px;
  background-color: #3b82f6;
}
```

#### ✅ Đúng - Sử dụng MUI sx prop:
```tsx
import { Box } from '@mui/material';

<Box sx={{ display: 'flex', p: 2, bgcolor: 'primary.main' }}>
  Content
</Box>

// Responsive design
<Box sx={{
  display: 'flex',
  flexDirection: { xs: 'column', md: 'row' },
  gap: 2,
  p: 2,
  bgcolor: 'primary.main',
  '&:hover': {
    bgcolor: 'primary.dark',
  },
}}>
  Content
</Box>
```

#### ✅ Đúng - Sử dụng styled() API cho complex components:
```tsx
import { styled } from '@mui/material/styles';
import { Box } from '@mui/material';

const StyledBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: theme.spacing(2),
  backgroundColor: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

<StyledBox>Content</StyledBox>
```

### ⚠️ LƯU Ý QUAN TRỌNG:
1. **ƯU TIÊN dùng `sx` prop** cho styling đơn giản
2. **Dùng `styled()` API** khi cần tái sử dụng styled component
3. **LUÔN sử dụng theme values** thay vì hard-code: `theme.spacing()`, `theme.palette.*`
4. **KHÔNG hard-code colors, spacing, breakpoints**

## 8. Reusable Input Components - BẮT BUỘC

### FormattedNumberInput
- **BẮT BUỘC: Sử dụng `FormattedNumberInput`** cho tất cả input nhập số tiền, số lượng lớn
- **Import từ**: `src/components/input`
- **Tự động format**: Hiển thị số với dấu phẩy ngăn cách hàng ngàn (1,000,000)
- **Sử dụng Intl.NumberFormat**: Đảm bảo consistent cross-browser

#### Props:
| Prop | Type | Description |
|------|------|-------------|
| `value` | `number \| undefined \| null` | Giá trị số (không format) |
| `onChange` | `(value: number \| undefined) => void` | Callback khi giá trị thay đổi |
| `suffix` | `string` | Text hiển thị sau input (VD: "VND", "%") |
| `min` | `number` | Giá trị tối thiểu |
| `max` | `number` | Giá trị tối đa |
| `allowEmpty` | `boolean` | Cho phép để trống (default: true) |

#### Ví dụ sử dụng:

```tsx
import { FormattedNumberInput } from 'src/components/input';

// Input số tiền với suffix VND
<FormattedNumberInput
  value={price}
  onChange={(value) => setPrice(value ?? 0)}
  suffix="VND"
  min={0}
/>

// Input số lượng cho phép để trống
<FormattedNumberInput
  value={quantity}
  onChange={setQuantity}
  min={1}
  allowEmpty
/>
```

#### Utilities liên quan (trong `src/utils/format.ts`):
- `formatInputNumber(value)` - Format số thành string có dấu phẩy: `1000000` → `"1,000,000"`
- `parseInputNumber(formatted)` - Parse string về số: `"1,000,000"` → `1000000`

### ⚠️ LƯU Ý QUAN TRỌNG:
1. **LUÔN dùng FormattedNumberInput** cho input số tiền, giảm giá, số lượng lớn
2. **KHÔNG dùng TextField type="number"** cho số lớn - khó đọc khi không có separator
3. **Value truyền vào là số thuần** - component tự format hiển thị
4. **onChange trả về số thuần** - không cần parse

---

## 9. UI Components & Icons
- **Sử dụng Material-UI (MUI)** cho tất cả UI components
- **Sử dụng Material Icons** (`@mui/icons-material`) cho tất cả icons
- **Chỉ sử dụng Iconify** (`@iconify/react`) cho icons không có trong Material Icons

### MUI Components:
- Docs: https://mui.com/material-ui/getting-started/
- Import từ: `@mui/material`

### Material Icons:
- Docs: https://mui.com/material-ui/material-icons/
- Import từ: `@mui/icons-material`

### Iconify:
- Docs: https://iconify.design/
- Import từ: `@iconify/react`

### Mẫu sử dụng UI & Icons:

#### ❌ Sai - Tự tạo custom SVG icons khi đã có sẵn:
```tsx
const MyIcon = () => (
  <svg width="16" height="16">
    <path d="..." />
  </svg>
);

<div className="custom-button">Click me</div>
```

#### ✅ Đúng - Sử dụng MUI & Material Icons:
```tsx
import { Button } from '@mui/material';
import { Notifications, ExpandMore } from '@mui/icons-material';

<Button variant="outlined" startIcon={<Notifications />}>
  Notifications
</Button>
```

#### ✅ Đúng - Sử dụng Iconify cho icons đặc biệt:
```tsx
import { Icon } from '@iconify/react';

<Icon icon="mdi:github" width={24} height={24} />
```

## 10. Client-Side Rendering (CSR)
- **Sử dụng React với Vite** cho Client-Side Rendering
- Tất cả components đều là Client Components (không có Server Components như Next.js)
- **Sử dụng React Router** (`react-router-dom`) cho routing

### React Component Best Practices:

#### ✅ Đúng - Standard React component:
```tsx
import { useState, useEffect } from 'react';
import { Button } from '@mui/material';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <Button onClick={() => setCount(count + 1)}>
      Count: {count}
    </Button>
  );
}
```

#### ✅ Đúng - Component với routing:
```tsx
import { useNavigate } from 'react-router-dom';
import { Button } from '@mui/material';

export function NavigationButton() {
  const navigate = useNavigate();

  return (
    <Button onClick={() => navigate('/customers')}>
      Go to Customers
    </Button>
  );
}
```

## 11. Notifications in Saga - BẮT BUỘC
- **BẮT BUỘC: Sử dụng toast utilities từ `src/utils/toast.ts`**
- **Import từ**: `src/utils/toast`
- **Các loại notifications**: success, error, info, warning

### Toast Utility Functions:
- `showSuccess(message: string)` - Hiển thị success notification
- `showError(error: unknown)` - Hiển thị error notification (tự động xử lý error types)
- `showInfo(message: string)` - Hiển thị info notification
- `showWarning(message: string)` - Hiển thị warning notification

### Mẫu sử dụng notifications trong saga:

#### ✅ Đúng - Sử dụng toast utilities:
```tsx
// redux/sagas/authSaga.ts
import { showSuccess, showError } from 'src/utils/toast';
import { call, put } from 'redux-saga/effects';

function* loginSaga(action: PayloadAction<LoginPayload>) {
  try {
    const response = yield call(authApi.login, action.payload);
    yield put(loginSuccess(response));
    showSuccess('Đăng nhập thành công');
  } catch (error) {
    yield put(loginFailure(error.message));
    showError(error);  // Tự động xử lý error type
  }
}
```

#### ✅ Đúng - Các loại notifications khác:
```tsx
import { showInfo, showSuccess, showError } from 'src/utils/toast';

function* updateProfileSaga(action: PayloadAction<ProfilePayload>) {
  try {
    showInfo('Đang cập nhật thông tin...');

    const response = yield call(profileApi.update, action.payload);
    showSuccess('Cập nhật thành công');
  } catch (error) {
    showError(error);  // Tự động xử lý error type
  }
}
```

#### ❌ SAI - Import trực tiếp từ react-toastify:
```tsx
// ❌ KHÔNG dùng cách này
import { toast } from 'react-toastify';
toast.success('Success');
toast.error(error.message || 'Error');

// ✅ PHẢI dùng toast utilities
import { showSuccess, showError } from 'src/utils/toast';
showSuccess('Success');
showError(error);  // Không cần check error.message
```

### ⚠️ LƯU Ý QUAN TRỌNG - Error Handling:
1. **LUÔN import** từ `src/utils/toast` thay vì `react-toastify`
2. **🔴 KHÔNG tạo errorMessage constant** - Truyền error trực tiếp: `showError(error)`
3. **🔴 KHÔNG kiểm tra error.message** - `showError()` tự động xử lý tất cả error types
4. **🔴 KHÔNG lưu error vào state** nếu chỉ show toast
   - ❌ SAI: `state.error = errorMessage` rồi show toast
   - ✅ ĐÚNG: Chỉ `showError(error)` - không cần state
   - Exception: CHỈ lưu error khi hiển thị trên UI (form validation, inline errors)

### ❌ TUYỆT ĐỐI KHÔNG LÀM:
```typescript
// ❌ SAI - Tạo errorMessage constant
function* fetchDataSaga() {
  try {
    const response = yield call(api.fetchData);
  } catch (error: any) {
    const errorMessage = error?.response?.data?.message || error?.message || 'Không thể tải dữ liệu';
    showError(errorMessage);  // ❌ KHÔNG ĐƯỢC!
  }
}

// ✅ ĐÚNG - Truyền error trực tiếp
function* fetchDataSaga() {
  try {
    const response = yield call(api.fetchData);
  } catch (error) {
    showError(error);  // ✅ Đơn giản và đúng!
  }
}
```

## 12. Submit Buttons & Loading States - BẮT BUỘC
- **BẮT BUỘC: Tất cả submit buttons phải có loading state**
- **PHẢI disable button khi đang loading** để ngăn user spam click
- **PHẢI hiển thị loading text hoặc CircularProgress** để user biết request đang xử lý
- Sử dụng Redux state hoặc local state để track loading

### Quy tắc loading state cho buttons:

#### ✅ ĐÚNG - Button với loading state (Redux):
```tsx
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, CircularProgress } from '@mui/material';
import { loginRequest } from '@/redux/store/authSlice';

export function LoginForm() {
  const dispatch = useDispatch();
  const isLoading = useSelector((state: any) => state.auth.loading);

  const handleSubmit = () => {
    dispatch(loginRequest({ email, password }));
  };

  return (
    <Button
      onClick={handleSubmit}
      disabled={isLoading}
      startIcon={isLoading && <CircularProgress size={20} />}
    >
      {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
    </Button>
  );
}
```

#### ✅ ĐÚNG - Button với local loading state:
```tsx
import { useState } from 'react';
import { Button, CircularProgress } from '@mui/material';

export function SubmitForm() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      await apiCall();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubmit}
      disabled={isLoading}
      startIcon={isLoading && <CircularProgress size={20} />}
    >
      {isLoading ? 'Đang xử lý...' : 'Gửi'}
    </Button>
  );
}
```

#### ❌ SAI - Button không có loading state:
```tsx
export function LoginForm() {
  const dispatch = useDispatch();

  return (
    <Button onClick={() => dispatch(loginRequest({ email, password }))}>
      Đăng nhập
    </Button>
  );
}
// Vấn đề:
// - User có thể spam click
// - Không có feedback khi đang xử lý
// - Có thể tạo nhiều requests trùng lặp
```

### Translation keys cho loading states:

Khi thêm loading state, cần thêm translation key cho loading text:

```json
// src/i18n/vi/common.json
{
  "signin": "Đăng nhập",
  "signingIn": "Đang đăng nhập...",
  "signup": "Đăng ký",
  "signingUp": "Đang đăng ký..."
}
```

```json
// src/i18n/en/common.json
{
  "signin": "Sign In",
  "signingIn": "Signing in...",
  "signup": "Sign Up",
  "signingUp": "Signing up..."
}
```

### ⚠️ LƯU Ý QUAN TRỌNG:
1. **TẤT CẢ submit/action buttons** đều phải có loading state
2. **LUÔN disable button** khi isLoading = true
3. **LUÔN thêm CircularProgress** hoặc loading text
4. **LUÔN thêm translation keys** cho cả normal và loading text
5. **Ưu tiên dùng Redux state** nếu đã có saga/slice xử lý async action

## 13. Dialog Components - BẮT BUỘC
- **BẮT BUỘC: Tất cả MUI Dialog phải có proper close handlers**
- **Sử dụng `onClose` prop** để handle close events
- **Có thể sử dụng `disableEscapeKeyDown`** để prevent closing bằng ESC key

### Quy tắc Dialog Components:

#### ✅ ĐÚNG - Dialog với close handler:
```tsx
import { Dialog, DialogContent, DialogTitle } from '@mui/material';

export function MyDialog({ open, onClose }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogContent>
        {/* Dialog content */}
      </DialogContent>
    </Dialog>
  );
}
```

#### ✅ ĐÚNG - Dialog prevent closing on backdrop click:
```tsx
import { Dialog, DialogContent, DialogTitle } from '@mui/material';

export function MyDialog({ open, onClose }) {
  const handleClose = (event: any, reason: string) => {
    if (reason === 'backdropClick') {
      return; // Prevent closing on backdrop click
    }
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Dialog Title</DialogTitle>
      <DialogContent>
        {/* Dialog content */}
      </DialogContent>
    </Dialog>
  );
}
```

### ⚠️ LƯU Ý QUAN TRỌNG:
1. **LUÔN có `onClose` handler** trong Dialog
2. **Có thể customize close behavior** bằng cách kiểm tra `reason` parameter
3. **Sử dụng `disableEscapeKeyDown`** nếu muốn prevent closing bằng ESC

## 14. Redux & Redux-Saga - BẮT BUỘC
- **BẮT BUỘC: Sử dụng Redux Toolkit** (`@reduxjs/toolkit`) cho state management
- **BẮT BUỘC: Sử dụng Redux-Saga** (`redux-saga`) cho side effects
- **BẮT BUỘC: Sử dụng Type Parameter pattern** cho tất cả saga actions
- **PHẢI tổ chức code** theo structure: slices, sagas

### Redux Toolkit Structure:
```
/src/redux
  /store
    store.ts          - Configure store
    authSlice.ts      - Auth slice với actions & reducers
  /sagas
    authSaga.ts       - Auth saga với side effects
    index.ts          - Root saga
```

### QUY CHUẨN: Redux Action Creator Pattern - BẮT BUỘC

#### ✅ ĐÚNG - Sử dụng Type Parameter Pattern (CHUẨN DUY NHẤT):
```typescript
// Saga actions - LUÔN định nghĩa payload types riêng trước

// 1. Define payload types

// Ví dụ: Login không cần callbacks (chỉ show toast)
export type LoginRequestPayload = {
  email: string;
  password: string;
};

// Ví dụ: Logout không có data và không cần callbacks
export type LogoutRequestPayload = {};

// Ví dụ: Create user CÓ callback để đóng dialog
export type CreateUserPayload = {
  data: CreateUserRequest;
  onSuccess?: () => void;  // Cần để đóng dialog
};

// 2. Create actions sử dụng payload types
export const loginRequest = createAction<LoginRequestPayload>('auth/loginRequest');
export const logoutRequest = createAction<LogoutRequestPayload>('auth/logoutRequest');
export const createUserRequest = createAction<CreateUserPayload>('user/createRequest');
export const clearAuthError = createAction('auth/clearError');

// 3. Cách dispatch:
dispatch(loginRequest({ email: 'user@example.com', password: '123456' }));
dispatch(logoutRequest({}));  // Pass object rỗng
dispatch(createUserRequest({ data: userData, onSuccess: () => setOpen(false) }));
dispatch(clearAuthError());
```

#### ❌ SAI - KHÔNG sử dụng Prepare Callback pattern:
```typescript
// ❌ TUYỆT ĐỐI KHÔNG dùng prepare callback
export const loginRequest = createAction(
  'auth/loginRequest',
  (payload: LoginPayload) => ({ payload })
);

// ❌ TUYỆT ĐỐI KHÔNG dùng cách này
export const logoutRequest = createAction(
  'auth/logoutRequest',
  (payload?: LogoutPayload) => ({ payload })
);
```

#### Quy tắc bắt buộc:
1. **LUÔN định nghĩa payload types riêng** - `export type XxxPayload = { ... }`
2. **LUÔN dùng Type Parameter** - `createAction<PayloadType>('actionType')`
3. **Tất cả fields trong payload đều optional** - Dùng `field?: Type` nếu field không bắt buộc
4. **Dispatch với object rỗng** - `dispatch(action({}))` khi không có data
5. **Không payload** - Không cần type parameter: `createAction('actionType')`
6. **TUYỆT ĐỐI KHÔNG dùng prepare callback** - Chỉ dùng type parameter
7. **TUYỆT ĐỐI KHÔNG dùng union với undefined** - `PayloadType | undefined` ❌

#### ⚠️ Khi nào cần onSuccess / onError callbacks?

🔴 **MẶC ĐỊNH: KHÔNG TẠO callbacks** - Chỉ tạo khi user YÊU CẦU EXPLICITLY

✅ **CẦN callbacks (chỉ khi user yêu cầu):** Đóng dialog, navigate, reset form, refresh data
❌ **KHÔNG BAO GIỜ TẠO callbacks cho:** Show toast, display error message

```typescript
// ❌ KHÔNG tạo callbacks nếu user không yêu cầu
export type LoginRequestPayload = {
  email: string;
  password: string;
  // ❌ KHÔNG thêm: onSuccess?: () => void;
  // ❌ KHÔNG thêm: onError?: (error: string) => void;
};

// ✅ CHỈ TẠO callback khi user YÊU CẦU (VD: "đóng dialog sau khi tạo")
export type CreateUserPayload = {
  data: CreateUserRequest;
  onSuccess?: () => void;  // Tạo vì user yêu cầu đóng dialog
};

// ❌ SAI - Tạo callbacks không cần thiết
export type GetProductPayload = {
  id: string;
  onSuccess?: (data: Product) => void;  // ❌ KHÔNG CẦN!
  onError?: (error: string) => void;    // ❌ KHÔNG CẦN!
};

// ✅ ĐÚNG - Không có callbacks
export type GetProductPayload = {
  id: string;
};

// Saga - KHÔNG CẦN error message constant
function* createUserSaga(action: PayloadAction<CreateUserPayload>) {
  try {
    const { data, onSuccess } = action.payload;
    const response = yield call(userApi.create, data);
    yield put(createUserSuccess(response));
    showSuccess('Thành công');
    if (onSuccess) onSuccess();
  } catch (error) {
    // ✅ ĐÚNG - Truyền error trực tiếp
    showError(error);

    // ❌ SAI - Tạo errorMessage constant
    // const errorMessage = error?.response?.data?.message || error?.message || 'Lỗi';
    // showError(errorMessage);
  }
}
```

#### Ví dụ thực tế - Nhanh.vn Integration:
```typescript
// src/redux/store/nhanhSlice.ts

// 1. Define payload types
export type NhanhRedirectPayload = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export type NhanhCallbackPayload = {
  accessCode: string;  // Required field
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

export type NhanhSyncAllPayload = {
  onSuccess?: () => void;
  onError?: (error: string) => void;
};

// 2. Create actions
export const nhanhRedirectRequest = createAction<NhanhRedirectPayload>('nhanh/redirectRequest');
export const nhanhCallbackRequest = createAction<NhanhCallbackPayload>('nhanh/callbackRequest');
export const nhanhSyncAllRequest = createAction<NhanhSyncAllPayload>('nhanh/syncAllRequest');

// 3. Usage trong component:
dispatch(nhanhRedirectRequest({}));  // Pass empty object
dispatch(nhanhCallbackRequest({ accessCode: 'ABC123' }));  // Required accessCode
dispatch(nhanhSyncAllRequest({}));  // Pass empty object
```

#### Xử lý Payload trong Saga:
```typescript
// src/redux/saga/nhanhSaga.ts
import type { PayloadAction } from '@reduxjs/toolkit';
import type { NhanhRedirectPayload, NhanhCallbackPayload } from '../store/nhanhSlice';

// Saga handler - Sử dụng PayloadAction với explicit type
function* nhanhRedirectSaga(action: PayloadAction<NhanhRedirectPayload>) {
  try {
    // ✅ ĐÚNG - Payload luôn là object, truy cập trực tiếp
    const { onSuccess, onError } = action.payload;

    const response = yield call(api.redirect);

    // Kiểm tra callback trước khi gọi (vì callback optional)
    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    // Reuse biến onError đã destructure ở trên
    if (onError) {
      onError(error.message);
    }
  }
}

// Saga handler với required field trong payload
function* nhanhCallbackSaga(action: PayloadAction<NhanhCallbackPayload>) {
  try {
    // ✅ ĐÚNG - Destructure tất cả fields
    const { accessCode, onSuccess, onError } = action.payload;

    const response = yield call(api.callback, { accessCode });

    if (onSuccess) {
      onSuccess();
    }
  } catch (error: any) {
    if (onError) {
      onError(error.message);
    }
  }
}
```

**Lưu ý quan trọng:**
- ✅ **ĐÚNG**: Dùng `PayloadAction<PayloadType>` thay vì `ReturnType<typeof action>`
- ✅ **ĐÚNG**: Destructure trực tiếp vì payload luôn là object
- ✅ **ĐÚNG**: Khai báo biến ở đầu function để reuse trong catch block
- ❌ **SAI**: Dùng optional chaining `action.payload?.field` (không cần thiết)

### Mẫu Redux Slice:

#### ✅ ĐÚNG - Sử dụng Redux Toolkit (Simple - không cần error state):
```tsx
// redux/store/authSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  user: any;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    loginSuccess: (state, action: PayloadAction<any>) => {
      state.loading = false;
      state.user = action.payload;
    },
    loginFailure: (state) => {
      state.loading = false;
      // Không cần lưu error - đã show toast
    },
  },
});

export const { setLoading, loginSuccess, loginFailure } = authSlice.actions;
export default authSlice.reducer;
```

### Mẫu Redux Saga:

#### ✅ ĐÚNG - Sử dụng Redux Saga (không cần lưu error vào state):
```tsx
// redux/sagas/authSaga.ts
import { call, put, takeLatest } from 'redux-saga/effects';
import { PayloadAction } from '@reduxjs/toolkit';
import { showSuccess, showError } from 'src/utils/toast';
import { setLoading, loginSuccess, loginFailure } from '@/redux/store/authSlice';
import { authApi } from '@/api/authApi';

function* loginSaga(action: PayloadAction<LoginPayload>) {
  try {
    yield put(setLoading(true));
    const response = yield call(authApi.login, action.payload);
    yield put(loginSuccess(response));
    showSuccess('Đăng nhập thành công');
  } catch (error) {
    yield put(loginFailure());
    showError(error);  // Tự động xử lý error - không cần lưu vào state
  }
}

export function* authSagaWatcher() {
  yield takeLatest(loginRequest.type, loginSaga);
}
```

### Redux Saga - Internationalization (i18n) - BẮT BUỘC:

**🔴 TUYỆT ĐỐI KHÔNG hardcode success/error messages trong saga**

```tsx
// ❌ SAI - Hardcode messages
function* createProductComboSaga(action: PayloadAction<CreatePayload>) {
  try {
    const response = yield call(api.create, action.payload);
    showSuccess('Tạo combo sản phẩm thành công');  // ❌ Hardcode!
  } catch (error) {
    showError(error);
  }
}

// ✅ ĐÚNG - Sử dụng i18next.t() trong saga
import i18next from 'src/i18next';  // Import i18next instance, KHÔNG dùng useTranslation hook

function* createProductComboSaga(action: PayloadAction<CreatePayload>) {
  try {
    const response = yield call(api.create, action.payload);
    showSuccess(i18next.t('createProductComboSuccess'));  // ✅ Đúng!
  } catch (error) {
    showError(error);
  }
}
```

**Quy trình bắt buộc:**

1. **Thêm translation keys** vào vi/common.json và en/common.json:
```json
// vi/common.json
{
  "createProductComboSuccess": "Tạo combo sản phẩm thành công",
  "updateProductComboSuccess": "Cập nhật combo sản phẩm thành công",
  "deleteProductComboSuccess": "Xóa combo sản phẩm thành công"
}

// en/common.json
{
  "createProductComboSuccess": "Product combo created successfully",
  "updateProductComboSuccess": "Product combo updated successfully",
  "deleteProductComboSuccess": "Product combo deleted successfully"
}
```

2. **Import i18next** trong saga (KHÔNG phải useTranslation):
```tsx
import i18next from 'src/i18next';  // ✅ Saga dùng i18next instance
// KHÔNG import { useTranslation } from 'react-i18next';  // ❌ Hook chỉ dùng trong components
```

3. **Sử dụng i18next.t()** thay vì hardcode:
```tsx
showSuccess(i18next.t('createProductComboSuccess'));
showInfo(i18next.t('processingData'));
// Error thì vẫn dùng showError(error) - không cần i18n
```

**⚠️ Tại sao không dùng useTranslation trong saga?**
- `useTranslation()` là React Hook, chỉ dùng được trong React components
- Saga không phải component, phải dùng `i18next` instance trực tiếp
- `i18next` instance có full access tới translations như hook

### ⚠️ LƯU Ý QUAN TRỌNG - Redux & Saga:
1. **LUÔN dùng Redux Toolkit + Redux Saga** thay vì vanilla Redux
2. **PHẢI có loading state** trong slice cho mỗi async operation
3. **🔴 KHÔNG lưu error vào state** nếu chỉ show toast (xem Rule #10 - Notifications)
4. **🔴 MẶC ĐỊNH: KHÔNG TẠO callbacks** - CHỈ tạo khi user YÊU CẦU EXPLICITLY (đóng dialog, navigate, refresh)
5. **🔴 LUÔN dùng i18next.t()** cho success messages - Import từ 'src/i18next', KHÔNG dùng useTranslation
6. **LUÔN dùng showError(error)** trực tiếp - KHÔNG tạo errorMessage constant

## 15. API Calls - BẮT BUỘC
- **BẮT BUỘC: Sử dụng Axios** (`axios`) cho tất cả API calls
- **PHẢI tạo axios instance** với base configuration
- **PHẢI handle errors** properly

### Axios Instance Setup:

#### ✅ ĐÚNG - Tạo axios instance:
```tsx
// api/axios.ts
import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => response.data,
  (error) => {
    // Handle error globally
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

### API Service:

#### ✅ ĐÚNG - Tạo API service:
```tsx
// api/authApi.ts
import axiosInstance from './axios';

export const authApi = {
  login: async (payload: LoginPayload) => {
    return axiosInstance.post('/auth/login', payload);
  },
  logout: async () => {
    return axiosInstance.post('/auth/logout');
  },
  register: async (payload: RegisterPayload) => {
    return axiosInstance.post('/auth/register', payload);
  },
};
```

### ⚠️ LƯU Ý QUAN TRỌNG:
1. **LUÔN dùng axios instance** thay vì axios trực tiếp
2. **PHẢI config interceptors** cho authentication
3. **PHẢI handle errors** trong interceptors
4. **Tổ chức API services** theo modules

## 16. Table Components - BẮT BUỘC
- **BẮT BUỘC: Sử dụng TanStack Table (`@tanstack/react-table`)** cho tất cả tables
- **BẮT BUỘC: Sử dụng table components từ `src/components/table/`**
- **PHẢI tuân thủ** các tính năng mặc định của table system

### Table System Components:
```
/src/components/table
  data-table.tsx        - Main table component với sticky header
  search-bar.tsx        - Search bar với filter
  column-visibility.tsx - Toggle hiển thị/ẩn columns
  table-pagination.tsx  - Pagination controls
  index.ts              - Export all components
```

### Tính năng mặc định của Table (LUÔN có sẵn):

#### 1. **Core Features** (Mặc định enabled):
- ✅ **Sorting** - Click vào header để sort ascending/descending
- ✅ **Pagination** - Phân trang tự động
- ✅ **Column Visibility** - Ẩn/hiện columns qua ColumnVisibility component
- ✅ **Global Filter** - Search toàn bộ table qua SearchBar
- ✅ **Sticky Header** - Header luôn hiển thị khi scroll
- ✅ **Responsive Styling** - Alternating row colors, hover effects
- ✅ **Column Sizing** - Set width cho từng column
- ✅ **Column Pinning** - Pin columns bên trái/phải khi scroll ngang (auto detect từ state)

#### 2. **Optional Features** (Mặc định disabled, cần flag để enable):
- ⚪ **Row Selection** - Checkbox để select rows (enableRowSelection prop)
- ⚪ **Custom Cell Rendering** - Custom render cho cell
- ⚪ **Custom Actions** - Buttons/icons trong SearchBar (renderActions prop)

#### 3. **Column Visibility Persistence** (Tự động lưu vào localStorage):
- ✅ **Auto-save**: Tự động lưu trạng thái ẩn/hiện cột vào localStorage
- ✅ **Auto-load**: Tự động load lại setting khi refresh page
- ✅ **Per-table storage**: Mỗi table có storage riêng (không conflict)
- ✅ **Cross-session**: Setting giữ nguyên khi đóng/mở browser
- ✅ **Backward compatible**: Optional, không ảnh hưởng code cũ

**Cách sử dụng:**
```tsx
// Import hook
import { useColumnVisibilityPersistence } from 'src/hooks';

// Thay thế useState bằng useColumnVisibilityPersistence
// Before:
const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

// After:
const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('table-key');
// table-key: ID duy nhất cho mỗi table (vd: 'product-table', 'inventory-table')
```

**Hook Parameters:**
- `tableKey` (required): ID duy nhất cho table - format: `'page-name-table'`
- `enabled` (optional): Enable/disable persistence - default: `true`

**Example:**
```tsx
// Product table with persistence
const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('product-table');

// Inventory table with persistence
const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('inventory-table');

// Table without persistence (disabled)
const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('my-table', false);
```

### ⚠️ QUY TẮC QUAN TRỌNG KHI THÊM TÍNH NĂNG MỚI:

#### 🔴 BẮT BUỘC - Backward Compatibility:
```tsx
// ❌ SAI - Thêm feature mới mà mặc định = true
interface DataTableProps<TData> {
  table: TanStackTable<TData>;
  enableNewFeature?: boolean;  // ❌ Default = true sẽ phá code cũ!
}

// ✅ ĐÚNG - Thêm feature mới với default = false
interface DataTableProps<TData> {
  table: TanStackTable<TData>;
  enableNewFeature?: boolean;  // ✅ Default = false, không ảnh hưởng code cũ
}

export function DataTable<TData>({
  table,
  enableNewFeature = false  // ✅ Explicit default = false
}: DataTableProps<TData>) {
  // Implementation
}
```

### Mẫu Implementation Table:

```tsx
import { useState } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel,
  getPaginationRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { SearchBar, ColumnVisibility, DataTable, TablePagination } from 'src/components/table';
import { useColumnVisibilityPersistence } from 'src/hooks';

export function MyTablePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sorting, setSorting] = useState([]);
  const [columnVisibility, setColumnVisibility] = useColumnVisibilityPersistence('my-table');
  const [pageSize, setPageSize] = useState(10);

  const columns = [
    { accessorKey: 'name', header: 'Name', size: 200 },
    { accessorKey: 'email', header: 'Email', size: 250 },
  ];

  const table = useReactTable({
    data: myData,
    columns,
    state: { sorting, columnVisibility, globalFilter: searchQuery },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>
      <Card sx={{ mb: 2 }}>
        <SearchBar value={searchQuery} onChange={setSearchQuery}
          renderActions={() => <ColumnVisibility table={table} />} />
      </Card>
      <Card sx={{ flex: 1 }}>
        <DataTable table={table} />
      </Card>
      <TablePagination table={table} totalItems={myData.length}
        pageSize={pageSize} onPageSizeChange={setPageSize} />
    </Box>
  );
}
```

### Column Pinning (Optional):

```tsx
// Pin cột actions bên phải
const [columnPinning] = useState({ right: ['actions'] });

const table = useReactTable({
  state: { columnPinning, /* ... */ },
  onColumnPinningChange: setColumnPinning,
  enableColumnPinning: true,
});
```

### ⚠️ Checklist:
- Import components từ `src/components/table`
- Dùng `useColumnVisibilityPersistence` cho columnVisibility
- Layout: SearchBar → Table → Pagination
- Thêm feature mới phải có flag với default = false

## 17. Layout & Navigation - BẮT BUỘC
- **KHÔNG thêm Breadcrumb/Title** trong page components (header tự động hiển thị)
- **CHỈ set title** qua `usePageTitle()` trong page wrapper

```tsx
// Page wrapper
export default function MyPage() {
  const { t } = useTranslation();
  const { setTitle } = usePageTitle();

  useEffect(() => { setTitle(t('myPageTitle')); }, [t, setTitle]);

  return (
    <>
      <Helmet><title>{`${t('myPageTitle')} - ${CONFIG.appName}`}</title></Helmet>
      <MyPageView />
    </>
  );
}

// View - Bắt đầu với content
export function MyPageView() {
  return <Box sx={{ p: 3 }}><Card>{/* Content */}</Card></Box>;
}
```

## 18. TypeScript - BẮT BUỘC
- **Sử dụng TypeScript** - Define types cho props, state, API responses
- **TRÁNH `any`** - dùng proper types hoặc `unknown`

```tsx
// ✅ ĐÚNG
interface LoginFormProps {
  onSuccess?: () => void;
}
export function LoginForm({ onSuccess }: LoginFormProps) { /* ... */ }

// ❌ SAI
function LoginForm(props: any) { /* ... */ }
```

## 19. Repository Pattern & Types - BẮT BUỘC
- **BẮT BUỘC: Khi tạo repository phải sử dụng types từ `src/types/`**
- **PHẢI tổ chức types theo domain/module** trong folder `src/types/`
- **KHÔNG được define types inline** trong repository files
- **NGOẠI LỆ: Có thể dùng `any`** nếu trong `src/types/` không có type nào phù hợp
- **🔴 TUYỆT ĐỐI KHÔNG tạo custom index.ts files** trong `src/types/` khi đã có Protobuf types

### Repository Structure:
```
/src
  /repositories
    auth.repository.ts      - Auth API calls
    user.repository.ts      - User API calls
    product.repository.ts   - Product API calls
  /types
    /auth                   - Auth-related types
    /users                  - User-related types
    /common                 - Common/shared types
    /nhanh                  - Nhanh.vn integration types
    /google                 - Google integration types
    /files                  - File-related types
    /product-combos         - Protobuf generated types (KHÔNG tạo custom index.ts)
```

### Pattern:

```tsx
// ✅ ĐÚNG - Types trong src/types/
// src/types/auth/index.ts
export interface LoginRequest {
  email: string;
  password: string;
}
export interface LoginResponse {
  accessToken: string;
  user: { id: string; email: string; name: string };
}

// src/repositories/auth.repository.ts
import axiosInstance from 'src/utils/axios';
import type { LoginRequest, LoginResponse } from 'src/types/auth';

export const authRepository = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    return axiosInstance.post('/auth/login', data);
  },
  // ⚠️ Dùng any nếu chưa có type
  someNewEndpoint: async (data: any): Promise<any> => {
    return axiosInstance.post('/new-endpoint', data);
  },
};

// ❌ SAI - Define types inline
// interface LoginRequest { ... }  // KHÔNG được!
```

### 🔴 Protobuf Types - QUY TẮC ĐẶC BIỆT:

```tsx
// ✅ ĐÚNG - Import trực tiếp từ Protobuf generated files
import type { ProductCombo, CreateProductCombo } from 'src/types/product-combos/product-combo';
import { ProductComboStatus, productComboStatusToJSON } from 'src/types/product-combos/product-combo';

// src/repositories/product-combo.repository.ts
export const productComboRepository = {
  getProductCombos: async (params: any): Promise<ProductCombo[]> => {
    // Implementation
  },
  createProductCombo: async (data: CreateProductCombo): Promise<ProductCombo> => {
    // Implementation
  },
};

// ❌ SAI - Tạo custom index.ts cho Protobuf types
// src/types/product-combos/index.ts
// export * from './product-combo';  // ❌ KHÔNG TẠO FILE NÀY!
```

### ⚠️ LƯU Ý:
- **Organize types theo domain** trong `src/types/{domain}/`
- **Naming**: `{Action}Request`, `{Action}Response`, `{Entity}`, `{Entity}ListResponse`
- **NGOẠI LỆ**: Dùng `any` tạm nếu chưa có type phù hợp
- **🔴 Protobuf types**: KHÔNG tạo custom wrappers, import trực tiếp từ generated files
- **🔴 Protobuf helpers**: LUÔN check helper functions (như `productComboStatusToJSON`) trước khi hardcode

## 20. Thêm Thư Viện Mới - BẮT BUỘC
- **BẮT BUỘC: Sử dụng Context7 MCP** để tra cứu documentation khi thêm thư viện mới
- **PHẢI tra cứu docs** trước khi triển khai code với thư viện chưa quen
- **LUÔN follow** official documentation và best practices

### Quy trình khi thêm/sử dụng thư viện mới:

#### Bước 1: Resolve Library ID
```
// Sử dụng Context7 MCP để tìm library ID
mcp__context7__resolve-library-id({ libraryName: "tên-thư-viện" })

// Ví dụ:
mcp__context7__resolve-library-id({ libraryName: "tanstack-table" })
mcp__context7__resolve-library-id({ libraryName: "react-hook-form" })
mcp__context7__resolve-library-id({ libraryName: "zod" })
```

#### Bước 2: Fetch Documentation
```
// Sau khi có library ID, fetch docs với topic cụ thể
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/org/project",
  topic: "topic-cần-tra-cứu",
  mode: "code"  // hoặc "info" cho conceptual guides
})

// Ví dụ:
mcp__context7__get-library-docs({
  context7CompatibleLibraryID: "/tanstack/table",
  topic: "column-pinning",
  mode: "code"
})
```

#### Bước 3: Implement theo Documentation
- Đọc kỹ docs trước khi code
- Follow official patterns và best practices
- Tham khảo code examples từ docs

### Khi nào BẮT BUỘC sử dụng Context7:

| Tình huống | Bắt buộc? |
|------------|-----------|
| Thêm thư viện mới vào project | ✅ BẮT BUỘC |
| Sử dụng feature mới của thư viện đã có | ✅ BẮT BUỘC |
| Không chắc chắn cách sử dụng API | ✅ BẮT BUỘC |
| Đã quen thuộc với thư viện | ⚪ Khuyến khích |
| Sửa bug đơn giản | ⚪ Tùy chọn |

### ⚠️ LƯU Ý QUAN TRỌNG:
1. **LUÔN tra cứu docs** khi không chắc chắn về API usage
2. **KHÔNG đoán mò** cách sử dụng thư viện - tra cứu docs
3. **Sử dụng mode phù hợp**: `code` cho API/examples, `info` cho concepts
4. **Pagination**: Nếu context không đủ, thử `page=2`, `page=3`, etc.

## 21. Enum & Status Mapping - BẮT BUỘC
- **🔴 TUYỆT ĐỐI KHÔNG hardcode status/enum mappings**
- **BẮT BUỘC: Sử dụng Protobuf helper functions** khi có sẵn
- **PHẢI check** generated types trước khi tạo custom mappings

### Protobuf Enum Helpers:

Protobuf generated types thường có các helper functions:
- `{EnumName}ToJSON(value)` - Convert enum value → string
- `{EnumName}FromJSON(value)` - Convert string → enum value

```tsx
// ❌ SAI - Hardcode status mapping
const statusMap: Record<number, string> = {
  1: 'active',
  2: 'inactive',
  3: 'discontinued',
};

const statusKey = statusMap[status];  // ❌ Không được hardcode!

// ✅ ĐÚNG - Sử dụng Protobuf helper function
import { ProductComboStatus, productComboStatusToJSON } from 'src/types/product-combos/product-combo';

// ProductComboStatus.PRODUCT_COMBO_STATUS_ACTIVE → "PRODUCT_COMBO_STATUS_ACTIVE"
const statusJSON = productComboStatusToJSON(status);
// Parse để lấy phần cần thiết: "PRODUCT_COMBO_STATUS_ACTIVE" → "active"
const statusKey = statusJSON.replace('PRODUCT_COMBO_STATUS_', '').toLowerCase();
```

### Pattern khi hiển thị status:

```tsx
// src/sections/product-combo/product-combo-view.tsx
import { ProductComboStatus, productComboStatusToJSON } from 'src/types/product-combos/product-combo';

const columns = [
  {
    accessorKey: 'status',
    header: t('sellingStatus'),
    cell: ({ getValue }) => {
      const status = getValue() as ProductComboStatus;

      // ✅ Sử dụng Protobuf helper
      const statusJSON = productComboStatusToJSON(status);
      const statusKey = statusJSON.replace('PRODUCT_COMBO_STATUS_', '').toLowerCase();

      // Helper cho MUI Chip colors (OK vì không có sẵn trong Protobuf)
      const statusColor = getProductComboStatusColor(status);

      return (
        <Chip
          label={t(statusKey)}  // Translation key: "active", "inactive", etc.
          size="small"
          color={statusColor}
        />
      );
    },
  },
];

// Helper function cho UI colors - CHỈ tạo khi KHÔNG có sẵn trong Protobuf
const getProductComboStatusColor = (
  status: ProductComboStatus
): 'success' | 'warning' | 'error' | 'default' => {
  switch (status) {
    case ProductComboStatus.PRODUCT_COMBO_STATUS_ACTIVE:
      return 'success';
    case ProductComboStatus.PRODUCT_COMBO_STATUS_INACTIVE:
      return 'warning';
    case ProductComboStatus.PRODUCT_COMBO_STATUS_DISCONTINUED:
      return 'error';
    default:
      return 'default';
  }
};
```

### Enum trong Form Controls (Select, Radio, etc.) - BẮT BUỘC:

**🔴 TUYỆT ĐỐI KHÔNG convert enum sang string rồi convert ngược lại**

```tsx
// ❌ SAI - Convert enum → string → enum (dài dòng, dễ lỗi)
<Select
  value={
    row.original.discountType === DiscountType.DISCOUNT_TYPE_PERCENTAGE
      ? 'percent'
      : 'fixed'
  }
  onChange={(e) => {
    const newDiscountType =
      e.target.value === 'percent'
        ? DiscountType.DISCOUNT_TYPE_PERCENTAGE
        : DiscountType.DISCOUNT_TYPE_FIXED;
    onUpdate({ discountType: newDiscountType });
  }}
>
  <MenuItem value="fixed">đ</MenuItem>
  <MenuItem value="percent">%</MenuItem>
</Select>

// ✅ ĐÚNG - Sử dụng enum trực tiếp làm value
<Select
  value={row.original.discountType || DiscountType.DISCOUNT_TYPE_FIXED}
  onChange={(e) =>
    onUpdate({ discountType: e.target.value as DiscountType })
  }
>
  <MenuItem value={DiscountType.DISCOUNT_TYPE_FIXED}>đ</MenuItem>
  <MenuItem value={DiscountType.DISCOUNT_TYPE_PERCENTAGE}>%</MenuItem>
</Select>
```

**Quy tắc:**
1. **Dùng enum value trực tiếp** làm `value` cho MenuItem/Option
2. **Cast type** khi cần: `e.target.value as EnumType`
3. **Default value** dùng enum: `value || EnumType.DEFAULT_VALUE`

### ⚠️ LƯU Ý QUAN TRỌNG:
1. **LUÔN check Protobuf helpers** trước khi tạo custom mapping
2. **Tìm helper functions** trong generated type files: `{EnumName}ToJSON`, `{EnumName}FromJSON`
3. **CHỈ tạo helper functions** cho UI-specific logic (colors, icons) không có trong Protobuf
4. **KHÔNG tạo hardcoded mappings** cho data transformation - dùng Protobuf helpers
5. **Translation keys** nên match với parsed enum values (lowercase)
6. **🔴 Form controls (Select, Radio)**: Dùng enum trực tiếp, KHÔNG convert qua string

---

## Tóm tắt Checklist cho mỗi Task:

### 🔴 CHECKLIST BẮT BUỘC - PHẢI LÀM TRƯỚC KHI CODE:
- [ ] **ĐỌC TOÀN BỘ** file vi/common.json và en/common.json
- [ ] **TÌM VÀ LIỆT KÊ** các keys có thể tái sử dụng
- [ ] **XÁC ĐỊNH** keys mới THỰC SỰ cần tạo (không trùng lặp)
- [ ] **VERIFY** không có keys trùng nghĩa

### 🟡 CHECKLIST TRONG QUÁ TRÌNH CODE:
- [ ] Sử dụng MUI components và Material Icons
- [ ] Sử dụng MUI styling (sx prop hoặc styled())
- [ ] **TUYỆT ĐỐI KHÔNG thêm Breadcrumb** trong view components (header đã có)
- [ ] **TUYỆT ĐỐI KHÔNG thêm page title (Typography h4)** trong view components (header đã có)
- [ ] **CHỈ set page title** qua usePageTitle() trong page wrapper
- [ ] **TUYỆT ĐỐI SỬ DỤNG** keys đã có thay vì tạo mới (save, cancel, delete, name, email, v.v.)
- [ ] **CHỈ TẠO keys MỚI** khi thực sự đặc biệt và chưa có
- [ ] Thêm translations vào vi/common.json VÀ en/common.json CÙNG LÚC
- [ ] Có loading states cho tất cả submit buttons
- [ ] Có proper error handling trong saga
- [ ] **🔴 TUYỆT ĐỐI KHÔNG tạo errorMessage constant** - Truyền error trực tiếp: `showError(error)`
- [ ] **🔴 TUYỆT ĐỐI KHÔNG tạo onSuccess/onError callbacks** - CHỈ tạo khi user YÊU CẦU EXPLICITLY
- [ ] **🔴 TUYỆT ĐỐI KHÔNG hardcode messages trong saga** - Dùng `i18next.t('key')`
- [ ] **🔴 TUYỆT ĐỐI KHÔNG hardcode status/enum mappings** - Check Protobuf helpers trước
- [ ] **🔴 TUYỆT ĐỐI KHÔNG convert enum ↔ string** trong form controls - Dùng enum trực tiếp làm value
- [ ] **🔴 TUYỆT ĐỐI KHÔNG tạo custom index.ts** cho Protobuf types - Import trực tiếp
- [ ] **🔴 TUYỆT ĐỐI KHÔNG lưu error vào state** nếu chỉ show toast
- [ ] **Sử dụng toast utilities** từ `src/utils/toast` (showSuccess, showError, showInfo, showWarning)
- [ ] **NẾU tạo saga:** Import `i18next` từ 'src/i18next' cho messages, KHÔNG dùng useTranslation
- [ ] **NẾU hiển thị enum/status:** Check Protobuf helpers (`{EnumName}ToJSON`) trước khi tạo custom mapping
- [ ] **NẾU làm với Protobuf types:** Import trực tiếp từ generated files, KHÔNG tạo wrappers
- [ ] **NẾU tạo repository:** Define types trong `src/types/` trước, organize theo domain
- [ ] **NẾU tạo repository:** Repository functions phải có proper return types
- [ ] **NẾU tạo repository:** Dùng `any` nếu không có type phù hợp trong `src/types/`
- [ ] **NẾU thêm thư viện mới:** Sử dụng Context7 MCP để tra cứu documentation trước khi code
- [ ] Define proper TypeScript types
- [ ] Kiểm tra file size không quá 500 dòng
- [ ] **NẾU làm table:** Sử dụng table components từ `src/components/table/`
- [ ] **NẾU thêm feature cho table:** Phải có flag với default = false
- [ ] **NẾU dùng .filter(), .map(), .find(), .forEach() trên array:** Dùng lodash (`_.filter()`, `_.map()`, etc.) để tránh crash khi undefined

## 22. Safe Array Access - BẮT BUỘC
- **BẮT BUỘC: Kiểm tra null/undefined trước khi access `.length`**
- **Sử dụng lodash** hoặc **helper functions từ `src/utils/array`**
- **Import lodash:** `import _ from 'lodash';`
- **Lodash methods an toàn:** `_.filter()`, `_.map()`, `_.find()`, `_.forEach()` tự động xử lý null/undefined

### Pattern cơ bản:

#### ❌ SAI - Crash nếu arr là undefined:
```tsx
const count = items.length;
const first = items[0];
items.map(item => item.name);
items.filter(item => item.active);
```

#### ✅ ĐÚNG - Sử dụng lodash (KHUYẾN NGHỊ cho filter/map/find/forEach):
```tsx
import _ from 'lodash';

// filter an toàn - trả về [] nếu items undefined
const activeItems = _.filter(items, item => item.active);

// map an toàn
const names = _.map(items, item => item.name);

// find an toàn
const found = _.find(items, item => item.id === id);

// forEach an toàn
_.forEach(items, item => console.log(item));
```

#### ✅ ĐÚNG - Helper functions từ src/utils/array:
```tsx
import { safeLength, safeFirst, isEmpty, safeMap } from 'src/utils/array';

const count = safeLength(items);
const first = safeFirst(items);
if (isEmpty(items)) return null;
const names = safeMap(items, item => item.name);
```

#### ✅ ĐÚNG - Optional chaining (cho cases đơn giản):
```tsx
const count = items?.length ?? 0;
const first = items?.[0];
```

### Helper functions có sẵn trong `src/utils/array.ts`:

| Function | Description | Example |
|----------|-------------|---------|
| `safeLength(arr)` | Trả về 0 nếu null/undefined | `safeLength(items)` |
| `safeFirst(arr)` | Lấy phần tử đầu tiên an toàn | `safeFirst(items)` |
| `safeLast(arr)` | Lấy phần tử cuối cùng an toàn | `safeLast(items)` |
| `isEmpty(arr)` | Check array rỗng hoặc null | `if (isEmpty(items)) return` |
| `isNotEmpty(arr)` | Check array có phần tử | `if (isNotEmpty(items)) ...` |
| `safeMap(arr, fn)` | Map an toàn, trả về [] nếu null | `safeMap(items, x => x.id)` |
| `safeFilter(arr, fn)` | Filter an toàn | `safeFilter(items, x => x.active)` |
| `safeFind(arr, fn)` | Find an toàn | `safeFind(items, x => x.id === id)` |

### Redux Saga - Data Structure:

#### ❌ SAI - Nếu repository đã unwrap data:
```tsx
// Repository trả về: response.data (PromotionResponse)
// Saga expect wrapper:
const response: { data: PromotionResponse } = yield call(repo.getPromotion, id);
yield put(setPromotion(response.data)); // ← response.data = undefined!
```

#### ✅ ĐÚNG - Match với repository return type:
```tsx
// Repository đã unwrap, trả về PromotionResponse trực tiếp
const response: PromotionResponse = yield call(repo.getPromotion, id);
yield put(setPromotion(response));
```

### Helper functions có sẵn trong `src/utils/array.ts`:

| Function | Description | Example |
|----------|-------------|---------|
| `safeLength(arr)` | Trả về 0 nếu null/undefined | `safeLength(items)` |
| `safeFirst(arr)` | Lấy phần tử đầu tiên an toàn | `safeFirst(items)` |
| `safeLast(arr)` | Lấy phần tử cuối cùng an toàn | `safeLast(items)` |
| `isEmpty(arr)` | Check array rỗng hoặc null | `if (isEmpty(items)) return` |
| `isNotEmpty(arr)` | Check array có phần tử | `if (isNotEmpty(items)) ...` |
| `safeMap(arr, fn)` | Map an toàn, trả về [] nếu null | `safeMap(items, x => x.id)` |
| `safeFilter(arr, fn)` | Filter an toàn | `safeFilter(items, x => x.active)` |
| `safeFind(arr, fn)` | Find an toàn | `safeFind(items, x => x.id === id)` |

### ⚠️ LƯU Ý QUAN TRỌNG:
1. **LUÔN kiểm tra null/undefined** trước khi access array properties
2. **Ưu tiên optional chaining** cho cases đơn giản: `arr?.length ?? 0`
3. **Dùng helper functions** cho complex operations hoặc reusability
4. **Kiểm tra repository return type** khi viết saga - đảm bảo match với type annotation

### 🟢 CHECKLIST SAU KHI HOÀN THÀNH:
- [ ] **REVIEW LẠI** tất cả keys đã tạo, xóa keys trùng lặp
- [ ] **VERIFY** vi/common.json và en/common.json đồng bộ
- [ ] Chạy `npm run fm:fix` 
- [ ] Update version.json và versions.MD
