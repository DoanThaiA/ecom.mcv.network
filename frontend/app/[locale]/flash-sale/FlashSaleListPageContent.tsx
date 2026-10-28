import { ProductCard } from '@/components/product/ProductCard';
import { AppLocale } from '@/lib/locale';
import type { ShopFlashSaleProductsResponse } from '@/types/gen/shop/shop/shop/shop';
import { ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Box, Flex, Text } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

interface FlashSaleListPageContentProps {
  locale: AppLocale;
  flashSaleProducts: ShopFlashSaleProductsResponse;
}

export async function FlashSaleListPageContent({
  locale,
  flashSaleProducts,
}: FlashSaleListPageContentProps) {
  const t = await getTranslations('flashSale');

  const currentPage = flashSaleProducts.page || 1;
  const totalPages = flashSaleProducts.totalPages || 1;

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (page > 1) {
      params.set('page', String(page));
    }
    return params.toString()
      ? `/${locale}/flash-sale?${params.toString()}`
      : `/${locale}/flash-sale`;
  };

  const pages: (number | string)[] = [];
  pages.push(1);

  if (currentPage > 3) {
    pages.push('...');
  }

  for (
    let i = Math.max(2, currentPage - 1);
    i <= Math.min(totalPages - 1, currentPage + 1);
    i += 1
  ) {
    pages.push(i);
  }

  if (currentPage < totalPages - 2) {
    pages.push('...');
  }

  if (totalPages > 1) {
    pages.push(totalPages);
  }

  return (
    <Box className="mt-4 lg:mt-16 mb-14 px-8">
      <Box className="flex flex-col gap-1">
        <Text className="text-xl font-semibold uppercase">
          {t('pageTitle')}
        </Text>

        <Text className="text-sm text-gray-600 mb-2">
          {t('totalProducts', { count: flashSaleProducts.total || 0 })}
        </Text>
      </Box>

      <Box className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
        {flashSaleProducts.data.map((product) => (
          <ProductCard key={product.id} product={product} locale={locale} />
        ))}
      </Box>

      {totalPages > 1 && (
        <Flex align="center" justify="center" gap="2" className="mt-8">
          <Link
            href={buildPageHref(Math.max(1, currentPage - 1))}
            aria-disabled={currentPage === 1}
            className="w-[32px] h-[32px] rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
          >
            <ChevronLeftIcon className="w-[20px] h-[20px]" />
          </Link>

          {pages.map((page, index) =>
            typeof page === 'number' ? (
              <Link
                key={index}
                href={buildPageHref(page)}
                className={`w-[32px] h-[32px] rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  page === currentPage
                    ? 'bg-gradient-to-r from-[#FAA63E] via-[#EA9839] to-[#C0752F] text-white border-0'
                    : 'border-2 border-black bg-white hover:bg-gray-50'
                }`}
              >
                {page}
              </Link>
            ) : (
              <span key={index} className="px-2 text-black font-bold">
                {page}
              </span>
            ),
          )}

          <Link
            href={buildPageHref(Math.min(totalPages, currentPage + 1))}
            aria-disabled={currentPage === totalPages}
            className="w-[32px] h-[32px] rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
          >
            <ChevronRightIcon className="w-[20px] h-[20px]" />
          </Link>
        </Flex>
      )}
    </Box>
  );
}
