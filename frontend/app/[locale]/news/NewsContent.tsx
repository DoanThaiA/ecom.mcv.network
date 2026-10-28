'use client';

import { AppLocale } from '@/lib/locale';
import {
  getNewsListRequest,
  selectNewsList,
  selectNewsLoading,
  selectNewsTotal,
  selectNewsPage,
  selectNewsLimit,
} from '@/lib/store/slices/newsSlice';
import { getLocalizedText, type NewsArticle } from '@/types/news';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@radix-ui/react-icons';
import { Box, Flex, Heading, Skeleton, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const PAGE_SIZE = 8;

interface NewsContentProps {
  locale: AppLocale;
}

function NewsRowSkeleton() {
  return (
    <Flex gap="4" className="py-5 border-b border-gray-100">
      <Skeleton className="w-40 sm:w-52 aspect-[16/9] rounded-xl flex-shrink-0" />
      <Box className="flex-1 flex flex-col gap-2 py-1">
        <Skeleton className="h-5 w-3/4 rounded" />
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-3 w-1/4 rounded mt-2" />
      </Box>
    </Flex>
  );
}

function NewsRowItem({ article, locale }: { article: NewsArticle; locale: string }) {
  const [imageError, setImageError] = useState(false);

  const localizedTitle = getLocalizedText(article.titleLocalization, locale, article.title);
  const localizedExcerpt = article.contentLocalization
    ? getLocalizedText(
        {
          vi: article.contentLocalization.vi
            ? article.contentLocalization.vi.replace(/<[^>]*>/g, '').trim().substring(0, 160)
            : undefined,
          en: article.contentLocalization.en
            ? article.contentLocalization.en.replace(/<[^>]*>/g, '').trim().substring(0, 160)
            : undefined,
        },
        locale,
        article.excerpt || '',
      )
    : article.excerpt;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

  return (
    <Link href={`/${locale}/news/${article.id}`} className="no-underline text-inherit block group">
      <Flex
        gap="4"
        className="py-5 border-b border-gray-100 hover:bg-gray-50 rounded-xl px-2 -mx-2 transition-colors duration-200"
      >
        {/* Thumbnail */}
        <Box className="w-40 sm:w-52 md:w-56 flex-shrink-0 aspect-[16/9] rounded-xl overflow-hidden bg-gray-200 self-start">
          {imageError ? (
            <Box className="w-full h-full flex items-center justify-center bg-gray-100">
              <Text className="text-gray-400 text-xs">No image</Text>
            </Box>
          ) : (
            <img
              src={article.thumbnail}
              alt={localizedTitle}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={() => setImageError(true)}
            />
          )}
        </Box>

        {/* Content */}
        <Box className="flex-1 min-w-0 flex flex-col justify-between py-1">
          <Box>
            <Text className="text-sm sm:text-base md:text-lg font-bold text-black line-clamp-2 leading-snug group-hover:text-[#FAA63E] transition-colors duration-200 mb-2">
              {localizedTitle}
            </Text>
            {localizedExcerpt && (
              <Text className="text-sm text-gray-500 line-clamp-2 leading-relaxed hidden sm:block">
                {localizedExcerpt}
              </Text>
            )}
          </Box>

          <Flex align="center" gap="1" className="mt-3">
            <CalendarIcon width="12" height="12" className="text-gray-400" />
            <Text className="text-xs text-gray-400">{formatDate(article.publishedAt)}</Text>
          </Flex>
        </Box>
      </Flex>
    </Link>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (_p: number) => void;
}) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (page > 3) pages.push('...');
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pages.push(i);
    }
    if (page < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  return (
    <Flex align="center" justify="center" gap="1" className="mt-10">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#FAA63E] hover:text-[#FAA63E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
      >
        <ChevronLeftIcon width="14" height="14" />
      </button>

      {pages.map((pageItem, i) =>
        pageItem === '...' ? (
          <Text key={`dots-${i}`} className="text-sm text-gray-400 px-1">
            …
          </Text>
        ) : (
          <button
            key={pageItem}
            onClick={() => onPageChange(pageItem as number)}
            className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-200 cursor-pointer ${
              pageItem === page
                ? 'bg-[#FAA63E] text-white border border-[#FAA63E]'
                : 'border border-gray-200 text-gray-700 hover:border-[#FAA63E] hover:text-[#FAA63E]'
            }`}
          >
            {pageItem}
          </button>
        )
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 text-gray-500 hover:border-[#FAA63E] hover:text-[#FAA63E] disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200 cursor-pointer"
      >
        <ChevronRightIcon width="14" height="14" />
      </button>
    </Flex>
  );
}

export function NewsContent({ locale }: NewsContentProps) {
  const dispatch = useDispatch();

  const newsList = useSelector(selectNewsList);
  const loading = useSelector(selectNewsLoading);
  const total = useSelector(selectNewsTotal);
  const page = useSelector(selectNewsPage);
  const limit = useSelector(selectNewsLimit);

  const t = useTranslations('news');

  const totalPages = Math.ceil(total / (limit || PAGE_SIZE));

  useEffect(() => {
    dispatch(getNewsListRequest({ page: 1, limit: PAGE_SIZE }));
  }, [dispatch]);

  const handlePageChange = (newPage: number) => {
    dispatch(getNewsListRequest({ page: newPage, limit: PAGE_SIZE }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isEmpty = !loading && newsList.length === 0;

  return (
    <Box className="mt-[40px] md:mt-[60px] mb-10 md:mb-20 px-3 md:px-8 lg:px-[60px] min-h-screen">
      {/* Page Title */}
      <Box className="mb-6 md:mb-8">
        <Flex align="center" gap="3">
          <Box className="w-1 h-7 bg-[#FAA63E] rounded-full" />
          <Heading
            size="7"
            className="text-xl md:text-2xl font-bold uppercase text-black tracking-wide"
          >
            {t('title')}
          </Heading>
        </Flex>
        <Box className="mt-2 h-px bg-gray-200" />
      </Box>

      {/* Loading */}
      {loading && (
        <Box>
          {[1, 2, 3, 4, 5].map((i) => (
            <NewsRowSkeleton key={i} />
          ))}
        </Box>
      )}

      {/* Empty State */}
      {isEmpty && (
        <Box className="flex flex-col items-center justify-center py-24 gap-3">
          <Text className="text-4xl">📰</Text>
          <Text className="text-gray-500 text-base">{t('noArticles')}</Text>
        </Box>
      )}

      {/* News List */}
      {!loading && newsList.length > 0 && (
        <Box>
          {newsList.map((article) => (
            <NewsRowItem key={article.id} article={article} locale={locale} />
          ))}

          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />

          {total > 0 && (
            <Text className="text-xs text-gray-400 text-center block mt-3">
              {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)} / {total}
            </Text>
          )}
        </Box>
      )}
    </Box>
  );
}
