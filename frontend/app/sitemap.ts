import type { MetadataRoute } from 'next';
import { productCategoryRepository } from '@/lib/repositories/product-category.repository';
import { topicRepository } from '@/lib/repositories/topic.repository';
import { API_BASE_URL } from '@/lib/config/api';
import {
  getCategoryUrl,
  getTopicUrl,
  getProductUrl,
  slugify,
} from '@/lib/utils/seoUrl';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://cchat.vn';
const LOCALES = ['vi', 'en'] as const;

/**
 * Helper to create alternates for all locales
 */
function createAlternates(path: string) {
  return {
    languages: Object.fromEntries(
      LOCALES.map((locale) => [locale, `${BASE_URL}/${locale}${path}`])
    ),
  };
}

/**
 * Helper to create URL entries for ALL locales
 * Returns an array with one entry per locale, each with alternates
 */
function createUrlEntries(
  path: string,
  options: {
    lastModified?: Date;
    changeFrequency?:
      | 'always'
      | 'hourly'
      | 'daily'
      | 'weekly'
      | 'monthly'
      | 'yearly'
      | 'never';
    priority?: number;
  } = {}
): MetadataRoute.Sitemap {
  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    lastModified: options.lastModified || new Date(),
    changeFrequency: options.changeFrequency,
    priority: options.priority,
    alternates: createAlternates(path),
  }));
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 1. Static pages (each entry generates URLs for all locales)
  const staticPages: MetadataRoute.Sitemap = [
    ...createUrlEntries('', { priority: 1.0, changeFrequency: 'daily' }),
    ...createUrlEntries('/about', { priority: 0.7, changeFrequency: 'monthly' }),
    ...createUrlEntries('/categories', {
      priority: 0.9,
      changeFrequency: 'weekly',
    }),
    ...createUrlEntries('/faq', { priority: 0.6, changeFrequency: 'monthly' }),
    ...createUrlEntries('/locations', {
      priority: 0.7,
      changeFrequency: 'monthly',
    }),
    ...createUrlEntries('/guide', { priority: 0.6, changeFrequency: 'monthly' }),
    ...createUrlEntries('/news', { priority: 0.8, changeFrequency: 'daily' }),
    ...createUrlEntries('/flash-sale', {
      priority: 0.9,
      changeFrequency: 'hourly',
    }),
    ...createUrlEntries('/search', { priority: 0.6, changeFrequency: 'weekly' }),
    ...createUrlEntries('/help/account-deletion', {
      priority: 0.3,
      changeFrequency: 'yearly',
    }),
    ...createUrlEntries('/policy/terms', {
      priority: 0.5,
      changeFrequency: 'yearly',
    }),
    ...createUrlEntries('/policy/privacy', {
      priority: 0.5,
      changeFrequency: 'yearly',
    }),
    ...createUrlEntries('/policy/return', {
      priority: 0.5,
      changeFrequency: 'yearly',
    }),
    ...createUrlEntries('/policy/delivery', {
      priority: 0.5,
      changeFrequency: 'yearly',
    }),
    ...createUrlEntries('/policy/vip', {
      priority: 0.5,
      changeFrequency: 'yearly',
    }),
  ];

  // 2. Dynamic: Categories (SEO-friendly URLs: /category/slug-id)
  let categoryPages: MetadataRoute.Sitemap = [];
  try {
    const categories = await productCategoryRepository.getProductCategories();
    categoryPages = categories.flatMap((category) => {
      // Generate slug from name if API doesn't provide one
      const categoryWithSlug = {
        ...category,
        slug: category.slug || slugify(category.name),
      };
      const seoPath = getCategoryUrl(categoryWithSlug, 'vi').replace('/vi', '');
      return createUrlEntries(seoPath, {
        priority: 0.9,
        changeFrequency: 'weekly',
        lastModified: category.updatedAt
          ? new Date(category.updatedAt)
          : new Date(),
      });
    });
  } catch {
    // Silently fail - sitemap will still include static pages
  }

  // 3. Dynamic: Topics (SEO-friendly URLs: /topic/slug-id)
  let topicPages: MetadataRoute.Sitemap = [];
  try {
    const topicsResponse = await topicRepository.getShopTopics();
    topicPages = (topicsResponse.topics || []).flatMap((topic) => {
      const seoPath = getTopicUrl(topic, 'vi').replace('/vi', '');
      return createUrlEntries(seoPath, {
        priority: 0.8,
        changeFrequency: 'weekly',
      });
    });
  } catch {
    // Silently fail
  }

  // 4. Dynamic: Products (SEO-friendly URLs: /products/slug-id)
  // Fetch all products for sitemap (paginate if needed)
  let productPages: MetadataRoute.Sitemap = [];
  try {
    const response = await fetch(`${API_BASE_URL}/shop/products?limit=1000`, {
      next: { revalidate: 3600 },
    });
    if (response.ok) {
      const data = await response.json();
      // API returns { data: [...] } not { products: [...] }
      const products = data.data || data.products || [];
      productPages = products.flatMap(
        (product: {
          id: string;
          name: string;
          slug?: string;
          updatedAt?: string;
        }) => {
          // Generate slug from name if API doesn't provide one
          const productWithSlug = {
            ...product,
            slug: product.slug || slugify(product.name),
          };
          const seoPath = getProductUrl(productWithSlug, 'vi').replace('/vi', '');
          return createUrlEntries(seoPath, {
            priority: 0.9,
            changeFrequency: 'daily',
            lastModified: product.updatedAt
              ? new Date(product.updatedAt)
              : new Date(),
          });
        }
      );
    }
  } catch {
    // Silently fail
  }

  return [...staticPages, ...categoryPages, ...topicPages, ...productPages];
}
