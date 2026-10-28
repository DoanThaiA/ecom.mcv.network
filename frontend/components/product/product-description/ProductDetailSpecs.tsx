import { Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import type { ProductDetails } from '@/types/gen/shared/shared/products/product';

interface ProductDetailSpecsProps {
  productName?: string;
  productCode?: string;
  details?: ProductDetails;
}

export function ProductDetailSpecs({ productName, productCode, details }: ProductDetailSpecsProps) {
  const t = useTranslations('productDetail');
  const rows = [
    [t('specProductName'), productName],
    [t('specProductCode'), productCode],
    [t('specMaterial'), details?.material],
    [t('specStyle'), details?.style],
    [t('specHighlights'), details?.highlights],
    [t('specSuitableFor'), details?.suitableFor],
    [t('specCare'), details?.careInstructions],
  ].filter(([, value]) => value?.trim());

  if (!rows.length) return null;

  return (
    <Flex direction="column" className="w-full" data-description-block="specs">
      {rows.map(([label, value], index) => (
        <Flex key={label} gap="3" align="start" className={`py-2 ${index < rows.length - 1 ? 'border-b border-[#f0f0f0]' : ''}`}>
          <Text weight="medium" className="w-[140px] shrink-0 text-sm text-black">{label}</Text>
          <Text className="flex-1 text-sm leading-5 text-black">{value}</Text>
        </Flex>
      ))}
    </Flex>
  );
}
