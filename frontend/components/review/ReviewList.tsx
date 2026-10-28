'use client';

import { useEffect, useRef, useState } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import {
  ReloadIcon,
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";
import { useTranslations } from 'next-intl';
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks';
import { fetchProductReviewsRequest } from '@/lib/store/slices/reviewSlice';
import { ReviewCard } from './ReviewCard';

type ReviewFilter = "newest" | "highest" | "lowest";

interface ReviewListProps {
  productId: string;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

export function ReviewList({ productId, containerRef }: ReviewListProps) {
  const t = useTranslations('reviews');
  const dispatch = useAppDispatch();
  const lastFetchedProductId = useRef<string | null>(null);
  const isInitialLoad = useRef(true);
  const [currentFilter, setCurrentFilter] = useState<ReviewFilter>("newest");

  const { productReviews, productReviewsLoading, productReviewsError } =
    useAppSelector((state) => state.review);

  // Scroll to top of reviews section when page changes (but not on initial load)
  useEffect(() => {
    // Only scroll if we have reviews and container ref is ready
    if (productReviews && containerRef.current) {
      // Skip scroll on initial load (when reviews first appear)
      if (isInitialLoad.current) {
        isInitialLoad.current = false;
        return;
      }

      // Wait for DOM to update before scrolling
      setTimeout(() => {
        if (!containerRef.current) return;

        // Get element position
        const elementPosition = containerRef.current.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset;

        // Check if desktop (lg breakpoint = 1024px)
        const isDesktop = window.innerWidth >= 1024;

        // Subtract header height on desktop (100px: 40px top bar + 60px secondary nav)
        const headerOffset = isDesktop ? 100 : 0;

        window.scrollTo({
          top: offsetPosition - headerOffset,
          behavior: 'smooth'
        });
      }, 100);
    }
  }, [productReviews?.page]);

  useEffect(() => {
    // Only fetch if productId changed
    if (productId && lastFetchedProductId.current !== productId) {
      lastFetchedProductId.current = productId;
      isInitialLoad.current = true; // Reset initial load flag for new product
      dispatch(fetchProductReviewsRequest({ productId, page: 1, sortBy: currentFilter }));
    }
  }, [dispatch, productId, currentFilter]);

  const handleFilterChange = (filter: ReviewFilter) => {
    setCurrentFilter(filter);
    dispatch(fetchProductReviewsRequest({ productId, page: 1, sortBy: filter }));
  };

  const handlePageChange = (page: number) => {
    dispatch(fetchProductReviewsRequest({ productId, page, sortBy: currentFilter }));
    // Scroll will be handled by useEffect after data loads
  };

  const renderPagination = () => {
    // Don't show pagination if:
    // - No reviews data
    // - No reviews in the list
    // - Total pages is not a valid number
    // - Only 1 or fewer pages
    if (
      !productReviews ||
      !productReviews.reviews ||
      productReviews.reviews.length === 0 ||
      !productReviews.totalPages ||
      productReviews.totalPages < 1
    ) {
      return null;
    }

    const currentPage = productReviews.page;
    const totalPages = productReviews.totalPages;
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // Show pages around current page
    if (currentPage > 3) {
      pages.push("...");
    }

    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    // Always show last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return (
      <Flex align="center" justify="center" gap="2" className="mt-6" key="abc">
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
          typeof page === "number" ? (
            <button
              key={index}
              onClick={() => handlePageChange(page)}
              className={`w-[24px] h-[24px] rounded-full flex items-center justify-center font-medium transition-colors ${
                page === currentPage
                  ? "bg-gradient-to-r from-[#FAA63E] via-[#EA9839] to-[#C0752F] text-white border-0"
                  : "border-2 border-black bg-white hover:bg-gray-50"
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

  // Loading state
  if (productReviewsLoading && !productReviews) {
    return (
      <Flex justify="center" align="center" className="py-8">
        <ReloadIcon className="animate-spin" width={24} height={24} />
      </Flex>
    );
  }

  // Error state
  if (productReviewsError) {
    return (
      <Box className="py-8">
        <Text size="2" color="red" align="center">
          {productReviewsError}
        </Text>
      </Box>
    );
  }

  // Empty state
  if (!productReviews || productReviews.reviews.length === 0) {
    return (
      <Box className="bg-white rounded-xl px-8">
        <Flex direction="column" align="center" gap="1" className="py-4">
          <Text className="text-black text-[14px] font-medium text-center">
            {t("emptyState.title")}
          </Text>
          <Text className="text-black text-center text-[14px]">
            {t("emptyState.subtitle")}
          </Text>
          <Box className="relative w-[250px] h-[200px] mt-4">
            <Image
              src="/assets/svg/product/emty_review.svg"
              alt="No reviews"
              fill
              className="object-contain"
            />
          </Box>
        </Flex>
      </Box>
    );
  }

  const filters: ReviewFilter[] = ["newest", "highest", "lowest"];

  return (
    <Box>
      {/* Filter tabs */}
      <Flex gap="2" className="mb-6">
        {filters.map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              currentFilter === filter
                ? "bg-[#AFAFAF] text-black"
                : "bg-white text-black border border-[#F0F0F0] hover:bg-gray-50"
            }`}
          >
            <Flex align="center" gap="1">
              {currentFilter === filter && <CheckIcon className="w-4 h-4" />}
              {t(`filters.${filter}`)}
            </Flex>
          </button>
        ))}
      </Flex>

      {/* Reviews list - Full width layout */}
      <Box className="grid grid-cols-1 gap-4">
        {productReviews.reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </Box>

      {/* Pagination */}
      {renderPagination()}
    </Box>
  );
}
