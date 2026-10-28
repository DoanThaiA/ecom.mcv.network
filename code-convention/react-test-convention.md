# Tài liệu: Quy ước Testing cho React/TypeScript Projects (Vitest)

Quy ước testing cho các dự án React/TypeScript/Vite sử dụng Vitest và React Testing Library.

**Áp dụng cho:** Tất cả React projects trong this project

**Triết lý:** "Test the way users interact with your app, not implementation details"

---

## 1. Triết lý Testing

### Core Principles

- **Test hành vi (behavior)**, không phải implementation
- **Test real components**, không phải mocks
- **Ưu tiên integration tests** hơn unit tests
- **Mỗi test độc lập**, không phụ thuộc thứ tự chạy
- **Test phải readable**, dễ hiểu như documentation

### Why Integration Testing?

Integration tests mang lại giá trị cao hơn vì:
- Phát hiện bugs thực tế trong user workflows
- Verify components hoạt động đúng khi kết hợp
- Ít brittle (không break khi refactor)
- Confidence cao về code quality

---

## 2. Cấu trúc Test Files

```
test/
├── fixtures/              # Mock data JSON files
│   ├── users.json
│   └── products.json
├── utils/
│   ├── testUtils.ts      # Unified render utilities
│   ├── mockData.ts       # Data loaders & converters
│   └── setup.ts          # Global test setup
└── pages/
    └── [feature]/
        └── [Feature].test.tsx
```

### Naming Conventions

- Test files: `[ComponentName].test.tsx`
- Mock data: `[entity].json` (lowercase, plural)

---

## 3. Test Utilities

### testUtils.ts - CRITICAL: Sử dụng unified render

```typescript
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';

export const renderWithProviders = (ui, { preloadedState = {}, ...options } = {}) => {
  const store = configureStore({ reducer: rootReducer, preloadedState });

  const Wrapper = ({ children }) => (
    <Provider store={store}>
      <BrowserRouter>
        {/* Add: ThemeProvider, I18nProvider, QueryClient... */}
        {children}
      </BrowserRouter>
    </Provider>
  );

  return { store, ...render(ui, { wrapper: Wrapper, ...options }) };
};

export * from '@testing-library/react';
```

---

## 4. Mock Data Strategy

### Triết lý: Mock data PHẢI load từ JSON files

#### JSON Fixtures Structure

**`test/fixtures/users.json`:**
```json
{
  "users": [
    {
      "id": "user-1",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "status": "active"
    },
    {
      "id": "user-2",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "user",
      "status": "active"
    }
  ],
  "singleUser": { "id": "user-single", "name": "Test User", ... },
  "adminUser": { "id": "user-admin", "name": "Admin", "role": "admin", ... }
}
```

**Best Practices:**
- Mỗi entity type có file riêng
- Include diverse scenarios (admin, inactive, edge cases)
- Use realistic data
- Có cả lists và single objects

#### Data Loaders - mockData.ts

```typescript
import usersData from '../fixtures/users.json';

// Loaders - Load từ JSON
export const loadUserData = (userId?: string) => {
  if (userId) return usersData.users.find(u => u.id === userId);
  return usersData.singleUser;
};

export const loadUsersData = () => usersData.users;

// Converters - Convert JSON to domain objects
export const createUserFromData = (data) => {
  if (!data) throw new Error('User data not found');

  // Option 1: Return raw (REST APIs)
  return data;

  // Option 2: Convert to class/proto (gRPC)
  // const user = new UserProto();
  // user.setId(data.id);
  // return user;
};

// Quick helpers - Pre-converted
export const mockUser = createUserFromData(loadUserData());
export const mockUsers = loadUsersData().map(createUserFromData);
export const mockAdminUser = createUserFromData(usersData.adminUser);

// Custom builders - For customization
export const createCustomUser = (baseId, overrides) => {
  const baseData = loadUserData(baseId);
  if (!baseData) throw new Error(`User ${baseId} not found`);
  return createUserFromData({ ...baseData, ...overrides });
};
```

#### Usage Examples

