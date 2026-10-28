import { AddressFormSection } from '@/components/account/AddressFormSection';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';

interface EditAddressPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function EditAddressPage({ params }: EditAddressPageProps) {
  const { locale, id } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <AuthGuard locale={locale as AppLocale}>
        <AddressFormSection addressId={id} locale={locale as AppLocale} />
      </AuthGuard>
    </PageLayout>
  );
}
