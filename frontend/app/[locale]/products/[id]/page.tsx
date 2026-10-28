import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { ProductJsonLd } from '@/components/seo';
import { ProductPromotionHighlightsLoader } from '@/components/product/promotions/ProductPromotionHighlightsLoader';
import { ProductPromotionHighlightsSkeleton } from '@/components/product/promotions/ProductPromotionHighlightsSkeleton';
import { AppLocale } from '@/lib/locale';
import { productRepository } from '@/lib/repositories';
import { generateProductMetadata } from '@/lib/utils/seo';
import { parseSlug } from '@/lib/utils/seoUrl';
import { cache, Suspense } from 'react';
import { ProductDetailContent } from './ProductDetailContent';

const getProductDetail = cache((productId: string) =>
  productRepository.getProductById(productId)
);

interface ProductDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const { locale, id: urlSegment } = await params;
  const parsed = parseSlug(urlSegment);
  const productId = parsed.id || urlSegment;

  try {
    const product = await getProductDetail(productId);

    return generateProductMetadata({
      product: product,
      locale: locale as AppLocale,
    });
  } catch {
    return {
      title: 'Product Not Found | CChat Shop',
    };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const { locale, id: urlSegment } = await params;
  const parsed = parseSlug(urlSegment);
  const productId = parsed.id || urlSegment;

  let product;
  try {
    product = await getProductDetail(productId);
  } catch {
    notFound();
  }

  return (
    <>
      <ProductJsonLd product={product} locale={locale as AppLocale} />
      <PageLayout locale={locale as AppLocale}>
        <ProductDetailContent
          locale={locale as AppLocale}
          product={product}
          promotionContent={
            <Suspense
              key={`product-promotion-highlights-${product.id}`}
              fallback={<ProductPromotionHighlightsSkeleton />}
            >
              <ProductPromotionHighlightsLoader productId={product.id} />
            </Suspense>
          }
        />
      </PageLayout>
    </>
  );
}
