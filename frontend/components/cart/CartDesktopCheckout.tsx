'use client';

import { useEffect } from 'react';
import { AppLocale } from '@/lib/locale';
import { Box, Text } from '@radix-ui/themes';
import { useTranslations } from 'next-intl';
import { ConfirmOrderShippingAuth } from './ConfirmOrderShippingAuth';
import { ConfirmOrderShippingGuest } from './ConfirmOrderShippingGuest';
import { CartPaymentMethod } from './CartPaymentMethod';
import { ConfirmOrderPlaceButton } from './ConfirmOrderPlaceButton';
import { ConfirmOrderPaymentStatus } from './ConfirmOrderPaymentStatus';
import { QRCodeDialog } from '@/components/payment/QRCodeDialog';
import { AddressManagementDialog } from './AddressManagementDialog';
import { useConfirmOrder } from './hooks/useConfirmOrder';
import type { CheckoutSession } from '@/types/gen/shop/shared/checkout-sessions/checkout-session';

interface CartDesktopCheckoutProps {
  checkoutSessionId: string;
  checkoutSession: CheckoutSession | null;
  locale: AppLocale;
  onPaymentProcessingChange?: (_isProcessing: boolean) => void;
  onAddressLoadedChange?: (_isLoaded: boolean) => void;
  onCheckoutSessionUpdate?: (_session: CheckoutSession | null) => void;
}

export function CartDesktopCheckout({
  checkoutSessionId,
  checkoutSession: externalSession,
  locale,
  onPaymentProcessingChange,
  onAddressLoadedChange,
  onCheckoutSessionUpdate,
}: CartDesktopCheckoutProps) {
  const t = useTranslations('orderDetail');

  const {
    isAuthenticated,
    checkoutSession,
    isLoading,
    isPlacingOrder,
    isPaymentProcessing,
    paymentMethod,
    shippingFormData,
    cities,
    availableDistricts,
    availableWards,
    shippingAddresses,
    selectedAddressId,
    isAddressLoaded,
    isQRDialogOpen,
    qrDialogData,
    isAddressManagementDialogOpen,
    setPaymentMethod,
    setShippingFormData,
    handlePlaceOrder,
    handleNotesChange,
    handleRetryPayment,
    handleQRDialogClose,
    handleNavigateToAddressBook,
    handleCloseAddressManagementDialog,
    handleSelectAddress,
    fieldErrors,
    clearFieldError,
  } = useConfirmOrder({
    locale,
    checkoutSessionId,
    checkoutSession: externalSession,
    onCheckoutSessionUpdate,
  });

  // Log when checkoutSession prop changes
  useEffect(() => {
    console.log('[CartDesktopCheckout] Received new checkoutSession:', {
      id: checkoutSession?.id,
      canPlaceOrder: checkoutSession?.canPlaceOrder,
    });
  }, [checkoutSession]);

  // Notify parent when payment processing state changes
  useEffect(() => {
    onPaymentProcessingChange?.(isPaymentProcessing);
  }, [isPaymentProcessing, onPaymentProcessingChange]);

  // Notify parent when address loaded state changes
  useEffect(() => {
    console.log('[CartDesktopCheckout] Address loaded state changed, calling callback:', isAddressLoaded);
    onAddressLoadedChange?.(isAddressLoaded);
  }, [isAddressLoaded, onAddressLoadedChange]);

  if (isLoading) {
    return (
      <Box className="bg-white rounded-lg p-6">
        <Text>{t('loading')}</Text>
      </Box>
    );
  }

  if (!checkoutSession || !checkoutSession.id) {
    return (
      <Box className="bg-white rounded-lg p-6">
        <Text>{t('loading')}</Text>
      </Box>
    );
  }

  return (
    <>
      <Box className="bg-white rounded-lg pb-6">
        {/* Shipping Information Section */}
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

        {/* Payment Method Section */}
        <Box className="mt-4">
          <CartPaymentMethod
            selectedMethod={paymentMethod}
            onSelect={setPaymentMethod}
            isPaymentProcessing={isPaymentProcessing}
          />
        </Box>

        {/* Payment Status (if processing) */}
        {isPaymentProcessing && (
          <Box className="mt-4">
            <ConfirmOrderPaymentStatus
              isProcessing={isPaymentProcessing}
              onRetry={handleRetryPayment}
            />
          </Box>
        )}

        {/* Place Order Button */}
        <Box className="mt-4">
          <ConfirmOrderPlaceButton
            checkoutSession={checkoutSession}
            isPlacingOrder={isPlacingOrder}
            isPaymentProcessing={isPaymentProcessing}
            onPlaceOrder={handlePlaceOrder}
            fieldErrors={fieldErrors}
          />
        </Box>
      </Box>

      {/* QR Code Dialog for VietQR payment */}
      <QRCodeDialog
        open={isQRDialogOpen}
        onOpenChange={handleQRDialogClose}
        qrUrl={qrDialogData.qrUrl}
        qrData={qrDialogData.qrData}
      />

      {/* Address Management Dialog */}
      {isAuthenticated && (
        <AddressManagementDialog
          open={isAddressManagementDialogOpen}
          onOpenChange={handleCloseAddressManagementDialog}
          onSelectAddress={handleSelectAddress}
          selectedAddressId={selectedAddressId}
          locale={locale}
        />
      )}
    </>
  );
}
