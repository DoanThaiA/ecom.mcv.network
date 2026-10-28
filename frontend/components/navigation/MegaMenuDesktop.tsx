'use client';

import { getLocalizedName } from '@/lib/helpers/localizationHelper';
import { AppLocale } from '@/lib/locale';
import type { ShopMenuItemWithLevel } from '@/lib/repositories/menu.repository';
import { getMenuUrl } from '@/lib/utils/menuUrl';
import { handleHashLinkClick } from '@/lib/utils/dom';
import { Box, Flex, Link, Separator, Text } from '@radix-ui/themes';
import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface MegaMenuDesktopProps {
  menus: ShopMenuItemWithLevel[];
  parentMenuId: string;
  locale: AppLocale;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function MegaMenuDesktop({
  menus,
  parentMenuId,
  locale,
  onMouseEnter,
  onMouseLeave,
}: MegaMenuDesktopProps) {
  const pathname = usePathname();

  // Create a map for quick lookup
  const menuMap = useMemo(() => {
    const map = new Map<string, ShopMenuItemWithLevel>();
    menus.forEach((m) => map.set(m.menu.id, m));
    return map;
  }, [menus]);

  // Get level 2 menus (children of the parent level 1 menu)
  const level2Menus = useMemo(() => {
    const parentMenu = menuMap.get(parentMenuId);
    if (!parentMenu) return [];

    return parentMenu.subMenu
      .map((id) => menuMap.get(id))
      .filter((m): m is ShopMenuItemWithLevel => !!m && m.level === 2)
      .sort((a, b) => a.menu.order - b.menu.order);
  }, [menuMap, parentMenuId]);

  // Find level 2 that contains the current page
  const findActiveLevel2FromPathname = useMemo(() => {
    if (!pathname) return null;

    for (const level2 of level2Menus) {
      // Check if pathname matches level 2 URL
      if (pathname.endsWith(level2.menu.url)) {
        return level2.menu.id;
      }

      // Check level 3 children of this level 2
      for (const level3Id of level2.subMenu) {
        const level3Menu = menuMap.get(level3Id);
        if (level3Menu && pathname.endsWith(level3Menu.menu.url)) {
          return level2.menu.id;
        }
      }
    }

    return null;
  }, [pathname, level2Menus, menuMap]);

  // Track active level 2 menu
  const [activeLevel2Id, setActiveLevel2Id] = useState<string | null>(null);

  // Reset activeLevel2Id when parentMenuId changes, prioritize current page's level 2
  useEffect(() => {
    const initialLevel2 =
      findActiveLevel2FromPathname ?? level2Menus[0]?.menu.id ?? null;
    setActiveLevel2Id(initialLevel2);
  }, [parentMenuId, level2Menus, findActiveLevel2FromPathname]);

  // Get level 3 menus (children of active level 2 menu)
  const level3Menus = useMemo(() => {
    if (!activeLevel2Id) return [];

    const activeMenu = menuMap.get(activeLevel2Id);
    if (!activeMenu) return [];

    return activeMenu.subMenu
      .map((id) => menuMap.get(id))
      .filter((m): m is ShopMenuItemWithLevel => !!m && m.level === 3)
      .sort((a, b) => a.menu.order - b.menu.order);
  }, [menuMap, activeLevel2Id]);

  // Split level 3 menus into 3 columns
  const level3Columns = useMemo(() => {
    const columns: ShopMenuItemWithLevel[][] = [[], [], []];
    level3Menus.forEach((menu, index) => {
      columns[index % 3].push(menu);
    });
    return columns;
  }, [level3Menus]);

  if (level2Menus.length === 0) return null;

  return (
    <Box
      className="absolute left-[20%] right-[20%] top-full bg-white shadow-lg border-t border-gray-200 z-50 rounded-2xl"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Flex className="flex">
        {/* Left Column - Level 2 Menus */}
        <Flex
          direction="column"
          gap="6"
          className="py-6 items-center flex-1 max-w-64 bg-gradient-to-br from-[#f8d0ad] via-[#fbe8d3] to-[#fdf5eb] rounded-l-2xl"
        >
          {level2Menus.map((menu) => {
            const menuUrl = getMenuUrl(menu.menu, locale);
            return (
              <Link
                key={menu.menu.id}
                href={menuUrl}
                className={`
                  no-underline px-4 py-1.5 rounded-full text-base font-semibold text-center transition-colors min-w-48
                  ${
                    activeLevel2Id === menu.menu.id
                      ? 'bg-[#C87C32] text-white'
                      : 'bg-primary-light text-gray-700 hover:bg-primary/20'
                  }
                `}
                onMouseEnter={() => setActiveLevel2Id(menu.menu.id)}
                onClick={(e) => handleHashLinkClick(menuUrl, e)}
              >
                {getLocalizedName(menu.menu.name, menu.menu.localization, locale)}
              </Link>
            );
          })}
        </Flex>

        {/* Divider */}
        <Separator orientation="vertical" className="h-auto" />

        {/* Right Area - Level 3 Menus in 3 columns with dividers */}
        <Flex className="flex-1 pt-[1.875rem] pb-6 max-h-full overflow-y-auto">
          {level3Columns.map((column, colIndex) => (
            <Flex
              key={colIndex}
              direction="column"
              gap="5"
              align="center"
              className={`flex-1 px-6 ${colIndex > 0 ? 'border-l border-gray-200' : ''}`}
            >
              {column.map((menu) => {
                const menuUrl = getMenuUrl(menu.menu, locale);
                return (
                  <Link
                    key={menu.menu.id}
                    href={menuUrl}
                    className="no-underline text-black text-base font-medium hover:text-primary transition-colors text-center"
                    onClick={(e) => handleHashLinkClick(menuUrl, e)}
                  >
                    <Text>{getLocalizedName(menu.menu.name, menu.menu.localization, locale)}</Text>
                  </Link>
                );
              })}
            </Flex>
          ))}
        </Flex>
      </Flex>
    </Box>
  );
}
