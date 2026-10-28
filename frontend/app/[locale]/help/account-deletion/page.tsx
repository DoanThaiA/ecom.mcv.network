import { getTranslations } from 'next-intl/server';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { AccountDeletionContent } from './AccountDeletionContent';

interface AccountDeletionPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({ params }: AccountDeletionPageProps) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'accountDeletion' });

  return {
    title: t('pageTitle'),
    description: t('subtitle'),
  };
}

export default async function AccountDeletionPage({
  params,
}: AccountDeletionPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <AccountDeletionContent />
    </PageLayout>
  );
}
