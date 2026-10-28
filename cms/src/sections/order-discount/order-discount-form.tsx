import { Box, Card, Grid } from '@mui/material';
import { useState, useCallback, useEffect, useRef } from 'react';

import { BasicInfoSection } from '../shock-deal/components';
import { FormActionButtons } from '../shock-deal/components';
import { SubTypeSection, DiscountConfigSection, UsageRestrictionsSection } from './components';
import { DiscountType, OrderDiscountSubType, PromotionStatus } from 'src/types/promotion';

// ----------------------------------------------------------------------

export interface OrderDiscountFormData {
  name: string;
  subType: OrderDiscountSubType;
  promoCode: string;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountValue: number | undefined;
  minimumOrderValue: number;
  notApplicableWithOtherPromotions: boolean;
  singleUsePerCustomer: boolean;
  totalUsageLimit: number | undefined;
  startTime: Date | undefined;
  endTime: Date | undefined;
  currentUsageCount?: number;
  isEnabled: boolean;
}

interface OrderDiscountFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<OrderDiscountFormData>;
  status?: PromotionStatus;
  onSubmit: (data: OrderDiscountFormData) => void;
  onCancel: () => void;
  onPause?: () => void;
  onResume?: () => void;
  loading?: boolean;
  pauseLoading?: boolean;
}

const defaultFormData: OrderDiscountFormData = {
  name: '',
  subType: OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_AUTO_APPLY,
  promoCode: '',
  discountType: DiscountType.DISCOUNT_TYPE_FIXED,
  discountValue: 0,
  maxDiscountValue: undefined,
  minimumOrderValue: 0,
  notApplicableWithOtherPromotions: false,
  singleUsePerCustomer: false,
  totalUsageLimit: undefined,
  startTime: undefined,
  endTime: undefined,
  isEnabled: true,
};

