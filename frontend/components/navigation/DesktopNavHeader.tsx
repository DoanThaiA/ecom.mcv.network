'use client';

import { getLocalizedName } from '@/lib/helpers/localizationHelper';
import { AppLocale } from '@/lib/locale';
import { safeLength } from '@/lib/helpers/arrayHelper';
import type { ShopMenuItemWithLevel } from '@/lib/repositories/menu.repository';
import { getMenuUrl } from '@/lib/utils/menuUrl';
import { handleHashLinkClick } from '@/lib/utils/dom';
import { Box, Flex, Link, TextField } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { CartIconWithBadge } from './CartIconWithBadge';
import { MegaMenuDesktop } from './MegaMenuDesktop';
import { NotificationBell } from './NotificationBell';
import { UserIconWithPromo } from './UserIconWithPromo';

interface DesktopNavHeaderProps {
  locale: AppLocale;
  menus?: ShopMenuItemWithLevel[];
  level1Menus: ShopMenuItemWithLevel[];
  hoveredMenuId: string | null;
  hoveredMenuHasChildren: boolean;
  desktopSearchQuery: string;
  isMounted: boolean;
  isAuthenticated: boolean;
  showPromoPopup: boolean;
  onHoveredMenuIdChange: (_id: string | null) => void;
  onSearchQueryChange: (_query: string) => void;
  onSearchSubmit: () => void;
  onSignInClick: () => void;
  onClosePromoPopup: () => void;
}

export function DesktopNavHeader({
  locale,
  menus,
  level1Menus,
  hoveredMenuId,
  hoveredMenuHasChildren,
  desktopSearchQuery,
  isMounted,
  isAuthenticated,
  showPromoPopup,
  onHoveredMenuIdChange,
  onSearchQueryChange,
  onSearchSubmit,
  onSignInClick,
  onClosePromoPopup,
}: DesktopNavHeaderProps) {
  const t = useTranslations('nav');

  return (
    <Flex
      align="center"
      justify="between"
      className="hidden lg:flex h-[60px] gap-6 relative"
      onMouseLeave={() => onHoveredMenuIdChange(null)}
    >
      {/* Logo */}
      <Link href={`/${locale}`} className="no-underline flex-shrink-0">
        <Image
          src="/assets/images/logo.webp"
          alt="CCHAT"
          width={120}
          height={32}
          className="h-8 w-auto"
        />
      </Link>

      {/* Level 1 Menus */}
      <Flex
        gap="4"
        align="center"
        className="flex-1 justify-center overflow-x-auto scrollbar-hide max-w-[calc(100%-400px)]"
      >
        {level1Menus.map((menuItem) => {
          const hasChildren = safeLength(menuItem.subMenu) > 0;
          const isHovered = hoveredMenuId === menuItem.menu.id;
          const menuUrl = getMenuUrl(menuItem.menu, locale);
          return (
            <Link
              key={menuItem.menu.id}
              href={menuUrl}
              className="no-underline whitespace-nowrap flex-shrink-0 flex items-center"
              onMouseEnter={() => onHoveredMenuIdChange(menuItem.menu.id)}
              onClick={(e) => handleHashLinkClick(menuUrl, e)}
            >
              <Box
                className={`
                  text-gray-700 text-base font-semibold transition-all
                  hover:text-gray-900 border-b-2
                  ${hasChildren && isHovered ? 'border-primary' : 'border-transparent'}
                `}
              >
                {getLocalizedName(menuItem.menu.name, menuItem.menu.localization, locale)}
              </Box>
            </Link>
          );
        })}
      </Flex>

      {/* Search, User, Cart */}
      <Flex gap="5" align="center">
        {/* Search Bar */}
        <Box className="relative lg:w-[220px] w-[280px]">
          <TextField.Root
            placeholder={t('search')}
            size="2"
            className="pl-8 bg-gray-100 border-none"
            value={desktopSearchQuery}
            onChange={(e) => onSearchQueryChange(e.target.value)}
            onFocus={() => onSearchSubmit()}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && desktopSearchQuery.trim()) {
                onSearchSubmit();
              }
            }}
            autoComplete="off"
          />
          <Image
            src="/assets/svg/search.svg"
            alt="Search"
            width={16}
            height={16}
            className="absolute left-[10px] top-1/2 -translate-y-1/2 opacity-50"
          />
        </Box>

        {/* Notification Bell */}
        <NotificationBell locale={locale} isAuthenticated={isAuthenticated} />

        {/* User Icon with Promo Popup */}
        <UserIconWithPromo
          locale={locale}
          isMounted={isMounted}
          isAuthenticated={isAuthenticated}
          showPromoPopup={showPromoPopup}
          onSignInClick={onSignInClick}
          onClosePromoPopup={onClosePromoPopup}
        />

        {/* Shopping Cart */}
        <CartIconWithBadge locale={locale} />
      </Flex>

      {/* Mega Menu Desktop */}
      {hoveredMenuId && hoveredMenuHasChildren && menus && (
        <MegaMenuDesktop
          menus={menus}
          parentMenuId={hoveredMenuId}
          locale={locale}
          onMouseEnter={() => onHoveredMenuIdChange(hoveredMenuId)}
          onMouseLeave={() => onHoveredMenuIdChange(null)}
        />
      )}
    </Flex>
  );
}
