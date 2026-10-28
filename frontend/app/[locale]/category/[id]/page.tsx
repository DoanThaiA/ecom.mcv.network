import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { productCategoryRepository, topicRepository } from '@/lib/repositories';
import { parseCategorySlug, findCategoryById } from '@/lib/utils/seoUrl';
import { generateCategoryMetadata } from '@/lib/utils/seo';
import { CategoryContent } from './CategoryContent';

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { locale, id } = await params;

  // Parse the URL segment to extract ID
  const parsed = parseCategorySlug(id);

  // Handle slug-only URLs
  if (parsed.isSlugOnly) {
    return {
      title: 'Category | CChat Shop',
    };
  }

  // Extract the actual category ID
  const categoryId = parsed.id || id;

  try {
    const categories = await productCategoryRepository.getProductCategories();
    const category = findCategoryById(categories, categoryId);

    if (!category) {
      return {
        title: 'Category Not Found | CChat Shop',
      };
    }

    return generateCategoryMetadata({
      id: category.id,
      name: category.name,
      description: category.content,
      image: category.image,
      slug: category.slug,
      locale: locale as AppLocale,
    });
  } catch {
    return {
      title: 'Category | CChat Shop',
    };
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { locale, id } = await params;

  // Parse the URL segment to extract ID
  const parsed = parseCategorySlug(id);

  // Handle slug-only URLs - redirect to home page to avoid performance hit
  if (parsed.isSlugOnly) {
    redirect(`/${locale}`);
  }

  // Extract the actual category ID
  const categoryId = parsed.id || id;

  const topicsResponse = await topicRepository.getShopTopics();

  return (
    <PageLayout locale={locale as AppLocale}>
      {({ categories }) => (
        <CategoryContent
          locale={locale as AppLocale}
          categoryId={categoryId}
          categories={categories}
          topics={topicsResponse.topics}
        />
      )}
    </PageLayout>
  );
}
