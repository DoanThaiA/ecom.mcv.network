'use client';

import { AppLocale } from '@/lib/locale';
import { Box, Flex, Link } from '@radix-ui/themes';
import Image from 'next/image';
import { CartIconWithBadge } from './CartIconWithBadge';
import { NotificationBell } from './NotificationBell';
import { UserIconWithPromo } from './UserIconWithPromo';

interface MobileNavHeaderProps {
  locale: AppLocale;
  isMounted: boolean;
  isAuthenticated: boolean;
  showPromoPopup: boolean;
  onMenuToggle: () => void;
  onSearchClick: () => void;
  onSignInClick: () => void;
  onClosePromoPopup: () => void;
}

export function MobileNavHeader({
  locale,
  isMounted,
  isAuthenticated,
  showPromoPopup,
  onMenuToggle,
  onSearchClick,
  onSignInClick,
  onClosePromoPopup,
}: MobileNavHeaderProps) {
  return (
    <Box className="lg:hidden relative h-[60px]">
      {/* Hamburger Menu - Left */}
      <Box
        className="absolute left-0 top-1/2 -translate-y-1/2 cursor-pointer w-6 h-6"
        onClick={onMenuToggle}
      >
        <Image
          src="/assets/svg/menu.svg"
          alt="Menu"
          width={24}
          height={24}
        />
      </Box>

      {/* Logo - Centered */}
      <Link
        href={`/${locale}`}
        className="no-underline absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      >
        <Image
          src="/assets/images/logo.webp"
          alt="CCHAT"
          width={120}
          height={32}
          className="h-6 w-auto"
        />
      </Link>

      {/* Actions - Right */}
      <Flex
        align="center"
        className="absolute right-0 top-1/2 -translate-y-1/2 gap-[10px]"
        style={{ overflow: 'visible' }}
      >
        {/* Search Icon */}
        <Box className="cursor-pointer w-6 h-6" onClick={onSearchClick}>
          <Image
            src="/assets/svg/search.svg"
            alt="Search"
            width={24}
            height={24}
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
    </Box>
  );
}
