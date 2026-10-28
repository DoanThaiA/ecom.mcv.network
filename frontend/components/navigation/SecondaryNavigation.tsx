'use client';

import { showWarningToast } from '@/lib/helpers/toastHelper';
import { AppLocale } from '@/lib/locale';
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated } from '@/lib/store/slices/authSlice';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';
import type { ShopMenuItemWithLevel } from '@/lib/repositories/menu.repository';
import { Box } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { safeLength } from '@/lib/helpers/arrayHelper';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useMemberPromoPopup } from '@/hooks/useMemberPromoPopup';
import { AuthDialogsManager } from './AuthDialogsManager';
import { DesktopNavHeader } from './DesktopNavHeader';
import { MobileNavHeader } from './MobileNavHeader';
import { SearchOverlay } from '../search/SearchOverlay';

// Lazy load MobileMenuDrawer to reduce initial bundle size
const MobileMenuDrawer = dynamic(
  () => import('./MobileMenuDrawer').then((mod) => ({ default: mod.MobileMenuDrawer })),
  { ssr: false, loading: () => null }
);

interface SecondaryNavigationProps {
  locale: AppLocale;
  categories?: ProductCategory[];
  menus?: ShopMenuItemWithLevel[];
}

export function SecondaryNavigation({
  locale,
  categories: _categoriesProp,
  menus: menusProp,
}: SecondaryNavigationProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);
  const [searchOverlayOpen, setSearchOverlayOpen] = useState(false);
  const [searchOpenedFromDrawer, setSearchOpenedFromDrawer] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [hoveredMenuId, setHoveredMenuId] = useState<string | null>(null);
  const [desktopSearchQuery, setDesktopSearchQuery] = useState('');

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const tAuth = useTranslations('auth');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const { showPromoPopup, handleClosePromoPopup } = useMemberPromoPopup(
    isAuthenticated,
    isMounted
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const authAction = searchParams.get('auth');
    const hasOpenSignin = searchParams.get('sign-in') === 'y';

    if (authAction === 'signin' || hasOpenSignin) {
      setSignInOpen(true);
      if (hasOpenSignin) {
        showWarningToast(tAuth('sessionExpired'));
      }
      router.replace(pathname, { scroll: false });
    } else if (authAction === 'signup') {
      setSignUpOpen(true);
      router.replace(pathname, { scroll: false });
    }
  }, [searchParams, pathname, router, tAuth]);

  const level1Menus = useMemo(() => {
    if (!menusProp || menusProp.length === 0) return [];
    return menusProp
      .filter((m) => m.level === 1)
      .sort((a, b) => (a.menu.order ?? 0) - (b.menu.order ?? 0));
  }, [menusProp]);

  const hoveredMenuHasChildren = useMemo(() => {
    if (!hoveredMenuId || !menusProp) return false;
    const menu = menusProp.find((m) => m.menu.id === hoveredMenuId);
    return menu ? safeLength(menu.subMenu) > 0 : false;
  }, [hoveredMenuId, menusProp]);

  const handleSearchClick = () => {
    setSearchOpenedFromDrawer(false);
    setSearchOverlayOpen(true);
  };

  const handleSearchFromDrawer = () => {
    setSearchOpenedFromDrawer(true);
    setSearchOverlayOpen(true);
  };

  return (
    <>
      <Box className="bg-white border-b border-gray-200 sticky lg:top-[40px] top-[0px] z-[49] px-4 md:px-[20px] xl:px-[60px]">
        <MobileNavHeader
          locale={locale}
          isMounted={isMounted}
          isAuthenticated={isAuthenticated}
          showPromoPopup={showPromoPopup}
          onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)}
          onSearchClick={handleSearchClick}
          onSignInClick={() => setSignInOpen(true)}
          onClosePromoPopup={handleClosePromoPopup}
        />

        <DesktopNavHeader
          locale={locale}
          menus={menusProp}
          level1Menus={level1Menus}
          hoveredMenuId={hoveredMenuId}
          hoveredMenuHasChildren={hoveredMenuHasChildren}
          desktopSearchQuery={desktopSearchQuery}
          isMounted={isMounted}
          isAuthenticated={isAuthenticated}
          showPromoPopup={showPromoPopup}
          onHoveredMenuIdChange={setHoveredMenuId}
          onSearchQueryChange={setDesktopSearchQuery}
          onSearchSubmit={handleSearchClick}
          onSignInClick={() => setSignInOpen(true)}
          onClosePromoPopup={handleClosePromoPopup}
        />
      </Box>

      <MobileMenuDrawer
        locale={locale}
        menus={menusProp || []}
        open={mobileMenuOpen}
        onOpenChange={setMobileMenuOpen}
        onSignInClick={() => setSignInOpen(true)}
        onSignUpClick={() => setSignUpOpen(true)}
        onSearchClick={handleSearchFromDrawer}
      />

      <AuthDialogsManager
        locale={locale}
        signInOpen={signInOpen}
        onSignInOpenChange={setSignInOpen}
        signUpOpen={signUpOpen}
        onSignUpOpenChange={setSignUpOpen}
      />

      <SearchOverlay
        locale={locale}
        open={searchOverlayOpen}
        onOpenChange={(open) => {
          setSearchOverlayOpen(open);
          if (!open) setDesktopSearchQuery('');
        }}
        initialQuery={desktopSearchQuery}
        onBack={
          searchOpenedFromDrawer
            ? () => {
                setSearchOverlayOpen(false);
                setMobileMenuOpen(true);
              }
            : undefined
        }
      />
    </>
  );
}
