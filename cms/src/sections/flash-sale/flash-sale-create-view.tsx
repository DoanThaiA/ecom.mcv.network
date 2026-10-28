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
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  createFlashSaleRequest,
  bulkAddFlashSaleProductsRequest,
  selectCreateFlashSaleLoading,
  selectAddProductLoading,
  selectBulkAddProgress,
  selectBulkAddResult,
  setBulkAddResult,
} from 'src/redux/store/flashSaleSlice';
import { BulkAddResultDialog } from 'src/components/dialog';
import {
  FlashSaleForm,
  type FlashSaleFormData,
  type FlashSaleProductChanges,
} from './flash-sale-form';
import type {
  BulkAddFlashSaleProductItem,
  BulkUpdateFlashSaleProductItem,
} from 'src/types/gen/cms/cms/flash-sales/flash-sale';

// ----------------------------------------------------------------------

export function FlashSaleCreateView() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const loading = useAppSelector(selectCreateFlashSaleLoading);
  const addProductLoading = useAppSelector(selectAddProductLoading);
  const bulkAddProgress = useAppSelector(selectBulkAddProgress);
  const bulkAddResult = useAppSelector(selectBulkAddResult);

  const handleCloseResultDialog = useCallback(() => {
    dispatch(setBulkAddResult(null));
    navigate('/flash-sale');
  }, [dispatch, navigate]);

  // Excel import from create page
  const [showCreateConfirmDialog, setShowCreateConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FlashSaleFormData | null>(null);

  const handleExcelImportRequest = useCallback((formData: FlashSaleFormData) => {
    setPendingFormData(formData);
    setShowCreateConfirmDialog(true);
  }, []);

  const handleConfirmCreateForExcel = useCallback(() => {
    if (!pendingFormData?.startTime || !pendingFormData?.endTime) return;
    setShowCreateConfirmDialog(false);

    dispatch(
      createFlashSaleRequest({
        name: pendingFormData.name,
        startTime: pendingFormData.startTime,
        endTime: pendingFormData.endTime,
        isEnabled: pendingFormData.isEnabled,
        onSuccess: (flashSale) => {
          navigate(`/flash-sale/edit/${flashSale.id}?openExcelImport=true`);
        },
      })
    );
    setPendingFormData(null);
  }, [dispatch, navigate, pendingFormData]);

  const handleSubmit = useCallback(
    (data: FlashSaleFormData, productChanges?: FlashSaleProductChanges) => {
      if (!data.startTime || !data.endTime) {
        return;
      }

      dispatch(
        createFlashSaleRequest({
          name: data.name,
          startTime: data.startTime,
          endTime: data.endTime,
          isEnabled: data.isEnabled,
          onSuccess: (flashSale) => {
            // If there are products to add, use bulk add
            if (productChanges?.addedProducts && productChanges.addedProducts.length > 0) {
              // Convert BulkUpdateFlashSaleProductItem[] to BulkAddFlashSaleProductItem[]
              const productsToAdd: BulkAddFlashSaleProductItem[] = productChanges.addedProducts
                .filter(
                  (
                    p
                  ): p is BulkUpdateFlashSaleProductItem & {
                    discountType: number;
                    discountValue: number;
                    promotionalQuantity: number;
                    order: number;
                  } =>
                    p.discountType !== undefined &&
                    p.discountValue !== undefined &&
                    p.promotionalQuantity !== undefined
                )
                .map((p) => ({
                  productId: p.productId,
                  discountType: p.discountType!,
                  discountValue: p.discountValue!,
                  promotionalQuantity: p.promotionalQuantity!,
                  order: p.order,
                  ...(p.isEnabled !== undefined && { isEnabled: p.isEnabled }),
                }));

              if (productsToAdd.length > 0) {
                dispatch(
                  bulkAddFlashSaleProductsRequest({
                    data: {
                      flashSaleId: flashSale.id,
                      products: productsToAdd,
                    },
                    onSuccess: () => {
                      navigate('/flash-sale');
                    },
                  })
                );
                return;
              }
            }
            // No products to add, navigate directly
            navigate('/flash-sale');
          },
        })
      );
    },
    [dispatch, navigate]
  );

  const handleCancel = useCallback(() => {
    navigate('/flash-sale');
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
      <FlashSaleForm
        mode="create"
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
          <DialogContentText>{t('flashSaleWillBeCreatedImmediately')}</DialogContentText>
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