```typescript
import { mockUsers, createCustomUser } from '../../utils/mockData';

// ✅ Simple: Use pre-built
const preloadedState = { user: { users: mockUsers } };

// ✅ Custom: Modify from JSON
const admin = createCustomUser('user-1', { role: 'admin' });

// ✅ Filter: Load and transform
const activeUsers = loadUsersData()
  .filter(u => u.status === 'active')
  .map(createUserFromData);
```

#### When to Hard-code

**✅ OK để hard-code:**
```typescript
// Simple objects < 5 fields
const pagination = { page: 1, limit: 25, total: 100 };
const filters = { search: 'John', status: 'active' };
```

**❌ PHẢI load từ JSON:**
- Object > 5 fields
- Cần reuse ở nhiều tests
- Data phức tạp (nested, arrays)

---

## 5. Mocking Strategy

### Core Principle: "ONLY Mock Data, NEVER Mock UI"

**Golden Rule:** Chỉ mock **data layer** (state, API responses, services). Không bao giờ mock **UI layer** (components, pages, tabs).

### ✅ PHẢI Mock (Data Layer Only)

**1. State Management - Mock Actions/State**
```typescript
// Redux: Mock action creators
vi.mock('src/redux/store/userSlice', () => ({
  getUsersRequest: vi.fn(req => ({ type: 'user/get', payload: req })),
  createUserRequest: vi.fn(req => ({ type: 'user/create', payload: req })),
}));

// Zustand: Mock store
vi.mock('src/stores/userStore', () => ({ useUserStore: vi.fn() }));

// React Query: Mock hooks
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
  useMutation: vi.fn(),
}));
```

**2. API Services - Mock gRPC/REST Responses**
```typescript
// Mock API service với data từ JSON fixtures
vi.mock('src/services/api', () => ({
  fetchUsers: vi.fn(() => Promise.resolve(mockUsers)),
  createUser: vi.fn(() => Promise.resolve(mockUser)),
}));

// Mock gRPC client (nếu cần)
vi.mock('src/services/grpcClient', () => ({
  userServiceClient: {
    getUsers: vi.fn(() => Promise.resolve({ usersList: mockUsers })),
  },
}));
```

**3. Browser APIs & External Services**
```typescript
// Mock localStorage
vi.mock('src/services/localStorage', async () => {
  const actual = await vi.importActual('src/services/localStorage');
  return {
    ...actual,
    getItem: vi.fn(key => mockStorageData[key]),
    setItem: vi.fn(),
  };
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});
```

### ❌ TUYỆT ĐỐI KHÔNG Mock (UI Layer)

**CRITICAL: KHÔNG BAO GIỜ mock bất kỳ UI component nào**

```typescript
// ❌ NEVER MOCK - Common Components
vi.mock('src/components/common/Button', ...);
vi.mock('src/components/common/Input', ...);
vi.mock('src/components/common/Modal', ...);
vi.mock('src/components/common/DatePicker', ...);
vi.mock('src/components/common/Dialog', ...);

// ❌ NEVER MOCK - Page Components
vi.mock('src/pages/users/UserList', ...);
vi.mock('src/pages/users/UserDetail', ...);

// ❌ NEVER MOCK - Tab Components
vi.mock('src/pages/users/tabs/UserListTab', ...);
vi.mock('src/pages/users/tabs/UserSettingsTab', ...);

// ❌ NEVER MOCK - Layout Components
vi.mock('src/components/layouts/Header', ...);
vi.mock('src/components/layouts/Sidebar', ...);

// ❌ NEVER MOCK - UI Libraries
vi.mock('react-i18next', ...);
vi.mock('@mui/material', ...);
vi.mock('antd', ...);

// ❌ NEVER MOCK - Feature Components
vi.mock('src/pages/users/components/UserTable', ...);
vi.mock('src/pages/users/components/UserForm', ...);
```

### Tại Sao KHÔNG Mock UI?

1. **Mất ý nghĩa của test**
   - Test mock thay vì real component
   - Không verify UI hoạt động đúng

2. **Không phát hiện bugs**
   - UI regressions không bị catch
   - Layout/styling issues bị bỏ qua
   - Responsive problems không được test

3. **False confidence**
   - Tests pass nhưng UI có thể broken
   - Mock behavior khác với real component

4. **Không test interactions**
   - User clicks, typing không hoạt động
   - Form validation không được test
   - Navigation không được verify

