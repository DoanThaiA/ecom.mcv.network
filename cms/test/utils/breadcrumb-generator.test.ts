import { describe, it, expect } from 'vitest';
import { generateBreadcrumbsFromNav, isDetailPage } from 'src/utils/breadcrumb-generator';
import type { NavItem } from 'src/layouts/config-nav-dashboard';

describe('breadcrumb-generator utils', () => {
  const mockNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      path: '/',
      icon: 'ic:round-dashboard',
    },
    {
      title: 'Products',
      path: '/product',
      icon: 'ic:round-inventory',
      children: [
        { title: 'Product List', path: '/product', icon: 'ic:round-list' },
        { title: 'Categories', path: '/product-category', icon: 'ic:round-category' },
      ],
    },
    {
      title: 'Orders',
      path: '/order',
      icon: 'ic:round-shopping-cart',
    },
  ];

  describe('generateBreadcrumbsFromNav', () => {
    it('generates breadcrumbs for root path', () => {
      const result = generateBreadcrumbsFromNav(mockNavItems, '/');
      expect(result).toEqual([{ label: 'Dashboard', href: undefined }]);
    });

    it('generates breadcrumbs for simple path', () => {
      const result = generateBreadcrumbsFromNav(mockNavItems, '/order');
      expect(result).toEqual([{ label: 'Orders', href: undefined }]);
    });

    it('generates breadcrumbs for nested path', () => {
      const result = generateBreadcrumbsFromNav(mockNavItems, '/product-category');
      expect(result).toEqual([
        { label: 'Products', href: '/product' },
        { label: 'Categories', href: undefined },
      ]);
    });

    it('generates breadcrumbs for detail page', () => {
      const result = generateBreadcrumbsFromNav(mockNavItems, '/product/123');
      expect(result).toEqual([
        { label: 'Products', href: '/product' },
        { label: 'Product List', href: '/product' },
        { label: 'detail', href: undefined },
      ]);
    });

    it('generates breadcrumbs for create page', () => {
      const result = generateBreadcrumbsFromNav(mockNavItems, '/product/create');
      expect(result).toEqual([
        { label: 'Products', href: '/product' },
        { label: 'Product List', href: '/product' },
        { label: 'create', href: undefined },
      ]);
    });

    it('generates breadcrumbs for edit page', () => {
      const result = generateBreadcrumbsFromNav(mockNavItems, '/product/edit/123');
      expect(result).toEqual([
        { label: 'Products', href: '/product' },
        { label: 'Product List', href: '/product' },
        { label: 'update', href: undefined },
      ]);
    });

    it('returns null for unknown path', () => {
      const result = generateBreadcrumbsFromNav(mockNavItems, '/unknown');
      expect(result).toBeNull();
    });

    it('finds best match for longer paths', () => {
      const result = generateBreadcrumbsFromNav(mockNavItems, '/product/edit/123');
      expect(result?.[0].label).toBe('Products');
      expect(result?.[2].label).toBe('update');
    });

    it('excludes placeholder paths (#)', () => {
      const navWithPlaceholder: NavItem[] = [
        {
          title: 'Parent',
          path: '#',
          icon: 'ic:round-folder',
          children: [{ title: 'Child', path: '/child', icon: 'ic:round-file' }],
        },
      ];
      const result = generateBreadcrumbsFromNav(navWithPlaceholder, '/child');
      expect(result).toEqual([
        { label: 'Parent', href: undefined },
        { label: 'Child', href: undefined },
      ]);
    });
  });

  describe('isDetailPage', () => {
    it('returns true for detail page', () => {
      expect(isDetailPage('/product', '/product/123')).toBe(true);
    });

    it('returns false for list page', () => {
      expect(isDetailPage('/product', '/product')).toBe(false);
    });

    it('returns false for unrelated page', () => {
      expect(isDetailPage('/product', '/order')).toBe(false);
    });

    it('returns true for nested detail page', () => {
      expect(isDetailPage('/product', '/product/edit/123')).toBe(true);
    });
  });
});
