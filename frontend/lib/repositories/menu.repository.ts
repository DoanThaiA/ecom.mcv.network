import { API_BASE_URL } from '@/lib/config/api';
import type { ShopMenuItem, ShopMenuListResponse } from '@/types/gen/shop/shop/menus/menu';
import { fetchWithTimeout } from '@/lib/utils/fetchWithTimeout';

/**
 * Cache menus list to avoid duplicate fetches during SSR/dev double render.
 */
const MENU_REVALIDATE_SECONDS = 300;

/**
 * Fetch shop menus (server-side compatible)
 * Uses native fetch for SSR compatibility
 */
async function fetchShopMenus(): Promise<ShopMenuListResponse> {
  const url = `${API_BASE_URL}/shop/menus`;

  const response = await fetchWithTimeout(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    next: {
      revalidate: MENU_REVALIDATE_SECONDS,
    },
    timeout: 3000, // 3 second timeout
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch shop menus: ${response.statusText}`);
  }

  return response.json();
}

export interface ShopMenuItemWithLevel {
  menu: ShopMenuItem;
  level: number;
  subMenu: string[];
}

export interface ShopMenuListWithLevelResponse {
  menus: ShopMenuItemWithLevel[];
}

/**
 * Calculate the level of a menu item based on its parent chain
 * Level 1: Items without parentId
 * Level 2, 3, ...: Items with parentId pointing to parent items
 */
function calculateMenuLevel(
  menuId: string,
  menuMap: Map<string, ShopMenuItem>
): number {
  let level = 1;
  let currentId: string | undefined = menuId;

  while (currentId) {
    const menu = menuMap.get(currentId);
    if (!menu?.parentId) break;
    level++;
    currentId = menu.parentId;
  }

  return level;
}

/**
 * Build menu tree with subMenu as list of child IDs
 */
function buildMenuTree(menus: ShopMenuItem[]): ShopMenuItemWithLevel[] {
  const menuMap = new Map<string, ShopMenuItem>();
  menus.forEach((menu) => menuMap.set(menu.id, menu));

  // Create items with level and empty subMenu
  const itemsWithLevel = menus.map((menu) => ({
    menu,
    level: calculateMenuLevel(menu.id, menuMap),
    subMenu: [] as string[],
  }));

  // Build lookup map
  const itemMap = new Map<string, ShopMenuItemWithLevel>();
  itemsWithLevel.forEach((item) => itemMap.set(item.menu.id, item));

  // Populate subMenu with child IDs
  itemsWithLevel.forEach((item) => {
    if (item.menu.parentId) {
      const parent = itemMap.get(item.menu.parentId);
      if (parent) {
        parent.subMenu.push(item.menu.id);
      }
    }
  });

  // Sort subMenus by order
  itemsWithLevel.forEach((item) => {
    item.subMenu.sort((a, b) => {
      const menuA = menuMap.get(a);
      const menuB = menuMap.get(b);
      return (menuA?.order ?? 0) - (menuB?.order ?? 0);
    });
  });

  return itemsWithLevel;
}

/**
 * Convert flat menu list to menus with level information and nested subMenu
 */
function convertMenusWithLevel(menus: ShopMenuItem[]): ShopMenuItemWithLevel[] {
  return buildMenuTree(menus);
}

/**
 * Get shop menus with level information
 * Returns menus with calculated hierarchy level
 */
export async function getShopMenus(): Promise<ShopMenuListWithLevelResponse> {
  try {
    const response = await fetchShopMenus();

    const result = {
      menus: convertMenusWithLevel(response.menus),
    };
    return result;
  } catch {
    return {
      menus: [],
    };
  }
}
