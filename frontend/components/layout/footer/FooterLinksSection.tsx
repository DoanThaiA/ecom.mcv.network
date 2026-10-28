'use client';

import { Box, Flex, Text, Link } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { AppLocale } from '@/lib/locale';
import { CollapsibleSection } from './CollapsibleSection';

interface FooterLinksSectionProps {
  locale: AppLocale;
}

export function FooterLinksSection({ locale }: FooterLinksSectionProps) {
  const t = useTranslations('footer');

  const linkStyleMobile = "text-black no-underline text-sm font-normal leading-relaxed hover:underline block py-1";
  const linkStyleDesktop = "text-black no-underline text-sm font-normal leading-relaxed hover:underline transition-colors";
  const titleStyleDesktop = "text-sm font-bold text-black mb-3";

  return (
    <>
      {/* Mobile: Collapsible Sections */}
      <Box className="md:hidden">
        {/* CCHAT */}
        <CollapsibleSection title="CCHAT">
          <Flex direction="column" gap="1">
            <Link href={`/${locale}/about`} className={linkStyleMobile}>
              {t('introduction')}
            </Link>
            <Link href={`/${locale}/careers`} className={linkStyleMobile}>
              {t('careers')}
            </Link>
            <Link href={`/${locale}/locations`} className={linkStyleMobile}>
              {t('storeSystem')}
            </Link>
          </Flex>
        </CollapsibleSection>

        {/* Policies */}
        <CollapsibleSection title={t('policies')}>
          <Flex direction="column" gap="1">
            <Link href={`/${locale}/policy/terms`} className={linkStyleMobile}>
              {t('policyTerms')}
            </Link>
            <Link href={`/${locale}/policy/vip`} className={linkStyleMobile}>
              {t('policyVIP')}
            </Link>
            <Link href={`/${locale}/policy/payment`} className={linkStyleMobile}>
              {t('policyPayment')}
            </Link>
            <Link href={`/${locale}/policy/return`} className={linkStyleMobile}>
              {t('policyReturn')}
            </Link>
            <Link href={`/${locale}/policy/warranty`} className={linkStyleMobile}>
              {t('policyWarranty')}
            </Link>
            <Link href={`/${locale}/policy/delivery`} className={linkStyleMobile}>
              {t('policyDelivery')}
            </Link>
            <Link href={`/${locale}/policy/privacy`} className={linkStyleMobile}>
              {t('policyPrivacy')}
            </Link>
          </Flex>
        </CollapsibleSection>

        {/* Customer Service */}
        <CollapsibleSection title={t('customerService')}>
          <Flex direction="column" gap="1">
            <Link href={`/${locale}/guide`} className={linkStyleMobile}>
              {t('shoppingGuide')}
            </Link>
            <Link href={`/${locale}/faq`} className={linkStyleMobile}>
              {t('faq')}
            </Link>
          </Flex>
        </CollapsibleSection>

        {/* News & Promotions */}
        <CollapsibleSection title={t('newsPromotionSection')}>
          <Flex direction="column" gap="1">
            <Link href={`/${locale}/news/fashion-trends`} className={linkStyleMobile}>
              {t('fashionTrends')}
            </Link>
            <Link href={`/${locale}/news/mega-sale`} className={linkStyleMobile}>
              {t('megaSale')}
            </Link>
            <Link href={`/${locale}/news/livestream`} className={linkStyleMobile}>
              {t('megaLivestream')}
            </Link>
          </Flex>
        </CollapsibleSection>

        {/* Store System */}
        <CollapsibleSection title={t('storeSystemSection')}>
          <Flex direction="column" gap="2">
            <Box>
              <Link href={`/${locale}/locations`} className={`${linkStyleMobile} underline inline`}>
                {t('stores.baTrieu')}
              </Link>
              <Text className="text-sm text-gray-600">: {t('stores.baTrieuAddress')}</Text>
            </Box>
            <Box>
              <Link href={`/${locale}/locations`} className={`${linkStyleMobile} underline inline`}>
                {t('stores.chuaBoc')}
              </Link>
              <Text className="text-sm text-gray-600">: {t('stores.chuaBocAddress')}</Text>
            </Box>
            <Box>
              <Link href={`/${locale}/locations`} className={`${linkStyleMobile} underline inline`}>
                {t('stores.phamNgocThach')}
              </Link>
              <Text className="text-sm text-gray-600">: {t('stores.phamNgocThachAddress')}</Text>
            </Box>
            <Box>
              <Link href={`/${locale}/locations`} className={`${linkStyleMobile} underline inline`}>
                {t('stores.hangVoi')}
              </Link>
              <Text className="text-sm text-gray-600">: {t('stores.hangVoiAddress')}</Text>
            </Box>
            <Box>
              <Link href={`/${locale}/locations`} className={`${linkStyleMobile} underline inline`}>
                {t('stores.haiPhong')}
              </Link>
              <Text className="text-sm text-gray-600">: {t('stores.haiPhongAddress')}</Text>
            </Box>
          </Flex>
        </CollapsibleSection>

        {/* Business Partnership */}
        <CollapsibleSection title={t('businessPartner')}>
          <Flex direction="column" gap="1">
            <Link href={`/${locale}/franchise`} className={linkStyleMobile}>
              {t('franchiseAgent')}
            </Link>
            <Link href={`/${locale}/affiliate`} className={linkStyleMobile}>
              {t('affiliate')}
            </Link>
          </Flex>
        </CollapsibleSection>
      </Box>

      {/* Desktop: Responsive Grid Layout */}
      <Box className="py-6 hidden md:block">
        {/* xl (1280px+): 5 columns - CCHAT+HỢP TÁC gộp chung */}
        <Box className="hidden xl:grid grid-cols-5 gap-x-8 gap-y-8">
          {/* Column 1: CCHAT + Business Partnership */}
          <Flex direction="column">
            <Text className={titleStyleDesktop}>CCHAT</Text>
            <Flex direction="column" gap="2" className="mb-6">
              <Link href={`/${locale}/about`} className={linkStyleDesktop}>
                {t('introduction')}
              </Link>
              <Link href={`/${locale}/careers`} className={linkStyleDesktop}>
                {t('careers')}
              </Link>
              <Link href={`/${locale}/locations`} className={linkStyleDesktop}>
                {t('storeSystem')}
              </Link>
            </Flex>
            <Text className={titleStyleDesktop}>{t('businessPartner').toUpperCase()}</Text>
            <Flex direction="column" gap="2">
              <Link href={`/${locale}/franchise`} className={linkStyleDesktop}>
                {t('franchiseAgent')}
              </Link>
              <Link href={`/${locale}/affiliate`} className={linkStyleDesktop}>
                {t('affiliate')}
              </Link>
            </Flex>
          </Flex>

          {/* Column 2: Policies */}
          <Flex direction="column">
            <Text className={titleStyleDesktop}>{t('policies').toUpperCase()}</Text>
            <Flex direction="column" gap="2">
              <Link href={`/${locale}/policy/terms`} className={linkStyleDesktop}>
                {t('policyTerms')}
              </Link>
              <Link href={`/${locale}/policy/vip`} className={linkStyleDesktop}>
                {t('policyVIP')}
              </Link>
              <Link href={`/${locale}/policy/payment`} className={linkStyleDesktop}>
                {t('policyPayment')}
              </Link>
              <Link href={`/${locale}/policy/return`} className={linkStyleDesktop}>
                {t('policyReturn')}
              </Link>
              <Link href={`/${locale}/policy/warranty`} className={linkStyleDesktop}>
                {t('policyWarranty')}
              </Link>
              <Link href={`/${locale}/policy/delivery`} className={linkStyleDesktop}>
                {t('policyDelivery')}
              </Link>
              <Link href={`/${locale}/policy/privacy`} className={linkStyleDesktop}>
                {t('policyPrivacy')}
              </Link>
            </Flex>
          </Flex>

          {/* Column 3: Customer Service */}
          <Flex direction="column">
            <Text className={titleStyleDesktop}>{t('customerService').toUpperCase()}</Text>
            <Flex direction="column" gap="2">
              <Link href={`/${locale}/guide`} className={linkStyleDesktop}>
                {t('shoppingGuide')}
              </Link>
              <Link href={`/${locale}/faq`} className={linkStyleDesktop}>
                {t('faq')}
              </Link>
            </Flex>
          </Flex>

          {/* Column 4: News & Promotions */}
          <Flex direction="column">
            <Text className={titleStyleDesktop}>{t('newsPromotionSection').toUpperCase()}</Text>
            <Flex direction="column" gap="2">
              <Link href={`/${locale}/news/fashion-trends`} className={linkStyleDesktop}>
                {t('fashionTrends')}
              </Link>
              <Link href={`/${locale}/news/mega-sale`} className={linkStyleDesktop}>
                {t('megaSale')}
              </Link>
              <Link href={`/${locale}/news/livestream`} className={linkStyleDesktop}>
                {t('megaLivestream')}
              </Link>
            </Flex>
          </Flex>

          {/* Column 5: Store System */}
          <Flex direction="column">
            <Text className={titleStyleDesktop}>{t('storeSystemSection').toUpperCase()}</Text>
            <Flex direction="column" gap="1">
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.baTrieu')}</Link>: {t('stores.baTrieuAddress')}
              </Text>
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.chuaBoc')}</Link>: {t('stores.chuaBocAddress')}
              </Text>
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.phamNgocThach')}</Link>: {t('stores.phamNgocThachAddress')}
              </Text>
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.hangVoi')}</Link>: {t('stores.hangVoiAddress')}
              </Text>
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.haiPhong')}</Link>: {t('stores.haiPhongAddress')}
              </Text>
            </Flex>
          </Flex>
        </Box>

        {/* lg (1024-1279px): 4 columns - DỊCH VỤ + TIN TỨC gộp, nằm bên trái CHÍNH SÁCH */}
        <Box className="hidden lg:grid xl:hidden grid-cols-4 gap-x-8 gap-y-8">
          {/* Column 1: CCHAT + Business Partnership */}
          <Flex direction="column">
            <Text className={titleStyleDesktop}>CCHAT</Text>
            <Flex direction="column" gap="2" className="mb-6">
              <Link href={`/${locale}/about`} className={linkStyleDesktop}>
                {t('introduction')}
              </Link>
              <Link href={`/${locale}/careers`} className={linkStyleDesktop}>
                {t('careers')}
              </Link>
              <Link href={`/${locale}/locations`} className={linkStyleDesktop}>
                {t('storeSystem')}
              </Link>
            </Flex>
            <Text className={titleStyleDesktop}>{t('businessPartner').toUpperCase()}</Text>
            <Flex direction="column" gap="2">
              <Link href={`/${locale}/franchise`} className={linkStyleDesktop}>
                {t('franchiseAgent')}
              </Link>
              <Link href={`/${locale}/affiliate`} className={linkStyleDesktop}>
                {t('affiliate')}
              </Link>
            </Flex>
          </Flex>

          {/* Column 2: Customer Service + News & Promotions (gộp) */}
          <Flex direction="column">
            <Text className={titleStyleDesktop}>{t('customerService').toUpperCase()}</Text>
            <Flex direction="column" gap="2" className="mb-6">
              <Link href={`/${locale}/guide`} className={linkStyleDesktop}>
                {t('shoppingGuide')}
              </Link>
              <Link href={`/${locale}/faq`} className={linkStyleDesktop}>
                {t('faq')}
              </Link>
            </Flex>
            <Text className={titleStyleDesktop}>{t('newsPromotionSection').toUpperCase()}</Text>
            <Flex direction="column" gap="2">
              <Link href={`/${locale}/news/fashion-trends`} className={linkStyleDesktop}>
                {t('fashionTrends')}
              </Link>
              <Link href={`/${locale}/news/mega-sale`} className={linkStyleDesktop}>
                {t('megaSale')}
              </Link>
              <Link href={`/${locale}/news/livestream`} className={linkStyleDesktop}>
                {t('megaLivestream')}
              </Link>
            </Flex>
          </Flex>

          {/* Column 3: Policies */}
          <Flex direction="column">
            <Text className={titleStyleDesktop}>{t('policies').toUpperCase()}</Text>
            <Flex direction="column" gap="2">
              <Link href={`/${locale}/policy/terms`} className={linkStyleDesktop}>
                {t('policyTerms')}
              </Link>
              <Link href={`/${locale}/policy/vip`} className={linkStyleDesktop}>
                {t('policyVIP')}
              </Link>
              <Link href={`/${locale}/policy/payment`} className={linkStyleDesktop}>
                {t('policyPayment')}
              </Link>
              <Link href={`/${locale}/policy/return`} className={linkStyleDesktop}>
                {t('policyReturn')}
              </Link>
              <Link href={`/${locale}/policy/warranty`} className={linkStyleDesktop}>
                {t('policyWarranty')}
              </Link>
              <Link href={`/${locale}/policy/delivery`} className={linkStyleDesktop}>
                {t('policyDelivery')}
              </Link>
              <Link href={`/${locale}/policy/privacy`} className={linkStyleDesktop}>
                {t('policyPrivacy')}
              </Link>
            </Flex>
          </Flex>

          {/* Column 4: Store System */}
          <Flex direction="column">
            <Text className={titleStyleDesktop}>{t('storeSystemSection').toUpperCase()}</Text>
            <Flex direction="column" gap="1">
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.baTrieu')}</Link>: {t('stores.baTrieuAddress')}
              </Text>
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.chuaBoc')}</Link>: {t('stores.chuaBocAddress')}
              </Text>
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.phamNgocThach')}</Link>: {t('stores.phamNgocThachAddress')}
              </Text>
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.hangVoi')}</Link>: {t('stores.hangVoiAddress')}
              </Text>
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.haiPhong')}</Link>: {t('stores.haiPhongAddress')}
              </Text>
            </Flex>
          </Flex>
        </Box>

        {/* md (768-1023px): 3 columns trên + Store System full width dưới */}
        <Box className="grid lg:hidden grid-cols-3 gap-x-8 gap-y-8">
          {/* Column 1: CCHAT + Business Partnership */}
          <Flex direction="column">
            <Text className={titleStyleDesktop}>CCHAT</Text>
            <Flex direction="column" gap="2" className="mb-6">
              <Link href={`/${locale}/about`} className={linkStyleDesktop}>
                {t('introduction')}
              </Link>
              <Link href={`/${locale}/careers`} className={linkStyleDesktop}>
                {t('careers')}
              </Link>
              <Link href={`/${locale}/locations`} className={linkStyleDesktop}>
                {t('storeSystem')}
              </Link>
            </Flex>
            <Text className={titleStyleDesktop}>{t('businessPartner').toUpperCase()}</Text>
            <Flex direction="column" gap="2">
              <Link href={`/${locale}/franchise`} className={linkStyleDesktop}>
                {t('franchiseAgent')}
              </Link>
              <Link href={`/${locale}/affiliate`} className={linkStyleDesktop}>
                {t('affiliate')}
              </Link>
            </Flex>
          </Flex>

          {/* Column 2: Customer Service + News & Promotions (gộp) */}
          <Flex direction="column">
            <Text className={titleStyleDesktop}>{t('customerService').toUpperCase()}</Text>
            <Flex direction="column" gap="2" className="mb-6">
              <Link href={`/${locale}/guide`} className={linkStyleDesktop}>
                {t('shoppingGuide')}
              </Link>
              <Link href={`/${locale}/faq`} className={linkStyleDesktop}>
                {t('faq')}
              </Link>
            </Flex>
            <Text className={titleStyleDesktop}>{t('newsPromotionSection').toUpperCase()}</Text>
            <Flex direction="column" gap="2">
              <Link href={`/${locale}/news/fashion-trends`} className={linkStyleDesktop}>
                {t('fashionTrends')}
              </Link>
              <Link href={`/${locale}/news/mega-sale`} className={linkStyleDesktop}>
                {t('megaSale')}
              </Link>
              <Link href={`/${locale}/news/livestream`} className={linkStyleDesktop}>
                {t('megaLivestream')}
              </Link>
            </Flex>
          </Flex>

          {/* Column 3: Policies */}
          <Flex direction="column">
            <Text className={titleStyleDesktop}>{t('policies').toUpperCase()}</Text>
            <Flex direction="column" gap="2">
              <Link href={`/${locale}/policy/terms`} className={linkStyleDesktop}>
                {t('policyTerms')}
              </Link>
              <Link href={`/${locale}/policy/vip`} className={linkStyleDesktop}>
                {t('policyVIP')}
              </Link>
              <Link href={`/${locale}/policy/payment`} className={linkStyleDesktop}>
                {t('policyPayment')}
              </Link>
              <Link href={`/${locale}/policy/return`} className={linkStyleDesktop}>
                {t('policyReturn')}
              </Link>
              <Link href={`/${locale}/policy/warranty`} className={linkStyleDesktop}>
                {t('policyWarranty')}
              </Link>
              <Link href={`/${locale}/policy/delivery`} className={linkStyleDesktop}>
                {t('policyDelivery')}
              </Link>
              <Link href={`/${locale}/policy/privacy`} className={linkStyleDesktop}>
                {t('policyPrivacy')}
              </Link>
            </Flex>
          </Flex>

          {/* Store System - full width row */}
          <Flex direction="column" className="col-span-3 pt-4 border-t border-gray-200">
            <Text className={titleStyleDesktop}>{t('storeSystemSection').toUpperCase()}</Text>
            <Box className="grid grid-cols-2 gap-x-8 gap-y-1">
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.baTrieu')}</Link>: {t('stores.baTrieuAddress')}
              </Text>
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.chuaBoc')}</Link>: {t('stores.chuaBocAddress')}
              </Text>
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.phamNgocThach')}</Link>: {t('stores.phamNgocThachAddress')}
              </Text>
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.hangVoi')}</Link>: {t('stores.hangVoiAddress')}
              </Text>
              <Text className="text-sm text-black leading-relaxed">
                <span className="mr-1">•</span>
                <Link href={`/${locale}/locations`} className="underline text-black hover:opacity-70">{t('stores.haiPhong')}</Link>: {t('stores.haiPhongAddress')}
              </Text>
            </Box>
          </Flex>
        </Box>
      </Box>
    </>
  );
}
