'use client';

import {
  AppLocale,
  LOCALE_FLAGS,
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  useLocaleSwitcher,
} from '@/lib/locale';
import { ChevronDownIcon } from '@radix-ui/react-icons';
import { Box, Button, Flex, Popover, Text } from '@radix-ui/themes';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import styles from './Navigation.module.css';

interface NavigationProps {
  locale?: AppLocale;
}

export function Navigation({ locale: localeProp }: NavigationProps) {
  const currentLocale = useLocale() as AppLocale;
  const locale = localeProp || currentLocale;
  const tFooter = useTranslations('footer');
  const switchLocale = useLocaleSwitcher();

  return (
    <>
      <Box className="fixed top-0 left-0 right-0 h-10 bg-[linear-gradient(90deg,#FAA63E_2%,#EA9839_20%,#C0752F_63%,#9B5526_97%)] z-[1000] hidden lg:flex items-center px-4 md:px-8 lg:px-[60px]">
        <Box className="w-full h-full flex justify-center">
          <Flex justify="between" align="center" className="h-full w-full">
            {/* Left Section: Menu Items */}
            <Flex align="center" className="h-full gap-1">
              {/* About CChat */}
              <Link href={`/${locale}/about`} className="no-underline">
                <Text className="text-white text-sm hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap">
                  {tFooter('introduction')} CCHAT
                </Text>
              </Link>

              <Text className="text-white/50 mx-3">|</Text>

              {/* Careers */}
              <Link href={`/${locale}/careers`} className="no-underline">
                <Text className="text-white text-sm hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap">
                  {tFooter('careers')}
                </Text>
              </Link>

              <Text className="text-white/50 mx-3">|</Text>

              {/* Store System */}
              <Link href={`/${locale}/locations`} className="no-underline">
                <Text className="text-white text-sm hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap">
                  {tFooter('storeSystem')}
                </Text>
              </Link>
            </Flex>

            {/* Right Section: Hotline + Sign In + Sign Up + Language */}
            <Flex align="center" className="h-full gap-1">
              {/* Hotline */}
              <Text className="text-white text-sm whitespace-nowrap">
                {tFooter('hotline')}: 0868 506 800
              </Text>

              <Text className="text-white/50 mx-3">|</Text>

              {/* Sign In */}
              {/* <Box
                onClick={handleSignInClick}
                className="cursor-pointer"
              >
                <Text className="text-white text-sm hover:opacity-80 transition-opacity whitespace-nowrap">
                  {tCommon('auth.signIn')}
                </Text>
              </Box>

              <Text className="text-white/50 mx-3">|</Text> */}

              {/* Sign Up */}
              {/* <Box
                onClick={handleSignUpClick}
                className="cursor-pointer"
              >
                <Text className="text-white text-sm hover:opacity-80 transition-opacity whitespace-nowrap">
                  {tCommon('auth.signUp')}
                </Text>
              </Box> */}

              {/* <Text className="text-white/50 mx-3">|</Text> */}

              {/* Language Switcher */}
              <Popover.Root>
                <Popover.Trigger>
                  <Button variant="ghost" size="2" className={styles.navButton}>
                    <Flex align="center" gap="1" className="cursor-pointer">
                      <Text className="text-white">{LOCALE_FLAGS[locale]}</Text>
                      <Text className="text-white text-sm">
                        {locale.toUpperCase()}
                      </Text>
                      <ChevronDownIcon className="text-white" />
                    </Flex>
                  </Button>
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
          </Flex>
        </Box>
      </Box>
    </>
  );
}
