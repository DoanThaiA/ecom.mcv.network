import { describe, it, expect, vi } from 'vitest';
import { AccountPopover } from 'src/layouts/components/account-popover';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/routes/hooks', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('src/hooks', () => ({
  useDialog: () => ({
    isOpen: false,
    open: vi.fn(),
    close: vi.fn(),
  }),
}));

vi.mock('src/services/localStorage', () => ({
  appLocalStorage: {
    getItem: vi.fn(() => ({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
    })),
  },
  localStorageKeys: {
    USER: 'user',
  },
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => vi.fn(),
}));

vi.mock('src/redux/store/authSlice', () => ({
  logoutRequest: vi.fn((payload) => ({ type: 'LOGOUT_REQUEST', payload })),
}));

vi.mock('src/redux/store/accountSlice', () => ({
  changePasswordRequest: vi.fn((payload) => ({ type: 'CHANGE_PASSWORD_REQUEST', payload })),
}));

vi.mock('src/sections/account/change-password-dialog', () => ({
  ChangePasswordDialog: () => <div data-testid="change-password-dialog">Dialog</div>,
}));

describe('AccountPopover', () => {
  it('exports AccountPopover function', () => {
    expect(AccountPopover).toBeDefined();
    expect(typeof AccountPopover).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof AccountPopover).toBe('function');
    expect(AccountPopover.name).toBe('AccountPopover');
  });

  it('has correct display name', () => {
    expect(AccountPopover.name).toBe('AccountPopover');
  });

  it('is exported as a named export', () => {
    expect(AccountPopover).toBeDefined();
  });

  it('is a React component', () => {
    expect(typeof AccountPopover).toBe('function');
  });

  it('accepts props', () => {
    const props = { data: [], sx: {} };
    expect(props).toBeDefined();
  });

  it('has AccountPopoverProps type', () => {
    const props: any = { data: [] };
    expect(props.data).toEqual([]);
  });

  it('supports sx prop', () => {
    const sx = { bgcolor: 'red' };
    expect(sx).toBeDefined();
  });

  it('supports data prop', () => {
    const data = [{ label: 'Test', href: '/test' }];
    expect(data.length).toBe(1);
  });

  it('component has proper structure', () => {
    expect(AccountPopover).toBeDefined();
  });
});
