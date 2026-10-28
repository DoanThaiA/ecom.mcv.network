'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { routing } from '@/i18n/routing';

/**
 * Supported locales in the application
 * Add new locales here to extend language support
 */
export type AppLocale = 'vi' | 'en';

/**
 * Default locale for the application
 */
export const DEFAULT_LOCALE: AppLocale = 'vi';

/**
 * List of all supported locales
 */
export const SUPPORTED_LOCALES: AppLocale[] = ['vi', 'en'];

/**
 * Locale labels for display
 */
export const LOCALE_LABELS: Record<AppLocale, string> = {
  vi: 'Tiếng Việt',
  en: 'English',
};

/**
 * Locale flag emojis
 */
export const LOCALE_FLAGS: Record<AppLocale, string> = {
  vi: '🇻🇳',
  en: '🇺🇸',
};

/**
 * Check if a string is a valid locale
 */
export function isValidLocale(locale: string): locale is AppLocale {
  return SUPPORTED_LOCALES.includes(locale as AppLocale);
}

/**
 * Get a valid locale from a string, fallback to default if invalid
 */
export function getValidLocale(locale: string | undefined): AppLocale {
  if (!locale) return DEFAULT_LOCALE;
  return isValidLocale(locale) ? locale : DEFAULT_LOCALE;
}

/**
 * Get locale label for display
 */
export function getLocaleLabel(locale: string): string {
  return LOCALE_LABELS[locale as AppLocale] || locale;
}

/**
 * Get locale flag emoji
 */
export function getLocaleFlag(locale: string): string {
  return LOCALE_FLAGS[locale as AppLocale] || '🌐';
}

/**
 * Hook to switch between locales
 * Usage:
 * const switchLocale = useLocaleSwitcher();
 * switchLocale('en') // Switch to English
 */
export function useLocaleSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const switchLocale = (newLocale: string) => {
    if (!routing.locales.includes(newLocale as any)) {
      // eslint-disable-next-line no-console
      console.error(`Invalid locale: ${newLocale}`);
      return;
    }

    // Remove current locale prefix from pathname
    const pathWithoutLocale = pathname.replace(`/${currentLocale}`, '') || '/';

    // Navigate to new locale
    router.push(`/${newLocale}${pathWithoutLocale}`);
  };

  return switchLocale;
}
