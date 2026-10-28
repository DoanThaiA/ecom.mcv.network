import { AccountSidebar } from '@/components/account/AccountSidebar';
import { OrderDetailSection } from '@/components/account/OrderDetailSection';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { Box } from '@radix-ui/themes';

interface OrderDetailPageProps {
  params: Promise<{
    locale: string;
    id: string;
  }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { locale, id } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <AuthGuard locale={locale as AppLocale}>
        <Box className="mt-[20px] sm:mt-[20px] lg:mt-[60px] mb-10 sm:mb-16 lg:mb-20 px-4 sm:px-8 lg:px-[60px]">
          {/* Page Layout */}
          <Box className="flex flex-col lg:flex-row gap-4 lg:gap-4">
            {/* Sidebar */}
            <AccountSidebar locale={locale as AppLocale} />

            {/* Main Content Area */}
            <OrderDetailSection orderId={id} locale={locale as AppLocale} />
          </Box>
        </Box>
      </AuthGuard>
    </PageLayout>
  );
}
