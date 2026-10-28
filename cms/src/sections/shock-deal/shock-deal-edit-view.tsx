import { Box, CircularProgress } from '@mui/material';
import { useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  getPromotionByIdRequest,
  updatePromotionRequest,
  pausePromotionRequest,
  resumePromotionRequest,
  selectCurrentPromotion,
  selectCurrentPromotionLoading,
  selectUpdatePromotionLoading,
  selectPausePromotionLoading,
  clearCurrentPromotion,
} from 'src/redux/store/promotionSlice';
import { BundleDealSubType } from 'src/types/promotion';
import {
  ShockDealForm,
  type ShockDealFormData,
  type FormTier,
  type FormProduct,
} from './shock-deal-form';

// ----------------------------------------------------------------------

export function ShockDealEditView() {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useAppDispatch();

  const currentPromotion = useAppSelector(selectCurrentPromotion);
  const fetchLoading = useAppSelector(selectCurrentPromotionLoading);
  const updateLoading = useAppSelector(selectUpdatePromotionLoading);
  const pauseLoading = useAppSelector(selectPausePromotionLoading);

  // Fetch promotion data on mount
  useEffect(() => {
    if (id) {
      dispatch(getPromotionByIdRequest({ id }));
    }

    // Cleanup on unmount
    return () => {
      dispatch(clearCurrentPromotion());
    };
  }, [dispatch, id]);

  const handleSubmit = useCallback(
    (formData: ShockDealFormData) => {
      if (!id) return;

      const isBuyXGetY = formData.subType === BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y;

      dispatch(
        updatePromotionRequest({
          id,
          data: {
            name: formData.name,
            startTime: formData.startTime,
            endTime: formData.endTime,
            isEnabled: formData.isEnabled,
            bundleDealConfig: isBuyXGetY
              ? {
                  subType: formData.subType,
                  requiredQuantity: formData.requiredQuantity,
                  requiredProducts: formData.requiredProducts.map((p) => ({
                    productId: p.productId,
                  })),
                  giftQuantity: formData.giftQuantity,
                  giftProducts: formData.buyXGetYGiftProducts.map((p) => ({
                    productId: p.productId,
                  })),
                  minimumOrderValue: formData.minimumOrderValue,
                  maxGiftQuantity: formData.maxGiftQuantity,
                  notApplicableWithOtherPromotions: formData.notApplicableWithOtherPromotions,
                }
              : {
                  subType: formData.subType,
                  tiers: formData.tiers.map((tier) => ({
                    minOrderValue: tier.minOrderValue,
                    giftProducts: tier.giftProducts.map((p) => ({ productId: p.productId })),
                  })),
                  notApplicableWithOtherPromotions: formData.notApplicableWithOtherPromotions,
                },
          },
          onSuccess: () => {
            navigate('/promotion');
          },
        })
      );
    },
    [dispatch, id, navigate]
  );

  const handleCancel = useCallback(() => {
    navigate('/promotion');
  }, [navigate]);

  const handlePause = useCallback(() => {
    if (!id) return;

    dispatch(
      pausePromotionRequest({
        id,
        onSuccess: () => {
          // Refresh the current promotion data after pause
          dispatch(getPromotionByIdRequest({ id }));
        },
      })
    );
  }, [dispatch, id]);

  const handleResume = useCallback(() => {
    if (!id) return;

    dispatch(
      resumePromotionRequest({
        id,
        onSuccess: () => {
          // Refresh the current promotion data after resume
          dispatch(getPromotionByIdRequest({ id }));
        },
      })
    );
  }, [dispatch, id]);

  // Show loading state while fetching
  if (fetchLoading || !currentPromotion) {
    return (
      <Box
        sx={{
          height: 'calc(100vh - 64px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // Transform Promotion to form data format
  // Note: API returns bundleDealConfig, not bundleDeal
  const bundleDealData = currentPromotion.bundleDealConfig;
  const formTiers: FormTier[] =
    bundleDealData?.tiers?.map((tier, index: number) => ({
      id: `tier-${index}`,
      minOrderValue: tier.minOrderValue,
      giftProducts: tier.giftProducts,
    })) || [];

  // Map GiftProduct[] to FormProduct[] for BUY_X_GET_Y
  const mapGiftToFormProducts = (
    gifts: Array<{ productId: string; name?: string; image?: string }> | undefined
  ): FormProduct[] =>
    (gifts || []).map((g) => ({
      productId: g.productId,
      name: g.name || '',
      image: g.image || '',
    }));

  const formData: ShockDealFormData = {
    name: currentPromotion.name,
    subType: bundleDealData?.subType || BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT,
    startTime: currentPromotion.startTime ? new Date(currentPromotion.startTime) : undefined,
    endTime: currentPromotion.endTime ? new Date(currentPromotion.endTime) : undefined,
    isEnabled: currentPromotion.isEnabled ?? true,
    tiers: formTiers,
    requiredQuantity: bundleDealData?.requiredQuantity ?? 1,
    requiredProducts: mapGiftToFormProducts(bundleDealData?.requiredProducts),
    giftQuantity: bundleDealData?.giftQuantity ?? 1,
    buyXGetYGiftProducts: mapGiftToFormProducts(bundleDealData?.giftProducts),
    minimumOrderValue: bundleDealData?.minimumOrderValue,
    maxGiftQuantity: bundleDealData?.maxGiftQuantity,
    notApplicableWithOtherPromotions: bundleDealData?.notApplicableWithOtherPromotions ?? false,
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ShockDealForm
        mode="edit"
        initialData={formData}
        status={currentPromotion.status}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onPause={handlePause}
        onResume={handleResume}
        loading={updateLoading}
        pauseLoading={pauseLoading}
      />
    </Box>
  );
}
