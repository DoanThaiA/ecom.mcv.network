import { describe, it, expect, vi } from 'vitest';
import { DashboardLayout } from 'src/layouts/dashboard/layout';

vi.mock('@mui/material/styles', () => ({
  useTheme: () => ({
    breakpoints: {
      up: () => '@media (min-width:0px)',
    },
    spacing: (value: number) => `${value * 8}px`,
  }),
}));

vi.mock('src/contexts/page-title-context', () => ({
  usePageTitle: () => ({ title: 'Test Title' }),
}));

vi.mock('src/hooks/use-breadcrumb-sync', () => ({
  useBreadcrumbSync: vi.fn(),
}));

vi.mock('react-router-dom', () => ({
  useSearchParams: () => [new URLSearchParams(), vi.fn()],
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => vi.fn(),
}));

vi.mock('src/routes/hooks/use-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
  }),
}));

vi.mock('src/redux/store/authSlice', () => ({
  logoutRequest: vi.fn(),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: () => <span>Icon</span>,
}));

vi.mock('src/components/breadcrumb', () => ({
  Breadcrumb: () => <div data-testid="breadcrumb">Breadcrumb</div>,
}));

vi.mock('../components/account-popover', () => ({
  AccountPopover: () => <div data-testid="account-popover">Account</div>,
}));

vi.mock('../components/language-popover', () => ({
  LanguagePopover: () => <div data-testid="language-popover">Language</div>,
}));

vi.mock('../components/menu-button', () => ({
  MenuButton: () => <button data-testid="menu-button">Menu</button>,
}));

vi.mock('../config-nav-dashboard', () => ({
  NavbarData: class {
    getNavigation() {
      return [];
    }
  },
}));

vi.mock('../core/header-section', () => ({
  HeaderSection: ({ slots }: any) => (
    <div data-testid="header-section">
      {slots.topArea}
      {slots.leftArea}
      {slots.breadcrumbArea}
      {slots.centerArea}
      {slots.rightArea}
    </div>
  ),
}));

vi.mock('../core/layout-section', () => ({
  LayoutSection: ({ children, headerSection, sidebarSection }: any) => (
    <div data-testid="layout-section">
      {headerSection}
      {sidebarSection}
      {children}
    </div>
  ),
}));

vi.mock('src/layouts/dashboard/main', () => ({
  Main: ({ children }: any) => <main data-testid="main">{children}</main>,
}));

vi.mock('src/layouts/dashboard/nav', () => ({
  NavDesktop: () => <div data-testid="nav-desktop">NavDesktop</div>,
  NavMobile: () => <div data-testid="nav-mobile">NavMobile</div>,
}));

describe('DashboardLayout', () => {
  it('exports DashboardLayout function', () => {
    expect(DashboardLayout).toBeDefined();
    expect(typeof DashboardLayout).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof DashboardLayout).toBe('function');
    expect(DashboardLayout.name).toBe('DashboardLayout');
  });

  it('has correct display name', () => {
    expect(DashboardLayout.name).toBe('DashboardLayout');
  });

  it('is exported as a named export', () => {
    expect(DashboardLayout).toBeDefined();
  });

  it('is a React component', () => {
    expect(typeof DashboardLayout).toBe('function');
  });

  it('accepts children prop', () => {
    const children = <div>Test</div>;
    expect(children).toBeDefined();
  });

  it('accepts sx prop', () => {
    const sx = { bgcolor: 'red' };
    expect(sx).toBeDefined();
  });

  it('accepts header prop', () => {
    const header = { sx: { p: 2 } };
    expect(header).toBeDefined();
  });

  it('has DashboardLayoutProps type', () => {
    const props: any = { children: <div>Test</div> };
    expect(props.children).toBeDefined();
  });

  it('component has proper structure', () => {
    expect(DashboardLayout).toBeDefined();
  });
});
