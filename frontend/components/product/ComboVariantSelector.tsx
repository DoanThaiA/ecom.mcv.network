"use client";

import { Box, Flex, Select, Text } from "@radix-ui/themes";
import { useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { ComboOptionRow } from "./ComboOptionRow";
import {
  findFirstInStockVariantId,
  getSelectableOptions,
  getSelectionForVariantId,
  isVariantInStock,
  resolveVariantIdForValue,
  type ComboOptionChoice,
  type ComboOptionKey,
  type ComboVariantInput,
  type ComboVariantOptions,
} from "@/lib/helpers/comboVariantHelper";

interface ComboVariantSelectorProps {
  /** Built by the card, which also needs it to pick the colour's photo. */
  options: ComboVariantOptions;
  variants: ComboVariantInput[];
  selectedVariantId?: string;
  onVariantChange: (_variantId: string) => void;
}

const FIELD_CLASS =
  "max-[399px]:w-full min-[400px]:w-[160px] lg:w-full h-[40px]";
const TRIGGER_CLASS =
  "w-full h-full px-3 bg-white border border-[#f0f0f0] rounded-[32px]";
const SOLD_OUT_ROW_CLASS = "line-through text-[#b0b0b0]";

/**
 * Variant picker for a combo slot: a colour row and a size row, each collapsing
 * to one line with a chevron. Falls back to a single dropdown of variant names
 * when the data can't be split safely. Sold-out options are struck through and
 * can't be picked. The parent still holds only the selected variant id.
 */
export function ComboVariantSelector({
  options,
  variants,
  selectedVariantId,
  onVariantChange,
}: ComboVariantSelectorProps) {
  const t = useTranslations("productDetail");

  const selection = useMemo(
    () => getSelectionForVariantId(options, selectedVariantId),
    [options, selectedVariantId]
  );

  // The parent defaults to the first variant, which may be sold out. Read the
  // variant list rather than the options, so this also corrects products that
  // fall back to the plain dropdown.
  useEffect(() => {
    if (!selectedVariantId) return;
    if (isVariantInStock(variants, selectedVariantId)) return;
    const inStock = findFirstInStockVariantId(variants);
    if (inStock) onVariantChange(inStock);
  }, [variants, selectedVariantId, onVariantChange]);

  const pick = (key: ComboOptionKey, choice: ComboOptionChoice) => {
    if (!choice.inStock) return;
    const variantId = resolveVariantIdForValue(
      options,
      key,
      choice.value,
      selection
    );
    if (variantId) onVariantChange(variantId);
  };

  if (!options.splittable) {
    return (
      <Box className={FIELD_CLASS}>
        <Select.Root value={selectedVariantId || ""} onValueChange={onVariantChange}>
          <Select.Trigger className={TRIGGER_CLASS}>
            <Flex align="center" justify="between" gap="1" className="w-full">
              <Text className="text-xs text-black flex-1 text-left line-clamp-2">
                {variants.find((v) => v.id === selectedVariantId)?.name ??
                  t("selectVariant")}
              </Text>
            </Flex>
          </Select.Trigger>
          <Select.Content className="rounded-xl">
            {variants.map((variant) => {
              const soldOut =
                variant.available != null && variant.available <= 0;
              return (
                <Select.Item
                  key={variant.id}
                  value={variant.id}
                  disabled={soldOut}
                  className={`text-xs ${soldOut ? SOLD_OUT_ROW_CLASS : ""}`}
                >
                  {variant.name}
                </Select.Item>
              );
            })}
          </Select.Content>
        </Select.Root>
      </Box>
    );
  }

  return (
    <Flex direction="column" gap="1" className="w-full">
      {options.groups.map((group, index) => {
        // Narrowed by the groups above it, so size only lists what the chosen
        // colour actually comes in.
        const narrowing = Object.fromEntries(
          options.groups
            .slice(0, index)
            .map((previous) => [previous.key, selection[previous.key]])
        );

        return (
          <ComboOptionRow
            key={group.key}
            optionKey={group.key}
            choices={getSelectableOptions(options, group.key, narrowing)}
            selected={selection[group.key]}
            onPick={(choice) => pick(group.key, choice)}
          />
        );
      })}
    </Flex>
  );
}
