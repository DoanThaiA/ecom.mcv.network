"use client";

import { useState, useRef } from "react";
import {
  Box,
  Flex,
  Text,
} from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import Image from "next/image";
import isEmpty from "lodash/isEmpty";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import { submitReviewRequest } from "@/lib/store/slices/reviewSlice";
import { OutlineButton } from "@/components/common/OutlineButton";
import { GradientButton } from "@/components/common/GradientButton";
import { StarRating } from "./StarRating";
import { ReviewProductFormFields } from "./ProductReviewDialog/ReviewProductFormFields";
import { ImageUpload } from "./ProductReviewDialog/ImageUpload";
import type { ReviewRating } from "@/lib/utils/reviewConverter";
import type { FitLevel } from "@/types/gen/shared/shared/reviews/review";
import type { File as FileType } from "@/types/gen/shared/shared/files/file";
import {
  validateRating,
  validateComment,
  validateHeight,
  validateWeight,
} from "@/lib/utils/reviewValidation";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/constants/images";
import { showErrorToast } from "@/lib/helpers/toastHelper";

interface ProductReviewDialogProps {
  orderNumber: string;
  productId: string;
  productName: string;
  productImage?: string | null;
  variantId?: string | null;
  quantity?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface FormData {
  rating: ReviewRating | 0;
  comment: string;
  height: string;
  weight: string;
  productFit: string;
  images: FileType[];
}

interface FormErrors {
  rating?: string;
  comment?: string;
  height?: string;
  weight?: string;
  productFit?: string;
}

const initialFormData: FormData = {
  rating: 5,
  comment: "",
  height: "",
  weight: "",
  productFit: "",
  images: [],
};

export function ProductReviewDialog({
  orderNumber,
  productId,
  productName,
  productImage,
  variantId,
  quantity = 1,
  onSuccess,
  onCancel,
}: ProductReviewDialogProps) {
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");
  const dispatch = useAppDispatch();

  const { isSubmitting } = useAppSelector((state) => state.review);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Refs for focus management
  const heightRef = useRef<HTMLInputElement>(null);
  const weightRef = useRef<HTMLInputElement>(null);
  const commentRef = useRef<HTMLTextAreaElement>(null);

  // Check if form has any data
  const hasFormData = (): boolean => {
    return (
      formData.rating !== initialFormData.rating ||
      formData.comment.trim() !== "" ||
      formData.height !== "" ||
      formData.weight !== "" ||
      formData.productFit !== "" ||
      formData.images.length > 0
    );
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    const ratingError = validateRating(formData.rating);
    if (ratingError) newErrors.rating = ratingError;

    const commentError = validateComment(formData.comment);
    if (commentError) newErrors.comment = commentError;

    const heightError = validateHeight(formData.height);
    if (heightError) newErrors.height = heightError;

    const weightError = validateWeight(formData.weight);
    if (weightError) newErrors.weight = weightError;

    setErrors(newErrors);

    // Focus on first error field
    if (!isEmpty(newErrors)) {
      if (newErrors.height && heightRef.current) {
        heightRef.current.focus();
      } else if (newErrors.weight && weightRef.current) {
        weightRef.current.focus();
      } else if (newErrors.comment && commentRef.current) {
        commentRef.current.focus();
      }
    }

    return isEmpty(newErrors);
  };

  // Check if submit button should be disabled
  const isSubmitDisabled = (): boolean => {
    if (isSubmitting) return true;

    // Check required fields
    if (formData.rating === 0) return true;
    if (!formData.comment.trim()) return true;
    if (!formData.height.trim()) return true;
    if (!formData.weight.trim()) return true;

    return false;
  };

  // Map productFit string to FitLevel enum
  const mapProductFitToFitLevel = (fit: string): FitLevel => {
    switch (fit) {
      case "fit":
        return 1; // FIT_LEVEL_FIT
      case "loose":
        return 2; // FIT_LEVEL_LOOSE
      case "tight":
        return 3; // FIT_LEVEL_TIGHT
      default:
        return 0; // FIT_LEVEL_UNSPECIFIED
    }
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      showErrorToast(t("fillAllRequiredFields"));
      return;
    }

    const payload = {
      orderNumber,
      productId,
      variantId,
      rating: formData.rating as ReviewRating,
      comment: formData.comment.trim(),
      height: formData.height ? parseFloat(formData.height) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      productFit: formData.productFit ? mapProductFitToFitLevel(formData.productFit) : undefined,
      images: formData.images.length > 0 ? formData.images.map((img) => img.id) : undefined,
      onSuccess: () => {
        if (onSuccess) onSuccess();
      },
    };

    dispatch(submitReviewRequest(payload));
  };

  const handleRatingChange = (rating: ReviewRating) => {
    setFormData((prev) => ({ ...prev, rating }));
    if (errors.rating) {
      setErrors((prev) => ({ ...prev, rating: undefined }));
    }
  };

