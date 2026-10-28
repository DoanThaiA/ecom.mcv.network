import { PageLayout } from "@/components/layout/PageLayout";
import { ConfirmOrderByTokenContent } from "@/components/order/ConfirmOrderByTokenContent";
import { AppLocale } from "@/lib/locale";
import { Suspense } from "react";
import { Box, Flex, Text } from "@radix-ui/themes";
import { ReloadIcon } from "@radix-ui/react-icons";

interface ConfirmOrderPageProps {
  params: Promise<{
    locale: string;
  }>;
}

function LoadingFallback() {
  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      className="min-h-[calc(100vh-400px)] px-4 md:px-5 py-10 md:py-[60px]"
    >
      <ReloadIcon className="w-8 h-8 sm:w-10 sm:h-10 text-[#9CA3AF] animate-spin" />
      <Box className="h-4" />
      <Text className="text-sm sm:text-base text-[#6B7280] text-center">
        Loading...
      </Text>
    </Flex>
  );
}

export default async function ConfirmOrderPage({
  params,
}: ConfirmOrderPageProps) {
  const { locale } = await params;

  return (
    <PageLayout locale={locale as AppLocale}>
      <Suspense fallback={<LoadingFallback />}>
        <ConfirmOrderByTokenContent locale={locale as AppLocale} />
      </Suspense>
    </PageLayout>
  );
}
