import { describe, it, expect, vi } from 'vitest';
import { Router } from 'src/routes/sections';

// Mock react-router-dom
vi.mock('react-router-dom', () => ({
  Navigate: ({ to }: any) => <div data-testid="navigate" data-to={to}>Navigate</div>,
  useRoutes: vi.fn((routes) => <div data-testid="router">{JSON.stringify(routes)}</div>),
}));

// Mock layouts
vi.mock('src/layouts/auth', () => ({
  AuthLayout: ({ children }: any) => <div data-testid="auth-layout">{children}</div>,
}));

vi.mock('src/layouts/dashboard', () => ({
  DashboardLayout: ({ children }: any) => <div data-testid="dashboard-layout">{children}</div>,
}));

// Mock guards
vi.mock('src/components/auth/guest-guard', () => ({
  default: () => <div data-testid="guest-guard">GuestGuard</div>,
}));

vi.mock('src/components/auth/auth-guard', () => ({
  AuthGuard: () => <div data-testid="auth-guard">AuthGuard</div>,
}));

describe('Router', () => {
  it('renders without errors', () => {
    expect(() => {
      Router();
    }).not.toThrow();
  });

  it('calls useRoutes', async () => {
    const routerModule = await import('react-router-dom');
    const mockUseRoutes = vi.mocked(routerModule.useRoutes);
    Router();
    expect(mockUseRoutes).toHaveBeenCalled();
  });

  it('exports Router function', () => {
    expect(Router).toBeDefined();
    expect(typeof Router).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof Router).toBe('function');
    expect(Router.name).toBe('Router');
  });
});

describe('Lazy-loaded Page Components', () => {
  it('exports ProductPage', async () => {
    const { ProductPage } = await import('src/routes/sections');
    expect(ProductPage).toBeDefined();
  });

  it('exports ProductDetailPage', async () => {
    const { ProductDetailPage } = await import('src/routes/sections');
    expect(ProductDetailPage).toBeDefined();
  });

  it('exports ProductComboPage', async () => {
    const { ProductComboPage } = await import('src/routes/sections');
    expect(ProductComboPage).toBeDefined();
  });

  it('exports ProductComboDetailPage', async () => {
    const { ProductComboDetailPage } = await import('src/routes/sections');
    expect(ProductComboDetailPage).toBeDefined();
  });

  it('exports ProductComboCreatePage', async () => {
    const { ProductComboCreatePage } = await import('src/routes/sections');
    expect(ProductComboCreatePage).toBeDefined();
  });

  it('exports ProductComboEditPage', async () => {
    const { ProductComboEditPage } = await import('src/routes/sections');
    expect(ProductComboEditPage).toBeDefined();
  });

  it('exports ProductCategoryPage', async () => {
    const { ProductCategoryPage } = await import('src/routes/sections');
    expect(ProductCategoryPage).toBeDefined();
  });

  it('exports InventoryPage', async () => {
    const { InventoryPage } = await import('src/routes/sections');
    expect(InventoryPage).toBeDefined();
  });

  it('exports OrderPage', async () => {
    const { OrderPage } = await import('src/routes/sections');
    expect(OrderPage).toBeDefined();
  });

  it('exports FlashSalePage', async () => {
    const { FlashSalePage } = await import('src/routes/sections');
    expect(FlashSalePage).toBeDefined();
  });

  it('exports FlashSaleCreatePage', async () => {
    const { FlashSaleCreatePage } = await import('src/routes/sections');
    expect(FlashSaleCreatePage).toBeDefined();
  });

  it('exports FlashSaleEditPage', async () => {
    const { FlashSaleEditPage } = await import('src/routes/sections');
    expect(FlashSaleEditPage).toBeDefined();
  });

  it('exports PromotionPage', async () => {
    const { PromotionPage } = await import('src/routes/sections');
    expect(PromotionPage).toBeDefined();
  });

  it('exports ShockDealCreatePage', async () => {
    const { ShockDealCreatePage } = await import('src/routes/sections');
    expect(ShockDealCreatePage).toBeDefined();
  });

  it('exports ShockDealEditPage', async () => {
    const { ShockDealEditPage } = await import('src/routes/sections');
    expect(ShockDealEditPage).toBeDefined();
  });

  it('exports NewsPage', async () => {
    const { NewsPage } = await import('src/routes/sections');
    expect(NewsPage).toBeDefined();
  });

  it('exports NewsCreatePage', async () => {
    const { NewsCreatePage } = await import('src/routes/sections');
    expect(NewsCreatePage).toBeDefined();
  });

  it('exports NewsEditPage', async () => {
    const { NewsEditPage } = await import('src/routes/sections');
    expect(NewsEditPage).toBeDefined();
  });

  it('exports TopicPage', async () => {
    const { TopicPage } = await import('src/routes/sections');
    expect(TopicPage).toBeDefined();
  });

  it('exports TopicCreatePage', async () => {
    const { TopicCreatePage } = await import('src/routes/sections');
    expect(TopicCreatePage).toBeDefined();
  });

  it('exports TopicEditPage', async () => {
    const { TopicEditPage } = await import('src/routes/sections');
    expect(TopicEditPage).toBeDefined();
  });

  it('exports MenuPage', async () => {
    const { MenuPage } = await import('src/routes/sections');
    expect(MenuPage).toBeDefined();
  });

  it('exports OrderDetailPage', async () => {
    const { OrderDetailPage } = await import('src/routes/sections');
    expect(OrderDetailPage).toBeDefined();
  });

  it('exports ReturnPage', async () => {
    const { ReturnPage } = await import('src/routes/sections');
    expect(ReturnPage).toBeDefined();
  });

  it('exports ReturnDetailPage', async () => {
    const { ReturnDetailPage } = await import('src/routes/sections');
    expect(ReturnDetailPage).toBeDefined();
  });

  it('exports AccountPage', async () => {
    const { AccountPage } = await import('src/routes/sections');
    expect(AccountPage).toBeDefined();
  });

  it('exports SignInPage', async () => {
    const { SignInPage } = await import('src/routes/sections');
    expect(SignInPage).toBeDefined();
  });

  it('exports ForgotPasswordPage', async () => {
    const { ForgotPasswordPage } = await import('src/routes/sections');
    expect(ForgotPasswordPage).toBeDefined();
  });

  it('exports NhanhAuthCallbackPage', async () => {
    const { NhanhAuthCallbackPage } = await import('src/routes/sections');
    expect(NhanhAuthCallbackPage).toBeDefined();
  });

  it('exports ZaloAuthCallbackPage', async () => {
    const { ZaloAuthCallbackPage } = await import('src/routes/sections');
    expect(ZaloAuthCallbackPage).toBeDefined();
  });

  it('exports ReviewPage', async () => {
    const { ReviewPage } = await import('src/routes/sections');
    expect(ReviewPage).toBeDefined();
  });
});
