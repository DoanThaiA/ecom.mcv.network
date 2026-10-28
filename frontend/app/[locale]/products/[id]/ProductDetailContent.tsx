'use client';

import { ProductDetailClient } from '@/components/product/ProductDetailClient';
import { RecommendationSection } from '@/components/home/RecommendationSection';
import { AppLocale } from '@/lib/locale';
import { useTranslations } from 'next-intl';
import { Box } from '@radix-ui/themes';
import type { ReactNode } from 'react';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { storageService } from '@/lib/services/storage.service';
import { affiliateRepository } from '@/lib/repositories/affiliate.repository';
import { productRepository } from '@/lib/repositories/product.repository';
import { scrollWindowToTopInstantly } from '@/lib/utils/dom';
import { ProductReviews } from '@/components/product/ProductReviews';
import type { Product } from '@/types/gen/shared/shared/products/product';

interface ProductDetailContentProps {
  locale: AppLocale;
  product: Product;
  promotionContent?: ReactNode;
}

export function ProductDetailContent({
  locale,
  product,
  promotionContent,
}: ProductDetailContentProps) {
  const t = useTranslations('productDetail');
  const searchParams = useSearchParams();
  const productId = product.id;

  // Track affiliate click with productId when landing via affiliate link
  useEffect(() => {
    if (!productId) return;
    const refCode = searchParams.get('ref') ?? storageService.getAffiliateCode();
    if (refCode) {
      void affiliateRepository.trackClick(refCode, productId);
    }
  }, [productId]);

  // Track product view once product data is loaded
  useEffect(() => {
    if (!product) return;
    void productRepository.trackProductView(
      productId,
      product.category?.id ?? undefined,
    );
    // Save to recently viewed products (full product data, expires after 3 days)
    storageService.addRecentlyViewedProduct(product);
  }, [product?.id]);

  // Scroll to top when productId changes to ignore cached scroll position
  useEffect(() => {
    scrollWindowToTopInstantly();
  }, [productId]);

  return (
    <>
      {/* Breadcrumb */}
      <Box className="mb-6 mt-4 lg:mt-[60px] ml-4 lg:ml-[60px]" />
      <Box className="mb-16 xl:w-[65%] xl:mx-auto lg:w-[80%] lg:mx-auto lg:px-0">
        {/* Product Detail Section */}
        <ProductDetailClient
          key={product.id}
          product={product}
          locale={locale}
          t={t}
          promotionContent={promotionContent}
        />
      </Box>
      {/* Product Reviews */}
      <Box className="mb-6">
        <ProductReviews productId={productId} />
      </Box>
      {/* Related Products - Personalized Recommendations */}
      <Box className="my-8">
        <RecommendationSection locale={locale} />
      </Box>
    </>
  );
}
