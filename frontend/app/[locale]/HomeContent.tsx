import { AdSection } from '@/components/ads/AdSection';
import { HeroSlider } from '@/components/hero/HeroSlider';
import { FlashSale } from '@/components/product/FlashSale';
import { TopicSectionClient } from '@/components/topic/TopicSectionClient';
import { getLocalizedName } from '@/lib/helpers/localizationHelper';
import { AppLocale } from '@/lib/locale';
import { getTopicUrl } from '@/lib/utils/seoUrl';
import type { ShopTopicItem } from '@/types/gen/shared/shared/topics/topic';
import type { LandingBanners } from '@/types/gen/shop/shop/products/product';
import type { ShopActiveFlashSaleResponse } from '@/types/gen/shop/shop/shop/shop';
import { Box } from '@radix-ui/themes';
import isEmpty from 'lodash/isEmpty';
import isNil from 'lodash/isNil';
import { getTranslations } from 'next-intl/server';

interface HomeContentProps {
  locale: AppLocale;
  topics?: ShopTopicItem[];
  flashSale?: ShopActiveFlashSaleResponse | null;
  banners?: LandingBanners;
}

export async function HomeContent({
  locale,
  topics = [],
  flashSale,
  banners,
}: HomeContentProps) {
  const t = await getTranslations('home');
  const tCommon = await getTranslations('common');

  // Use API banners for hero slides
  const heroSlides = (banners?.heroSlider ?? [])
    .filter((b) => !isNil(b.media))
    .map((b) => ({
      title: '',
      subtitle: '',
      responsiveMedia: b.media,
      mediaType: b.mediaType,
      buttonLink: b.link,
    }));

  // Map ad section banners to AdSection ads format
  const adSectionAds = (banners?.adSection ?? [])
    .filter((b) => !isNil(b.media))
    .map((b) => ({
      responsiveMedia: b.media,
      mediaType: b.mediaType,
      href: b.link,
    }));

  // Check data availability
  const hasFlashSaleProducts =
    flashSale && flashSale.data && flashSale.data.length > 0;

  // Use flash sale products directly from API - limit to 50
  const flashSaleProducts = hasFlashSaleProducts
    ? flashSale.data.slice(0, 50)
    : [];
  const flashSaleEndTime = flashSale?.endTime
    ? new Date(flashSale.endTime)
    : new Date();

  // Only show "View All" if total products exceeds 50
  const showFlashSaleViewAll = hasFlashSaleProducts && flashSale.total > 50;

  return (
    <Box className="lg:mt-10">
      {/* Hero Slider */}
      {!isEmpty(heroSlides) && <HeroSlider slides={heroSlides} />}

      {/* Sale Banner */}
      {adSectionAds.length > 0 && (
        <AdSection ads={adSectionAds} alt={t('saleBannerAlt')} />
      )}

      <Box>
        {/* Flash Sale */}
        {hasFlashSaleProducts && <Box className="h-8" />}
        {hasFlashSaleProducts && (
          <Box id="flashsale-section" className="scroll-mt-[120px]">
            <FlashSale
              title={tCommon('commerce.flashSale')}
              seeAllText={showFlashSaleViewAll ? t('seeAll').toUpperCase() : undefined}
              endsInText={t('endsIn')}
              products={flashSaleProducts as any}
              endTime={flashSaleEndTime}
              seeAllLink={showFlashSaleViewAll ? `/${locale}/flash-sale` : undefined}
              locale={locale}
            />
          </Box>
        )}

        {!isEmpty(topics) && <Box className="h-8" />}

        {/* Topic Sections - Client-side fetch for each topic */}
        {topics.map((topic, index) => (
          <Box key={topic.id} className={`${index > 0 ? 'mt-5' : ''}`}>
            <TopicSectionClient
              topicName={getLocalizedName(topic.name, topic.localization, locale)}
              topicSlug={topic.slug}
              topicType={topic.type}
              seeAllLink={getTopicUrl(topic, locale)}
              locale={locale}
            />
          </Box>
        ))}

        {/* Spacing before footer */}
        <Box className="h-12 sm:h-16 md:h-14" />
      </Box>
    </Box>
  );
}