5. **Không test accessibility**
   - ARIA attributes bị skip
   - Keyboard navigation không test
   - Screen reader compatibility không verify

### Thay Vì Mock UI → Provide Real Data

```typescript
// ❌ BAD: Mock tab component
vi.mock('src/pages/users/tabs/UserListTab', () => ({
  default: () => <div data-testid="user-list-tab">Mock</div>,
}));

it('should show user list tab', () => {
  renderWithProviders(<UserPage />);
  expect(screen.getByTestId('user-list-tab')).toBeInTheDocument();
  // ❌ Testing mock, not real tab!
});

// ✅ GOOD: Provide real state, test real tab
it('should show user list tab', () => {
  const preloadedState = {
    user: { users: mockUsers }, // Real data from JSON
  };

  renderWithProviders(<UserPage />, { preloadedState });

  // ✅ Test real tab behavior
  expect(screen.getByRole('tab', { name: /user list/i })).toBeInTheDocument();
  expect(screen.getByText('John Doe')).toBeInTheDocument(); // Real data shown
});
```

---

## 6. Writing Tests

### Test Structure

```typescript
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { renderWithProviders } from '../../utils/testUtils';
import { mockUsers } from '../../utils/mockData';

vi.mock('src/redux/store/userSlice', () => ({
  getUsersRequest: vi.fn(req => ({ type: 'user/get', payload: req })),
}));

describe('UserManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render user list', () => {
    const preloadedState = { user: { users: mockUsers } };
    renderWithProviders(<UserManagement />, { preloadedState });

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should filter on search', () => {
    renderWithProviders(<UserManagement />, { preloadedState: ... });

    const searchInput = screen.getByPlaceholderText('Search...');
    fireEvent.change(searchInput, { target: { value: 'John' } });

    expect(searchInput).toHaveValue('John');
  });
});
```

### Querying Elements - Priority

**1. Accessible Queries (Ưu tiên CAO NHẤT)**
```typescript
screen.getByRole('button', { name: /submit/i });
screen.getByRole('textbox', { name: /email/i });
screen.getByLabelText('Email Address');
screen.getByPlaceholderText('Search...');
screen.getByText('Create User');
```

**2. Semantic**
```typescript
screen.getByAltText('Avatar');
screen.getByTitle('Close');
```

**3. Test IDs (LAST RESORT)**
```typescript
screen.getByTestId('complex-widget'); // Only khi không có option khác
```

**❌ TRÁNH**
```typescript
container.querySelector('.button'); // ❌ Class names
container.querySelector('[data-internal]'); // ❌ Internal attributes
```

### Common Patterns

**Multiple Elements:**
```typescript
const buttons = screen.getAllByRole('button');
expect(buttons).toHaveLength(3);

const deleteButton = screen.queryByRole('button', { name: /delete/i });
expect(deleteButton).not.toBeInTheDocument(); // queryBy returns null
```

**Async:**
```typescript
await waitFor(() => {
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});

await waitForElementToBeRemoved(screen.getByText('Loading...'));
```

**Forms:**
```typescript
const nameInput = screen.getByLabelText('Name');
fireEvent.change(nameInput, { target: { value: 'John' } });
expect(nameInput).toHaveValue('John');

fireEvent.click(screen.getByRole('button', { name: /submit/i }));

await waitFor(() => {
  expect(screen.getByText('Success')).toBeInTheDocument();
});
```

**Tables:**
```typescript
expect(screen.getByText('Name')).toBeInTheDocument(); // Header
expect(screen.getByText('John Doe')).toBeInTheDocument(); // Data

const rows = screen.getAllByRole('row');
expect(rows).toHaveLength(mockUsers.length + 1); // +1 for header
```

---

## 7. Test Coverage

### Requirements

- Statements: 80%
- Branches: 75%
- Functions: 80%
- Lines: 80%

```bash
npm run test:coverage
```

### Configuration (vitest.config.ts)

```typescript
coverage: {
  provider: 'v8',
  reporter: ['text', 'html'],
  exclude: ['node_modules/', 'test/', '**/*.test.{ts,tsx}'],
  thresholds: { statements: 80, branches: 75, functions: 80, lines: 80 },
}
```

---

## 8. Running Tests

