import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cchat.vn';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/products/',
          '/categories',
          '/category/',
          '/danh-muc/',
          '/topic/',
          '/news/',
          '/faq',
          '/locations',
          '/policy/',
          '/guide',
        ],
        disallow: [
          '/auth/',
          '/account/',
          '/cart/',
          '/payment/',
          '/order-success',
          '/order/',
          '/search',
          '/api/',
          '/_next/',
          '/help/account-deletion',
          '/*.json$',
          '/*?*',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
