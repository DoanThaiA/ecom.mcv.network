"use client";

import { Box } from "@radix-ui/themes";
import { useEffect, useState, useMemo, useRef } from "react";
import { useTranslations } from "next-intl";
import { productRepository } from "@/lib/repositories/product.repository";
import { groupComboFamilies } from "@/lib/helpers/comboSlotHelper";
import type { ShopCombo, ShopComboItem } from "@/types/gen/shop/shop/combos/combo";
import isEmpty from "lodash/isEmpty";
import type { Product } from "@/types/gen/shared/shared/products/product";
import { ComboCard } from "./ComboCard";

interface ProductComboSectionProps {
  productId: string;
  mainProduct: Product;
}

export function ProductComboSection({
  productId,
  mainProduct,
}: ProductComboSectionProps) {
  const t = useTranslations("productDetail");
  const [combos, setCombos] = useState<ShopCombo[]>([]);
  const [loading, setLoading] = useState(true);
  const lastFetchedProductId = useRef<string | null>(null);

  useEffect(() => {
    // Only fetch if productId changed
    if (!productId || lastFetchedProductId.current === productId) {
      return;
    }

    lastFetchedProductId.current = productId;

    const fetchCombos = async () => {
      try {
        setLoading(true);
        const response = await productRepository.getCombosForProduct(productId);
        setCombos(response.combos || []);
      } catch {
        // Silently fail - combos are optional
        setCombos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, [productId]);

  // Merge combos that differ in a single product into one swappable card;
  // anything else gets its own card.
  const processedCombos = useMemo(() => {
    if (isEmpty(combos)) return [];

    return groupComboFamilies(combos).map((family, index) => {
      // Pool the products of the family - the surplus over the combo's own item
      // count are the alternatives a slot can offer.
      const mergedItems: ShopComboItem[] = [];
      const seenProductIds = new Set<string>();
      family.forEach((combo) => {
        combo.items.forEach((item) => {
          if (!seenProductIds.has(item.productId)) {
            seenProductIds.add(item.productId);
            mergedItems.push(item);
          }
        });
      });

      // Advertise the family at its best price
      const bestCombo = family.reduce((best, current) =>
        current.finalPrice < best.finalPrice ? current : best
      );

      const card: ShopCombo & {
        originalComboIds?: string[];
        originalItemCount?: number;
        originalCombos?: ShopCombo[];
      } = {
        ...bestCombo,
        // Two families can hold the same number of items, so the key has to be
        // the family, not the count.
        id: `combo-family-${index}`,
        name: t("comboProductsTitle"),
        items: mergedItems,
        originalComboIds: family.map((combo) => combo.id),
        originalItemCount: family[0].items.length,
        originalCombos: family,
      };

      return card;
    });
  }, [combos, t]);

  if (loading) {
    return null;
  }

  if (isEmpty(processedCombos)) {
    return null;
  }

  return (
    <Box className="w-full">
      {processedCombos.map((combo) => (
        <ComboCard key={combo.id} combo={combo} mainProduct={mainProduct} />
      ))}
    </Box>
  );
}
