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
import { DiscountType, OrderDiscountSubType } from 'src/types/promotion';
import { OrderDiscountForm, type OrderDiscountFormData } from './order-discount-form';

// ----------------------------------------------------------------------

export function OrderDiscountEditView() {
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
    (formData: OrderDiscountFormData) => {
      if (!id) return;

      dispatch(
        updatePromotionRequest({
          id,
          data: {
            name: formData.name,
            startTime: formData.startTime,
            endTime: formData.endTime,
            isEnabled: formData.isEnabled,
            orderDiscountConfig: {
              subType: formData.subType,
              promoCode: formData.promoCode || undefined,
              discountType: formData.discountType,
              discountValue: formData.discountValue,
              maxDiscountValue: formData.maxDiscountValue,
              minimumOrderValue: formData.minimumOrderValue,
              notApplicableWithOtherPromotions: formData.notApplicableWithOtherPromotions,
              singleUsePerCustomer: formData.singleUsePerCustomer,
              totalUsageLimit: formData.totalUsageLimit,
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
  const orderDiscountData = currentPromotion.orderDiscountConfig;
  const formData: OrderDiscountFormData = {
    name: currentPromotion.name,
    subType: orderDiscountData?.subType || OrderDiscountSubType.ORDER_DISCOUNT_SUB_TYPE_AUTO_APPLY,
    promoCode: orderDiscountData?.promoCode || '',
    discountType: orderDiscountData?.discountType || DiscountType.DISCOUNT_TYPE_FIXED,
    discountValue: orderDiscountData?.discountValue || 0,
    maxDiscountValue: orderDiscountData?.maxDiscountValue,
    minimumOrderValue: orderDiscountData?.minimumOrderValue || 0,
    notApplicableWithOtherPromotions: orderDiscountData?.notApplicableWithOtherPromotions || false,
    singleUsePerCustomer: orderDiscountData?.singleUsePerCustomer || false,
    totalUsageLimit: orderDiscountData?.totalUsageLimit,
    startTime: currentPromotion.startTime ? new Date(currentPromotion.startTime) : undefined,
    endTime: currentPromotion.endTime ? new Date(currentPromotion.endTime) : undefined,
    currentUsageCount: orderDiscountData?.currentUsageCount || 0,
    isEnabled: currentPromotion.isEnabled ?? true,
  };

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <OrderDiscountForm
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
