"use client";

import { Box, Flex, Text } from "@radix-ui/themes";
import { useMemo } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { Product } from "@/types/gen/shared/shared/products/product";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/constants";
import { getLocalizedProductName } from "@/lib/helpers/localizationHelper";
import type { AppLocale } from "@/lib/locale";
import { ProductImage } from "@/components/common/ProductImage";
import { ComboVariantSelector } from "./ComboVariantSelector";
import {
  buildComboVariantOptions,
  findColorImage,
  isComboItemSellable,
} from "@/lib/helpers/comboVariantHelper";

interface ComboProductCardProps {
  product: Product;
  selectedVariant?: string;
  onVariantChange: (_variantId: string) => void;
}

export function ComboProductCard({
  product,
  selectedVariant,
  onVariantChange,
}: ComboProductCardProps) {
  const locale = useLocale() as AppLocale;
  const t = useTranslations("productDetail");
  const hasVariants = product.variants && product.variants.length > 0;
  const productName = getLocalizedProductName(product, locale);
  // The product detail payload nests stock and photo differently; flatten both
  // to the shape the combo endpoint already sends.
  const variantInputs = useMemo(
    () =>
      (product.variants ?? []).map((variant) => ({
        id: variant.id,
        name: variant.name,
        code: variant.code,
        attributes: variant.attributes,
        available: variant.inventory?.available ?? 0,
        image: variant.images?.avatar,
      })),
    [product.variants]
  );

  const isSoldOut = !isComboItemSellable({
    variants: variantInputs,
    available: product.inventory?.available ?? 0,
  });

  const options = useMemo(
    () => buildComboVariantOptions(variantInputs, product.code),
    [variantInputs, product.code]
  );

  const image =
    findColorImage(options, selectedVariant, product.images?.avatar) ||
    product.images?.avatar;

  return (
    <Flex direction="column" gap="2" className="w-full">
      {/* Product Name - No dropdown for main product */}
      <Box className="max-[349px]:w-full min-[350px]:w-[160px] lg:w-full h-[40px] flex items-center px-3">
        <Text className="text-sm text-black truncate">{productName}</Text>
      </Box>

      {/* Product Image */}
      <Box className="w-full max-[349px]:aspect-square min-[350px]:aspect-[3/4] rounded-lg overflow-hidden bg-[#d9d9d9] relative">
        <ProductImage
          src={image || DEFAULT_PRODUCT_IMAGE}
          alt={productName}
          fill
          className={`${image ? "object-cover" : "object-contain p-4"}`}
        />
      </Box>

      {/* Variant Selector */}
      {hasVariants && (
        <ComboVariantSelector
          options={options}
          variants={variantInputs}
          selectedVariantId={selectedVariant}
          onVariantChange={onVariantChange}
        />
      )}

      {isSoldOut && (
        <Box className="max-[399px]:w-full min-[400px]:w-[160px] lg:w-full h-[40px] flex items-center px-3">
          <Text className="text-sm font-medium text-[#ed2024]">
            {t("soldOut")}
          </Text>
        </Box>
      )}
    </Flex>
  );
}