  const handleFieldChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleImagesChange = (images: FileType[]) => {
    setFormData((prev) => ({ ...prev, images }));
  };

  const handleCancel = () => {
    if (hasFormData()) {
      setShowCancelConfirm(true);
    } else {
      if (onCancel) onCancel();
    }
  };

  const handleConfirmCancel = () => {
    setShowCancelConfirm(false);
    if (onCancel) onCancel();
  };

  const handleKeepEditing = () => {
    setShowCancelConfirm(false);
  };

  return (
    <>
      <Box className="bg-white border border-[#F0F0F0] rounded-2xl">
        {/* Header */}
        <Flex
          align="center"
          justify="center"
          className="px-4 py-4 border-b border-gray-200"
        >
          <Text className="text-black text-[12px] font-bold">
            {t("dialogTitle")}
          </Text>
        </Flex>

        {/* Content */}
        <Box className="px-4 py-4">
          {/* Product info card */}
          <Flex
            gap="3"
            align="start"
            className="mb-6 p-3 bg-gray-50 rounded-lg"
          >
            <Box className="relative w-[80px] h-[80px] flex-shrink-0">
              <Image
                src={productImage || DEFAULT_PRODUCT_IMAGE}
                alt={productName}
                fill
                className={productImage ? "object-cover rounded" : "object-contain rounded"}
              />
            </Box>
            <Box className="flex-1">
              <Text size="2" weight="medium" className="block mb-1">
                {productName}
              </Text>
              <Text size="1" color="gray">
                X{quantity}
              </Text>
            </Box>
          </Flex>

          {/* Star rating */}
          <Box className="mb-4">
            <Flex align="center" gap="3" className="mb-1">
              <Text size="2" weight="medium">
                {t("rating")} <Text color="red">*</Text>
              </Text>
              <StarRating
                value={formData.rating}
                onChange={handleRatingChange}
                size="tiny"
              />
            </Flex>
            {errors.rating && (
              <Text size="2" color="red" className="mt-1 block">
                {t(errors.rating)}
              </Text>
            )}
          </Box>

          {/* Form fields */}
          <ReviewProductFormFields
            height={formData.height}
            weight={formData.weight}
            comment={formData.comment}
            productFit={formData.productFit}
            onHeightChange={(value) => handleFieldChange("height", value)}
            onWeightChange={(value) => handleFieldChange("weight", value)}
            onCommentChange={(value) => handleFieldChange("comment", value)}
            onProductFitChange={(value) =>
              handleFieldChange("productFit", value)
            }
            errors={errors}
            heightRef={heightRef}
            weightRef={weightRef}
            commentRef={commentRef}
          />

          {/* Image upload */}
          <ImageUpload
            images={formData.images}
            onImagesChange={handleImagesChange}
          />
        </Box>

        {/* Action buttons at bottom */}
        <Box className="px-4 py-4 border-t border-gray-200">
          <Flex gap="3" className="w-full">
            <Box className="flex-1">
              <OutlineButton
                onClick={handleCancel}
                disabled={isSubmitting}
                fullWidth
              >
                {tCommon("buttons.cancel")}
              </OutlineButton>
            </Box>
            <Box className="flex-1">
              <GradientButton
                onClick={handleSubmit}
                disabled={isSubmitDisabled()}
                isLoading={isSubmitting}
                loadingText={t("submitting")}
                fullWidth
              >
                {t("submitReview")}
              </GradientButton>
            </Box>
          </Flex>
        </Box>
      </Box>

      {/* Cancel Confirmation - Simple overlay */}
      {showCancelConfirm && (
        <Box className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Box className="bg-white rounded-2xl max-w-[90vw] sm:max-w-[400px] p-0">
            {/* Header */}
            <Flex
              align="center"
              justify="center"
              className="px-4 py-4 border-b border-gray-200"
            >
              <Text className="text-black text-[12px] font-bold">
                {t("confirmCancelTitle")}
              </Text>
            </Flex>

            {/* Content */}
            <Box className="px-4 py-6">
              <Text size="2" className="text-center text-gray-700">
                {t("confirmCancelMessage")}
              </Text>
            </Box>

            {/* Action buttons */}
            <Box className="px-4 py-4 border-t border-gray-200">
              <Flex gap="3" className="w-full">
                <Box className="flex-1">
                  <OutlineButton onClick={handleKeepEditing} fullWidth>
                    {t("keepEditing")}
                  </OutlineButton>
                </Box>
                <Box className="flex-1">
                  <GradientButton onClick={handleConfirmCancel} fullWidth>
                    {t("confirmDiscard")}
                  </GradientButton>
                </Box>
              </Flex>
            </Box>
          </Box>
        </Box>
      )}
    </>
  );
}
