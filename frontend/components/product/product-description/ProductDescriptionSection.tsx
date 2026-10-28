'use client';

import { Box, Flex, Heading } from '@radix-ui/themes';
import type { ProductDescriptionMedia, ProductDetails } from '@/types/gen/shared/shared/products/product';
import { ProductDescriptionGallery } from './ProductDescriptionGallery';
import { ProductDescriptionMediaImage } from './ProductDescriptionMediaImage';
import { ProductDetailSpecs } from './ProductDetailSpecs';
import { ProductRichDescription } from './ProductRichDescription';

interface ProductDescriptionSectionProps {
  title: string;
  description?: string;
  descriptionMedia?: ProductDescriptionMedia;
  productName?: string;
  productCode?: string;
  details?: ProductDetails;
}

export function ProductDescriptionSection({ title, description, descriptionMedia, productName, productCode, details }: ProductDescriptionSectionProps) {
  const topImage = descriptionMedia?.topImages?.[0];
  const bottomImage = descriptionMedia?.bottomImages?.[0];
  const gallery = descriptionMedia?.sliderImages ?? [];
  const alt = productName || title;
  const hasSpecs = Boolean(
    productName?.trim() ||
      productCode?.trim() ||
      details?.material?.trim() ||
      details?.style?.trim() ||
      details?.highlights?.trim() ||
      details?.suitableFor?.trim() ||
      details?.careInstructions?.trim(),
  );

  return (
    <Box className="w-full bg-white">
      <Flex direction="column" align="center" className="w-full pb-8 pt-0">
        <Flex align="center" className="w-full py-6"><Heading size="6" weight="medium" className="text-black">{title}</Heading></Flex>
        <Box className={`grid w-full gap-4 ${gallery.length ? 'lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:grid-rows-[max-content_max-content_minmax(0,1fr)]' : 'lg:grid-cols-1'}`}>
          {topImage && <Box className="self-start lg:col-start-1 lg:row-start-1"><ProductDescriptionMediaImage src={topImage} alt={`${alt} - top`} testId="top-image" /></Box>}
          {gallery.length > 0 && <Box className="lg:col-start-2 lg:row-span-3 lg:row-start-1"><ProductDescriptionGallery images={gallery} alt={alt} /></Box>}
          {hasSpecs && (
            <Box className="self-start lg:col-start-1 lg:row-start-2">
              <ProductDetailSpecs productName={productName} productCode={productCode} details={details} />
            </Box>
          )}
        </Box>
        {bottomImage && <Box className="mt-6 min-w-0 w-full"><ProductDescriptionMediaImage src={bottomImage} alt={`${alt} - bottom`} testId="bottom-image" mobileHorizontalScroll /></Box>}
        {description && <Box className="mt-6 w-full"><ProductRichDescription description={description} /></Box>}
      </Flex>
    </Box>
  );
}
