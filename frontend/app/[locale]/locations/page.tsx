import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { generateStaticMetadata } from '@/lib/utils/seo';
import { LocationsContent } from './LocationsContent';

interface LocationsPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: LocationsPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateStaticMetadata('locations', locale as AppLocale);
}

export default async function LocationsPage({ params }: LocationsPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <LocationsContent locale={locale as AppLocale} />
    </PageLayout>
  );
}