```bash
npm run test                    # All tests
npm run test:watch              # Watch mode
npm run test -- path/to/file    # Specific file
npm run test:coverage           # With coverage
npm run test:ui                 # UI mode
```

---

## 9. Best Practices

### ✅ DO

```typescript
// Clear test names
it('should display error when email is invalid', () => {});

// Arrange-Act-Assert
it('should filter users', () => {
  const state = { user: { users: mockUsers } }; // Arrange
  renderWithProviders(<UserList />, { preloadedState: state }); // Act
  expect(screen.getByText('John')).toBeInTheDocument(); // Assert
});

// Test user behavior
it('should show success after save', async () => {
  renderWithProviders(<Form />);
  fireEvent.click(screen.getByRole('button', { name: /save/i }));
  await waitFor(() => {
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });
});

// Group related
describe('Authentication', () => {
  describe('Login', () => {
    it('with valid credentials', () => {});
    it('with invalid credentials', () => {});
  });
});

// Use mock data from JSON
const users = mockUsers;

// Clean up
beforeEach(() => vi.clearAllMocks());
```

### ❌ DON'T

```typescript
// ❌ Vague names
it('should work', () => {});

// ❌ Test implementation
it('should call handleSubmit', () => {
  const fn = vi.fn();
  // Testing function call, not behavior
});

// ❌ Test internal state
expect(component.state.value).toBe(5);

// ❌ Hard-code complex data
const user = { id: 1, name: 'John', /* 20 fields */ };

// ❌ Mock UI
vi.mock('src/components/Button', () => ({ Button: props => <button {...props} /> }));
```

---

## 10. Migration Guide - Removing UI Mocks

### Steps

**1. Find UI mocks:**
```bash
grep -r "vi.mock.*src/components/common/" test/ --include="*.test.tsx"
```

**2. Remove declarations:**
```typescript
// ❌ Delete
vi.mock('src/components/common/Input', () => ({
  InputCommon: props => <input {...props} />,
}));
```

**3. Update assertions:**
```typescript
// Before
expect(screen.getByTestId('search-input')).toBeInTheDocument();

// After
expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
```

**4. Fix translations:**
```typescript
// Before: key
expect(screen.getByText('user.title')).toBeInTheDocument();

// After: actual text
expect(screen.getByText('User Management')).toBeInTheDocument();
```

**5. Run and fix:**
```bash
npm run test -- path/to/test.tsx
npm run lint
git commit -m "test: remove UI mocks from Component"
```

---

## 11. Debugging

```typescript
// Print DOM
screen.debug();
screen.debug(screen.getByRole('button'));

// Get testing playground URL
screen.logTestingPlaygroundURL();

// Check available elements
console.log(screen.getAllByRole('button').length);
```

---

## 12. Test Quality Checklist

Before commit:

- [ ] No UI component mocks (Button, Input, Dialog, etc.)
- [ ] No i18n mocks
- [ ] Use accessible queries (getByRole, getByLabel, getByPlaceholder)
- [ ] Clear test names describing behavior
- [ ] Mock data from JSON fixtures
- [ ] Independent tests
- [ ] beforeEach() with vi.clearAllMocks()
- [ ] All tests pass: `npm run test`
- [ ] No lint errors: `npm run lint`
- [ ] Coverage maintained

---

## 13. Quick Reference

### Query Types

| Type | Returns | Use When |
|------|---------|----------|
| `getBy*` | Element or error | Should exist |
| `queryBy*` | Element or null | Might not exist |
| `findBy*` | Promise | Async |
| `getAllBy*` | Array or error | Multiple should exist |
| `queryAllBy*` | Array (empty ok) | Multiple might exist |
| `findAllBy*` | Promise<Array> | Async multiple |

### Common Matchers

```typescript
expect(el).toBeInTheDocument();
expect(el).toBeVisible();
expect(input).toHaveValue('text');
expect(checkbox).toBeChecked();
expect(button).toBeDisabled();
expect(el).toHaveTextContent('text');
expect(mockFn).toHaveBeenCalled();
expect(mockFn).toHaveBeenCalledWith(arg);
```

---

## Resources

- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro)
- [Vitest](https://vitest.dev/)
- [Testing Playground](https://testing-playground.com/)
- [Common Mistakes](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
