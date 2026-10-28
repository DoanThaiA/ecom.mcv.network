import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Theme } from '@radix-ui/themes';
import { Toaster } from 'sonner';
import {
  fontVariables,
  primaryFontClassName,
} from '@/lib/config/fonts';
import StoreProvider from '@/lib/store/StoreProvider';
import { CartSuccessPopover } from '@/components/cart/CartSuccessPopover';
import { PlatformDetector } from '@/components/common/PlatformDetector';
import { Suspense } from 'react';
import { AffiliateTracker } from '@/components/affiliate/AffiliateTracker';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{
    locale: string;
  }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={fontVariables}
    >
      <body className={primaryFontClassName}>
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-T2KQCDMV"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <NextIntlClientProvider messages={messages}>
          <StoreProvider>
            <Theme>{children}</Theme>
            <PlatformDetector />
            <CartSuccessPopover />
            <Suspense>
              <AffiliateTracker />
            </Suspense>
            <Toaster
              className="pointer-events-auto"
              position="top-right"
              expand={true}
              richColors
              closeButton
              duration={4000}
              style={{
                zIndex: 2147483647,
              }}
              toastOptions={{
                style: {
                  zIndex: 2147483647,
                },
              }}
            />
          </StoreProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
