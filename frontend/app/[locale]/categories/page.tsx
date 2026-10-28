import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { CategoryCard } from '@/components/category/CategoryCard';
import { AppLocale } from '@/lib/locale';
import { filterTopLevelCategories } from '@/lib/utils/categoryFilters';
import { generateStaticMetadata } from '@/lib/utils/seo';
import { Box, Heading } from '@radix-ui/themes';
import { getTranslations } from 'next-intl/server';

interface CategoriesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoriesPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateStaticMetadata('categories', locale as AppLocale);
}

export default async function CategoriesPage({ params }: CategoriesPageProps) {
  const { locale } = await params;
  const t = await getTranslations('viewAll');

  return (
    <PageLayout locale={locale as AppLocale}>
      {({ categories }) => {
        // Filter to show only top-level categories (level 1)
        const topLevelCategories = filterTopLevelCategories(categories);

        return (
          <Box className="min-h-screen px-6 mt-4">
            {/* Page Header */}
            <Box className="mb-6 md:mb-8 pt-4 md:pt-8">
              <Heading
                size="6"
                className="text-black uppercase text-2xl md:text-2xl font-bold tracking-wider"
              >
                {t('allCategories')}
              </Heading>
            </Box>

            {/* Categories Grid */}
            {topLevelCategories.length > 0 ? (
              <Box className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-6">
                {topLevelCategories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    locale={locale}
                  />
                ))}
              </Box>
            ) : (
              <Box className="flex items-center justify-center py-20">
                <Heading size="4" className="text-gray-500">
                  {t('noCategories')}
                </Heading>
              </Box>
            )}

            {/* Spacing before footer */}
            <Box className="h-16 sm:h-24 md:h-[168px]" />
          </Box>
        );
      }}
    </PageLayout>
  );
}
