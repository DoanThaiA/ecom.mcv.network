import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { SearchContent } from './SearchContent';

interface SearchPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function SearchPage({ params }: SearchPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      {({ categories }) => (
        <SearchContent locale={locale as AppLocale} categories={categories} />
      )}
    </PageLayout>
  );
}
