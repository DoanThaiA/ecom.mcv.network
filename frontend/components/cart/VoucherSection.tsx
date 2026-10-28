'use client';

import { Box, Flex, Text, Button } from '@radix-ui/themes';
import { Cross2Icon } from '@radix-ui/react-icons';
import { useTranslations } from 'next-intl';
import { useState, useMemo } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { promotionRepository } from '@/lib/repositories/promotion.repository';
import { showErrorToast, showSuccessToast } from '@/lib/helpers/toastHelper';
import { formatPrice } from '@/lib/utils/format';
import { VoucherManagementSheet } from './VoucherManagementSheet';
import type { CheckoutSession } from '@/types/gen/shop/shared/checkout-sessions/checkout-session';
import { DiscountDetailType } from '@/types/gen/shared/shared/common/enums';
import { AuthDialogsManager } from '@/components/navigation/AuthDialogsManager';
import { AppLocale } from '@/lib/locale';
interface VoucherSectionProps {
  checkoutSession: CheckoutSession | null;
  onVoucherApplied?: (_updatedSession: CheckoutSession) => void;
  isPaymentProcessing?: boolean;
}

export function VoucherSection({
  checkoutSession,
  onVoucherApplied,
  isPaymentProcessing = false,
}: VoucherSectionProps) {
  const t = useTranslations('cart');
  const params = useParams();
  const locale = params.locale as AppLocale;
  const [voucherCode, setVoucherCode] = useState('');
  const [isApplying, setIsApplying] = useState(false);
  const [removingDiscountId, setRemovingDiscountId] = useState<string | null>(
    null,
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);
  const [signUpOpen, setSignUpOpen] = useState(false);

  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) {
      showErrorToast(t('voucherCodeRequired'));
      return;
    }

    if (!checkoutSession?.id) {
      showErrorToast(t('checkoutSessionNotFound'));
      return;
    }

    setIsApplying(true);
    try {
      const updatedSession = await promotionRepository.applyVoucher(
        voucherCode.trim(),
        checkoutSession.id,
      );
      showSuccessToast(t('voucherAppliedSuccess'));
      setVoucherCode('');
      onVoucherApplied?.(updatedSession);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.message || t('voucherApplyError');
      showErrorToast(errorMessage);
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveDiscount = async (
    discountId: string,
    discountType: 'voucher' | 'product_discount' | 'shipping_promotion',
  ) => {
    if (!checkoutSession?.id) {
      showErrorToast(t('checkoutSessionNotFound'));
      return;
    }

    setRemovingDiscountId(discountId);
    try {
      let updatedSession: CheckoutSession;

      // Check if it's a voucher, product discount, or shipping promotion based on unified type
      if (discountType === 'voucher') {
        // discountId is the voucher code
        updatedSession = await promotionRepository.removeVoucher(
          checkoutSession.id,
          discountId,
        );
        showSuccessToast(t('voucherRemovedSuccess'));
      } else if (discountType === 'shipping_promotion') {
        // Shipping promotion - only one can be applied at a time
        updatedSession = await promotionRepository.removeShippingPromotion(
          checkoutSession.id,
        );
        showSuccessToast(
          t('shippingPromotion.removeSuccess') || 'Đã gỡ ưu đãi vận chuyển',
        );
      } else {
        // Product discount - discountId is the referenceId (promotion ID)
        updatedSession = await promotionRepository.removeProductDiscount(
          checkoutSession.id,
          discountId,
        );
        showSuccessToast(t('promotionPicker.removeSuccess'));
      }

      onVoucherApplied?.(updatedSession);
    } catch (error: unknown) {
      const errorMessage =
        (error as { response?: { data?: { message?: string } } })?.response
          ?.data?.message || t('voucherRemoveError');
      showErrorToast(errorMessage);
    } finally {
      setRemovingDiscountId(null);
    }
  };

  // Open sheet to select/re-select promotions
  const handleOpenPromotionSheet = () => {
    if (isPaymentProcessing || !checkoutSession?.id) return;
    setIsSheetOpen(true);
  };

  // Define unified discount type for display
  interface DisplayDiscount {
    id: string; // For vouchers: code, for product discounts: referenceId
    name: string;
    discountAmount: number;
    type: 'voucher' | 'product_discount' | 'shipping_promotion';
  }

  // Get all applied discounts (vouchers from appliedVouchers + product discounts from discountDetails)
  const appliedDiscounts = useMemo((): DisplayDiscount[] => {
    const discounts: DisplayDiscount[] = [];

    // 1. Add vouchers from appliedVouchers array
    const vouchers = checkoutSession?.appliedVouchers || [];
    vouchers.forEach((voucher) => {
      discounts.push({
        id: voucher.code,
        name: voucher.name || voucher.code,
        discountAmount: voucher.discountAmount,
        type: 'voucher',
      });
    });

    // 2. Add all non-voucher discounts from discountDetails
    const detailDiscounts = (checkoutSession?.discountDetails || []).filter(
      (detail) => {
        const type = detail.type;
        const typeStr = String(type);
        // Include product discounts and order discounts (everything except combos, flash sales)
        return (
          type === DiscountDetailType.DISCOUNT_DETAIL_TYPE_PRODUCT_DISCOUNT ||
          typeStr === 'product_discount' ||
          typeStr === 'order_discount' ||
          type === DiscountDetailType.DISCOUNT_DETAIL_TYPE_COUPON ||
          typeStr === 'DISCOUNT_DETAIL_TYPE_COUPON'
        );
      },
    );
    detailDiscounts.forEach((discount) => {
      discounts.push({
        id: discount.referenceId,
        name: discount.referenceName,
        discountAmount: discount.discountAmount,
        type: 'product_discount',
      });
    });

    // 3. Add shipping promotion from shippingPromotion field (primary source)
    if (checkoutSession?.shippingPromotion?.id) {
      discounts.push({
        id: checkoutSession.shippingPromotion.id,
        name:
          checkoutSession.shippingPromotion.name ||
          t('shippingPromotion.shippingFeeDiscount'),
        discountAmount: checkoutSession.shippingPromotion.discountAmount || 0,
        type: 'shipping_promotion',
      });
    } else {
      // Fallback: Add shipping promotions from discountDetails (if any)
      const shippingDiscounts = (checkoutSession?.discountDetails || []).filter(
        (detail) => {
          const typeStr = String(detail.type);
          return typeStr === 'shipping_promotion';
        },
      );
      shippingDiscounts.forEach((discount) => {
        discounts.push({
          id: discount.referenceId,
          name:
            discount.referenceName ||
            t('shippingPromotion.shippingFeeDiscount'),
          discountAmount: discount.discountAmount,
          type: 'shipping_promotion',
        });
      });
    }

    return discounts;
  }, [
    checkoutSession?.appliedVouchers,
    checkoutSession?.discountDetails,
    checkoutSession?.shippingPromotion,
    t,
  ]);

  const hasAppliedDiscounts = appliedDiscounts.length > 0;

  // Check if shipping promotion is free shipping type
  const isFreeShip = useMemo(() => {
    if (!checkoutSession?.shippingPromotion?.id) return false;
    // API returns "freeship" as string, TypeScript expects enum
    const typeStr = String(checkoutSession.shippingPromotion.type);
    return typeStr === 'freeship';
  }, [checkoutSession?.shippingPromotion]);

  return (
    <Box>
      {/* Voucher Input */}
      <Flex
        align="center"
        justify="center"
        className="mb-4 gap-1 bg-white lg:bg-transparent p-4 lg:p-0 mt-0"
      >
        <input
          type="text"
          value={voucherCode}
          onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
          placeholder={t('enterDiscountCodePlaceholder')}
          className={`w-[100%] rounded-l-full p-3 border border-[#F0F0F0] text-black placeholder-gray-400 focus:outline-none focus:border-[#FAA63E] ${
            isPaymentProcessing ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'
          }`}
          disabled={isApplying || isPaymentProcessing}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !isPaymentProcessing) {
              handleApplyVoucher();
            }
          }}
        />
        <Button
          onClick={handleApplyVoucher}
          disabled={
            isApplying ||
            !voucherCode.trim() ||
            isPaymentProcessing
          }
          className={`w-[89px] h-[48px] rounded-r-full bg-gradient-to-r from-[#FAA63E] via-[#EA9839] to-[#9B5526] text-white font-medium text-xs p-0 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
            isPaymentProcessing ? 'cursor-not-allowed' : 'cursor-pointer'
          }`}
        >
          {isApplying ? t('applying') : t('apply')}
        </Button>
      </Flex>

      {/* Applied Discounts Section - "Ưu đãi áp dụng".
          Guests get the same treatment as logged-in customers: they can open
          the promotion sheet, pick a promotion, and remove what they applied. */}
      {checkoutSession?.id && (
        <Flex
          justify="between"
          align="center"
          className="px-4 lg:px-0 mt-2"
          onClick={handleOpenPromotionSheet}
        >
          <Text weight="medium" className="text-black flex-shrink-0">
            {t('appliedDiscounts')}
          </Text>

          {/* Right side: "Chọn ưu đãi >" or applied discount badges */}
          {hasAppliedDiscounts ? (
            <Flex
              gap="2"
              direction="row"
              className={`items-end ${
                isPaymentProcessing ? 'cursor-not-allowed' : 'cursor-pointer'
              }`}
            >
              {appliedDiscounts.map((discount, index) => (
                <Box key={index} className="relative inline-block">
                  {/* Free Ship badge for shipping promotion when it results in free shipping */}
                  {discount.type === 'shipping_promotion' && isFreeShip ? (
                    <Image
                      src="/assets/svg/free-ship.svg"
                      alt="Free Ship"
                      width={97}
                      height={25}
                      className="h-6 w-auto"
                    />
                  ) : (
                    <>
                      <Box
                        className={`h-6 px-3 rounded flex items-center justify-center gap-2 bg-gradient-to-r from-[#FAA63E] via-[#EA9839] to-[#9B5526] ${
                          isPaymentProcessing ? 'opacity-60' : ''
                        }`}
                      >
                        <Text className="text-white text-sm font-normal">
                          - {formatPrice(discount.discountAmount)}
                        </Text>
                        {/* Hide remove button for shipping promotions */}
                        {discount.type !== 'shipping_promotion' && (
                          <Box
                            onClick={(e) => {
                              e.stopPropagation();
                              if (!isPaymentProcessing) {
                                handleRemoveDiscount(
                                  discount.id,
                                  discount.type,
                                );
                              }
                            }}
                            className={`hover:opacity-80 transition-opacity ${
                              removingDiscountId === discount.id ||
                              isPaymentProcessing
                                ? 'opacity-50 pointer-events-none cursor-not-allowed'
                                : 'cursor-pointer'
                            }`}
                          >
                            <Cross2Icon className="text-white w-3 h-3" />
                          </Box>
                        )}
                      </Box>
                      {/* Left circular cutout */}
                      <Box
                        className="absolute w-2 h-2 rounded-full bg-white"
                        style={{
                          left: '0',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                        }}
                      />
                      {/* Right circular cutout */}
                      <Box
                        className="absolute w-2 h-2 rounded-full bg-white"
                        style={{
                          right: '0',
                          top: '50%',
                          transform: 'translate(50%, -50%)',
                        }}
                      />
                    </>
                  )}
                </Box>
              ))}
            </Flex>
          ) : (
            <Text
              weight="medium"
              className={`text-[#C0752F] transition-colors ${
                isPaymentProcessing
                  ? 'cursor-not-allowed opacity-60'
                  : 'hover:text-[#9B5526] cursor-pointer'
              }`}
              onClick={handleOpenPromotionSheet}
            >
              {t('selectPromotion')} {'>'}
            </Text>
          )}
        </Flex>
      )}

      {/* Voucher Management Sheet - Full-screen on mobile, dialog on desktop */}
      <VoucherManagementSheet
        open={isSheetOpen}
        onOpenChange={setIsSheetOpen}
        checkoutSession={checkoutSession}
        onCheckoutSessionUpdate={(session) => onVoucherApplied?.(session)}
      />

      <AuthDialogsManager
        locale={locale}
        signInOpen={signInOpen}
        onSignInOpenChange={setSignInOpen}
        signUpOpen={signUpOpen}
        onSignUpOpenChange={setSignUpOpen}
      />
    </Box>
  );
}
