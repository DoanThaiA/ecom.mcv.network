"use client";

import { useEffect, useState, useRef } from "react";
import { Box, Flex, Text, AlertDialog } from "@radix-ui/themes";
import { Cross2Icon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Image from "next/image";
import isEmpty from "lodash/isEmpty";
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks";
import {
  fetchOrderDetailRequest,
  clearOrderDetail,
} from "@/lib/store/slices/orderSlice";
import { reviewRepository } from "@/lib/repositories/review.repository";
import { OutlineButton } from "@/components/common/OutlineButton";
import { GradientButton } from "@/components/common/GradientButton";
import { StarRating } from "@/components/review/StarRating";
import { ReviewProductFormFields } from "@/components/review/ProductReviewDialog/ReviewProductFormFields";
import { ImageUpload } from "@/components/review/ProductReviewDialog/ImageUpload";
import type { ReviewRating } from "@/lib/utils/reviewConverter";
import type { FitLevel } from "@/types/gen/shared/shared/reviews/review";
import type { File as FileType } from "@/types/gen/shared/shared/files/file";
import {
  validateRating,
  validateHeight,
  validateWeight,
} from "@/lib/utils/reviewValidation";
import { DEFAULT_PRODUCT_IMAGE } from "@/lib/constants/images";
import { showErrorToast, showSuccessToast } from "@/lib/helpers/toastHelper";
import { AppLocale } from "@/lib/locale";

interface WriteReviewSectionProps {
  orderId: string;
  locale: AppLocale;
}

interface ProductFormData {
  productId: string;
  variantId?: string;
  rating: ReviewRating | 0;
  comment: string;
  height: string;
  weight: string;
  productFit: string;
  images: FileType[];
}

interface ProductFormErrors {
  rating?: string;
  comment?: string;
  height?: string;
  weight?: string;
  productFit?: string;
}

const createInitialFormData = (productId: string, variantId?: string): ProductFormData => ({
  productId,
  variantId,
  rating: 5,
  comment: "",
  height: "",
  weight: "",
  productFit: "",
  images: [],
});

export function WriteReviewSection({
  orderId,
  locale,
}: WriteReviewSectionProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const t = useTranslations("reviews");
  const tCommon = useTranslations("common");

  const { orderDetail, isLoadingOrderDetail } = useAppSelector(
    (state) => state.order
  );

  const [productForms, setProductForms] = useState<ProductFormData[]>([]);
  const [productErrors, setProductErrors] = useState<Record<number, ProductFormErrors>>({});
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch order detail on mount
  useEffect(() => {
    dispatch(fetchOrderDetailRequest(orderId));
    return () => {
      dispatch(clearOrderDetail());
    };
  }, [dispatch, orderId]);

  // Initialize forms when orderDetail is loaded
  useEffect(() => {
    if (orderDetail && orderDetail.items && orderDetail.items.length > 0) {
      const initialForms = orderDetail.items.map(item =>
        createInitialFormData(item.productId, item.variantId)
      );
      setProductForms(initialForms);
    }
  }, [orderDetail]);

  // Check if any form has data (for cancel confirmation)
  const hasFormData = (): boolean => {
    return productForms.some(form =>
      form.rating !== 5 ||
      form.comment.trim() !== "" ||
      form.height !== "" ||
      form.weight !== "" ||
      form.productFit !== "" ||
      form.images.length > 0
    );
  };

  // Check if a product form has been started (user intends to review this product)
  const isProductFormStarted = (form: ProductFormData): boolean => {
    return (
      form.rating > 0 ||
      form.comment.trim() !== "" ||
      form.height !== "" ||
      form.weight !== "" ||
      form.productFit !== "" ||
      form.images.length > 0
    );
  };

  // Validate only the forms that have been started
  const validateFilledForms = (): boolean => {
    const allErrors: Record<number, ProductFormErrors> = {};
    let hasErrors = false;

    productForms.forEach((form, index) => {
      // Only validate if user has started filling this product
      if (isProductFormStarted(form)) {
        const errors: ProductFormErrors = {};

        const ratingError = validateRating(form.rating);
        if (ratingError) errors.rating = ratingError;

        const heightError = validateHeight(form.height);
        if (heightError) errors.height = heightError;

        const weightError = validateWeight(form.weight);
        if (weightError) errors.weight = weightError;

        if (!isEmpty(errors)) {
          allErrors[index] = errors;
          hasErrors = true;
        }
      }
    });

    setProductErrors(allErrors);
    return !hasErrors;
  };

  // Check if submit button should be disabled
  const isSubmitDisabled = (): boolean => {
    if (isSubmitting) return true;
    if (productForms.length === 0) return true;

    // Check if at least ONE product has been started
    const hasAnyStartedForm = productForms.some(form => isProductFormStarted(form));
    return !hasAnyStartedForm;
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

  const handleSubmit = async () => {
    // Validate only the products that have been filled
    if (!validateFilledForms()) {
      showErrorToast(t("fillAllRequiredFields"));
      return;
    }

    if (!orderDetail) {
      showErrorToast("Order detail not found");
      return;
    }

    // Filter only products that user has started filling
    const filledForms = productForms.filter(form => isProductFormStarted(form));

    if (filledForms.length === 0) {
      showErrorToast("No products to review");
      return;
    }

    // Build payloads only for filled products
    const payloads = filledForms.map((form) => ({
      productId: form.productId,
      variantId: form.variantId,
      rating: form.rating as ReviewRating,
      comment: form.comment.trim(),
      height: form.height ? parseFloat(form.height) : undefined,
      weight: form.weight ? parseFloat(form.weight) : undefined,
      productFit: form.productFit
        ? mapProductFitToFitLevel(form.productFit)
        : undefined,
      images:
        form.images.length > 0 ? form.images.map((img) => img.id) : undefined,
    }));

    try {
      setIsSubmitting(true);

      // Submit all filled reviews in a single API call
      await reviewRepository.createBatchReview(
        orderDetail.orderNumber || "",
        payloads
      );

      showSuccessToast(t("reviewSubmittedSuccessfully"));
      router.push(`/${locale}/account/order-history`);
    } catch (error: any) {
      console.error("Failed to submit reviews:", error);
      showErrorToast(
        error?.response?.data?.message || t("reviewSubmissionFailed")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = (productIndex: number, rating: ReviewRating) => {
    setProductForms((prev) =>
      prev.map((form, i) =>
        i === productIndex ? { ...form, rating } : form
      )
    );
    if (productErrors[productIndex]?.rating) {
      setProductErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors[productIndex]) {
          delete newErrors[productIndex].rating;
          if (Object.keys(newErrors[productIndex]).length === 0) {
            delete newErrors[productIndex];
          }
        }
        return newErrors;
      });
    }
  };

  const handleFieldChange = (productIndex: number, field: keyof Omit<ProductFormData, 'productId' | 'variantId'>, value: string) => {
    setProductForms((prev) =>
      prev.map((form, i) =>
        i === productIndex ? { ...form, [field]: value } : form
      )
    );
    if (productErrors[productIndex]?.[field as keyof ProductFormErrors]) {
      setProductErrors((prev) => {
        const newErrors = { ...prev };
        if (newErrors[productIndex]) {
          delete newErrors[productIndex][field as keyof ProductFormErrors];
          if (Object.keys(newErrors[productIndex]).length === 0) {
            delete newErrors[productIndex];
          }
        }
        return newErrors;
      });
    }
  };

  const handleImagesChange = (productIndex: number, images: FileType[]) => {
    setProductForms((prev) =>
      prev.map((form, i) =>
        i === productIndex ? { ...form, images } : form
      )
    );
  };

  const handleBack = () => {
    if (hasFormData()) {
      setShowCancelConfirm(true);
    } else {
      router.push(`/${locale}/account/order-history`);
    }
  };

  const handleConfirmBack = () => {
    router.push(`/${locale}/account/order-history`);
  };

  if (isLoadingOrderDetail) {
    return (
      <Box className="mx-[18px]">
        <Text className="text-sm text-[#606060]">{t("loading")}</Text>
      </Box>
    );
  }

  if (!orderDetail) {
    return (
      <Box className="mx-[18px]">
        <Text className="text-sm text-[#606060]">{t("orderNotFound")}</Text>
      </Box>
    );
  }

  if (orderDetail.items.length === 0 || productForms.length === 0) {
    return (
      <Box className="mx-[18px]">
        <Text className="text-sm text-[#606060]">{t("noProductsToReview")}</Text>
      </Box>
    );
  }

  return (
    <>
      <Box className="mx-[18px] space-y-4">
        {/* Header with centered title and close button */}
        <Flex
          align="center"
          justify="center"
          className="relative"
        >
          <Text className="text-base font-bold text-black">
            {t("dialogTitle")}
          </Text>
          <button
            onClick={handleBack}
            className="absolute right-0 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={tCommon("buttons.cancel")}
          >
            <Cross2Icon className="w-5 h-5 text-black" />
          </button>
        </Flex>

        {/* All products review forms */}
        {orderDetail.items.map((item, index) => {
          const formData = productForms[index];
          const errors = productErrors[index] || {};

          return (
            <Box key={`${item.productId}-${item.variantId || 'no-variant'}-${index}`} className="bg-white rounded-2xl p-4 space-y-4">
              {/* Product info card */}
              <Flex gap="3" align="start" className="rounded-lg">
                <Box className="relative w-[80px] h-[80px] flex-shrink-0 bg-[#F5F5F5] rounded-lg overflow-hidden">
                  <Image
                    src={item.image || DEFAULT_PRODUCT_IMAGE}
                    alt={item.name}
                    fill
                    className={item.image ? "object-cover" : "object-contain"}
                  />
                </Box>
                <Box className="flex-1 flex flex-col justify-center">
                  <Text size="2" weight="medium" className="block text-black">
                    {item.name}
                  </Text>
                  <Text size="1" className="text-[#999999]">
                    X{item.quantity}
                  </Text>
                </Box>
              </Flex>

              {/* Star rating */}
              <Box>
                <Flex align="center" justify="between">
                  <Text size="2" weight="medium">
                    {t("rating")} <Text color="red">*</Text>
                  </Text>
                  <StarRating
                    value={formData?.rating || 0}
                    onChange={(rating) => handleRatingChange(index, rating)}
                    size="tiny"
                  />
                </Flex>
                {errors.rating && (
                  <Text size="2" color="red" className="block">
                    {t(errors.rating)}
                  </Text>
                )}
              </Box>

              {/* Form fields */}
              <ReviewProductFormFields
                height={formData?.height || ""}
                weight={formData?.weight || ""}
                comment={formData?.comment || ""}
                productFit={formData?.productFit || ""}
                onHeightChange={(value) => handleFieldChange(index, "height", value)}
                onWeightChange={(value) => handleFieldChange(index, "weight", value)}
                onCommentChange={(value) => handleFieldChange(index, "comment", value)}
                onProductFitChange={(value) => handleFieldChange(index, "productFit", value)}
                errors={errors}
              />

              {/* Image upload */}
              <ImageUpload
                images={formData?.images || []}
                onImagesChange={(images) => handleImagesChange(index, images)}
              />
            </Box>
          );
        })}

        {/* Action buttons - shown once for all products */}
        <Box className="bg-white rounded-2xl p-4">
          <Flex gap="3" className="w-full">
            <Box className="flex-1">
              <OutlineButton
                onClick={handleBack}
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

      {/* Cancel Confirmation Dialog */}
      <AlertDialog.Root open={showCancelConfirm} onOpenChange={setShowCancelConfirm}>
        <AlertDialog.Content maxWidth="400px" className="text-center">
          <AlertDialog.Title className="text-center text-black font-bold">
            {tCommon("buttons.confirm")}
          </AlertDialog.Title>
          <AlertDialog.Description size="2" className="text-center text-gray-700">
            {t("confirmCancelMessage")}
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="center">
            <AlertDialog.Cancel>
              <button
                className="w-[133px] h-[48px] rounded-[40px] px-4 py-3 border border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-50 cursor-pointer"
              >
                {tCommon("buttons.cancel").toUpperCase()}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <button
                onClick={handleConfirmBack}
                className="w-[133px] h-[48px] rounded-[40px] px-4 py-3 border border-transparent text-white font-medium cursor-pointer"
                style={{
                  background: 'linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)'
                }}
              >
                {tCommon("buttons.continue").toUpperCase()}
              </button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
