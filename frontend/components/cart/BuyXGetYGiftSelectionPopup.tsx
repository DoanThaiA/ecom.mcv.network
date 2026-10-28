"use client";

import { formatPrice } from "@/lib/utils/format";
import type {
  BundleDealEligibilityResponse,
  GiftProductDetailResponse,
  GiftProductVariantResponse,
} from "@/types/cart";
import { Box, Button, Dialog, Flex, Text, Select } from "@radix-ui/themes";
import {
  Cross2Icon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
} from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { ProductImage } from "@/components/common/ProductImage";
import { useState, useMemo, useCallback } from "react";

interface GiftSelection {
  productId: string;
  variantId?: string;
  quantity: number;
}

interface BuyXGetYGiftSelectionPopupProps {
  eligibility: BundleDealEligibilityResponse;
  onConfirm: (_promotionId: string, _gifts: GiftSelection[]) => Promise<void>;
  onClose: () => void;
  isLoading?: boolean;
}

const getSelectionKey = (productId: string, variantId?: string): string =>
  variantId ? `${productId}:${variantId}` : productId;

const getVariantLabel = (variant: GiftProductVariantResponse): string =>
  variant.name || variant.attributes.map((a) => a.value).join(" - ");

/**
 * Multi-select gift popup for BUY_X_GET_Y promotions.
 * One row per product. Products with variants show an "Add variant" picker
 * and compact sub-rows for each selected variant with independent qty controls.
 */
