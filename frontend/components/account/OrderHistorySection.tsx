'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import {
  ArchiveIcon,
  ReloadIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@radix-ui/react-icons';
import isEmpty from 'lodash/isEmpty';
import { OrderCard } from './OrderCard';
import { AppLocale } from '@/lib/locale';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchOrdersRequest } from '@/lib/store/slices/orderSlice';
import { mapApiOrderToOrder } from '@/lib/utils/orderMapper';

interface OrderHistorySectionProps {
  locale: AppLocale;
}

export function OrderHistorySection({ locale }: OrderHistorySectionProps) {
  const t = useTranslations('orderHistory');
  const tCommon = useTranslations('common');
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get page from URL or default to 1
  const urlPage = parseInt(searchParams.get('page') || '1', 10);

  const {
    orders: apiOrders,
    isLoadingOrders,
    ordersPage,
    ordersTotalPages,
  } = useAppSelector((state) => state.order);

  // Map API orders to frontend Order type
  const orders = useMemo(() => {
    if (isEmpty(apiOrders)) return [];
    return apiOrders.map(mapApiOrderToOrder);
  }, [apiOrders]);

  // Fetch orders based on URL page parameter
  useEffect(() => {
    dispatch(fetchOrdersRequest({ page: urlPage }));
  }, [dispatch, urlPage]);

  const handlePageChange = (page: number) => {
    // Update URL with new page parameter
    const params = new URLSearchParams(searchParams.toString());
    if (page === 1) {
      params.delete('page'); // Clean URL for page 1
    } else {
      params.set('page', page.toString());
    }
    const newUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.push(newUrl, { scroll: false });
    // Scroll to top of the section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (!orders || orders.length === 0 || !ordersTotalPages || ordersTotalPages <= 1) {
      return null;
    }

    const currentPage = ordersPage;
    const totalPages = ordersTotalPages;
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // Show pages around current page
    if (currentPage > 3) {
      pages.push('...');
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push('...');
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return (
      <Flex align="center" justify="center" gap="2" className="mt-6">
        {/* Previous button */}
        <button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-[24px] h-[24px] rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
        >
          <ChevronLeftIcon className="w-[24px] h-[24px]" />
        </button>

        {/* Page numbers */}
        {pages.map((page, index) =>
          typeof page === 'number' ? (
            <button
              key={index}
              onClick={() => handlePageChange(page)}
              className={`w-[24px] h-[24px] rounded-full flex items-center justify-center font-medium transition-colors ${
                page === currentPage
                  ? 'bg-gradient-to-r from-[#FAA63E] via-[#EA9839] to-[#C0752F] text-white border-0'
                  : 'border-2 border-black bg-white hover:bg-gray-50'
              }`}
            >
              {page}
            </button>
          ) : (
            <span key={index} className="px-2 text-black font-bold">
              {page}
            </span>
          )
        )}

        {/* Next button */}
        <button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-[24px] h-[24px] rounded-full border-2 border-black flex items-center justify-center hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors bg-white"
        >
          <ChevronRightIcon className="w-[24px] h-[24px]" />
        </button>
      </Flex>
    );
  };


  return (
    <Box className="flex-1 bg-white min-h-[400px]">
      {/* Order List */}
      <Box className="px-1 lg:px-8 ">
        {isLoadingOrders ? (
          <Box className="flex flex-col items-center justify-center py-16 sm:py-20">
            <ReloadIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#9CA3AF] animate-spin" />
            <Text className="text-sm sm:text-base text-[#6B7280] text-center mt-4">
              {tCommon("status.loading")}
            </Text>
          </Box>
        ) : orders.length > 0 ? (
          <Box>
            <Box className="flex flex-col gap-3 sm:gap-4">
              {orders.map((order) => (
                <OrderCard key={order.id} order={order} locale={locale} />
              ))}
            </Box>
            {renderPagination()}
          </Box>
        ) : (
          <Box className="flex flex-col items-center justify-center py-16 sm:py-20">
            <Box className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#F3F4F6] flex items-center justify-center mb-4">
              <ArchiveIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#9CA3AF]" />
            </Box>
            <Text className="text-sm sm:text-base text-[#6B7280] text-center">
              {t("noOrders")}
            </Text>
          </Box>
        )}
      </Box>
    </Box>
  );
}
