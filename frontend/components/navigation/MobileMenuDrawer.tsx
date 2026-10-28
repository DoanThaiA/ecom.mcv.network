'use client';

import { getLocalizedName } from '@/lib/helpers/localizationHelper';
import {
  AppLocale,
  LOCALE_FLAGS,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  useLocaleSwitcher,
} from '@/lib/locale';
import type { ShopMenuItemWithLevel } from '@/lib/repositories/menu.repository';
import { storageService } from '@/lib/services/storage.service';
import { getMenuUrl } from '@/lib/utils/menuUrl';
import { handleHashLinkClick } from '@/lib/utils/dom';
import { useAppSelector } from '@/lib/store/hooks';
import { selectIsAuthenticated } from '@/lib/store/slices/authSlice';
import { preventDialogCloseOnToast } from '@/lib/utils/dialog';
import { ChevronDownIcon, Cross1Icon } from '@radix-ui/react-icons';
import {
  Box,
  Button,
  Dialog,
  Flex,
  IconButton,
  Link,
  Popover,
  Text,
  TextField,
  VisuallyHidden,
} from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { safeLength } from '@/lib/helpers/arrayHelper';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { MemberPromoPopup } from '../common/MemberPromoPopup';

interface MobileMenuDrawerProps {
  locale: AppLocale;
  menus: ShopMenuItemWithLevel[];
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  onSignInClick: () => void;
  onSignUpClick: () => void;
  onSearchClick: () => void;
}

