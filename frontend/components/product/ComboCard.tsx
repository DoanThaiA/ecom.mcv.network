"use client";

import { Box, Flex, Text, Button } from "@radix-ui/themes";
import { useEffect, useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import type { ShopCombo } from "@/types/gen/shop/shop/combos/combo";
import { formatPrice } from "@/lib/utils/format";
import { showErrorToast } from "@/lib/helpers/toastHelper";
import { PlusIcon } from "@radix-ui/react-icons";
import type { Product } from "@/types/gen/shared/shared/products/product";
import { useAppDispatch } from "@/lib/store/hooks";
import { addComboToCartRequest } from "@/lib/store/slices/cartSlice";
import { ComboProductCard } from "./ComboProductCard";
import { ComboItemCard } from "./ComboItemCard";
import {
  isComboItemSellable,
  isVariantInStock,
} from "@/lib/helpers/comboVariantHelper";
import {
  getAvailableComboItems,
  pruneInvalidSelections,
} from "@/lib/helpers/comboSlotHelper";

interface ComboCardProps {
  combo: ShopCombo;
  mainProduct: Product;
}

export function ComboCard({ combo, mainProduct }: ComboCardProps) {
  const t = useTranslations("productDetail");
  const dispatch = useAppDispatch();
  const [selectedItems, setSelectedItems] = useState<Record<number, string>>(
    {}
  );
  const [selectedVariants, setSelectedVariants] = useState<
    Record<string, string>
  >({});
  const [isAdding, setIsAdding] = useState(false);

  // Handle selecting which product for a position
  const handleItemSelect = (position: number, productId: string) => {
    setSelectedItems((prev) => {
      const comboMetadata = combo as ShopCombo & {
        originalCombos?: ShopCombo[];
      };

      // Drop whatever this choice made impossible, in any slot rather than only
      // the later ones. The chosen slot itself is kept.
      return pruneInvalidSelections(
        { ...prev, [position]: productId },
        mainProduct.id,
        comboMetadata.originalCombos,
        position
      );
    });

    // Auto-select first variant of the newly selected product
    const selectedProduct = filteredComboItems.find(item => item.productId === productId);
    if (selectedProduct && selectedProduct.variants && selectedProduct.variants.length > 0) {
      setSelectedVariants((prev) => ({
        ...prev,
        [productId]: selectedProduct.variants[0].id,
      }));
    }
  };

  const handleVariantChange = (productId: string, variantId: string) => {
    setSelectedVariants((prev) => ({
      ...prev,
      [productId]: variantId,
    }));
  };

  // The product detail payload nests stock under `inventory`; flatten it so the
  // stock checks read the same shape the combo endpoint sends.
  const mainVariantStock = useMemo(
    () =>
      (mainProduct.variants ?? []).map((variant) => ({
        id: variant.id,
        available: variant.inventory?.available ?? 0,
      })),
    [mainProduct.variants]
  );

  const handleAddToCart = () => {
    // The main product is its own SKU when it has no variants, so its stock
    // decides. The product detail page blocks the same case.
    if (!isComboItemSellable({
      variants: mainVariantStock,
      available: mainProduct.inventory?.available ?? 0,
    })) {
      showErrorToast(t("soldOut"));
      return;
    }

    // Check if main product has variants and needs one selected
    if (mainProduct.variants && mainProduct.variants.length > 0 && !selectedVariants[mainProduct.id]) {
      showErrorToast(t("pleaseSelectAllVariants"));
      return;
    }

    // Last line of defence: the cart API doesn't check inventory, so a sold-out
    // SKU that slipped past the pickers would otherwise be ordered.
    if (
      mainVariantStock.length > 0 &&
      !isVariantInStock(mainVariantStock, selectedVariants[mainProduct.id])
    ) {
      showErrorToast(t("soldOut"));
      return;
    }

    // Calculate how many items to include
    const comboConfig = combo as ShopCombo & { originalItemCount?: number };
    const itemsToShow = comboConfig.originalItemCount
      ? comboConfig.originalItemCount - 1
      : filteredComboItems.length;

    // Check if all positions have products selected
    for (let idx = 0; idx < itemsToShow; idx++) {
      const position = idx + 1;
      if (!selectedItems[position]) {
        showErrorToast(t("pleaseSelectAllProducts"));
        return;
      }
    }

    // Build items array for combo
    const items = [];

    // Add main product
    const mainProductItem: { productId: string; variantId?: string } = {
      productId: mainProduct.id,
    };
    if (selectedVariants[mainProduct.id]) {
      mainProductItem.variantId = selectedVariants[mainProduct.id];
    }
    items.push(mainProductItem);

    // Add selected combo items based on positions
    for (let idx = 0; idx < itemsToShow; idx++) {
      const position = idx + 1;
      const productId = selectedItems[position];

      // Check if this item has variants and needs one selected
      const currentItem = filteredComboItems.find(i => i.productId === productId);
      if (currentItem && !isComboItemSellable(currentItem)) {
        showErrorToast(t("soldOut"));
        return;
      }
      if (currentItem && currentItem.variants && currentItem.variants.length > 0 && !selectedVariants[productId]) {
        showErrorToast(t("pleaseSelectAllVariants"));
        return;
      }
      if (
        currentItem?.variants?.length &&
        !isVariantInStock(currentItem.variants, selectedVariants[productId])
      ) {
        showErrorToast(t("soldOut"));
        return;
      }

      const comboItem: { productId: string; variantId?: string } = {
        productId: productId,
      };
      if (selectedVariants[productId]) {
        comboItem.variantId = selectedVariants[productId];
      }
      items.push(comboItem);
    }

    // Dispatch add combo to cart action
    // Use matched combo ID based on selected items
    const comboData = combo as ShopCombo & {
      originalCombos?: ShopCombo[];
      originalItemCount?: number;
    };

    let actualComboId = combo.id;

    if (comboData.originalCombos) {
      // Build selected product IDs array
      const selectedProductIds = items.map(item => item.productId);

      // Find exact matching combo from original combos
      // A combo matches if it has exactly the same products (same length and all IDs match)
      const matchingCombo = comboData.originalCombos.find((originalCombo) => {
        const comboProductIds = originalCombo.items.map(item => item.productId);

        // Check if lengths match
        if (comboProductIds.length !== selectedProductIds.length) {
          return false;
        }

        // Check if all selected products exist in combo and vice versa
        return selectedProductIds.every(id => comboProductIds.includes(id)) &&
               comboProductIds.every(id => selectedProductIds.includes(id));
      });

      actualComboId = matchingCombo?.id || comboData.originalCombos[0].id;
    }

    setIsAdding(true);
    dispatch(
      addComboToCartRequest({
        comboId: actualComboId,
        items: items,
        successMessage: t("addedToCart"),
      })
    );

    // Reset loading state after a short delay
    setTimeout(() => setIsAdding(false), 1000);
  };

  // Filter out main product from combo items if it exists
  const filteredComboItems = useMemo(() =>
    combo.items.filter((item) => item.productId !== mainProduct.id),
    [combo.items, mainProduct.id]
  );

  // Calculate pricing based on selected items
  const calculatedPricing = useMemo(() => {
    const comboMetadata = combo as ShopCombo & {
      originalCombos?: ShopCombo[];
      originalItemCount?: number;
    };

    // Calculate how many items need to be selected
    const itemsToShow = comboMetadata.originalItemCount
      ? comboMetadata.originalItemCount - 1
      : filteredComboItems.length;

    // Check if all items are selected
    const selectedProductIds = [mainProduct.id];
    let allSelected = true;
    for (let idx = 0; idx < itemsToShow; idx++) {
      const position = idx + 1;
      const productId = selectedItems[position];
      if (!productId) {
        allSelected = false;
        break;
      }
      selectedProductIds.push(productId);
    }

    // If not all products are selected, show price as 0
    if (!allSelected) {
      return {
        originalPrice: 0,
        finalPrice: 0,
        discountAmount: 0,
        matchedComboId: combo.id,
      };
    }

    // If not a fake combo, use original pricing
    if (!comboMetadata.originalCombos) {
      return {
        originalPrice: combo.originalPrice,
        finalPrice: combo.finalPrice,
        discountAmount: combo.discountAmount,
        matchedComboId: combo.id,
      };
    }

    // Find exact matching combo from original combos
    // A combo matches if it has exactly the same products (same length and all IDs match)
    const matchingCombo = comboMetadata.originalCombos.find((originalCombo) => {
      const comboProductIds = originalCombo.items.map(item => item.productId);

      // Check if lengths match
      if (comboProductIds.length !== selectedProductIds.length) {
        return false;
      }

      // Check if all selected products exist in combo and vice versa
      return selectedProductIds.every(id => comboProductIds.includes(id)) &&
             comboProductIds.every(id => selectedProductIds.includes(id));
    });

    // Use matched combo pricing or fallback to default
    const targetCombo = matchingCombo || comboMetadata.originalCombos[0];
    return {
      originalPrice: targetCombo.originalPrice,
      finalPrice: targetCombo.finalPrice,
      discountAmount: targetCombo.discountAmount,
      matchedComboId: targetCombo.id,
    };
  }, [combo, mainProduct.id, selectedItems, filteredComboItems]);

  const discountPercentage =
    calculatedPricing.originalPrice > 0
      ? Math.round((calculatedPricing.discountAmount / calculatedPricing.originalPrice) * 100)
      : 0;

  // Set default variants only for main product
  useEffect(() => {
    const defaultVariants: Record<string, string> = {};

    // Set main product default variant
    if (mainProduct.variants && mainProduct.variants.length > 0) {
      defaultVariants[mainProduct.id] = mainProduct.variants[0].id;
    }

    setSelectedVariants(defaultVariants);
  }, [mainProduct]);

  // Helper function to calculate available items for a position
  const getAvailableItemsForPosition = (position: number, currentSelectedItems: Record<number, string>) => {
    const comboMetadata = combo as ShopCombo & { originalCombos?: ShopCombo[] };

    return getAvailableComboItems(
      filteredComboItems,
      currentSelectedItems,
      position,
      mainProduct.id,
      comboMetadata.originalCombos
    );
  };

  // Auto-fill combo items from first combo on mount
  useEffect(() => {
    const comboMetadata = combo as ShopCombo & { originalCombos?: ShopCombo[] };

    // Only auto-fill if we have original combos
    if (comboMetadata.originalCombos && comboMetadata.originalCombos.length > 0) {
      const firstCombo = comboMetadata.originalCombos[0];

      // Get items from first combo, excluding main product
      const comboItemsToSelect = firstCombo.items.filter(
        (item) => item.productId !== mainProduct.id
      );

      // Build initial selected items and variants
      const initialSelectedItems: Record<number, string> = {};
      const initialVariants: Record<string, string> = {};

      comboItemsToSelect.forEach((item, index) => {
        const position = index + 1;
        initialSelectedItems[position] = item.productId;

        // Auto-select first variant if product has variants
        if (item.variants && item.variants.length > 0) {
          initialVariants[item.productId] = item.variants[0].id;
        }
      });

      setSelectedItems(initialSelectedItems);

      // Merge with main product variant
      setSelectedVariants((prev) => ({
        ...prev,
        ...initialVariants,
      }));
    }
  }, [combo, mainProduct.id]);

  // Auto-fill positions that have only 1 available product
  useEffect(() => {
    const comboInfo = combo as ShopCombo & { originalItemCount?: number };
    const itemsToShow = comboInfo.originalItemCount
      ? comboInfo.originalItemCount - 1
      : filteredComboItems.length;

    // Check each position
    for (let position = 1; position <= itemsToShow; position++) {
      // Skip if already selected
      if (selectedItems[position]) continue;

      // Get available items for this position
      const availableItems = getAvailableItemsForPosition(position, selectedItems);

      // If only 1 item available, auto-select it
      if (availableItems.length === 1) {
        const productId = availableItems[0].productId;

        setSelectedItems((prev) => ({
          ...prev,
          [position]: productId,
        }));

        // Auto-select first variant if available
        if (availableItems[0].variants && availableItems[0].variants.length > 0) {
          setSelectedVariants((prev) => ({
            ...prev,
            [productId]: availableItems[0].variants[0].id,
          }));
        }
      }
    }
  }, [selectedItems, combo, mainProduct.id, filteredComboItems]);

  // Create display array: main product + filtered combo items for selection
  const comboInfo = combo as ShopCombo & { originalItemCount?: number };
  // One slot per item the combo actually has. Merged combos pool more products
  // than that on purpose - the surplus are the alternatives a slot offers, so
  // counting them as extra slots would both hide the choice and render a slot
  // that handleAddToCart ignores.
  const itemsToShow = comboInfo.originalItemCount
    ? comboInfo.originalItemCount - 1 // Subtract 1 for main product
    : filteredComboItems.length;

  const displayItems = [
    {
      position: 0,
      isMain: true,
      productId: mainProduct.id,
      productName: mainProduct.name,
      productImage: mainProduct.images?.avatar,
      variants: mainProduct.variants || [],
    },
    // Create positions without default items - user must select
    ...Array.from({ length: itemsToShow }, (_, idx) => ({
      position: idx + 1,
      isMain: false,
    })),
  ];

  return (
    <Box className="bg-[#fef8f1] px-4 py-8 rounded-lg">
      {/* Title */}
      <Text className="font-semibold text-xl text-black mb-4 block">
        {combo.name}
      </Text>

      {/* Grid Layout - 1 column on screens < 400px, 2 columns on screens >= 400px, horizontal flex on desktop */}
      <Box className="grid grid-cols-1 max-[349px]:gap-y-0 min-[400px]:grid-cols-2 min-[400px]:gap-x-12 min-[400px]:gap-y-0 lg:flex lg:flex-row lg:items-start lg:gap-8 w-full">
        {displayItems.map((item, index) => (
          <Flex
            key={`${item.position}-${index}`}
            direction="column"
            /* Desktop shares the row rather than pinning every slot to the
               tablet width, so the cards read at product-card scale. */
            className="relative lg:flex-1 lg:min-w-0 lg:max-w-[240px]"
          >
            {/* Plus icon between items */}
            {index > 0 && (
              <>
                {/* Small screens (<400px): Plus icon between items (centered) - show for all except first */}
                <Flex
                  align="center"
                  justify="center"
                  className="flex min-[400px]:hidden w-full py-3"
                >
                  <Box className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <PlusIcon width="16" height="16" className="text-black" />
                  </Box>
                </Flex>
                {/* Tablet (400px-1023px): Plus icon to the left for odd indexes only (2-column grid) */}
                {index % 2 === 1 && (
                  <Flex
                    align="center"
                    justify="center"
                    className="hidden min-[400px]:flex lg:hidden absolute left-[-36px] top-[155px] w-6 h-6 bg-white rounded-full"
                  >
                    <PlusIcon width="16" height="16" className="text-black" />
                  </Flex>
                )}
                {/* Desktop (>=1024px): Plus icon between all items (horizontal row) */}
                <Flex
                  align="center"
                  justify="center"
                  className="hidden lg:flex lg:absolute lg:left-[-28px] lg:top-1/2 lg:-translate-y-1/2 lg:z-10 w-6 h-6 bg-white rounded-full"
                >
                  <PlusIcon width="16" height="16" className="text-black" />
                </Flex>
              </>
            )}

            {/* Item container */}
            <Flex
              direction="column"
              gap="2"
              className={`max-[349px]:w-full min-[400px]:w-[161px] lg:w-full relative ${
                index >= 2
                  ? "min-[400px]:border-t border-[#f0f0f0] min-[400px]:pt-4 lg:border-t-0 lg:pt-0"
                  : ""
              }`}
            >
              {item.isMain ? (
                <ComboProductCard
                  product={mainProduct}
                  selectedVariant={selectedVariants[mainProduct.id]}
                  onVariantChange={(variantId) =>
                    handleVariantChange(mainProduct.id, variantId)
                  }
                />
              ) : (
                <ComboItemCard
                  comboItems={filteredComboItems}
                  selectedProductId={selectedItems[item.position]}
                  selectedItems={selectedItems}
                  currentPosition={item.position}
                  mainProductId={mainProduct.id}
                  originalCombos={
                    (combo as ShopCombo & { originalCombos?: ShopCombo[] })
                      .originalCombos
                  }
                  onItemSelect={(productId) =>
                    handleItemSelect(item.position, productId)
                  }
                  selectedVariant={
                    selectedItems[item.position]
                      ? selectedVariants[selectedItems[item.position]]
                      : undefined
                  }
                  onVariantChange={(variantId) => {
                    if (selectedItems[item.position]) {
                      handleVariantChange(
                        selectedItems[item.position],
                        variantId
                      );
                    }
                  }}
                />
              )}
            </Flex>
          </Flex>
        ))}
      </Box>

      {/* Price and Button Section */}
      <Flex
        direction="column"
        gap="4"
        className="mt-4 pt-4 border-t-0 max-[349px]:flex-col max-[349px]:gap-4 min-[400px]:flex-row min-[400px]:items-end min-[400px]:gap-6 lg:justify-end lg:items-center"
      >
        {/* Price Section */}
        <Flex direction="column" className="flex-1 lg:flex-none">
          <Text className="text-sm text-[#afafaf] leading-6">
            {formatPrice(calculatedPricing.originalPrice)}
          </Text>
          <Flex align="start" gap="2">
            <Text className="font-semibold text-2xl text-black underline leading-8">
              {formatPrice(calculatedPricing.finalPrice)}
            </Text>
            {discountPercentage > 0 && (
              <Box className="bg-[#ed2024] px-1 rounded-full flex items-center justify-center">
                <Text className="text-xs text-white leading-4">
                  -{discountPercentage}%
                </Text>
              </Box>
            )}
          </Flex>
        </Flex>

        {/* Add Button */}
        <Button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="max-[349px]:w-full lg:w-auto lg:min-w-[200px] px-4 py-3 rounded-full cursor-pointer font-semibold text-base text-white uppercase transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background:
              "linear-gradient(90deg, #FAA63E 2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
          }}
        >
          {isAdding ? t("adding") : t("addComboToCart")}
        </Button>
      </Flex>
    </Box>
  );
}
