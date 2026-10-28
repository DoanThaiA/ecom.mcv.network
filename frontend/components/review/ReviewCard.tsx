"use client";

import { useState } from "react";
import { Box, Card, Flex, Text } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { PlayIcon } from "@radix-ui/react-icons";
import { StarRating } from "./StarRating";
import { ReviewMediaDialog } from "./ReviewMediaDialog";
import type { FrontendReview as Review } from "@/lib/utils/reviewConverter";
import { formatDate } from "@/lib/utils/format";
import { parseVariantFromProductName } from "@/lib/helpers/variantHelper";
import { FitLevel } from "@/types/gen/shared/shared/reviews/review";

interface ReviewCardProps {
  review: Review;
  showProductInfo?: boolean;
}

export function ReviewCard({
  review,
  showProductInfo = false,
}: ReviewCardProps) {
  const t = useTranslations("reviews");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  // Parse variant info from productName
  const { color, size } = parseVariantFromProductName(review.productName);
  const getFitLevelText = (fitLevel: FitLevel): string => {
    switch (fitLevel) {
      case FitLevel.FIT_LEVEL_FIT:
        return t("fitLevels.fit");
      case FitLevel.FIT_LEVEL_LOOSE:
        return t("fitLevels.loose");
      case FitLevel.FIT_LEVEL_TIGHT:
        return t("fitLevels.tight");
      default:
        return "";
    }
  };
  return (
    <Card className="p-4 bg-white rounded-2xl">
      {/* 1. Header: Name + Stars (space-between) */}
      <Flex
        justify="between"
        align="center"
        className="mb-1 pb-2 border-b lg:border-b-0 border-[#F0F0F0]"
      >
        <Text size="2" weight="medium" className="text-black">
          {review.userName}
        </Text>
        <StarRating value={review.rating} readOnly size="small" />
      </Flex>

      {/* 2. Product Info - MOBILE ONLY */}
      <Text size="1" className="lg:hidden text-[#999999] mb-2">
        {t("productInfo")}: {review.productName}
      </Text>

      {/* 3. Height + Weight - MOBILE ONLY */}
      {(review.height || review.weight) && (
        <Flex justify="between" className="lg:hidden mb-2 text-[#999999]">
          {review.height && (
            <Text size="1">
              {t("height")}: {review.height}cm
            </Text>
          )}
          {review.weight && (
            <Text size="1">
              {t("weight")}: {review.weight}kg
            </Text>
          )}
        </Flex>
      )}

      {/* 4. Product Fit - MOBILE ONLY */}
      <Text size="1" className="lg:hidden mb-3 text-[#999999]">
        {review.productFit
          ? `${t("fitLevel") + ": " + getFitLevelText(review.productFit)}`
          : `${t("fitLevel")}: `}
      </Text>

      {/* Divider - MOBILE ONLY */}
      <Box className="lg:hidden border-t border-[#F0F0F0] mb-3" />

      {/* 5. Date + Variant Info Row - DESKTOP ONLY */}
      <Flex
        justify="between"
        align="center"
        className="hidden lg:flex mb-3 text-[#999999] border-t border-b border-[#F0F0F0] py-3"
      >
        <Text size="1">{formatDate(review.createdAt)}</Text>
        {/* 3. Height + Weight - DESKTOP ONLY */}
        {review.height && (
          <Text size="1">
            {t("height")}: {review.height}cm
          </Text>
        )}
        {review.weight && (
          <Text size="1">
            {t("weight")}: {review.weight}kg
          </Text>
        )}
      </Flex>

      {/* 6. Review Comment */}
      {review.comment && (
        <Text size="2" className="mb-3 whitespace-pre-wrap text-black">
          {review.comment}
        </Text>
      )}

      {/* 6. Media Gallery with Video Play Icons */}
      {review.images && review.images.length > 0 && (
        <Flex gap="2" wrap="wrap" className="mb-0">
          {review.images.map((media, index) => {
            return (
              <button
                key={media.id || index}
                onClick={() => {
                  setSelectedMediaIndex(index);
                  setDialogOpen(true);
                } }
                className="relative w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity bg-[#AFAFAF]"
              >
                <Image
                  src={media.type === "video"
                    ? media.thumbnail || media.url
                    : media.url}
                  alt={`Review ${media.type} ${index + 1}`}
                  fill
                  className="object-cover" />
                {/* Video Play Icon Overlay */}
                {media.type === "video" && (
                  <Box className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
                    <PlayIcon className="w-8 h-8 text-white" />
                  </Box>
                )}
              </button>
            );
          })}
        </Flex>
      )}

      {/* Purchase Date - MOBILE ONLY */}
      <Box className="lg:hidden mt-3">
        <Text size="1" className="text-[#999999] block text-right">
          {t("purchasedOn", { date: formatDate(review.createdAt) })}
        </Text>
      </Box>

      {/* Media Dialog */}
      <ReviewMediaDialog
        review={review}
        initialMediaIndex={selectedMediaIndex}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </Card>
  );
}
