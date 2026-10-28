'use client';

import { RelatedNews } from '@/components/news';
import { AppLocale } from '@/lib/locale';
import { getLocalizedText } from '@/types/news';
import {
  getNewsByIdRequest,
  getRelatedNewsRequest,
  selectCurrentNews,
  selectRelatedNews,
  selectNewsDetailLoading,
  clearCurrentNews,
} from '@/lib/store/slices/newsDetailSlice';
import { useTranslations } from 'next-intl';
import { CalendarIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Box, Flex, Heading, Skeleton, Text } from '@radix-ui/themes';
import Link from 'next/link';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

interface NewsDetailContentProps {
  locale: AppLocale;
  newsId: string;
}

function NewsDetailSkeleton() {
  return (
    <Box className="mt-[40px] md:mt-[60px] mb-10 md:mb-20 px-3 md:px-8 lg:px-[60px] min-h-screen">
      <Box className="mb-6">
        <Skeleton className="h-4 w-48 rounded" />
      </Box>
      <Box className="max-w-3xl mx-auto">
        <Skeleton className="h-8 w-3/4 rounded mb-3" />
        <Skeleton className="h-4 w-1/4 rounded mb-6" />
        <Skeleton className="aspect-[16/9] w-full rounded-xl mb-8" />
        <Box className="flex flex-col gap-3">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-5/6 rounded" />
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-2/3 rounded" />
        </Box>
      </Box>
    </Box>
  );
}

export function NewsDetailContent({
  locale,
  newsId,
}: NewsDetailContentProps) {
  const dispatch = useDispatch();

  const currentNews = useSelector(selectCurrentNews);
  const relatedNews = useSelector(selectRelatedNews);
  const loading = useSelector(selectNewsDetailLoading);

  const t = useTranslations('news');

  // Fetch news detail on mount
  useEffect(() => {
    if (!newsId) return;

    dispatch(getNewsByIdRequest({ id: newsId }));
    dispatch(getRelatedNewsRequest({ currentId: newsId, limit: 3 }));

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentNews());
    };
  }, [dispatch, newsId]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const localizedTitle = currentNews
    ? getLocalizedText(currentNews.titleLocalization, locale, currentNews.title)
    : '';
  const localizedContent = currentNews
    ? getLocalizedText(currentNews.contentLocalization, locale, currentNews.content)
    : '';

  // Loading state
  if (loading || !currentNews) {
    return <NewsDetailSkeleton />;
  }

  return (
    <Box className="mt-[40px] md:mt-[60px] mb-10 md:mb-20 px-3 md:px-8 lg:px-[60px]">
      {/* Breadcrumb */}
      <Box className="mb-6">
        <Flex gap="2" align="center" className="text-xs lg:text-sm flex-wrap">
          <Link
            href={`/${locale}/news`}
            className="text-[#FAA63E] hover:text-[#E8952F] transition-colors font-medium"
          >
            {t('breadcrumbHome')}
          </Link>
          <ChevronRightIcon className="text-gray-400" width="14" height="14" />
          <Text className="text-gray-500 line-clamp-1 max-w-[280px] sm:max-w-none">
            {localizedTitle}
          </Text>
        </Flex>
      </Box>

      {/* Article Content */}
      <Box className="max-w-3xl mx-auto">
        {/* Title */}
        <Heading
          size="8"
          className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 text-black leading-snug"
        >
          {localizedTitle}
        </Heading>

        {/* Date */}
        <Flex align="center" gap="1" className="mb-6">
          <CalendarIcon width="14" height="14" className="text-gray-400" />
          <Text className="text-sm text-gray-400">
            {formatDate(currentNews.publishedAt)}
          </Text>
        </Flex>

        {/* Thumbnail hero image */}
        {currentNews.thumbnail && (
          <Box className="aspect-[16/9] w-full overflow-hidden rounded-xl mb-8 bg-gray-100">
            <img
              src={currentNews.thumbnail}
              alt={localizedTitle}
              className="w-full h-full object-cover"
            />
          </Box>
        )}

        {/* Divider */}
        <Box className="border-t border-gray-200 mb-8" />

        {/* Content */}
        <Box
          className="article-content"
          dangerouslySetInnerHTML={{ __html: localizedContent }}
        />
      </Box>

      {/* Related News */}
      <Box className="max-w-3xl mx-auto">
        <RelatedNews
          articles={relatedNews}
          locale={locale}
          title={t('relatedArticles')}
        />
      </Box>
    </Box>
  );
}
