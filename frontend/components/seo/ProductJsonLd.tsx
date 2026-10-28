/**
 * ProductJsonLd Component
 * Server Component to render Product and Breadcrumb JSON-LD structured data
 */
import type { AppLocale } from '@/lib/locale';
import {
  buildProductBreadcrumbSchema,
  buildProductSchema,
} from '@/lib/utils/seo';
import type { Product } from '@/types/gen/shop/shared/products/product';
import { JsonLd } from './JsonLd';

interface ProductJsonLdProps {
  product: Product;
  locale: AppLocale;
}

/**
 * Renders Product and BreadcrumbList JSON-LD for product detail pages
 * Includes product info (name, price, availability, reviews) and navigation breadcrumbs
 */
export function ProductJsonLd({ product, locale }: ProductJsonLdProps) {
  const productSchema = buildProductSchema(product, locale);
  const breadcrumbSchema = buildProductBreadcrumbSchema(product, locale);

  return (
    <>
      <JsonLd data={productSchema} />
      <JsonLd data={breadcrumbSchema} />
    </>
  );
}
