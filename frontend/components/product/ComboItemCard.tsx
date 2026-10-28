"use client";

import { Box, Flex, Text, Select } from "@radix-ui/themes";
import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { ShopCombo, ShopComboItem } from "@/types/gen/shop/shop/combos/combo";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/constants";
import { ProductImage } from "@/components/common/ProductImage";
import { ComboVariantSelector } from "./ComboVariantSelector";
import {
  buildComboVariantOptions,
  findColorImage,
  isComboItemSellable,
} from "@/lib/helpers/comboVariantHelper";
import { getAvailableComboItems } from "@/lib/helpers/comboSlotHelper";

interface ComboItemCardProps {
  comboItems: ShopComboItem[];
  selectedProductId?: string;
  selectedItems: Record<number, string>;
  currentPosition: number;
  mainProductId: string;
  originalCombos?: ShopCombo[];
  onItemSelect: (_productId: string) => void;
  selectedVariant?: string;
  onVariantChange: (_variantId: string) => void;
}

export function ComboItemCard({
  comboItems,
  selectedProductId,
  selectedItems,
  currentPosition,
  mainProductId,
  originalCombos,
  onItemSelect,
  selectedVariant,
  onVariantChange,
}: ComboItemCardProps) {
  const t = useTranslations("productDetail");
  const currentItem = selectedProductId
    ? comboItems.find((i) => i.productId === selectedProductId)
    : undefined;

  const hasVariants = currentItem?.variants && currentItem.variants.length > 0;
  const isSoldOut = Boolean(currentItem) && !isComboItemSellable(currentItem);

  const options = useMemo(
    () =>
      buildComboVariantOptions(
        currentItem?.variants ?? [],
        currentItem?.productCode
      ),
    [currentItem?.variants, currentItem?.productCode]
  );

  const image =
    findColorImage(options, selectedVariant, currentItem?.productImage) ??
    currentItem?.productImage;

  const availableItems = useMemo(
    () =>
      getAvailableComboItems(
        comboItems,
        selectedItems,
        currentPosition,
        mainProductId,
        originalCombos
      ),
    [comboItems, selectedItems, currentPosition, mainProductId, originalCombos]
  );

  return (
    <Flex direction="column" gap="2" className="w-full">
      {/* Product Name Selector - Dropdown to choose from available items.
          With nothing to choose between, show the name the way the main
          product does rather than a dropdown that can't change anything. */}
      <Box className="max-[349px]:w-full min-[400px]:w-[160px] lg:w-full h-[40px]">
        {availableItems.length < 2 ? (
          <Flex align="center" className="w-full h-full px-3">
            <Text className="text-sm text-black truncate">
              {currentItem?.productName || t("selectProduct")}
            </Text>
          </Flex>
        ) : (
          <Select.Root
            value={selectedProductId || ""}
            onValueChange={onItemSelect}
          >
            <Select.Trigger className="w-full h-full px-3 bg-white border border-[#f0f0f0] rounded-[32px]">
              <Flex align="center" justify="between" className="w-full">
                <Text className="text-xs text-[#999] flex-1 text-left truncate">
                  {currentItem?.productName || t("selectProduct")}
                </Text>
              </Flex>
            </Select.Trigger>
            <Select.Content>
              {availableItems.map((comboItem) => (
                <Select.Item
                  key={comboItem.productId}
                  value={comboItem.productId}
                >
                  {comboItem.productName}
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Root>
        )}
      </Box>

      {/* Product Image - Show empty state or selected product */}
      <Box className="w-full max-[349px]:aspect-square min-[400px]:aspect-[3/4] rounded-lg overflow-hidden bg-[#d9d9d9] flex items-center justify-center relative">
        {currentItem ? (
          <ProductImage
            src={image?.trim() || DEFAULT_PRODUCT_IMAGE}
            alt={currentItem.productName || "Product"}
            fill
            className={`${
              image?.trim() ? "object-cover" : "object-contain p-4"
            }`}
          />
        ) : (
          <Text className="text-[#999] text-sm">{t("selectProduct")}</Text>
        )}
      </Box>

      {/* Variant Selector */}
      {hasVariants && (
        <ComboVariantSelector
          options={options}
          variants={currentItem.variants}
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
