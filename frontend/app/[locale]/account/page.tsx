import { AccountInfoSection } from '@/components/account/AccountInfoSection';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { LinkedAccountsSection } from '@/components/account/LinkedAccountsSection';
import { ShippingInfoSection } from '@/components/account/ShippingInfoSection';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { Box } from '@radix-ui/themes';

interface AccountPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AccountPage({ params }: AccountPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <AuthGuard locale={locale as AppLocale}>
        <Box className="mt-[20px] lg:mt-[60px] mb-10 sm:mb-16 lg:mb-20 px-4 sm:px-8 lg:px-[60px]">
          {/* Page Layout */}
          <Box className="flex flex-col lg:flex-row gap-4 lg:gap-4">
            {/* Sidebar */}
            <AccountSidebar locale={locale as AppLocale} />

            {/* Main Content Area */}
            <Box className="flex-1 flex flex-col gap-4">
              <AccountInfoSection />
              <LinkedAccountsSection />
              <ShippingInfoSection />
            </Box>
          </Box>
        </Box>
      </AuthGuard>
    </PageLayout>
  );
}
