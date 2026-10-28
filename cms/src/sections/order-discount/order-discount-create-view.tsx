import { Box } from '@mui/material';
import { useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  createPromotionRequest,
  selectCreatePromotionLoading,
} from 'src/redux/store/promotionSlice';
import { PromotionType, type Promotion } from 'src/types/promotion';
import { OrderDiscountForm, type OrderDiscountFormData } from './order-discount-form';

// ----------------------------------------------------------------------

export function OrderDiscountCreateView() {
  const navigate = useNavigate();
  const location = useLocation();
  const duplicateSource = location.state?.duplicateFrom as Promotion | undefined;
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectCreatePromotionLoading);

  const handleSubmit = useCallback(
    (data: OrderDiscountFormData) => {
      if (!data.startTime || !data.endTime) {
        return;
      }

      dispatch(
        createPromotionRequest({
          data: {
            type: PromotionType.PROMOTION_TYPE_ORDER_DISCOUNT,
            name: data.name,
            startTime: data.startTime,
            endTime: data.endTime,
            orderDiscountConfig: {
              subType: data.subType,
              promoCode: data.promoCode || undefined,
              discountType: data.discountType,
              discountValue: data.discountValue,
              maxDiscountValue: data.maxDiscountValue,
              minimumOrderValue: data.minimumOrderValue,
              notApplicableWithOtherPromotions: data.notApplicableWithOtherPromotions,
              singleUsePerCustomer: data.singleUsePerCustomer,
              totalUsageLimit: data.totalUsageLimit,
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
      <OrderDiscountForm
        mode="create"
        initialData={
          duplicateSource
            ? {
                name: `${duplicateSource.name} (Copy)`,
                subType: duplicateSource.orderDiscountConfig?.subType,
                promoCode: '',
                discountType: duplicateSource.orderDiscountConfig?.discountType,
                discountValue: duplicateSource.orderDiscountConfig?.discountValue,
                maxDiscountValue: duplicateSource.orderDiscountConfig?.maxDiscountValue,
                minimumOrderValue: duplicateSource.orderDiscountConfig?.minimumOrderValue,
                notApplicableWithOtherPromotions:
                  duplicateSource.orderDiscountConfig?.notApplicableWithOtherPromotions,
                singleUsePerCustomer: duplicateSource.orderDiscountConfig?.singleUsePerCustomer,
                totalUsageLimit: duplicateSource.orderDiscountConfig?.totalUsageLimit,
                startTime: undefined,
                endTime: undefined,
                isEnabled: true,
              }
            : undefined
        }
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </Box>
  );
}
