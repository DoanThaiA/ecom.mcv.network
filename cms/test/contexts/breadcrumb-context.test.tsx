import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { BreadcrumbProvider, useBreadcrumb, type BreadcrumbItem } from 'src/contexts/breadcrumb-context';

describe('BreadcrumbContext', () => {
  describe('BreadcrumbProvider', () => {
    it('provides breadcrumb context to children', () => {
      const { result } = renderHook(() => useBreadcrumb(), {
        wrapper: BreadcrumbProvider,
      });

      expect(result.current).toBeDefined();
      expect(result.current).toHaveProperty('breadcrumbs');
      expect(result.current).toHaveProperty('setBreadcrumbs');
    });

    it('initializes with empty breadcrumbs array', () => {
      const { result } = renderHook(() => useBreadcrumb(), {
        wrapper: BreadcrumbProvider,
      });

      expect(result.current.breadcrumbs).toEqual([]);
    });

    it('updates breadcrumbs when setBreadcrumbs is called', () => {
      const { result } = renderHook(() => useBreadcrumb(), {
        wrapper: BreadcrumbProvider,
      });

      const newBreadcrumbs: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
      ];

      act(() => {
        result.current.setBreadcrumbs(newBreadcrumbs);
      });

      expect(result.current.breadcrumbs).toEqual(newBreadcrumbs);
    });

    it('replaces breadcrumbs on subsequent calls', () => {
      const { result } = renderHook(() => useBreadcrumb(), {
        wrapper: BreadcrumbProvider,
      });

      const firstBreadcrumbs: BreadcrumbItem[] = [{ label: 'Home', href: '/' }];
      const secondBreadcrumbs: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Settings' },
      ];

      act(() => {
        result.current.setBreadcrumbs(firstBreadcrumbs);
      });

      expect(result.current.breadcrumbs).toEqual(firstBreadcrumbs);

      act(() => {
        result.current.setBreadcrumbs(secondBreadcrumbs);
      });

      expect(result.current.breadcrumbs).toEqual(secondBreadcrumbs);
    });

    it('handles breadcrumbs without href', () => {
      const { result } = renderHook(() => useBreadcrumb(), {
        wrapper: BreadcrumbProvider,
      });

      const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Current Page' },
      ];

      act(() => {
        result.current.setBreadcrumbs(breadcrumbs);
      });

      expect(result.current.breadcrumbs).toEqual(breadcrumbs);
      expect(result.current.breadcrumbs[1].href).toBeUndefined();
    });

    it('handles empty breadcrumbs array', () => {
      const { result } = renderHook(() => useBreadcrumb(), {
        wrapper: BreadcrumbProvider,
      });

      act(() => {
        result.current.setBreadcrumbs([{ label: 'Test' }]);
      });

      expect(result.current.breadcrumbs).toHaveLength(1);

      act(() => {
        result.current.setBreadcrumbs([]);
      });

      expect(result.current.breadcrumbs).toEqual([]);
    });

    it('memoizes setBreadcrumbs function', () => {
      const { result, rerender } = renderHook(() => useBreadcrumb(), {
        wrapper: BreadcrumbProvider,
      });

      const firstSetBreadcrumbs = result.current.setBreadcrumbs;

      rerender();

      expect(result.current.setBreadcrumbs).toBe(firstSetBreadcrumbs);
    });

    it('updates context value when breadcrumbs change', () => {
      const { result } = renderHook(() => useBreadcrumb(), {
        wrapper: BreadcrumbProvider,
      });

      const breadcrumbs: BreadcrumbItem[] = [{ label: 'Test', href: '/test' }];

      act(() => {
        result.current.setBreadcrumbs(breadcrumbs);
      });

      expect(result.current.breadcrumbs).toEqual(breadcrumbs);
    });
  });

  describe('useBreadcrumb', () => {
    it('throws error when used outside BreadcrumbProvider', () => {
      expect(() => {
        renderHook(() => useBreadcrumb());
      }).toThrow('useBreadcrumb must be used within BreadcrumbProvider');
    });

    it('returns breadcrumb context when used inside provider', () => {
      const { result } = renderHook(() => useBreadcrumb(), {
        wrapper: BreadcrumbProvider,
      });

      expect(result.current).toBeDefined();
      expect(typeof result.current.setBreadcrumbs).toBe('function');
      expect(Array.isArray(result.current.breadcrumbs)).toBe(true);
    });
  });

  describe('BreadcrumbItem type', () => {
    it('accepts items with label and href', () => {
      const { result } = renderHook(() => useBreadcrumb(), {
        wrapper: BreadcrumbProvider,
      });

      const item: BreadcrumbItem = {
        label: 'Test',
        href: '/test',
      };

      act(() => {
        result.current.setBreadcrumbs([item]);
      });

      expect(result.current.breadcrumbs[0]).toEqual(item);
    });

    it('accepts items with only label', () => {
      const { result } = renderHook(() => useBreadcrumb(), {
        wrapper: BreadcrumbProvider,
      });

      const item: BreadcrumbItem = {
        label: 'Current',
      };

      act(() => {
        result.current.setBreadcrumbs([item]);
      });

      expect(result.current.breadcrumbs[0]).toEqual(item);
    });
  });
});
