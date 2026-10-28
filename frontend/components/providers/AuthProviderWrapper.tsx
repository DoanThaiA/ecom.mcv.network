'use client';

import { ReactNode } from 'react';
import { AppLocale } from '@/lib/locale';

/**
 * AuthProviderWrapper - Now simplified since we use Redux
 * Keeping this wrapper for potential future use (locale context, etc.)
 */
export function AuthProviderWrapper({
  children,
  locale: _locale,
}: {
  children: ReactNode;
  locale: AppLocale;
}) {
  // Redux StoreProvider is already wrapping at root level
  // Auth and Cart state managed by Redux
  // This wrapper can be used for locale-specific logic if needed
  return <>{children}</>;
}