export function MobileMenuDrawer({
  locale,
  menus,
  open,
  onOpenChange,
  onSignInClick,
  onSignUpClick,
  onSearchClick,
}: MobileMenuDrawerProps) {
  const [expandedMenuIds, setExpandedMenuIds] = useState<Set<string>>(new Set());
  const [showPromoPopup, setShowPromoPopup] = useState(false);
  const router = useRouter();
  const t = useTranslations('nav');
  const tCommon = useTranslations('common');
  const tFooter = useTranslations('footer');
  const switchLocale = useLocaleSwitcher();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const cart = useAppSelector((state) => state.cart.cart);

  const handleClosePromoPopup = () => {
    storageService.setMemberPromoDismissed();
    setShowPromoPopup(false);
  };

  // Create menu lookup map
  const menuMap = useMemo(
    () => new Map(menus.map((m) => [m.menu.id, m])),
    [menus]
  );

  // Level 1 menus (root menus)
  const level1Menus = useMemo(
    () =>
      menus
        .filter((m) => m.level === 1)
        .sort((a, b) => a.menu.order - b.menu.order),
    [menus]
  );

  // Helper function to get children of a menu item (sorted by order)
  const getChildren = (item: ShopMenuItemWithLevel): ShopMenuItemWithLevel[] => {
    return item.subMenu
      .map((id) => menuMap.get(id))
      .filter((m): m is ShopMenuItemWithLevel => !!m)
      .sort((a, b) => a.menu.order - b.menu.order);
  };

  const handleSearchClick = () => {
    onOpenChange(false);
    onSearchClick();
  };

  const handleMenuLinkClick = (url: string, e: React.MouseEvent) => {
    handleHashLinkClick(url, e);
    onOpenChange(false);
  };

  const handleCloseDrawer = () => {
    onOpenChange(false);
  };

  const handleCartClick = () => {
    router.push(`/${locale}/cart`);
    onOpenChange(false);
  };

  const handleSignInClick = () => {
    onOpenChange(false);
    onSignInClick();
  };

  const handleSignUpClick = () => {
    onOpenChange(false);
    onSignUpClick();
  };

  const toggleExpand = (menuId: string) => {
    setExpandedMenuIds((prev) => {
      const next = new Set(prev);
      if (next.has(menuId)) {
        next.delete(menuId);
      } else {
        next.add(menuId);
      }
      return next;
    });
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Content
        className="fixed inset-0 w-full h-full m-0 p-0 rounded-none bg-white z-50 lg:hidden"
        onPointerDownOutside={preventDialogCloseOnToast}
      >
        <VisuallyHidden>
          <Dialog.Title>{t('categories')}</Dialog.Title>
          <Dialog.Description>{t('categories')}</Dialog.Description>
        </VisuallyHidden>

        <Flex direction="column" className="h-full">
          {/* Header */}
          <Flex
            align="center"
            justify="between"
            className="px-4 py-3 border-b border-gray-100 flex-shrink-0"
          >
            <Flex align="center" gap="2">
              <Image
                src="/assets/images/logo.webp"
                alt="CCHAT"
                width={80}
                height={24}
                className="h-6 w-auto"
              />
              {/* Language Switcher */}
              <Popover.Root>
                <Popover.Trigger>
                  <Box className="ml-2 cursor-pointer">
                    <Flex align="center" gap="1">
                      <Text size="1">{LOCALE_FLAGS[locale]}</Text>
                      <Text size="1" className="text-gray-600">
                        {locale.toUpperCase()}
                      </Text>
                      <ChevronDownIcon width="12" height="12" className="text-gray-600" />
                    </Flex>
                  </Box>
                </Popover.Trigger>
                <Popover.Content>
                  <Flex direction="column" gap="2">
                    {SUPPORTED_LOCALES.map((loc) => (
                      <Button
                        key={loc}
                        onClick={() => switchLocale(loc)}
                        variant={locale === loc ? 'solid' : 'ghost'}
                        size="2"
                        className="w-full cursor-pointer flex items-center gap-2"
                      >
                        <Text>{LOCALE_FLAGS[loc]}</Text>
                        {LOCALE_LABELS[loc]}
                      </Button>
                    ))}
                  </Flex>
                </Popover.Content>
              </Popover.Root>
            </Flex>

            <Flex align="center" gap="3">
              {/* Avatar with Promo Popup */}
              <Box className="relative">
                {isAuthenticated ? (
                  <Link href={`/${locale}/account`} onClick={handleCloseDrawer}>
                    <Image
                      src="/assets/svg/user.svg"
                      alt="User"
                      width={24}
                      height={24}
                      className="opacity-70"
                    />
                  </Link>
                ) : (
                  <Box className="cursor-pointer" onClick={handleSignInClick}>
                    <Image
                      src="/assets/svg/user.svg"
                      alt="User"
                      width={24}
                      height={24}
                      className="opacity-70"
                    />
                  </Box>
                )}
                {/* Member Promo Popup */}
                {showPromoPopup && !isAuthenticated && (
                  <MemberPromoPopup onClose={handleClosePromoPopup} />
                )}
              </Box>
              <Dialog.Close>
                <IconButton
                  size="2"
                  variant="ghost"
                  className="cursor-pointer text-gray-500 hover:bg-gray-100 rounded-full"
                >
                  <Cross1Icon width="18" height="18" />
                </IconButton>
              </Dialog.Close>
            </Flex>
          </Flex>

          {/* Search Bar */}
          <Box
            className="px-4 py-3 border-b border-gray-100 flex-shrink-0 cursor-pointer"
            onClick={handleSearchClick}
          >
            <Box className="relative">
              <TextField.Root
                placeholder={t('search')}
                size="2"
                className="pl-3 pr-10 bg-gray-50 border border-gray-200 rounded-lg pointer-events-none"
                readOnly
              />
              <Image
                src="/assets/svg/search.svg"
                alt="Search"
                width={18}
                height={18}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50"
              />
            </Box>
          </Box>

          {/* Scrollable Container: Menu List + Actions & Footer */}
          <Box className="flex-1 overflow-y-auto">
            {/* Menu List - Level 1, 2, 3 nested */}
            <Box>
              {level1Menus.map((level1Item) => {
                const level1HasChildren = safeLength(level1Item.subMenu) > 0;
                const level1IsExpanded = expandedMenuIds.has(level1Item.menu.id);
                const level2Items = getChildren(level1Item);

                return (
                  <Box key={level1Item.menu.id}>
                    {/* Level 1 Item */}
                    {level1HasChildren ? (
                      <Flex
                        align="center"
                        justify="between"
                        className="px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => toggleExpand(level1Item.menu.id)}
                      >
                        <Text className="text-gray-900 font-semibold uppercase">
                          {getLocalizedName(level1Item.menu.name, level1Item.menu.localization, locale)}
                        </Text>
                        <ChevronDownIcon
                          width="20"
                          height="20"
                          className={`text-gray-400 transition-transform ${level1IsExpanded ? 'rotate-180' : ''}`}
                        />
                      </Flex>
                    ) : (
                      (() => {
                        const menuUrl = getMenuUrl(level1Item.menu, locale);
                        return (
                          <Link
                            href={menuUrl}
                            onClick={(e) => handleMenuLinkClick(menuUrl, e)}
                            className="no-underline"
                          >
                            <Flex
                              align="center"
                              className="px-4 py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            >
                              <Text className="text-gray-900 font-semibold uppercase">
                                {getLocalizedName(level1Item.menu.name, level1Item.menu.localization, locale)}
                              </Text>
                            </Flex>
                          </Link>
                        );
                      })()
                    )}

                    {/* Level 2 Items (expanded from Level 1) */}
                    {level1HasChildren && level1IsExpanded && (
                      <Box className="bg-gray-50">
                        {level2Items.map((level2Item) => {
                          const level2HasChildren = safeLength(level2Item.subMenu) > 0;
                          const level2IsExpanded = expandedMenuIds.has(level2Item.menu.id);
                          const level3Items = getChildren(level2Item);

                          return (
                            <Box key={level2Item.menu.id}>
                              {/* Level 2 Item */}
                              {level2HasChildren ? (
                                <Flex
                                  align="center"
                                  justify="between"
                                  className="px-6 py-3 border-b border-gray-100 hover:bg-gray-100 transition-colors cursor-pointer"
                                  onClick={() => toggleExpand(level2Item.menu.id)}
                                >
                                  <Text className="text-gray-800 font-medium">
                                    {getLocalizedName(level2Item.menu.name, level2Item.menu.localization, locale)}
                                  </Text>
                                  <ChevronDownIcon
                                    width="18"
                                    height="18"
                                    className={`text-gray-400 transition-transform ${level2IsExpanded ? 'rotate-180' : ''}`}
                                  />
                                </Flex>
                              ) : (
                                (() => {
                                  const menuUrl = getMenuUrl(level2Item.menu, locale);
                                  return (
                                    <Link
                                      href={menuUrl}
                                      onClick={(e) => handleMenuLinkClick(menuUrl, e)}
                                      className="no-underline"
                                    >
                                      <Flex
                                        align="center"
                                        className="px-6 py-3 border-b border-gray-100 hover:bg-gray-100 transition-colors"
                                      >
                                        <Text className="text-gray-800 font-medium">
                                          {getLocalizedName(level2Item.menu.name, level2Item.menu.localization, locale)}
                                        </Text>
                                      </Flex>
                                    </Link>
                                  );
                                })()
                              )}

                              {/* Level 3 Items (expanded from Level 2) */}
                              {level2HasChildren && level2IsExpanded && (
                                <Box className="bg-gray-100">
                                  {level3Items.map((level3Item) => {
                                    const menuUrl = getMenuUrl(level3Item.menu, locale);
                                    return (
                                      <Link
                                        key={level3Item.menu.id}
                                        href={menuUrl}
                                        onClick={(e) => handleMenuLinkClick(menuUrl, e)}
                                        className="no-underline"
                                      >
                                        <Flex
                                          align="center"
                                          className="px-10 py-2.5 border-b border-gray-200 hover:bg-gray-200 transition-colors"
                                        >
                                          <Text className="text-gray-700 text-sm">
                                            {getLocalizedName(level3Item.menu.name, level3Item.menu.localization, locale)}
                                          </Text>
                                        </Flex>
                                      </Link>
                                    );
                                  })}
                                </Box>
                              )}
                            </Box>
                          );
                        })}
                      </Box>
                    )}
                  </Box>
                );
              })}
            </Box>

            {/* Footer Section */}
            <Box className="border-t border-gray-100 bg-white mt-2">
              {/* Cart Button */}
              <Box className="px-4 pt-4 pb-2">
                <Box
                  className="w-full bg-[#FAA63E] hover:bg-[#e8953a] text-white py-3 rounded-full cursor-pointer transition-colors"
                  onClick={handleCartClick}
                >
                  <Flex align="center" justify="center" gap="2">
                    <Image
                      src="/assets/svg/shopping-bag.svg"
                      alt="Cart"
                      width={20}
                      height={20}
                      className="brightness-0 invert"
                    />
                    <Text size="2" weight="bold" className="uppercase">
                      {t('cart')}
                      {cart.itemCount > 0 && ` (${cart.itemCount})`}
                    </Text>
                  </Flex>
                </Box>
              </Box>

              {/* Auth Buttons */}
              {!isAuthenticated && (
                <Flex className="px-4 pb-3" gap="2">
                  <Box
                    className="flex-1 border border-gray-300 py-2.5 rounded-full cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={handleSignInClick}
                  >
                    <Text
                      size="2"
                      weight="medium"
                      className="text-gray-700 uppercase block text-center"
                    >
                      {tCommon('auth.signIn')}
                    </Text>
                  </Box>
                  <Box
                    className="flex-1 border border-gray-300 py-2.5 rounded-full cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={handleSignUpClick}
                  >
                    <Text
                      size="2"
                      weight="medium"
                      className="text-gray-700 uppercase block text-center"
                    >
                      {tCommon('auth.signUp')}
                    </Text>
                  </Box>
                </Flex>
              )}

              {/* Contact Info */}
              <Box className="px-4 py-4 pb-40 bg-gray-50 border-t border-gray-100">
                <Flex gap="4">
                  {/* Left Column - Contact */}
                  <Box className="flex-1">
                    <Flex direction="column" gap="2">
                      <Flex align="center" gap="2">
                        <Image
                          src="/assets/svg/footer/phone.svg"
                          alt="Phone"
                          width={16}
                          height={16}
                          className="opacity-60 flex-shrink-0"
                        />
                        <Box>
                          <Text size="1" className="text-gray-500 block">
                            {tFooter('hotline')}
                          </Text>
                          <Text size="1" weight="medium" className="text-gray-700">
                            {tFooter('phoneNumber')}
                          </Text>
                        </Box>
                      </Flex>

                      <Flex align="center" gap="2">
                        <Image
                          src="/assets/svg/footer/email.svg"
                          alt="Email"
                          width={16}
                          height={16}
                          className="opacity-60 flex-shrink-0"
                        />
                        <Box>
                          <Text size="1" className="text-gray-500 block">
                            {tFooter('emailLabel')}
                          </Text>
                          <Text size="1" weight="medium" className="text-gray-700">
                            {tFooter('emailAddress')}
                          </Text>
                        </Box>
                      </Flex>

                      <Flex align="center" gap="2">
                        <Image
                          src="/assets/svg/footer/facebook.svg"
                          alt="Facebook"
                          width={16}
                          height={16}
                          className="opacity-60 flex-shrink-0"
                        />
                        <Box>
                          <Text size="1" className="text-gray-500 block">
                            {tFooter('fanpageLabel')}
                          </Text>
                          <Text size="1" weight="medium" className="text-gray-700">
                            {tFooter('facebook')}
                          </Text>
                        </Box>
                      </Flex>
                    </Flex>
                  </Box>

                  {/* Right Column - Links */}
                  <Box className="flex-1">
                    <Flex direction="column" gap="2">
                      <Link
                        href={`/${locale}/about`}
                        onClick={handleCloseDrawer}
                        className="no-underline"
                      >
                        <Text
                          size="1"
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          {tFooter('introduction')}
                        </Text>
                      </Link>
                      <Link
                        href={`/${locale}/careers`}
                        onClick={handleCloseDrawer}
                        className="no-underline"
                      >
                        <Text
                          size="1"
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          {tFooter('careers')}
                        </Text>
                      </Link>
                      <Link
                        href={`/${locale}/locations`}
                        onClick={handleCloseDrawer}
                        className="no-underline"
                      >
                        <Text
                          size="1"
                          className="text-gray-600 hover:text-gray-900 transition-colors"
                        >
                          {tFooter('storeSystem')}
                        </Text>
                      </Link>
                    </Flex>
                  </Box>
                </Flex>
              </Box>
            </Box>
          </Box>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
