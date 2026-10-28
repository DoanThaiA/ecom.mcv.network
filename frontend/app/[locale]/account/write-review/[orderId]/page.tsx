import { Box } from "@radix-ui/themes";
import { WriteReviewSection } from "@/components/account/WriteReviewSection";
import type { AppLocale } from "@/lib/locale";

interface WriteReviewPageProps {
  params: Promise<{
    locale: AppLocale;
    orderId: string;
  }>;
}

export default async function WriteReviewPage({ params }: WriteReviewPageProps) {
  const { locale, orderId } = await params;

  return (
    <Box className="container py-4 max-w-7xl">
      <Box className="flex-1">
        <WriteReviewSection orderId={orderId} locale={locale} />
      </Box>
    </Box>
  );
}
