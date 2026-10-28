import { AddressListSection } from '@/components/account/AddressListSection';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { Box } from '@radix-ui/themes';

interface AddressesPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AddressesPage({ params }: AddressesPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <AuthGuard locale={locale as AppLocale}>
        <Box className="mt-[20px] lg:mt-[60px] mb-10 sm:mb-16 lg:mb-20 px-4 sm:px-8 lg:px-[60px]">

          <Box className="flex flex-col lg:flex-row gap-4 lg:gap-4">

            {/* Main Content Area */}
            <Box className="flex-1">
              <AddressListSection locale={locale as AppLocale} />
            </Box>
          </Box>
        </Box>
      </AuthGuard>
    </PageLayout>
  );
}
