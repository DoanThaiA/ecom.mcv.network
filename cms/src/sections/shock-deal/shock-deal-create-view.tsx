import { Box } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  createPromotionRequest,
  selectCreatePromotionLoading,
} from 'src/redux/store/promotionSlice';
import { BundleDealSubType, PromotionType, type Promotion } from 'src/types/promotion';
import { ShockDealForm, type ShockDealFormData } from './shock-deal-form';

// ----------------------------------------------------------------------

export function ShockDealCreateView() {
  const navigate = useNavigate();
  const location = useLocation();
  const duplicateSource = location.state?.duplicateFrom as Promotion | undefined;
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectCreatePromotionLoading);

  const handleSubmit = useCallback(
    (data: ShockDealFormData) => {
      if (!data.startTime || !data.endTime) {
        return;
      }

      const isBuyXGetY = data.subType === BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_X_GET_Y;

      dispatch(
        createPromotionRequest({
          data: {
            type: PromotionType.PROMOTION_TYPE_BUNDLE_DEAL,
            name: data.name,
            startTime: data.startTime,
            endTime: data.endTime,
            bundleDealConfig: isBuyXGetY
              ? {
                  subType: data.subType,
                  requiredQuantity: data.requiredQuantity,
                  requiredProducts: data.requiredProducts.map((p) => ({
                    productId: p.productId,
                  })),
                  giftQuantity: data.giftQuantity,
                  giftProducts: data.buyXGetYGiftProducts.map((p) => ({
                    productId: p.productId,
                  })),
                  minimumOrderValue: data.minimumOrderValue,
                  maxGiftQuantity: data.maxGiftQuantity,
                  notApplicableWithOtherPromotions: data.notApplicableWithOtherPromotions,
                }
              : {
                  subType: data.subType,
                  tiers: data.tiers.map((tier) => ({
                    minOrderValue: tier.minOrderValue,
                    giftProducts: tier.giftProducts.map((p) => ({ productId: p.productId })),
                  })),
                  notApplicableWithOtherPromotions: data.notApplicableWithOtherPromotions,
                },
          },
          onSuccess: () => {
            navigate('/promotion');
          },
        })
      );
    },
    [dispatch, navigate]
  );

  const handleCancel = useCallback(() => {
    navigate('/promotion');
  }, [navigate]);

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <ShockDealForm
        mode="create"
        initialData={(() => {
          const config = duplicateSource?.bundleDealConfig;
          if (!duplicateSource || !config) return undefined;
          return {
            name: `${duplicateSource.name} (Copy)`,
            subType: config.subType,
            startTime: undefined,
            endTime: undefined,
            isEnabled: true,
            notApplicableWithOtherPromotions: config.notApplicableWithOtherPromotions,
            tiers: config.tiers.map((tier, i) => ({
              id: `tier-${i}`,
              minOrderValue: tier.minOrderValue,
              giftProducts: tier.giftProducts.map((p) => ({
                productId: p.productId,
                name: p.name,
                image: p.image,
              })),
            })),
            requiredQuantity: config.requiredQuantity ?? 1,
            requiredProducts: config.requiredProducts.map((p) => ({
              productId: p.productId,
              name: p.name,
              image: p.image,
            })),
            giftQuantity: config.giftQuantity ?? 1,
            buyXGetYGiftProducts: config.giftProducts.map((p) => ({
              productId: p.productId,
              name: p.name,
              image: p.image,
            })),
            minimumOrderValue: config.minimumOrderValue,
            maxGiftQuantity: config.maxGiftQuantity,
          };
        })()}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </Box>
  );
}
