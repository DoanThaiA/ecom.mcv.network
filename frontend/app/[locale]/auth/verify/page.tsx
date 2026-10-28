import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { Suspense } from 'react';
import { Text } from '@radix-ui/themes';
import { VerifyContent } from './VerifyContent';

interface VerifyPageProps {
  params: Promise<{ locale: AppLocale }>;
}

export default async function VerifyPage({ params }: VerifyPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale}>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Text>Loading...</Text>
          </div>
        }
      >
        <VerifyContent />
      </Suspense>
    </PageLayout>
  );
}
