import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { shopRepository } from '@/lib/repositories';
import { generateStaticMetadata } from '@/lib/utils/seo';
import { FlashSaleListPageContent } from './FlashSaleListPageContent';

interface FlashSalePageProps {
  params: Promise<{
    locale: AppLocale;
  }>;
  searchParams?: Promise<{
    page?: string;
    limit?: string;
  }>;
}

export async function generateMetadata({
  params,
}: FlashSalePageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateStaticMetadata('flashSale', locale);
}

export default async function FlashSalePage({
  params,
  searchParams,
}: FlashSalePageProps) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);

  const page = Number(resolvedSearchParams?.page ?? '1') || 1;
  const limit = Number(resolvedSearchParams?.limit ?? '20') || 20;

  // console.log('[FlashSalePage] Request params:', { page, limit, locale });

  const flashSaleProducts = await shopRepository.getFlashSaleProducts({
    page,
    limit,
    filters: {
      categoryIds: [],
    },
  });

  // console.log('[FlashSalePage] API Response:', {
  //   total: flashSaleProducts.total,
  //   page: flashSaleProducts.page,
  //   limit: flashSaleProducts.limit,
  //   totalPages: flashSaleProducts.totalPages,
  //   hasNextPage: flashSaleProducts.hasNextPage,
  //   dataLength: flashSaleProducts.data?.length || 0,
  //   firstProduct: flashSaleProducts.data?.[0]?.id || 'none',
  // });

  return (
    <PageLayout locale={locale}>
      {() => (
        <FlashSaleListPageContent
          locale={locale}
          flashSaleProducts={flashSaleProducts}
        />
      )}
    </PageLayout>
  );
}

