import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { topicRepository } from '@/lib/repositories/topic.repository';
import { parseCategorySlug } from '@/lib/utils/seoUrl';
import { redirect } from 'next/navigation';
import { CategoryContent } from '../../category/[id]/CategoryContent';

interface CategoryPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function DanhMucPage({ params }: CategoryPageProps) {
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