export function OrderDiscountForm({
  mode,
  initialData = {},
  status,
  onSubmit,
  onCancel,
  onPause,
  onResume,
  loading = false,
  pauseLoading = false,
}: OrderDiscountFormProps) {
  // Track if form has been initialized with data
  const isInitializedRef = useRef(false);

  // Form state
  const [formData, setFormData] = useState<OrderDiscountFormData>({
    ...defaultFormData,
    ...initialData,
  });

  // Sync with initialData only on first load (for edit mode)
  useEffect(() => {
    if (mode === 'edit' && initialData.name && !isInitializedRef.current) {
      isInitializedRef.current = true;
      setFormData({
        ...defaultFormData,
        ...initialData,
      });
    }
  }, [mode, initialData]);

  // Field handlers
  const handleNameChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, name: value }));
  }, []);

  const handleStartTimeChange = useCallback((value: Date | undefined) => {
    setFormData((prev) => ({ ...prev, startTime: value }));
  }, []);

  const handleEndTimeChange = useCallback((value: Date | undefined) => {
    setFormData((prev) => ({ ...prev, endTime: value }));
  }, []);

  const handleIsEnabledChange = useCallback((value: boolean) => {
    setFormData((prev) => ({ ...prev, isEnabled: value }));
  }, []);

  const handleSubTypeChange = useCallback((value: OrderDiscountSubType) => {
    setFormData((prev) => ({
      ...prev,
      subType: value,
      // Clear promo code when switching to auto-apply
      promoCode:
        value === OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_AUTO_APPLY ? '' : prev.promoCode,
    }));
  }, []);

  const handlePromoCodeChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, promoCode: value }));
  }, []);

  const handleDiscountTypeChange = useCallback((value: DiscountType) => {
    setFormData((prev) => {
      const isPercentage = value === DiscountType.DISCOUNT_TYPE_PERCENTAGE;
      const isFixed = value === DiscountType.DISCOUNT_TYPE_FIXED;

      // Reset discount value when switching types to avoid invalid values
      // (e.g., 100000 VND is invalid for percentage type which requires <= 100)
      let newDiscountValue = prev.discountValue;
      if (isPercentage && prev.discountValue > 100) {
        newDiscountValue = 0;
      }

      return {
        ...prev,
        discountType: value,
        discountValue: newDiscountValue,
        // Clear max discount value when switching to fixed
        maxDiscountValue: isFixed ? undefined : prev.maxDiscountValue,
      };
    });
  }, []);

  const handleDiscountValueChange = useCallback((value: number) => {
    setFormData((prev) => ({ ...prev, discountValue: value }));
  }, []);

  const handleMaxDiscountValueChange = useCallback((value: number | undefined) => {
    setFormData((prev) => ({ ...prev, maxDiscountValue: value }));
  }, []);

  const handleMinimumOrderValueChange = useCallback((value: number) => {
    setFormData((prev) => ({ ...prev, minimumOrderValue: value }));
  }, []);

  const handleNotApplicableWithOtherChange = useCallback((value: boolean) => {
    setFormData((prev) => ({ ...prev, notApplicableWithOtherPromotions: value }));
  }, []);

  const handleSingleUsePerCustomerChange = useCallback((value: boolean) => {
    setFormData((prev) => ({ ...prev, singleUsePerCustomer: value }));
  }, []);

  const handleTotalUsageLimitChange = useCallback((value: number | undefined) => {
    setFormData((prev) => ({ ...prev, totalUsageLimit: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit(formData);
  }, [formData, onSubmit]);

  // Validation
  const isValid =
    formData.name.trim() !== '' &&
    formData.startTime !== undefined &&
    formData.endTime !== undefined &&
    formData.discountValue > 0 &&
    formData.minimumOrderValue >= 0 &&
    // Promo code required for PROMO_CODE sub type
    (formData.subType !== OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_PROMO_CODE ||
      formData.promoCode.trim() !== '') &&
    // Discount value <= 100 for percentage
    (formData.discountType !== DiscountType.DISCOUNT_TYPE_PERCENTAGE ||
      formData.discountValue <= 100);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Form Content */}
      <Box
        sx={{
          flex: 1,
          overflow: 'auto',
          p: { xs: 2, sm: 3 },
        }}
      >
        <Card sx={{ boxShadow: 'none', border: 'none' }}>
          <Grid container spacing={3}>
            {/* Left Column */}
            <Grid item xs={12} lg={6}>
              <SubTypeSection
                value={formData.subType}
                onChange={handleSubTypeChange}
                disabled={loading}
              />

              <BasicInfoSection
                name={formData.name}
                startTime={formData.startTime}
                endTime={formData.endTime}
                onNameChange={handleNameChange}
                onStartTimeChange={handleStartTimeChange}
                onEndTimeChange={handleEndTimeChange}
                isEnabled={formData.isEnabled}
                onIsEnabledChange={handleIsEnabledChange}
                disabled={loading}
              />
            </Grid>

            {/* Right Column */}
            <Grid item xs={12} lg={6}>
              <DiscountConfigSection
                subType={formData.subType}
                promoCode={formData.promoCode}
                discountType={formData.discountType}
                discountValue={formData.discountValue}
                maxDiscountValue={formData.maxDiscountValue}
                minimumOrderValue={formData.minimumOrderValue}
                onPromoCodeChange={handlePromoCodeChange}
                onDiscountTypeChange={handleDiscountTypeChange}
                onDiscountValueChange={handleDiscountValueChange}
                onMaxDiscountValueChange={handleMaxDiscountValueChange}
                onMinimumOrderValueChange={handleMinimumOrderValueChange}
                disabled={loading}
              />

              <UsageRestrictionsSection
                notApplicableWithOtherPromotions={formData.notApplicableWithOtherPromotions}
                singleUsePerCustomer={formData.singleUsePerCustomer}
                totalUsageLimit={formData.totalUsageLimit}
                currentUsageCount={formData.currentUsageCount}
                onNotApplicableWithOtherChange={handleNotApplicableWithOtherChange}
                onSingleUsePerCustomerChange={handleSingleUsePerCustomerChange}
                onTotalUsageLimitChange={handleTotalUsageLimitChange}
                disabled={loading}
                mode={mode}
              />
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Sticky Action Buttons */}
      <FormActionButtons
        mode={mode}
        status={status}
        loading={loading}
        pauseLoading={pauseLoading}
        isValid={isValid}
        onSubmit={handleSubmit}
        onCancel={onCancel}
        onPause={onPause}
        onResume={onResume}
      />
    </Box>
  );
}
