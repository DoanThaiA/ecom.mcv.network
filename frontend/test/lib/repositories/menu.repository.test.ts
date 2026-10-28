import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getShopMenus } from '@/lib/repositories/menu.repository';
import { API_BASE_URL } from '@/lib/config/api';
import type { ShopMenuItem, ShopMenuListResponse } from '@/types/gen/shop/shop/menus/menu';
import { fetchWithTimeout } from '@/lib/utils/fetchWithTimeout';

// Mock fetchWithTimeout
vi.mock('@/lib/utils/fetchWithTimeout', () => ({
  fetchWithTimeout: vi.fn(),
}));

describe('MenuRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getShopMenus', () => {
    it('fetches and processes shop menus successfully', async () => {
      const mockMenus: ShopMenuItem[] = [
        {
          id: '1',
          name: 'Menu 1',
          order: 1,
          parentId: undefined,
        } as ShopMenuItem,
        {
          id: '2',
          name: 'Menu 2',
          order: 2,
          parentId: undefined,
        } as ShopMenuItem,
      ];

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menus: mockMenus }),
      } as Response);

      const result = await getShopMenus();

      expect(fetchWithTimeout).toHaveBeenCalledWith(`${API_BASE_URL}/shop/menus`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        next: {
          revalidate: 300,
        },
        timeout: 3000,
      });

      expect(result.menus).toHaveLength(2);
      expect(result.menus[0].menu.id).toBe('1');
      expect(result.menus[0].level).toBe(1);
      expect(result.menus[0].subMenu).toEqual([]);
    });

    it('calculates menu levels correctly for nested menus', async () => {
      const mockMenus: ShopMenuItem[] = [
        {
          id: '1',
          name: 'Parent',
          order: 1,
          parentId: undefined,
        } as ShopMenuItem,
        {
          id: '2',
          name: 'Child Level 1',
          order: 1,
          parentId: '1',
        } as ShopMenuItem,
        {
          id: '3',
          name: 'Child Level 2',
          order: 1,
          parentId: '2',
        } as ShopMenuItem,
      ];

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menus: mockMenus }),
      } as Response);

      const result = await getShopMenus();

      const menu1 = result.menus.find((m) => m.menu.id === '1');
      const menu2 = result.menus.find((m) => m.menu.id === '2');
      const menu3 = result.menus.find((m) => m.menu.id === '3');

      expect(menu1?.level).toBe(1);
      expect(menu2?.level).toBe(2);
      expect(menu3?.level).toBe(3);
    });

    it('builds subMenu arrays with child IDs', async () => {
      const mockMenus: ShopMenuItem[] = [
        {
          id: '1',
          name: 'Parent',
          order: 1,
          parentId: undefined,
        } as ShopMenuItem,
        {
          id: '2',
          name: 'Child 1',
          order: 1,
          parentId: '1',
        } as ShopMenuItem,
        {
          id: '3',
          name: 'Child 2',
          order: 2,
          parentId: '1',
        } as ShopMenuItem,
      ];

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menus: mockMenus }),
      } as Response);

      const result = await getShopMenus();

      const parent = result.menus.find((m) => m.menu.id === '1');
      expect(parent?.subMenu).toEqual(['2', '3']);
    });

    it('sorts subMenu by order', async () => {
      const mockMenus: ShopMenuItem[] = [
        {
          id: '1',
          name: 'Parent',
          order: 1,
          parentId: undefined,
        } as ShopMenuItem,
        {
          id: '2',
          name: 'Child order 3',
          order: 3,
          parentId: '1',
        } as ShopMenuItem,
        {
          id: '3',
          name: 'Child order 1',
          order: 1,
          parentId: '1',
        } as ShopMenuItem,
        {
          id: '4',
          name: 'Child order 2',
          order: 2,
          parentId: '1',
        } as ShopMenuItem,
      ];

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menus: mockMenus }),
      } as Response);

      const result = await getShopMenus();

      const parent = result.menus.find((m) => m.menu.id === '1');
      expect(parent?.subMenu).toEqual(['3', '4', '2']);
    });

    it('handles menus without order (defaults to 0)', async () => {
      const mockMenus: ShopMenuItem[] = [
        {
          id: '1',
          name: 'Parent',
          order: 1,
          parentId: undefined,
        } as ShopMenuItem,
        {
          id: '2',
          name: 'Child without order',
          parentId: '1',
        } as ShopMenuItem,
        {
          id: '3',
          name: 'Child with order',
          order: 5,
          parentId: '1',
        } as ShopMenuItem,
      ];

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menus: mockMenus }),
      } as Response);

      const result = await getShopMenus();

      const parent = result.menus.find((m) => m.menu.id === '1');
      // Child without order (defaults to 0) should come before child with order 5
      expect(parent?.subMenu).toEqual(['2', '3']);
    });

    it('handles empty menus array', async () => {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menus: [] }),
      } as Response);

      const result = await getShopMenus();

      expect(result.menus).toEqual([]);
    });

    it('returns empty array when fetch fails', async () => {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      } as Response);

      const result = await getShopMenus();

      expect(result).toEqual({ menus: [] });
    });

    it('returns empty array when fetch throws error', async () => {
      vi.mocked(fetchWithTimeout).mockRejectedValueOnce(new Error('Network error'));

      const result = await getShopMenus();

      expect(result).toEqual({ menus: [] });
    });

    it('returns empty array when JSON parsing fails', async () => {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        },
      } as Response);

      const result = await getShopMenus();

      expect(result).toEqual({ menus: [] });
    });

    it('handles complex nested menu structure', async () => {
      const mockMenus: ShopMenuItem[] = [
        { id: '1', name: 'Root 1', order: 1 } as ShopMenuItem,
        { id: '2', name: 'Root 2', order: 2 } as ShopMenuItem,
        { id: '3', name: 'Child 1.1', order: 1, parentId: '1' } as ShopMenuItem,
        { id: '4', name: 'Child 1.2', order: 2, parentId: '1' } as ShopMenuItem,
        { id: '5', name: 'Child 2.1', order: 1, parentId: '2' } as ShopMenuItem,
        {
          id: '6',
          name: 'Grandchild 1.1.1',
          order: 1,
          parentId: '3',
        } as ShopMenuItem,
      ];

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menus: mockMenus }),
      } as Response);

      const result = await getShopMenus();

      const root1 = result.menus.find((m) => m.menu.id === '1');
      const root2 = result.menus.find((m) => m.menu.id === '2');
      const child11 = result.menus.find((m) => m.menu.id === '3');
      const grandchild = result.menus.find((m) => m.menu.id === '6');

      expect(root1?.level).toBe(1);
      expect(root1?.subMenu).toEqual(['3', '4']);

      expect(root2?.level).toBe(1);
      expect(root2?.subMenu).toEqual(['5']);

      expect(child11?.level).toBe(2);
      expect(child11?.subMenu).toEqual(['6']);

      expect(grandchild?.level).toBe(3);
      expect(grandchild?.subMenu).toEqual([]);
    });

    it('handles menu with invalid parentId', async () => {
      const mockMenus: ShopMenuItem[] = [
        { id: '1', name: 'Root', order: 1 } as ShopMenuItem,
        {
          id: '2',
          name: 'Child with invalid parent',
          order: 1,
          parentId: 'non-existent',
        } as ShopMenuItem,
      ];

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menus: mockMenus }),
      } as Response);

      const result = await getShopMenus();

      // Child with invalid parentId should still be processed
      expect(result.menus).toHaveLength(2);
      const childWithInvalidParent = result.menus.find(
        (m) => m.menu.id === '2'
      );
      expect(childWithInvalidParent?.level).toBe(2); // Has parentId, so level increments even if parent doesn't exist
      expect(childWithInvalidParent?.subMenu).toEqual([]);
    });

    it('uses correct API endpoint', async () => {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menus: [] }),
      } as Response);

      await getShopMenus();

      expect(fetchWithTimeout).toHaveBeenCalledWith(
        expect.stringContaining('/shop/menus'),
        expect.any(Object)
      );
    });

    it('sets revalidate to 300 seconds', async () => {
      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menus: [] }),
      } as Response);

      await getShopMenus();

      expect(fetchWithTimeout).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          next: {
            revalidate: 300,
          },
        })
      );
    });

    it('handles menus with same order value', async () => {
      const mockMenus: ShopMenuItem[] = [
        { id: '1', name: 'Parent', order: 1 } as ShopMenuItem,
        {
          id: '2',
          name: 'Child same order 1',
          order: 5,
          parentId: '1',
        } as ShopMenuItem,
        {
          id: '3',
          name: 'Child same order 2',
          order: 5,
          parentId: '1',
        } as ShopMenuItem,
        {
          id: '4',
          name: 'Child same order 3',
          order: 5,
          parentId: '1',
        } as ShopMenuItem,
      ];

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menus: mockMenus }),
      } as Response);

      const result = await getShopMenus();

      const parent = result.menus.find((m) => m.menu.id === '1');
      // All children have same order, so order should be preserved from original array
      expect(parent?.subMenu).toHaveLength(3);
      expect(parent?.subMenu).toContain('2');
      expect(parent?.subMenu).toContain('3');
      expect(parent?.subMenu).toContain('4');
    });

    it('handles single menu item', async () => {
      const mockMenus: ShopMenuItem[] = [
        { id: '1', name: 'Single Menu', order: 1 } as ShopMenuItem,
      ];

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menus: mockMenus }),
      } as Response);

      const result = await getShopMenus();

      expect(result.menus).toHaveLength(1);
      expect(result.menus[0].menu.id).toBe('1');
      expect(result.menus[0].level).toBe(1);
      expect(result.menus[0].subMenu).toEqual([]);
    });

    it('handles menu with many children', async () => {
      const mockMenus: ShopMenuItem[] = [
        { id: 'parent', name: 'Parent', order: 1 } as ShopMenuItem,
        ...Array.from({ length: 50 }, (_, i) => ({
          id: `child-${i}`,
          name: `Child ${i}`,
          order: i,
          parentId: 'parent',
        })) as ShopMenuItem[],
      ];

      vi.mocked(fetchWithTimeout).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ menus: mockMenus }),
      } as Response);

      const result = await getShopMenus();

      const parent = result.menus.find((m) => m.menu.id === 'parent');
      expect(parent?.subMenu).toHaveLength(50);
    });
  });
});
