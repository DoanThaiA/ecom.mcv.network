import { Box, Card } from '@mui/material';
import { useState, useCallback, useEffect, useRef } from 'react';

import {
  ClassificationAndBasicInfoSection,
  BenefitTiersSection,
  BuyXGetYProductsSection,
  FormActionButtons,
} from './components';
import type { FormProduct } from './components';
import { BundleDealSubType, GiftProduct, PromotionStatus } from 'src/types/promotion';

// Local tier type for form state
export interface FormTier {
  id: string;
  minOrderValue: number;
  giftProducts: GiftProduct[];
}

// Re-export FormProduct for use in create/edit views
export type { FormProduct } from './components';

// ----------------------------------------------------------------------

export interface ShockDealFormData {
  name: string;
  subType: BundleDealSubType;
  startTime: Date | undefined;
  endTime: Date | undefined;
  isEnabled: boolean;
  // BUY_TO_GET_GIFT
  tiers: FormTier[];
  // BUY_X_GET_Y
  requiredQuantity: number;
  requiredProducts: FormProduct[];
  giftQuantity: number;
  buyXGetYGiftProducts: FormProduct[];
  minimumOrderValue?: number;
  maxGiftQuantity?: number;
  // Shared
  notApplicableWithOtherPromotions: boolean;
}

interface ShockDealFormProps {
  mode: 'create' | 'edit';
  initialData?: Partial<ShockDealFormData>;
  status?: PromotionStatus;
  onSubmit: (data: ShockDealFormData) => void;
  onCancel: () => void;
  onPause?: () => void;
  onResume?: () => void;
  loading?: boolean;
  pauseLoading?: boolean;
}

const defaultTier: FormTier = {
  id: 'tier-default',
  minOrderValue: 0,
  giftProducts: [],
};

