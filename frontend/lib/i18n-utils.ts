/**
 * Helper utilities for next-intl
 *
 * Migration guide from old getTranslations:
 *
 * OLD WAY:
 * const t = getTranslations(locale)('namespace')
 * t('key')
 *
 * NEW WAY (Client Components):
 * import { useTranslations } from 'next-intl'
 * const t = useTranslations('namespace')
 * t('key')
 *
 * NEW WAY (Server Components):
 * import { getTranslations } from 'next-intl/server'
 * const t = await getTranslations('namespace')
 * t('key')
 */

import { useTranslations as useNextIntlTranslations } from 'next-intl';

/**
 * Type-safe hook for translations in client components
 * Usage: const t = useTranslations('namespace')
 */
export { useNextIntlTranslations as useTranslations };

/**
 * Get current locale in client components
 */
export { useLocale } from 'next-intl';

/**
 * Get translations in server components
 */
export { getTranslations } from 'next-intl/server';

/**
 * Get current locale in server components
 */
export { getLocale } from 'next-intl/server';
