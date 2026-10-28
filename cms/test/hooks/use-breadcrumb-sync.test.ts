import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useBreadcrumbSync } from 'src/hooks/use-breadcrumb-sync';

// Mock dependencies
vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(() => ({ pathname: '/products' })),
}));

vi.mock('react-i18next', () => ({
  useTranslation: vi.fn(() => ({ t: (key: string) => key })),
}));

vi.mock('src/contexts/breadcrumb-context', () => ({
  useBreadcrumb: vi.fn(() => ({ setBreadcrumbs: vi.fn() })),
}));

vi.mock('src/utils/breadcrumb-generator', () => ({
  generateBreadcrumbsFromNav: vi.fn(() => [{ label: 'products', href: '/products' }]),
}));

vi.mock('src/layouts/config-nav-dashboard', () => ({
  NavbarData: class {
    getNavigation = vi.fn(() => []);
  },
}));

const mockUseLocation = vi.mocked(await import('react-router-dom')).useLocation;
const mockUseTranslation = vi.mocked(await import('react-i18next')).useTranslation;
const mockUseBreadcrumb = vi.mocked(await import('src/contexts/breadcrumb-context')).useBreadcrumb;
const mockGenerateBreadcrumbsFromNav = vi.mocked(
  await import('src/utils/breadcrumb-generator')
).generateBreadcrumbsFromNav;

describe('useBreadcrumbSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sets breadcrumbs on mount', () => {
    const setBreadcrumbs = vi.fn();
    mockUseBreadcrumb.mockReturnValue({ breadcrumbs: [], setBreadcrumbs });
    mockGenerateBreadcrumbsFromNav.mockReturnValue([{ label: 'products', href: '/products' }]);

    renderHook(() => useBreadcrumbSync());

    expect(setBreadcrumbs).toHaveBeenCalledWith([{ label: 'products', href: '/products' }]);
  });

  it('translates breadcrumb labels', () => {
    const setBreadcrumbs = vi.fn();
    const t = vi.fn((key: string) => `translated_${key}`);
    mockUseBreadcrumb.mockReturnValue({ breadcrumbs: [], setBreadcrumbs });
    mockUseTranslation.mockReturnValue({ t, i18n: {} as any, ready: true });
    mockGenerateBreadcrumbsFromNav.mockReturnValue([
      { label: 'home', href: '/' },
      { label: 'products', href: '/products' },
    ]);

    renderHook(() => useBreadcrumbSync());

    expect(setBreadcrumbs).toHaveBeenCalledWith([
      { label: 'translated_home', href: '/' },
      { label: 'translated_products', href: '/products' },
    ]);
  });

  it('sets empty breadcrumbs when no match', () => {
    const setBreadcrumbs = vi.fn();
    mockUseBreadcrumb.mockReturnValue({ breadcrumbs: [], setBreadcrumbs });
    mockGenerateBreadcrumbsFromNav.mockReturnValue(null);

    renderHook(() => useBreadcrumbSync());

    expect(setBreadcrumbs).toHaveBeenCalledWith([]);
  });

  it('updates breadcrumbs when location changes', () => {
    const setBreadcrumbs = vi.fn();
    mockUseBreadcrumb.mockReturnValue({ breadcrumbs: [], setBreadcrumbs });

    mockUseLocation.mockReturnValue({ pathname: '/products' } as any);
    mockGenerateBreadcrumbsFromNav.mockReturnValue([{ label: 'products', href: '/products' }]);

    const { rerender } = renderHook(() => useBreadcrumbSync());

    mockUseLocation.mockReturnValue({ pathname: '/orders' } as any);
    mockGenerateBreadcrumbsFromNav.mockReturnValue([{ label: 'orders', href: '/orders' }]);

    rerender();

    expect(setBreadcrumbs).toHaveBeenCalledTimes(2);
  });

  it('handles breadcrumbs with no href', () => {
    const setBreadcrumbs = vi.fn();
    const t = vi.fn((key: string) => `translated_${key}`);
    mockUseBreadcrumb.mockReturnValue({ breadcrumbs: [], setBreadcrumbs });
    mockUseTranslation.mockReturnValue({ t, i18n: {} as any, ready: true });
    mockGenerateBreadcrumbsFromNav.mockReturnValue([
      { label: 'home', href: '/' },
      { label: 'current' },
    ]);

    renderHook(() => useBreadcrumbSync());

    expect(setBreadcrumbs).toHaveBeenCalledWith([
      { label: 'translated_home', href: '/' },
      { label: 'translated_current' },
    ]);
  });

  it('handles empty navigation data', () => {
    const setBreadcrumbs = vi.fn();
    mockUseBreadcrumb.mockReturnValue({ breadcrumbs: [], setBreadcrumbs });
    mockGenerateBreadcrumbsFromNav.mockReturnValue(null);

    renderHook(() => useBreadcrumbSync());

    expect(setBreadcrumbs).toHaveBeenCalledWith([]);
  });

  it('handles root path', () => {
    const setBreadcrumbs = vi.fn();
    mockUseBreadcrumb.mockReturnValue({ breadcrumbs: [], setBreadcrumbs });
    mockUseLocation.mockReturnValue({ pathname: '/' } as any);
    mockGenerateBreadcrumbsFromNav.mockReturnValue(null);

    renderHook(() => useBreadcrumbSync());

    expect(setBreadcrumbs).toHaveBeenCalledWith([]);
  });
});
