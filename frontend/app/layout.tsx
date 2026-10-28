import type { Metadata, Viewport } from 'next';
import '@radix-ui/themes/styles.css';
import './globals.css';
import Script from 'next/script';

export const viewport: Viewport = {
  themeColor: 'white',
};

export const metadata: Metadata = {
  title: 'CChat Shop',
  description: 'Thời trang cao cấp, phong cách hiện đại',
  manifest: '/manifest.json',
  openGraph: {
    title: 'CChat Shop',
    description: 'Thời trang cao cấp, phong cách hiện đại',
    type: 'website',
    url: 'https://cchat.vn',
    siteName: 'CChat Shop',
    images: [
      {
        url: 'https://cchat.vn/og-image.png',
        width: 1200,
        height: 630,
        alt: 'CChat Shop',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CChat Shop',
    description: 'Thời trang cao cấp, phong cách hiện đại',
    images: ['https://cchat.vn/twitter-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  verification: {
    google: 'jhDreeKvJwDdSdW2-fPs2iPfdbM7zljOjiS2Wu2euCI',
    other: {
      'facebook-domain-verification': 'b9mr907a1nkrlvewtxy31ljwp7vt4v',
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Script
        src="https://cdn.fchat.vn/assets/embed/webchat.js?id=695f75880ed7afb7a608ada1"
        strategy="lazyOnload"

      />
      {process.env.NEXT_PUBLIC_GA_ID && (
        <>
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            strategy="afterInteractive"
          />
          <Script id="google-analytics" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
            `}
          </Script>
        </>
      )}
      {/* Google Tag Manager */}
      <Script id="gtm-script" strategy="afterInteractive">
        {`
          (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-T2KQCDMV');
        `}
      </Script>
      {children}
    </>
  );
}
