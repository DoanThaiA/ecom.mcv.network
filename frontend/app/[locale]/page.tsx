import type { Metadata } from 'next';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { shopRepository } from '@/lib/repositories';
import { generateStaticMetadata } from '@/lib/utils/seo';
import { HomeContent } from './HomeContent';
import { HomePageClient } from './HomePageClient';

// Cache landing data for 5 minutes to prevent repeated refetching
export const revalidate = 300;

interface HomePageProps {
  params: Promise<{
    locale: AppLocale;
  }>;
}

export async function generateMetadata({
  params,
}: HomePageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateStaticMetadata('home', locale);
}

export default async function Home({ params }: HomePageProps) {
  const { locale } = await params;

  // Fetch landing data and flash sale (menus and categories are fetched by PageLayout)
  const [landingData, flashSale] = await Promise.all([
    shopRepository.getLandingPageData(),
    shopRepository.getActiveFlashSale(),
  ]);

  return (
    <PageLayout locale={locale}>
      {() => (
        <HomePageClient>
          <HomeContent
            locale={locale}
            topics={landingData.topics}
            flashSale={flashSale}
            banners={landingData.banners}
          />
        </HomePageClient>
      )}
    </PageLayout>
  );
}
