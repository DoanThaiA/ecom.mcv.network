"use client";

import { useState, useEffect } from "react";
import { Flex, Text, Button, IconButton, Tooltip } from "@radix-ui/themes";
import { CopyIcon, CheckIcon } from "@radix-ui/react-icons";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/lib/store/hooks";
import { AuthStatus } from "@/lib/store/slices/authSlice";
import { SignUpDialog } from "@/components/auth/SignUpDialog";
import { storageService } from "@/lib/services/storage.service";
import { orderRepository } from "@/lib/repositories/order.repository";
import type { AppLocale } from "@/lib/locale";
import { CrossSellSection } from "./CrossSellSection";

interface OrderSuccessContentProps {
  locale: AppLocale;
  orderNumber?: string;
}

export function OrderSuccessContent({ locale, orderNumber }: OrderSuccessContentProps) {
  const t = useTranslations("orderSuccess");
  const tSignIn = useTranslations("signin");
  const router = useRouter();

  // Auth status
  const { status: authStatus } = useAppSelector((state) => state.auth);
  const isAuthenticated = authStatus === AuthStatus.AUTHENTICATED;

  // SignUp dialog state
  const [isSignUpDialogOpen, setIsSignUpDialogOpen] = useState(false);
  const [customerData, setCustomerData] = useState<{
    name: string;
    phone: string;
    email: string;
    orderNumber?: string;
    productIds?: string[];
  } | null>(null);

  // Prevent hydration mismatch by only rendering conditional content after mount
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  // Separate state for cross-sell productIds (from localStorage or API)
  const [crossSellProductIds, setCrossSellProductIds] = useState<string[]>([]);

  // Order code: prioritize URL param, fallback to localStorage
  const displayOrderNumber = orderNumber || customerData?.orderNumber;

  // Copy order number to clipboard
  const handleCopyOrderNumber = async () => {
    if (displayOrderNumber) {
      await navigator.clipboard.writeText(displayOrderNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Load customer data and fetch productIds on mount
  // Priority: API (orderNumber) > localStorage (fallback)
  useEffect(() => {
    const data = storageService.getOrderCustomerData();
    if (data) {
      setCustomerData(data);
    }
    setMounted(true);

    // Fetch productIds from order API (primary source)
    const fetchOrderProducts = async () => {
      // Use orderNumber from URL or localStorage
      const orderNum = orderNumber || data?.orderNumber;

      if (orderNum) {
        try {
          const order = await orderRepository.getOrderByNumber(orderNum);
          if (order?.items && order.items.length > 0) {
            const productIds = order.items.map(item => item.productId).filter(Boolean) as string[];
            if (productIds.length > 0) {
              setCrossSellProductIds(productIds);
              return; // Success - no need for fallback
            }
          }
        } catch {
          // API failed - fall through to localStorage fallback
        }
      }

      // Fallback: use productIds from localStorage if API failed or no orderNumber
      if (data?.productIds && data.productIds.length > 0) {
        setCrossSellProductIds(data.productIds);
      }
    };

    fetchOrderProducts();
  }, [orderNumber]);

  // Clear customer data when component unmounts
  useEffect(() => {
    return () => {
      storageService.clearOrderCustomerData();
    };
  }, []);

  const handleTrackOrder = () => {
    router.push(`/${locale}/account/order-history`);
  };

  return (
    <>
      <Flex
        direction="column"
        align="center"
        justify="center"
        className="min-h-[calc(100vh-400px)] px-4 md:px-5 py-10 md:py-[60px]"
      >
        {/* Success Illustration */}
        <div className="mb-6 md:mb-8">
          <Image
            src="/assets/svg/order-success.svg"
            alt="Order Success"
            width={143}
            height={122}
            priority
            className="w-[100px] h-[85px] md:w-[143px] md:h-[122px]"
          />
        </div>

        {/* Title */}
        <Text
          weight="bold"
          className="text-black mb-3 md:mb-4 text-center text-xl md:text-2xl"
        >
          {t("title")}
        </Text>

        {/* Order Code - Display when available (from URL or localStorage) */}
        {displayOrderNumber && (
          <Flex align="center" gap="2" className="mb-3 md:mb-4">
            <Text className="text-gray-600 text-center text-sm md:text-base">
              {t("orderCode")}: <Text weight="bold">{displayOrderNumber}</Text>
            </Text>
            <Tooltip content={copied ? t("copied") : t("copyOrderCode")}>
              <IconButton
                size="1"
                variant="ghost"
                color="gray"
                onClick={handleCopyOrderNumber}
                className="cursor-pointer"
              >
                {copied ? <CheckIcon /> : <CopyIcon />}
              </IconButton>
            </Tooltip>
          </Flex>
        )}

        {/* Message */}
        <Text className="text-black mb-8 md:mb-10 text-center max-w-[900px] text-sm md:text-base px-2">
          {t("message")}
        </Text>

        {/* Conditional button based on auth status - only render after mount to prevent hydration mismatch */}
        {mounted && (
          <>
            {isAuthenticated ? (
              <Button
                size="4"
                onClick={handleTrackOrder}
                className="text-white rounded-full px-6 md:px-8 py-3 md:py-4 font-semibold text-sm md:text-base cursor-pointer w-full max-w-[317px] h-12 md:h-14 transition-all hover:opacity-90"
                style={{
                  background:
                    "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
                }}
              >
                {t("trackOrderButton")}
              </Button>
            ) : (
              <>
                <Text className="text-gray-600 text-center mb-4 text-sm md:text-base px-2">
                  {t("signUpMessage")}
                </Text>
                <Button
                  size="4"
                  onClick={() => setIsSignUpDialogOpen(true)}
                  className="text-white rounded-full px-6 md:px-8 py-3 md:py-4 font-semibold text-sm md:text-base cursor-pointer w-full max-w-[400px] h-12 md:h-14 transition-all hover:opacity-90"
                  style={{
                    background:
                      "linear-gradient(90deg, #FAA63E -2.23%, #EA9839 19.77%, #C0752F 62.77%, #9B5526 96.77%, #9B5526 97.77%)",
                  }}
                >
                  {tSignIn("signUpNow")}
                </Button>
              </>
            )}
          </>
        )}

        {/* SignUp Dialog */}
        <SignUpDialog
          open={isSignUpDialogOpen}
          onOpenChange={setIsSignUpDialogOpen}
          locale={locale}
          initialData={{
            fullName: customerData?.name || "",
            emailOrPhone: customerData?.email || customerData?.phone || "",
          }}
          onEmailSignUpSuccess={() => {
            setIsSignUpDialogOpen(false);
            router.push(`/${locale}/account/order-history`);
          }}
          onPhoneSignUp={() => {
            setIsSignUpDialogOpen(false);
            router.push(`/${locale}/account/order-history`);
          }}
        />
      </Flex>

      {/* Cross-sell Recommendations - Outside centered container, like home page */}
      {crossSellProductIds.length > 0 && (
        <CrossSellSection productIds={crossSellProductIds} locale={locale} />
      )}
    </>
  );
}
