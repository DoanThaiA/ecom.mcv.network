import { PageLayout } from '@/components/layout/PageLayout';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { MyReviewsSection } from '@/components/account/MyReviewsSection';
import { Box, Heading } from '@radix-ui/themes';
import { AppLocale } from '@/lib/locale';
import { getTranslations } from 'next-intl/server';

export default async function MyReviewsPage({
  params,
}: {
  params: Promise<{ locale: AppLocale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('myReviews');

  return (
    <PageLayout locale={locale}>
      <AuthGuard locale={locale}>
        <Box className="flex gap-4 lg:gap-4 px-4 sm:px-8 lg:px-[60px] py-8">
          <AccountSidebar locale={locale} />
          <Box className="flex-1">
            <Heading size="6" className="mb-6">
              {t('pageTitle')}
            </Heading>
            <MyReviewsSection />
          </Box>
        </Box>
      </AuthGuard>
    </PageLayout>
  );
}
