"use client";

import { useEffect } from "react";
import { Box, Flex, Text, IconButton } from "@radix-ui/themes";
import { ArrowLeftIcon, Cross2Icon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import { VoucherManagementContent } from "./VoucherManagementContent";
import type { CheckoutSession } from "@/types/gen/shop/shared/checkout-sessions/checkout-session";
interface VoucherManagementSheetProps {
  open: boolean;
  onOpenChange: (_open: boolean) => void;
  checkoutSession: CheckoutSession | null;
  onCheckoutSessionUpdate: (_updatedSession: CheckoutSession) => void;
}

/**
 * VoucherManagementSheet - Full-screen on mobile, dialog on desktop
 * Uses portal to render on top of everything
 */
export function VoucherManagementSheet({
  open,
  onOpenChange,
  checkoutSession,
  onCheckoutSessionUpdate,
}: VoucherManagementSheetProps) {
  const t = useTranslations("cart");

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open, onOpenChange]);

  if (!open) return null;

  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <>
      {/* Backdrop - only visible on desktop */}
      <Box
        className="fixed inset-0 bg-black/50 z-[100] hidden lg:block"
        onClick={handleClose}
      />

      {/* Sheet container */}
      <Box
        className="fixed inset-0 z-[101] lg:inset-auto lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2
                   lg:w-[90vw] lg:max-w-2xl lg:max-h-[90vh] lg:rounded-2xl
                   bg-[#FEF8F1] lg:bg-white overflow-hidden flex flex-col"
        style={{
          boxShadow: "0px 12px 40px 0px rgba(0, 0, 0, 0.16)",
        }}
      >
        {/* Header - Mobile: back button, Desktop: close button */}
        <Flex
          align="center"
          justify="between"
          className="h-14 px-4 bg-white border-b border-gray-100 flex-shrink-0"
        >
          {/* Mobile: Back button */}
          <IconButton
            variant="ghost"
            className="lg:hidden cursor-pointer"
            onClick={handleClose}
          >
            <ArrowLeftIcon width={20} height={20} />
          </IconButton>

          {/* Title */}
          <Text weight="bold" className="text-lg text-black absolute left-1/2 -translate-x-1/2 lg:static lg:translate-x-0">
            {t("selectPromotion") || "Chọn ưu đãi"}
          </Text>

          {/* Desktop: Close button */}
          <IconButton
            variant="ghost"
            className="hidden lg:flex cursor-pointer"
            onClick={handleClose}
          >
            <Cross2Icon width={20} height={20} />
          </IconButton>

          {/* Spacer for mobile to balance the header */}
          <Box className="w-8 lg:hidden" />
        </Flex>

        {/* Content - scrollable */}
        <Box className="flex-1 overflow-y-auto">
          <VoucherManagementContent
            checkoutSession={checkoutSession}
            onCheckoutSessionUpdate={onCheckoutSessionUpdate}
            onClose={handleClose}
            mode="page"
          />
        </Box>
      </Box>
    </>
  );
}
