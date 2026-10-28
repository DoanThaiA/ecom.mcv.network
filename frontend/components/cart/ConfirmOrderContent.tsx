'use client';

import { AppLocale } from '@/lib/locale';
import { ArrowLeftIcon } from '@radix-ui/react-icons';
import { Box, Flex, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { CartPaymentMethod } from './CartPaymentMethod';
import { ConfirmOrderItems } from './ConfirmOrderItems';
import { ConfirmOrderPaymentStatus } from './ConfirmOrderPaymentStatus';
import { ConfirmOrderPlaceButton } from './ConfirmOrderPlaceButton';
import { ConfirmOrderShippingAuth } from './ConfirmOrderShippingAuth';
import { ConfirmOrderShippingGuest } from './ConfirmOrderShippingGuest';
import { useConfirmOrder } from './hooks/useConfirmOrder';
import { PaymentDetails } from './PaymentDetails';
import { VoucherSection } from './VoucherSection';
import { QRCodeDialog } from '@/components/payment/QRCodeDialog';
import { AddressManagementDialog } from './AddressManagementDialog';

interface ConfirmOrderContentProps {
  locale: AppLocale;
  checkoutSessionId?: string;
  navigationSource?: 'product' | 'cart';
  productId?: string;
}

export function ConfirmOrderContent({
  locale,
  checkoutSessionId,
  navigationSource,
  productId,
}: ConfirmOrderContentProps) {
  const t = useTranslations('orderDetail');

  const {
    isAuthenticated,
    isDesktop,
    checkoutSession,
    isLoading,
    isPlacingOrder,
    isCalculatingCheckout,
    isPaymentProcessing,
    isUpdatingQuantity,
    paymentMethod,
    shippingFormData,
    cities,
    availableDistricts,
    availableWards,
    shippingAddresses,
    selectedAddressId,
    setPaymentMethod,
    setShippingFormData,
    handlePlaceOrder,
    handleBackToCart,
    handleItemQuantityChange,
    handleNotesChange,
    handleRetryPayment,
    handleQRDialogClose,
    isQRDialogOpen,
    qrDialogData,
    handleNavigateToAddressBook,
    isAddressManagementDialogOpen,
    handleCloseAddressManagementDialog,
    handleSelectAddress,
    handleVoucherApplied,
    fieldErrors,
    clearFieldError,
  } = useConfirmOrder({ locale, checkoutSessionId, navigationSource, productId });

  // Loading state
  if (isLoading) {
    return (
      <Box className="min-h-screen bg-[#FEF8F1]">
        <Box className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
          <Flex justify="center" align="center" className="min-h-[500px]">
            <Box className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 border-t-black" />
          </Flex>
        </Box>
      </Box>
    );
  }

  // No session
  if (!checkoutSession) {
    return (
      <Box className="min-h-screen bg-[#FEF8F1]">
        <Box className="container mx-auto px-4 py-8 sm:px-6 lg:px-8 max-w-7xl">
          <Text className="text-center text-gray-600">
            {t('orderNotFound')}
          </Text>
        </Box>
      </Box>
    );
  }

  return (
    <Box className="min-h-screen bg-[#FEF8F1] overflow-x-hidden">
      <Box className="container mx-auto mt-6 max-w-7xl">
        {/* Header with Back Button */}
        <Box className="px-4 sm:px-6 lg:px-8 mb-6">
          <Flex align="center" gap="2">
            <button
              onClick={handleBackToCart}
              disabled={isPaymentProcessing}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
            >
              <ArrowLeftIcon className="w-5 h-5 text-black" />
            </button>
            <Text className="text-[20px] sm:text-[22px] lg:text-[24px] font-bold text-black">
              {t("confirmOrder")}
            </Text>
          </Flex>
        </Box>

        {/* Main Content */}
        <Flex
          direction={{ initial: "column", lg: "row" }}
          className="items-start relative pb-10 gap-4 lg:gap-8"
        >
          {/* Left Column - Shipping Info */}
          <Box className="w-full lg:w-1/2 px-2 sm:px-6 lg:px-8">
            {isAuthenticated ? (
              <ConfirmOrderShippingAuth
                shippingAddresses={shippingAddresses}
                selectedAddressId={selectedAddressId}
                shippingFormData={shippingFormData}
                onNavigateToAddressBook={handleNavigateToAddressBook}
                onNotesChange={handleNotesChange}
                isPaymentProcessing={isPaymentProcessing}
              />
            ) : (
              <ConfirmOrderShippingGuest
                shippingFormData={shippingFormData}
                cities={cities}
                availableDistricts={availableDistricts}
                availableWards={availableWards}
                onFormDataChange={setShippingFormData}
                fieldErrors={fieldErrors}
                onClearFieldError={clearFieldError}
                isPaymentProcessing={isPaymentProcessing}
              />
            )}
          </Box>

          {/* Right Column - Order Summary */}
          <Box className="w-full lg:w-1/2 sm:px-6 lg:px-8">
            <PaymentDetails
              checkoutSession={checkoutSession}
              isCalculating={isCalculatingCheckout}
            />
            
            {/* Voucher Section */}
            <Box className="mb-4">
              <VoucherSection
                checkoutSession={checkoutSession}
                onVoucherApplied={handleVoucherApplied}
                isPaymentProcessing={isPaymentProcessing}
              />
            </Box>

            <Box className="h-[1px] bg-gray-200 mx-4" />

            <CartPaymentMethod
              selectedMethod={paymentMethod}
              onSelect={setPaymentMethod}
              isPaymentProcessing={isPaymentProcessing}
            />

            <ConfirmOrderItems
              checkoutSession={checkoutSession}
              onQuantityChange={handleItemQuantityChange}
              isUpdating={isUpdatingQuantity}
              isPaymentProcessing={isPaymentProcessing}
            />

            <ConfirmOrderPaymentStatus
              isProcessing={isPaymentProcessing}
              onRetry={handleRetryPayment}
            />

            <ConfirmOrderPlaceButton
              checkoutSession={checkoutSession}
              isPlacingOrder={isPlacingOrder}
              isPaymentProcessing={isPaymentProcessing}
              onPlaceOrder={handlePlaceOrder}
              fieldErrors={fieldErrors}
            />
          </Box>
        </Flex>
      </Box>

      {/* QR Code Dialog for VietQR payment */}
      <QRCodeDialog
        open={isQRDialogOpen}
        onOpenChange={handleQRDialogClose}
        qrUrl={qrDialogData.qrUrl}
        qrData={qrDialogData.qrData}
      />

      {/* Address Management Dialog - Desktop Only */}
      {isAuthenticated && isDesktop && (
        <AddressManagementDialog
          open={isAddressManagementDialogOpen}
          onOpenChange={handleCloseAddressManagementDialog}
          onSelectAddress={handleSelectAddress}
          selectedAddressId={selectedAddressId}
          locale={locale}
        />
      )}
    </Box>
  );
}