export function BuyXGetYGiftSelectionPopup({
  eligibility,
  onConfirm,
  onClose,
  isLoading = false,
}: BuyXGetYGiftSelectionPopupProps) {
  const t = useTranslations("cart");
  const maxGifts = eligibility.giftQuantity ?? 1;

  // Build initial selections from currently claimed gifts
  const initialSelections = useMemo(() => {
    const map = new Map<string, GiftSelection>();
    for (const gift of eligibility.currentGifts ?? []) {
      const key = getSelectionKey(gift.productId, gift.variantId || undefined);
      map.set(key, {
        productId: gift.productId,
        variantId: gift.variantId || undefined,
        quantity: gift.quantity ?? 1,
      });
    }
    return map;
  }, [eligibility.currentGifts]);

  const [selections, setSelections] =
    useState<Map<string, GiftSelection>>(initialSelections);

  const totalSelected = useMemo(() => {
    let total = 0;
    for (const sel of selections.values()) {
      total += sel.quantity;
    }
    return total;
  }, [selections]);

  /** Total qty selected for a specific product (across all its variants) */
  const getProductTotalQty = useCallback(
    (productId: string, product: GiftProductDetailResponse): number => {
      if (!product.hasVariants) {
        return selections.get(productId)?.quantity ?? 0;
      }
      let total = 0;
      for (const [key, sel] of selections) {
        if (key === productId || key.startsWith(`${productId}:`)) {
          total += sel.quantity;
        }
      }
      return total;
    },
    [selections],
  );

  /** Get selected variant entries for a product */
  const getProductVariantSelections = useCallback(
    (
      productId: string,
    ): Array<{ variantId: string; quantity: number; key: string }> => {
      const result: Array<{
        variantId: string;
        quantity: number;
        key: string;
      }> = [];
      for (const [key, sel] of selections) {
        if (key.startsWith(`${productId}:`) && sel.variantId) {
          result.push({
            variantId: sel.variantId,
            quantity: sel.quantity,
            key,
          });
        }
      }
      return result;
    },
    [selections],
  );

  // --- Handlers for products WITHOUT variants ---

  const handleIncrementSimple = (product: GiftProductDetailResponse) => {
    if (totalSelected >= maxGifts) return;
    const key = product.productId;
    const existing = selections.get(key);
    const currentQty = existing?.quantity ?? 0;
    if (currentQty >= product.availableStock) return;

    const newSelections = new Map(selections);
    newSelections.set(key, {
      productId: product.productId,
      quantity: currentQty + 1,
    });
    setSelections(newSelections);
  };

  const handleDecrementSimple = (product: GiftProductDetailResponse) => {
    const key = product.productId;
    const existing = selections.get(key);
    if (!existing || existing.quantity <= 0) return;

    const newSelections = new Map(selections);
    if (existing.quantity === 1) {
      newSelections.delete(key);
    } else {
      newSelections.set(key, { ...existing, quantity: existing.quantity - 1 });
    }
    setSelections(newSelections);
  };

  // --- Handlers for products WITH variants ---

  /** Add a variant to the product's selections (called from the Select picker) */
  const handleAddVariant = (
    product: GiftProductDetailResponse,
    variantId: string,
  ) => {
    if (totalSelected >= maxGifts) return;
    const variant = product.variants.find((v) => v.variantId === variantId);
    if (!variant || !variant.isAvailable) return;

    const key = getSelectionKey(product.productId, variantId);
    const existing = selections.get(key);
    const currentQty = existing?.quantity ?? 0;
    if (currentQty >= variant.availableStock) return;

    const newSelections = new Map(selections);
    newSelections.set(key, {
      productId: product.productId,
      variantId,
      quantity: currentQty + 1,
    });
    setSelections(newSelections);
  };

  const handleIncrementVariant = (
    product: GiftProductDetailResponse,
    variantId: string,
  ) => {
    if (totalSelected >= maxGifts) return;
    const variant = product.variants.find((v) => v.variantId === variantId);
    if (!variant) return;

    const key = getSelectionKey(product.productId, variantId);
    const existing = selections.get(key);
    const currentQty = existing?.quantity ?? 0;
    if (currentQty >= variant.availableStock) return;

    const newSelections = new Map(selections);
    newSelections.set(key, {
      productId: product.productId,
      variantId,
      quantity: currentQty + 1,
    });
    setSelections(newSelections);
  };

  const handleDecrementVariant = (productId: string, variantId: string) => {
    const key = getSelectionKey(productId, variantId);
    const existing = selections.get(key);
    if (!existing || existing.quantity <= 0) return;

    const newSelections = new Map(selections);
    if (existing.quantity === 1) {
      newSelections.delete(key);
    } else {
      newSelections.set(key, { ...existing, quantity: existing.quantity - 1 });
    }
    setSelections(newSelections);
  };

  const handleRemoveVariant = (productId: string, variantId: string) => {
    const key = getSelectionKey(productId, variantId);
    const newSelections = new Map(selections);
    newSelections.delete(key);
    setSelections(newSelections);
  };

  const handleConfirm = async () => {
    const gifts: GiftSelection[] = [];
    for (const sel of selections.values()) {
      if (sel.quantity > 0) gifts.push(sel);
    }
    await onConfirm(eligibility.promotionId, gifts);
  };

  const reachedMax = totalSelected >= maxGifts;

  return (
    <Dialog.Root open={true} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content
        className="p-0 rounded-2xl overflow-hidden"
        style={{ maxWidth: "560px", width: "90vw" }}
        aria-describedby="buy-x-get-y-gift-selection-description"
      >
        <Dialog.Title className="sr-only">
          {t("giftOffer.selectGiftTitle")}
        </Dialog.Title>
        <Dialog.Description
          id="buy-x-get-y-gift-selection-description"
          className="sr-only"
        >
          {t("giftOffer.selectGiftTitle")}
        </Dialog.Description>

        {/* Header */}
        <Flex
          justify="between"
          align="center"
          className="p-4 border-b border-gray-200"
        >
          <Flex align="center" gap="2">
            <Text weight="bold" style={{ fontSize: "18px" }}>
              {t("giftOffer.selectGiftTitle")}
            </Text>
            <Box className="bg-[#FAA63E] text-white px-2 py-0.5 rounded-full text-xs font-medium">
              {totalSelected}/{maxGifts}
            </Box>
          </Flex>
          <Button
            variant="ghost"
            size="1"
            className="cursor-pointer"
            onClick={onClose}
          >
            <Cross2Icon width={20} height={20} />
          </Button>
        </Flex>

        {/* Content */}
        <Box className="p-4 max-h-[60vh] overflow-y-auto">
          {/* Selected count info */}
          <Box className="bg-[#FFF5E6] rounded-lg p-3 mb-4">
            <Text className="text-[#C0752F]" style={{ fontSize: "14px" }}>
              {t("giftOffer.selectedCount", {
                current: totalSelected,
                max: maxGifts,
              })}
            </Text>
            {reachedMax && (
              <Text
                className="text-[#C0752F] block mt-1"
                style={{ fontSize: "12px" }}
              >
                {t("giftOffer.maxGiftsReached")}
              </Text>
            )}
          </Box>

          {/* Product list — one card per product */}
          <Box className="space-y-3">
            {eligibility.giftProducts.map((product) => {
              const productQty = getProductTotalQty(
                product.productId,
                product,
              );
              const hasVariants =
                product.hasVariants && product.variants.length > 0;

              return (
                <ProductCard
                  key={product.productId}
                  product={product}
                  productQty={productQty}
                  hasVariants={hasVariants}
                  reachedMax={reachedMax}
                  isLoading={isLoading}
                  selections={selections}
                  t={t}
                  onIncrementSimple={handleIncrementSimple}
                  onDecrementSimple={handleDecrementSimple}
                  onAddVariant={handleAddVariant}
                  onIncrementVariant={handleIncrementVariant}
                  onDecrementVariant={handleDecrementVariant}
                  onRemoveVariant={handleRemoveVariant}
                  getProductVariantSelections={getProductVariantSelections}
                />
              );
            })}
          </Box>
        </Box>

        {/* Footer */}
        <Box className="p-4 border-t border-gray-200">
          <Flex justify="between" align="center" className="mb-3">
            <Text className="text-gray-600" style={{ fontSize: "13px" }}>
              {t("giftOffer.selectedCount", {
                current: totalSelected,
                max: maxGifts,
              })}
            </Text>
          </Flex>
          <Button
            size="3"
            className="w-full cursor-pointer"
            style={{
              background:
                isLoading || totalSelected === 0
                  ? "#ccc"
                  : "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%)",
              color: "white",
              borderRadius: "8px",
            }}
            onClick={handleConfirm}
            disabled={isLoading || totalSelected === 0}
          >
            {isLoading
              ? t("giftOffer.selecting")
              : t("giftOffer.confirmButton")}
          </Button>
        </Box>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// ─── Product Card (extracted to keep main component under 500 lines) ────────

interface ProductCardProps {
  product: GiftProductDetailResponse;
  productQty: number;
  hasVariants: boolean;
  reachedMax: boolean;
  isLoading: boolean;
  selections: Map<string, GiftSelection>;
  t: ReturnType<typeof useTranslations<"cart">>;
  onIncrementSimple: (p: GiftProductDetailResponse) => void;
  onDecrementSimple: (p: GiftProductDetailResponse) => void;
  onAddVariant: (p: GiftProductDetailResponse, variantId: string) => void;
  onIncrementVariant: (p: GiftProductDetailResponse, vId: string) => void;
  onDecrementVariant: (productId: string, variantId: string) => void;
  onRemoveVariant: (productId: string, variantId: string) => void;
  getProductVariantSelections: (
    productId: string,
  ) => Array<{ variantId: string; quantity: number; key: string }>;
}

function ProductCard({
  product,
  productQty,
  hasVariants,
  reachedMax,
  isLoading,
  selections,
  t,
  onIncrementSimple,
  onDecrementSimple,
  onAddVariant,
  onIncrementVariant,
  onDecrementVariant,
  onRemoveVariant,
  getProductVariantSelections,
}: ProductCardProps) {
  const variantEntries = hasVariants
    ? getProductVariantSelections(product.productId)
    : [];

  const simpleQty = !hasVariants
    ? (selections.get(product.productId)?.quantity ?? 0)
    : 0;

  const isSimpleIncrDisabled =
    reachedMax || simpleQty >= product.availableStock;

  // Available variants that can still be added
  const availableVariantsToAdd = hasVariants
    ? product.variants.filter((v) => {
        if (!v.isAvailable) return false;
        const key = getSelectionKey(product.productId, v.variantId);
        const currentQty = selections.get(key)?.quantity ?? 0;
        return currentQty < v.availableStock;
      })
    : [];

  return (
    <Box
      className={`bg-white rounded-lg p-3 border-2 transition-all ${
        productQty > 0 ? "border-[#FAA63E]" : "border-gray-200"
      }`}
    >
      <Flex gap="3" align="start">
        {/* Product image */}
        <Box
          className="flex-shrink-0 bg-gray-100 overflow-hidden rounded-lg"
          style={{ width: "70px", height: "85px" }}
        >
          {product.image ? (
            <ProductImage
              src={product.image}
              alt={product.name}
              width={70}
              height={85}
              className="w-full h-full object-cover"
            />
          ) : (
            <Box className="w-full h-full flex items-center justify-center bg-gray-200">
              <Text size="1" color="gray">
                {t("giftOffer.noImage")}
              </Text>
            </Box>
          )}
        </Box>

        {/* Product info + controls */}
        <Flex direction="column" className="flex-1 min-w-0" gap="1">
          <Text
            className="text-black font-medium"
            style={{ fontSize: "14px" }}
          >
            {product.name}
          </Text>

          <Flex align="center" gap="2">
            <Text
              weight="bold"
              className="text-[#FAA63E]"
              style={{ fontSize: "14px" }}
            >
              0đ
            </Text>
            {product.price > 0 && (
              <Text
                className="text-gray-400 line-through"
                style={{ fontSize: "12px" }}
              >
                {formatPrice(product.price)}
              </Text>
            )}
          </Flex>

          {/* For products WITHOUT variants: simple qty controls */}
          {!hasVariants && (
            <>
              <Flex align="center" gap="2" className="mt-1">
                <Button
                  variant="outline"
                  size="1"
                  className="cursor-pointer w-7 h-7 p-0"
                  onClick={() => onDecrementSimple(product)}
                  disabled={simpleQty <= 0 || isLoading}
                >
                  <MinusIcon width={14} height={14} />
                </Button>
                <Text
                  weight="bold"
                  style={{
                    fontSize: "14px",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {simpleQty}
                </Text>
                <Button
                  variant="outline"
                  size="1"
                  className="cursor-pointer w-7 h-7 p-0"
                  onClick={() => onIncrementSimple(product)}
                  disabled={isSimpleIncrDisabled || isLoading}
                >
                  <PlusIcon width={14} height={14} />
                </Button>
              </Flex>
            </>
          )}

          {/* For products WITH variants: variant picker + selected variant sub-rows */}
          {hasVariants && (
            <Box className="mt-1 space-y-2 min-w-0">
              {/* Selected variant sub-rows */}
              {variantEntries.map((entry) => {
                const variant = product.variants.find(
                  (v) => v.variantId === entry.variantId,
                );
                if (!variant) return null;
                const label = getVariantLabel(variant);
                const incrDisabled =
                  reachedMax ||
                  entry.quantity >= variant.availableStock;

                return (
                  <Flex
                    key={entry.key}
                    align="center"
                    gap="2"
                    className="bg-gray-50 rounded-md px-2 py-2 min-w-0"
                  >
                    <Text
                      className="flex-1 text-gray-700 overflow-hidden text-ellipsis whitespace-nowrap"
                      style={{ fontSize: "13px", minWidth: 0 }}
                      title={label}
                    >
                      {label}
                    </Text>
                    <Flex align="center" gap="2" className="flex-shrink-0">
                      <Button
                        variant="outline"
                        size="1"
                        className="cursor-pointer w-7 h-7 p-0"
                        onClick={() =>
                          onDecrementVariant(
                            product.productId,
                            entry.variantId,
                          )
                        }
                        disabled={isLoading}
                      >
                        <MinusIcon width={14} height={14} />
                      </Button>
                      <Text
                        weight="bold"
                        style={{
                          fontSize: "14px",
                          minWidth: "20px",
                          textAlign: "center",
                        }}
                      >
                        {entry.quantity}
                      </Text>
                      <Button
                        variant="outline"
                        size="1"
                        className="cursor-pointer w-7 h-7 p-0"
                        onClick={() =>
                          onIncrementVariant(product, entry.variantId)
                        }
                        disabled={incrDisabled || isLoading}
                      >
                        <PlusIcon width={14} height={14} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="1"
                        className="cursor-pointer w-7 h-7 p-0 text-red-400"
                        onClick={() =>
                          onRemoveVariant(
                            product.productId,
                            entry.variantId,
                          )
                        }
                        disabled={isLoading}
                      >
                        <TrashIcon width={14} height={14} />
                      </Button>
                    </Flex>
                  </Flex>
                );
              })}

              {/* Add variant picker */}
              {!reachedMax && availableVariantsToAdd.length > 0 && (
                <Select.Root
                  value=""
                  onValueChange={(val) => onAddVariant(product, val)}
                >
                  <Select.Trigger
                    placeholder={t("giftOffer.addVariant")}
                    className="w-full"
                  />
                  <Select.Content>
                    {availableVariantsToAdd.map((variant) => (
                      <Select.Item
                        key={variant.variantId}
                        value={variant.variantId}
                      >
                        <Flex align="center" gap="2">
                          <Text>{getVariantLabel(variant)}</Text>
                        </Flex>
                      </Select.Item>
                    ))}
                  </Select.Content>
                </Select.Root>
              )}

              {/* All variants out of stock or max reached */}
              {hasVariants &&
                availableVariantsToAdd.length === 0 &&
                variantEntries.length === 0 && (
                  <Text
                    className="text-red-500"
                    style={{ fontSize: "12px" }}
                  >
                    {t("giftOffer.outOfStock")}
                  </Text>
                )}
            </Box>
          )}
        </Flex>
      </Flex>
    </Box>
  );
}
