"use client";

import { ProductBadge as ProductBadgeEnum } from "@/types/gen/shared/shared/common/enums";
import { Box, Text } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { parseBadgeString } from "@/lib/helpers/badgeHelper";

interface ProductBadgeProps {
  badge: string | ProductBadgeEnum | undefined | null;
  className?: string;
  source?: string;
}

/**
 * Product badge component that displays promotional badges on product images
 * Supports SVG badges (NEW, HOT, SALE) and text badges (BEST_SELLER, CLEARANCE_SALE)
 * Accepts both string values from API and ProductBadge enum values
 */
export function ProductBadge({ badge, className, source }: ProductBadgeProps) {
  const t = useTranslations("productListing");

  // Parse string to enum if needed
  let badgeEnum: ProductBadgeEnum | undefined;

  if (typeof badge === "string") {
    // API returned string like "NEW", "HOT", "BEST_SELLER"
    badgeEnum = parseBadgeString(badge);
  } else {
    // Already an enum or undefined/null
    badgeEnum = badge ?? undefined;
  }

  // Early return for invalid badges
  // Note: !badgeEnum catches undefined, null, and 0 (PRODUCT_BADGE_UNSPECIFIED)
  if (!badgeEnum || badgeEnum === ProductBadgeEnum.UNRECOGNIZED) {
    return null;
  }
  // SVG badge - NEW
  if (badgeEnum === ProductBadgeEnum.PRODUCT_BADGE_NEW) {
    return (
      <Box className={`${className} w-[15%] aspect-square`}>
        <Image
          src="/assets/svg/product/new_badge.svg"
          alt="New"
          width={48}
          height={48}
          className="w-full h-full object-contain"
        />
      </Box>
    );
  }

  // SVG badge - HOT
  if (badgeEnum === ProductBadgeEnum.PRODUCT_BADGE_HOT) {
    return (
      <Box className={`${className} w-[15%] aspect-square`}>
        <Image
          src="/assets/svg/product/hot_badge.svg"
          alt="Hot"
          width={48}
          height={48}
          className="w-full h-full object-contain"
        />
      </Box>
    );
  }

  // SVG badge - SALE
  if (badgeEnum === ProductBadgeEnum.PRODUCT_BADGE_SALE) {
    return (
      <Box className={`${className} w-[15%] aspect-square`}>
        <Image
          src="/assets/svg/product/sale_badge.svg"
          alt="Sale"
          width={48}
          height={48}
          className="w-full h-full object-contain"
        />
      </Box>
    );
  }

  // Text badge - BEST_SELLER
  if (badgeEnum === ProductBadgeEnum.PRODUCT_BADGE_BEST_SELLER) {
    return (
      <Box
        className={`${className} bg-[#D80000] rounded-full flex items-center justify-center px-2 py-[1] max-w-fit ${
          source === "detail" ? "min-h-[1.45rem]" : "min-h-[1.25rem]"
        }`}
        style={{
          minWidth: source === "detail" ? "25%" : "15%",
        }}
      >
        <Text
          className="text-white font-medium whitespace-nowrap"
          style={{
            fontSize:
              source === "detail"
                ? "clamp(0.8rem, 1.35vw, 0.45rem)"
                : "clamp(0.5rem, 1.25vw, 0.55rem)",
          }}
        >
          {t("productTypes.bestSeller")}
        </Text>
      </Box>
    );
  }

  // Text badge - CLEARANCE_SALE
  if (badgeEnum === ProductBadgeEnum.PRODUCT_BADGE_CLEARANCE_SALE) {
    return (
      <Box
        className={`${className} rounded-full flex items-center justify-center px-2 py-[1] max-w-fit ${
          source === "detail" ? "min-h-[1.45rem]" : "min-h-[1.25rem]"
        }`}
        style={{
          minWidth: source === "detail" ? "25%" : "15%",
          background: "linear-gradient(90deg, #F9A63F 0%, #9B5526 99%)",
        }}
      >
        <Text
          className="text-white font-medium whitespace-nowrap"
          style={{
            fontSize:
              source === "detail"
                ? "clamp(0.8rem, 1.35vw, 0.45rem)"
                : "clamp(0.5rem, 1.25vw, 0.55rem)",
          }}
        >
          {t("productTypes.clearance")}
        </Text>
      </Box>
    );
  }

  return null;
}