export function ShockDealForm({
  mode,
  initialData = {},
  status,
  onSubmit,
  onCancel,
  onPause,
  onResume,
  loading = false,
  pauseLoading = false,
}: ShockDealFormProps) {
  // Track if form has been initialized with data (to prevent re-sync during editing)
  const isInitializedRef = useRef(false);

  // Helper to build full form state from initialData
  const buildFormState = (data: Partial<ShockDealFormData>): ShockDealFormData => ({
    name: data.name || '',
    subType: data.subType || BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT,
    startTime: data.startTime,
    endTime: data.endTime,
    isEnabled: data.isEnabled ?? true,
    tiers: data.tiers?.length ? data.tiers : [{ ...defaultTier, id: `tier-${Date.now()}` }],
    requiredQuantity: data.requiredQuantity ?? 1,
    requiredProducts: data.requiredProducts ?? [],
    giftQuantity: data.giftQuantity ?? 1,
    buyXGetYGiftProducts: data.buyXGetYGiftProducts ?? [],
    minimumOrderValue: data.minimumOrderValue,
    maxGiftQuantity: data.maxGiftQuantity,
    notApplicableWithOtherPromotions: data.notApplicableWithOtherPromotions ?? false,
  });

  // Form state
  const [formData, setFormData] = useState<ShockDealFormData>(buildFormState(initialData));

  // Sync with initialData only on first load (for edit mode)
  // Once initialized, don't re-sync to avoid overwriting user edits
  useEffect(() => {
    if (mode === 'edit' && initialData.name && !isInitializedRef.current) {
      isInitializedRef.current = true;
      setFormData(buildFormState(initialData));
    }
  }, [mode, initialData]);

  const handleSubTypeChange = useCallback((value: BundleDealSubType) => {
    setFormData((prev) => ({ ...prev, subType: value }));
  }, []);

  const handleNameChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, name: value }));
  }, []);

  const handleStartTimeChange = useCallback((value: Date | undefined) => {
    setFormData((prev) => ({ ...prev, startTime: value }));
  }, []);

  const handleEndTimeChange = useCallback((value: Date | undefined) => {
    setFormData((prev) => ({ ...prev, endTime: value }));
  }, []);

  const handleTiersChange = useCallback((tiers: FormTier[]) => {
    setFormData((prev) => ({ ...prev, tiers }));
  }, []);

  const handleIsEnabledChange = useCallback((value: boolean) => {
    setFormData((prev) => ({ ...prev, isEnabled: value }));
  }, []);

  const handleRequiredQuantityChange = useCallback((value: number) => {
    setFormData((prev) => ({ ...prev, requiredQuantity: value }));
  }, []);

  const handleRequiredProductsChange = useCallback((products: FormProduct[]) => {
    setFormData((prev) => ({ ...prev, requiredProducts: products }));
  }, []);

  const handleGiftQuantityChange = useCallback((value: number) => {
    setFormData((prev) => ({ ...prev, giftQuantity: value }));
  }, []);

  const handleBuyXGetYGiftProductsChange = useCallback((products: FormProduct[]) => {
    setFormData((prev) => ({ ...prev, buyXGetYGiftProducts: products }));
  }, []);

  const handleMinimumOrderValueChange = useCallback((value: number | undefined) => {
    setFormData((prev) => ({ ...prev, minimumOrderValue: value }));
  }, []);

  const handleMaxGiftQuantityChange = useCallback((value: number | undefined) => {
    setFormData((prev) => ({ ...prev, maxGiftQuantity: value }));
  }, []);

  const handleExclusivityChange = useCallback((value: boolean) => {
    setFormData((prev) => ({ ...prev, notApplicableWithOtherPromotions: value }));
  }, []);

  const handleSubmit = useCallback(() => {
    onSubmit(formData);
  }, [formData, onSubmit]);

  // Validation
  const baseValid =
    formData.name.trim() !== '' &&
    formData.startTime !== undefined &&
    formData.endTime !== undefined;

  const isBuyToGetGiftValid =
    formData.subType === BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT &&
    formData.tiers.length > 0 &&
    formData.tiers.every((tier) => tier.minOrderValue >= 0 && tier.giftProducts.length > 0);

  const isBuyXGetYValid =
    formData.subType === BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y &&
    formData.requiredQuantity >= 1 &&
    formData.requiredProducts.length > 0 &&
    formData.giftQuantity >= 1 &&
    formData.buyXGetYGiftProducts.length > 0;

  const isValid = baseValid && (isBuyToGetGiftValid || isBuyXGetYValid);

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
          <ClassificationAndBasicInfoSection
            subType={formData.subType}
            onSubTypeChange={handleSubTypeChange}
            name={formData.name}
            startTime={formData.startTime}
            endTime={formData.endTime}
            isEnabled={formData.isEnabled}
            onNameChange={handleNameChange}
            onStartTimeChange={handleStartTimeChange}
            onEndTimeChange={handleEndTimeChange}
            onIsEnabledChange={handleIsEnabledChange}
            disabled={loading}
          />

          {formData.subType === BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT && (
            <BenefitTiersSection
              tiers={formData.tiers}
              onTiersChange={handleTiersChange}
              disabled={loading}
            />
          )}

          {formData.subType === BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y && (
            <>
              <BuyXGetYProductsSection
                title="requiredProducts"
                quantityLabel="requiredProductQuantity"
                quantity={formData.requiredQuantity}
                onQuantityChange={handleRequiredQuantityChange}
                products={formData.requiredProducts}
                onProductsChange={handleRequiredProductsChange}
                disabled={loading}
              />
              <BuyXGetYProductsSection
                title="giftedProducts"
                quantityLabel="giftProductQuantity"
                quantity={formData.giftQuantity}
                onQuantityChange={handleGiftQuantityChange}
                products={formData.buyXGetYGiftProducts}
                onProductsChange={handleBuyXGetYGiftProductsChange}
                disabled={loading}
                showAdditionalConditions
                additionalConditions={{
                  minimumOrderValue: formData.minimumOrderValue,
                  maxGiftQuantity: formData.maxGiftQuantity,
                  notApplicableWithOtherPromotions: formData.notApplicableWithOtherPromotions,
                  onMinimumOrderValueChange: handleMinimumOrderValueChange,
                  onMaxGiftQuantityChange: handleMaxGiftQuantityChange,
                  onNotApplicableChange: handleExclusivityChange,
                }}
              />
            </>
          )}
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
