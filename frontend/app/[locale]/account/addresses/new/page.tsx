import { AddressFormSection } from '@/components/account/AddressFormSection';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';

interface NewAddressPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function NewAddressPage({ params }: NewAddressPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <AuthGuard locale={locale as AppLocale}>
        <AddressFormSection locale={locale as AppLocale} />
      </AuthGuard>
    </PageLayout>
  );
}
