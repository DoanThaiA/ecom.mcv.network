import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
  Typography,
  Stack,
} from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  createPromotionRequest,
  bulkAddPromotionProductsRequest,
  selectCreatePromotionLoading,
  selectAddProductLoading,
  selectBulkAddProgress,
  selectBulkAddResult,
  setBulkAddResult,
} from 'src/redux/store/promotionSlice';
import { BulkAddResultDialog } from 'src/components/dialog';
import { PromotionType, type Promotion } from 'src/types/promotion';
import { DISCOUNT_TYPE_API } from 'src/utils/enum-converter';
import { ProductDiscountForm, type ProductDiscountFormData } from './product-discount-form';

// ----------------------------------------------------------------------

export function ProductDiscountCreateView() {
  const navigate = useNavigate();
  const location = useLocation();
  const duplicateSource = location.state?.duplicateFrom as Promotion | undefined;
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const loading = useAppSelector(selectCreatePromotionLoading);
  const addProductLoading = useAppSelector(selectAddProductLoading);
  const bulkAddProgress = useAppSelector(selectBulkAddProgress);
  const bulkAddResult = useAppSelector(selectBulkAddResult);

  const handleCloseResultDialog = useCallback(() => {
    dispatch(setBulkAddResult(null));
    navigate('/promotion');
  }, [dispatch, navigate]);

  // Excel import from create page
  const [showCreateConfirmDialog, setShowCreateConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<ProductDiscountFormData | null>(null);

  const handleExcelImportRequest = useCallback((formData: ProductDiscountFormData) => {
    setPendingFormData(formData);
    setShowCreateConfirmDialog(true);
  }, []);

  const handleConfirmCreateForExcel = useCallback(() => {
    if (!pendingFormData?.startTime || !pendingFormData?.endTime) return;
    setShowCreateConfirmDialog(false);

    dispatch(
      createPromotionRequest({
        data: {
          type: PromotionType.PROMOTION_TYPE_PRODUCT_DISCOUNT,
          name: pendingFormData.name,
          startTime: pendingFormData.startTime,
          endTime: pendingFormData.endTime,
          productDiscountConfig: {
            subType: pendingFormData.subType,
            voucherCode: pendingFormData.voucherCode,
            minimumOrderValue: pendingFormData.minimumOrderValue,
            products: [],
            totalUsageLimit: pendingFormData.totalUsageLimit,
            maxUsagePerCustomer: pendingFormData.maxUsagePerCustomer,
            notApplicableWithOtherPromotions: pendingFormData.notApplicableWithOtherPromotions,
          },
        },
        onSuccess: (promotion) => {
          navigate(`/product-discount/edit/${promotion.id}?openExcelImport=true`);
        },
      })
    );
    setPendingFormData(null);
  }, [dispatch, navigate, pendingFormData]);

  const handleSubmit = useCallback(
    (data: ProductDiscountFormData) => {
      if (!data.startTime || !data.endTime) {
        return;
      }

      // Step 1: Create promotion WITHOUT products (empty array)
      dispatch(
        createPromotionRequest({
          data: {
            type: PromotionType.PROMOTION_TYPE_PRODUCT_DISCOUNT,
            name: data.name,
            startTime: data.startTime,
            endTime: data.endTime,
            productDiscountConfig: {
              subType: data.subType,
              voucherCode: data.voucherCode,
              minimumOrderValue: data.minimumOrderValue,
              products: [],
              totalUsageLimit: data.totalUsageLimit,
              maxUsagePerCustomer: data.maxUsagePerCustomer,
              notApplicableWithOtherPromotions: data.notApplicableWithOtherPromotions,
            },
          },
          onSuccess: (promotion) => {
            // Step 2: If there are products, bulk add them separately
            if (data.products.length > 0) {
              dispatch(
                bulkAddPromotionProductsRequest({
                  promotionId: promotion.id,
                  products: data.products.map((p) => ({
                    productId: p.productId,
                    isEnabled: p.isEnabled,
                    discountType: DISCOUNT_TYPE_API[p.discountType],
                    discountValue: p.discountValue,
                  })),
                  onSuccess: () => {
                    navigate('/promotion');
                  },
                })
              );
              return;
            }
            // No products to add, navigate directly
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

  const progressPercent =
    bulkAddProgress && bulkAddProgress.total > 0
      ? Math.round((bulkAddProgress.current / bulkAddProgress.total) * 100)
      : 0;

  return (
    <Box
      sx={{
        height: 'calc(100vh - 64px)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {bulkAddProgress && (
        <Stack spacing={1} sx={{ px: 3, py: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {t('bulkAddProgressLabel', {
              current: bulkAddProgress.current,
              total: bulkAddProgress.total,
            })}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={progressPercent}
            sx={{ height: 6, borderRadius: 1 }}
          />
          <Alert severity="warning" sx={{ mt: 1 }}>
            {t('doNotCloseWhileBulkProcessing')}
          </Alert>
        </Stack>
      )}
      <ProductDiscountForm
        mode="create"
        initialData={
          duplicateSource
            ? {
                name: `${duplicateSource.name} (Copy)`,
                subType: duplicateSource.productDiscountConfig?.subType,
                startTime: undefined,
                endTime: undefined,
                isEnabled: true,
                voucherCode: undefined,
                minimumOrderValue: duplicateSource.productDiscountConfig?.minimumOrderValue,
                products: [],
                totalUsageLimit: duplicateSource.productDiscountConfig?.totalUsageLimit,
                maxUsagePerCustomer: duplicateSource.productDiscountConfig?.maxUsagePerCustomer,
                notApplicableWithOtherPromotions:
                  duplicateSource.productDiscountConfig?.notApplicableWithOtherPromotions,
              }
            : undefined
        }
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onExcelImportRequest={handleExcelImportRequest}
        loading={loading || addProductLoading}
      />

      {bulkAddResult && (
        <BulkAddResultDialog
          open
          onClose={handleCloseResultDialog}
          addedCount={bulkAddResult.addedCount}
          failedCount={bulkAddResult.failedCount}
          failedProducts={bulkAddResult.failedProducts}
        />
      )}

      <Dialog open={showCreateConfirmDialog} onClose={() => setShowCreateConfirmDialog(false)}>
        <DialogTitle>{t('importExcel')}</DialogTitle>
        <DialogContent>
          <DialogContentText>{t('promotionWillBeCreatedImmediately')}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCreateConfirmDialog(false)} color="inherit">
            {t('cancel')}
          </Button>
          <Button onClick={handleConfirmCreateForExcel} variant="contained" disabled={loading}>
            {t('confirm')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
