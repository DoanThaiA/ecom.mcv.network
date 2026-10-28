"use client";

import { Box, Flex, Text, TextArea, Select } from "@radix-ui/themes";
import { useTranslations } from "next-intl";
import { LabeledTextField } from "@/components/common/LabeledTextField";
import { REVIEW_CONSTANTS } from "@/lib/constants/review";

interface FormFieldsProps {
  height: string;
  weight: string;
  comment: string;
  productFit: string;
  onHeightChange: (_value: string) => void;
  onWeightChange: (_value: string) => void;
  onCommentChange: (_value: string) => void;
  onProductFitChange: (_value: string) => void;
  errors: {
    height?: string;
    weight?: string;
    comment?: string;
    productFit?: string;
  };
  heightRef?: React.RefObject<HTMLInputElement | null>;
  weightRef?: React.RefObject<HTMLInputElement | null>;
  commentRef?: React.RefObject<HTMLTextAreaElement | null>;
}

export function ReviewProductFormFields({
  height,
  weight,
  comment,
  productFit,
  onHeightChange,
  onWeightChange,
  onCommentChange,
  onProductFitChange,
  errors,
  heightRef,
  weightRef,
  commentRef,
}: FormFieldsProps) {
  const t = useTranslations("reviews");

  const fitOptions = [
    { value: "tight", label: t("fitOptions.tight") },
    { value: "perfect", label: t("fitOptions.perfect") },
    { value: "loose", label: t("fitOptions.loose") },
  ];

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow only numbers and one decimal point
    if (newValue === "" || /^\d*\.?\d*$/.test(newValue)) {
      onHeightChange(newValue);
    }
  };

  const handleWeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Allow only numbers and one decimal point
    if (newValue === "" || /^\d*\.?\d*$/.test(newValue)) {
      onWeightChange(newValue);
    }
  };

  return (
    <Box>
      {/* Height and Weight in same row */}
      <Flex gap="3" className="mb-4">
        <Box className="w-[177px]">
          <LabeledTextField
            ref={heightRef}
            label={
              <>
                {t("height")} <Text color="red">*</Text>
              </>
            }
            value={height}
            onChange={handleHeightChange}
            placeholder={t("heightPlaceholder")}
            error={errors.height ? t(errors.height) : undefined}
            type="text"
            inputMode="numeric"
          />
        </Box>
        <Box className="w-[177px]">
          <LabeledTextField
            ref={weightRef}
            label={
              <>
                {t("weight")} <Text color="red">*</Text>
              </>
            }
            value={weight}
            onChange={handleWeightChange}
            placeholder={t("weightPlaceholder")}
            error={errors.weight ? t(errors.weight) : undefined}
            type="text"
            inputMode="numeric"
          />
        </Box>
      </Flex>

      {/* Product Fit field */}
      <Box className="mb-4">
        <Flex align="center" gap="3" className="mb-2">
          <Text size="2" weight="medium" className="flex-shrink-0">
            {t("productFit")} <Text color="red">*</Text>
          </Text>
          <Box className="w-[177px]">
            <Select.Root value={productFit} onValueChange={onProductFitChange}>
              <Select.Trigger
                placeholder={t("productFitPlaceholder")}
                className="w-full h-10 rounded-lg border p-2"
              />
              <Select.Content position="popper">
                {fitOptions.map((option) => (
                  <Select.Item key={option.value} value={option.value}>
                    {option.label}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Box>
        </Flex>
        {errors.productFit && (
          <Text size="2" color="red" className="mt-1 block">
            {t(errors.productFit)}
          </Text>
        )}
      </Box>

      {/* Comment field */}
      <Box className="mb-4">
        <Text size="2" weight="medium" className="mb-2 block">
          {t("comment")}
        </Text>
        <TextArea
          ref={commentRef}
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          placeholder={t("commentPlaceholder")}
          className="w-full"
          rows={5}
          maxLength={REVIEW_CONSTANTS.MAX_COMMENT_LENGTH}
        />
        <Flex justify="between" className="mt-1">
          {errors.comment ? (
            <Text size="2" color="red">
              {t(errors.comment)}
            </Text>
          ) : (
            <Box />
          )}
          <Text size="1" color="gray">
            {comment.length}/{REVIEW_CONSTANTS.MAX_COMMENT_LENGTH}
          </Text>
        </Flex>
      </Box>
    </Box>
  );
}
