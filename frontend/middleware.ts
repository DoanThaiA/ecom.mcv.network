import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware({
  ...routing,
  localeDetection: false
});

export const config = {
  // Match all pathnames except for:
  // - api (API routes)
  // - _next/static (static files)
  // - _next/image (image optimization files)
  // - _vercel (Vercel internals)
  // - Files with extensions (favicon.ico, icon.png, etc.)
  // - assets folder
  // - zalo verifier file
  matcher: [
    '/((?!api|_next/static|_next/image|_vercel|favicon.ico|icon.png|assets|zalo_verifierKEUwBghc4ZHAvP8Zaf4e0rEXXHI_rr5AD3Oo|.*\\..*).*)',
    '/'
  ]
};
