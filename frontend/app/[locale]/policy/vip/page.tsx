import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { Box, Heading, Text, Flex } from '@radix-ui/themes';
import { PageLayout } from '@/components/layout/PageLayout';
import { AppLocale } from '@/lib/locale';
import { generateStaticMetadata } from '@/lib/utils/seo';

interface VipPolicyPageProps {
  params: Promise<{
    locale: string;
  }>;
}

export async function generateMetadata({
  params,
}: VipPolicyPageProps): Promise<Metadata> {
  const { locale } = await params;
  return generateStaticMetadata('policy/vip', locale as AppLocale);
}

export default async function VipPolicyPage({ params }: VipPolicyPageProps) {
  const { locale } = await params;
  const tFooter = await getTranslations('footer');
  const tPolicy = await getTranslations('policyPlaceholder');

  return (
    <PageLayout locale={locale as AppLocale}>
      <Box className="mt-[60px] sm:mt-[100px] lg:mt-[80px] mb-10 sm:mb-16 lg:mb-20 px-4 sm:px-8 lg:px-[60px]">
        {/* Page Title */}
        <Heading
          as="h1"
          size="6"
          className="text-xl sm:text-2xl font-bold mb-6 uppercase"
        >
          {tFooter('policyVIP')}
        </Heading>

        {/* Placeholder Content */}
        <Flex
          direction="column"
          align="center"
          justify="center"
          className="min-h-[300px] bg-gray-100 rounded-lg"
        >
          <Text size="5" className="text-gray-500 font-medium">
            {tPolicy('comingSoon')}
          </Text>
          <Text size="3" className="text-gray-400 mt-2">
            {tPolicy('contentBeingUpdated')}
          </Text>
        </Flex>
      </Box>
    </PageLayout>
  );
}
